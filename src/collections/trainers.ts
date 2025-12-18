import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo";
import { COLLECTION_TRAINERS } from "../utils";
import { TrainerType } from "../types";

export const createTrainer = async (
  name: string,
  passwordHash: string
) => {
  const db = getDB();

  const res = await db.collection<TrainerType>(COLLECTION_TRAINERS).insertOne({
      name,
      passwordHash,
      pokemons: [],
      _id: new ObjectId
  });

  return await db
    .collection<TrainerType>(COLLECTION_TRAINERS)
    .findOne({ _id: res.insertedId });
};

export const getTrainerByName = async (name: string) => {
  const db = getDB();

  return await db
    .collection<TrainerType>(COLLECTION_TRAINERS)
    .findOne({ name });
};

export const getTrainerById = async (id: string | ObjectId) => {
  const db = getDB();
  const _id = typeof id === "string" ? new ObjectId(id) : id;

  return await db
    .collection<TrainerType>(COLLECTION_TRAINERS)
    .findOne({ _id });
};
