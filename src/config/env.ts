import dotenv from "dotenv";

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_from_antigravity";
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "super_refresh_secret_key_from_antigravity";
