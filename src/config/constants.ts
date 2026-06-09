import dotenv from "dotenv";

dotenv.config();

export const BASE_URL = process.env.BASE_URL!;
export const ACCESS_CODE = process.env.ACCESS_CODE!;
export const CLIENT_ID = process.env.CLIENT_ID!;
export const CLIENT_SECRET = process.env.CLIENT_SECRET!;