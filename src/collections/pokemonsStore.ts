// src/collections/pokemonsStore.ts
import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo";
import { COLLECTION_POKEMONS } from "../utils";
import { PokemonType } from "../types";

export const createPokemon = async (data: {
  name: string;
  description: string;
  height: number;
  weight: number;
  types: PokemonType[];
}) => {
  const db = getDB();

  const res = await db.collection<PokemonType>(COLLECTION_POKEMONS).insertOne({
    ...data,
    _id: new ObjectId
  });

  return await db
    .collection<PokemonType>(COLLECTION_POKEMONS)
    .findOne({ _id: res.insertedId });
};

export const getAllPokemons = async (page = 1, size = 10) => {
  const db = getDB();

  return await db
    .collection<PokemonType>(COLLECTION_POKEMONS)
    .find({})
    .skip((page - 1) * size)
    .limit(size)
    .toArray();
};

export const getPokemonById = async (id: string | ObjectId) => {
  const db = getDB();
  const _id = typeof id === "string" ? new ObjectId(id) : id;

  return await db
    .collection<PokemonType>(COLLECTION_POKEMONS)
    .findOne({ _id });
};
