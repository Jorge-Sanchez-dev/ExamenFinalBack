// src/collections/ownedPokemonsStore.ts

import { ObjectId, OptionalId } from "mongodb";
import { getDB } from "../db/mongo";
import { COLLECTION_OWNED_POKEMONS } from "../utils";
import { OwnedPokemonType} from "../types";

export const createOwnedPokemon = async (data: {
  trainerId: ObjectId;
  pokemon: ObjectId;
  nickname?: string | null;
  attack: number;
  defense: number;
  speed: number;
  special: number;
  level: number;
}) => {
  const db = getDB();

const res = await db
  .collection<OptionalId<OwnedPokemonType>>(COLLECTION_OWNED_POKEMONS)
  .insertOne(data);

  return await db
  .collection<OwnedPokemonType>(COLLECTION_OWNED_POKEMONS)
  .findOne({ _id: res.insertedId });
};

export const getOwnedPokemonById = async (id: string | ObjectId) => {
  const db = getDB();
  const _id = typeof id === "string" ? new ObjectId(id) : id;

  return await db
    .collection<OwnedPokemonType>(COLLECTION_OWNED_POKEMONS)
    .findOne({ _id });
};

export const getOwnedPokemonsByTrainer = async (trainerId: ObjectId) => {
  const db = getDB();

  return await db
    .collection<OwnedPokemonType>(COLLECTION_OWNED_POKEMONS)
    .find({ trainerId })
    .toArray();
};

export const deleteOwnedPokemon = async (id: string | ObjectId) => {
  const db = getDB();
  const _id = typeof id === "string" ? new ObjectId(id) : id;

  return await db
    .collection<OwnedPokemonType>(COLLECTION_OWNED_POKEMONS)
    .deleteOne({ _id });
};
