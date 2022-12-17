import dotenv from "dotenv";

dotenv.config({ path: ".env" })

export const DISCORD_TOKEN = process.env["TOKEN"];
export const BETA_TOKEN = process.env["BETA"];

if (!DISCORD_TOKEN) {
  console.error("No 'discord token' provided in .env file.");
}