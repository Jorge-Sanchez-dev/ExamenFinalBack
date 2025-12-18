//Jorge Sanchez Lopez
import { ObjectId } from "mongodb";

export type PokemonType = "NORMAL" | "FIRE"  | "WATER"  | "ELECTRIC" | "GRASS"  | "ICE" | "FIGHTING"  | "POISON" | "GROUND"  | "FLYING" | "PSYCHIC" | "BUG" | "ROCK" | "GHOST" | "DRAGON";

export type Pokemon = {
  _id: ObjectId;
  name: string;
  description: string;
  height: number;
  weight: number;
  types: PokemonType[];
}

export type OwnedPokemonType = {
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

export type TrainerType = {
  _id: ObjectId;
  name: string;
  passwordHash: string;
  pokemons: ObjectId[];
}

export type JwtPayload ={
  trainerId: string;
  name?: string;
}

export type GraphQLContext ={
  token?: string;
  user?: { trainerId: ObjectId; name?: string } | null;
}
