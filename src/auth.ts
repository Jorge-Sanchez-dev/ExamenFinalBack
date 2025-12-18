//Jorge Sanchez Lopez
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

dotenv.config();

const SUPER_SECRETO = process.env.SECRET;

type TokenPayload = {
  trainerId: string;
};

export const signToken = (userId: string): string => {
  if (!SUPER_SECRETO) {
    throw new Error("SECRET is not defined in environment variables");
  }
  return jwt.sign({ userId }, SUPER_SECRETO, { expiresIn: "1h" });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    if (!SUPER_SECRETO) {
      throw new Error("SECRET is not defined in environment variables");
    }
    return jwt.verify(token, SUPER_SECRETO) as TokenPayload;
  } catch {
    return null;
  }
};


export const getUserFromToken = async (token: string) => {
  const clean = token.startsWith("Bearer ") ? token.slice(7) : token;
  const payload = verifyToken(clean);
  if (!payload) return null;

  return { trainerId: new ObjectId(payload.trainerId) };
};

