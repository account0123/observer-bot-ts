import dotenv from "dotenv";

const result = dotenv.config({ path: ".env" })

export const DISCORD_TOKEN = process.env["token"];
if (result.error) {
  console.error(result.error)
}
if (!DISCORD_TOKEN) {
  console.error("No 'discord token' provided in .env file.");
}