
import { ObjectId } from "mongodb";

export type Pokemon = | "NORMAL" | "FIRE"  | "WATER"  | "ELECTRIC" | "GRASS"  | "ICE" | "FIGHTING"  | "POISON" | "GROUND"  | "FLYING" | "PSYCHIC" | "BUG" | "ROCK" | "GHOST" | "DRAGON";

export interface PokemonType {
  _id: ObjectId;
  name: string;
  description: string;
  height: number;
  weight: number;
  types: PokemonType[];
}

export interface OwnedPokemonType{
  _id: ObjectId;
  trainerId: ObjectId;
  pokemon: ObjectId;
  nickname?: string | null;
  attack: number;
  defense: number;
  speed: number;
  special: number;
  level: number;
}

export interface TrainerType {
  _id: ObjectId;
  name: string;
  passwordHash: string;
  pokemons: ObjectId[];
}

export interface JwtPayload {
  trainerId: string;
  name?: string;
}

export interface GraphQLContext {
  token?: string;
  user?: { trainerId: ObjectId; name?: string } | null;
}
