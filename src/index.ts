import { Client, Message } from "discord.js";
import dotenv from "dotenv";
import { prefix } from "./constants";
import { connect } from "mongoose";
import { PlayerQueued, ListQueue, PlayerLeavingQueue } from "./Queue";

dotenv.config();
const client = new Client();

client.on("ready", () => console.log("QueuePop is logged in."));

client.on("message", async (msg: Message) => {
  if (!msg.content.startsWith(prefix) || msg.author.bot || !msg.guild) return;

  // remove prefix from message
  const command = msg.content.slice(1);

  if (command === "q") msg.channel.send(await PlayerQueued(msg.guild.id, msg.author));
  else if (command === "list") msg.channel.send(await ListQueue(msg.guild.id));
  else if (command === "leave") msg.channel.send(await PlayerLeavingQueue(msg.guild.id, msg.author));
});

client.login(process.env.token);
connect(process.env.mongodb ?? "", { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true }, () =>
  console.log("Connected to db!")
);
