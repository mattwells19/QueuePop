import { Client, Message } from "discord.js";
import dotenv from "dotenv";
import { prefix } from "./constants";

dotenv.config();
const client = new Client();

client.on("ready", () => {
  console.log("working!");
});

client.on("message", (msg: Message) => {
  if (!msg.content.startsWith(prefix) || msg.author.bot) return;
});

client.login(process.env.token);
