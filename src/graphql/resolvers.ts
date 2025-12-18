import { ObjectId, OptionalId } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDB } from "../db/mongo";
import {
  COLLECTION_TRAINERS,
  COLLECTION_POKEMONS,
  COLLECTION_OWNED_POKEMONS,
} from "../utils";
import type {
  GraphQLContext,
  JwtPayload,
  PokemonType,
  TrainerType,
  OwnedPokemonType,
} from "../types";

const JWT_SECRET = process.env.SECRET || "dev_secret_change_me";

function requireAuth(ctx: GraphQLContext) {
  if (!ctx.user?.trainerId) throw new Error("Unauthorized");
  return ctx.user.trainerId;
}

function toObjectId(id: string, label = "id") {
  if (!ObjectId.isValid(id)) throw new Error(`Invalid ${label}`);
  return new ObjectId(id);
}

function randomStat1to100() {
  return Math.floor(Math.random() * 100) + 1;
}

function signToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export const resolvers = {
  Query: {
    me: async (_: any, __: any, ctx: GraphQLContext) => {
      const trainerId = requireAuth(ctx);
      const db = getDB();

      const trainer = await db
        .collection<TrainerType>(COLLECTION_TRAINERS)
        .findOne({ _id: trainerId });

      if (!trainer) throw new Error("Unauthorized");
      return trainer;
    },

    pokemons: async (_: any, args: { page?: number; size?: number }) => {
      const db = getDB();
      const page = args.page ?? 1;
      const size = args.size ?? 10;

      return await db
        .collection(COLLECTION_POKEMONS)
        .find({})
        .skip((page - 1) * size)
        .limit(size)
        .toArray();
    },

    pokemon: async (_: any, args: { id: string }) => {
      const db = getDB();
      const _id = toObjectId(args.id, "pokemon id");
      return await db.collection(COLLECTION_POKEMONS).findOne({ _id });
    },
  },

  Mutation: {
    startJourney: async (_: any, args: { name: string; password: string }) => {
      const db = getDB();
      const name = args.name.trim();
      if (!name) throw new Error("Name required");
      if (!args.password || args.password.length < 4)
        throw new Error("Password too short");

      const existing = await db
        .collection(COLLECTION_TRAINERS)
        .findOne({ name });
      if (existing) throw new Error("Trainer already exists");

      const passwordHash = await bcrypt.hash(args.password, 10);

      const insertRes = await db.collection(COLLECTION_TRAINERS).insertOne({
        name,
        passwordHash,
        pokemons: [] as ObjectId[],
      });

      return signToken({ trainerId: insertRes.insertedId.toString(), name });
    },

    login: async (_: any, args: { name: string; password: string }) => {
      const db = getDB();
      const name = args.name.trim();

      const trainer = await db
        .collection(COLLECTION_TRAINERS)
        .findOne({ name });
      if (!trainer) throw new Error("Invalid credentials");

      const ok = await bcrypt.compare(args.password, trainer.passwordHash);
      if (!ok) throw new Error("Invalid credentials");

      return signToken({
        trainerId: trainer._id.toString(),
        name: trainer.name,
      });
    },

    createPokemon: async (
      _: any,
      args: {
        name: string;
        description: string;
        height: number;
        weight: number;
        types: PokemonType[];
      }
    ) => {
      const db = getDB();
      const name = args.name.trim();
      const description = args.description.trim();

      if (!name) throw new Error("Name required");
      if (!description) throw new Error("Description required");
      if (typeof args.height !== "number" || args.height <= 0)
        throw new Error("Height must be > 0");
      if (typeof args.weight !== "number" || args.weight <= 0)
        throw new Error("Weight must be > 0");
      if (!Array.isArray(args.types) || args.types.length === 0)
        throw new Error("Types required");

      const insertRes = await db.collection(COLLECTION_POKEMONS).insertOne({
        name,
        description,
        height: args.height,
        weight: args.weight,
        types: args.types,
      });

      return await db
        .collection(COLLECTION_POKEMONS)
        .findOne({ _id: insertRes.insertedId });
    },

    catchPokemon: async (
      _: any,
      args: { pokemonId: string; nickname?: string | null },
      ctx: GraphQLContext
    ) => {
      const trainerId = requireAuth(ctx);
      const db = getDB();

      const pokemonId = toObjectId(args.pokemonId, "pokemonId");

      const pokemon = await db
        .collection(COLLECTION_POKEMONS)
        .findOne({ _id: pokemonId });

      if (!pokemon) throw new Error("Pokemon not found");

      const trainer = await db
        .collection<TrainerType>(COLLECTION_TRAINERS)
        .findOne({ _id: trainerId });

      if (!trainer) throw new Error("Trainer not found");
      if ((trainer.pokemons?.length ?? 0) >= 6)
        throw new Error("Trainer already has 6 pokemons");

      const insertRes = await db
        .collection<OptionalId<OwnedPokemonType>>(COLLECTION_OWNED_POKEMONS)
        .insertOne({
          trainerId,
          pokemon: pokemonId,
          nickname: args.nickname ?? null,
          attack: randomStat1to100(),
          defense: randomStat1to100(),
          speed: randomStat1to100(),
          special: randomStat1to100(),
          level: 1,
        });

      await db
        .collection<TrainerType>(COLLECTION_TRAINERS)
        .updateOne(
          { _id: trainerId },
          { $push: { pokemons: insertRes.insertedId } }
        );

      return await db
        .collection<OwnedPokemonType>(COLLECTION_OWNED_POKEMONS)
        .findOne({ _id: insertRes.insertedId });
    },

    freePokemon: async (
      _: any,
      args: { ownedPokemonId: string },
      ctx: GraphQLContext
    ) => {
      const trainerId = requireAuth(ctx);
      const db = getDB();

      const ownedId = toObjectId(args.ownedPokemonId, "ownedPokemonId");

      const owned = await db
        .collection<OwnedPokemonType>(COLLECTION_OWNED_POKEMONS)
        .findOne({ _id: ownedId });

      if (!owned) throw new Error("OwnedPokemon not found");
      if (owned.trainerId.toString() !== trainerId.toString())
        throw new Error("Forbidden");

      await db
        .collection<OwnedPokemonType>(COLLECTION_OWNED_POKEMONS)
        .deleteOne({ _id: ownedId });

      await db
        .collection<TrainerType>(COLLECTION_TRAINERS)
        .updateOne({ _id: trainerId }, { $pull: { pokemons: ownedId } });

      return await db
        .collection(COLLECTION_TRAINERS)
        .findOne({ _id: trainerId });
    },
  },

  Trainer: {
    pokemons: async (trainer: any) => {
      const db = getDB();
      const ids: ObjectId[] = trainer.pokemons ?? [];
      if (ids.length === 0) return [];
      return await db
        .collection(COLLECTION_OWNED_POKEMONS)
        .find({ _id: { $in: ids } })
        .toArray();
    },
  },

  OwnedPokemon: {
    pokemon: async (owned: any) => {
      const db = getDB();
      const pokemonId: ObjectId = owned.pokemon;
      return await db
        .collection(COLLECTION_POKEMONS)
        .findOne({ _id: pokemonId });
    },
  },
};
