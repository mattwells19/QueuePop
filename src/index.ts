import { Client, Message } from "discord.js";
import dotenv from "dotenv";
import { prefix } from "./Utils/constants";
import { connect } from "mongoose";
import {
  PlayerQueued,
  ListQueue,
  PlayerLeavingQueue,
  QueuePopRandom,
  QueuePopCaptains,
  CaptainsPick,
} from "./Queue/Queue";
import { FillQueue, ClearQueue, FillCaptains, FlipCaptains } from "./Helpers/TestHelpers";
import { isAdmin } from "./Utils/utils";
import { ErrorEmbed } from "./Helpers/EmbedHelper";

dotenv.config();
const client = new Client({});

client.on("ready", async () => {
  console.log("QueuePop is logged in.");

  // TODO: Doesn't work
  await client.user?.setPresence({
    activity: {
      name: "6 mans",
      type: "PLAYING",
      url: "", //TODO put website here
    },
  });
  // setInterval(() => {
  //   console.log("beep");
  // }, (5 * 60 * 1000)); // run every five minutes
});

client.on("message", async (msg: Message) => {
  if (!msg.content.startsWith(prefix) || msg.author.bot || !msg.guild) return;

  msg.channel.startTyping();

  // remove prefix from message
  // const args = msg.content.trim().split(" ").slice(1);
  const command = msg.content.slice(1).trim().split(" ")[0].toLowerCase();

  if (command === "q") msg.channel.send(await PlayerQueued(msg.guild.id, msg.author));
  else if (command === "list") msg.channel.send(await ListQueue(msg.guild.id));
  else if (command === "leave") msg.channel.send(await PlayerLeavingQueue(msg.guild.id, msg.author));
  else if (command === "random") msg.channel.send(await QueuePopRandom(msg.guild.id));
  else if (command === "captains") msg.channel.send(await QueuePopCaptains(msg.guild.id));
  else if (command === "pick") msg.channel.send(await CaptainsPick(msg.guild.id, msg.author, msg.mentions));
  else if (command === "fill" && isAdmin(msg)) msg.channel.send(await FillQueue(msg.guild.id));
  else if (command === "fillcap" && isAdmin(msg)) msg.channel.send(await FillCaptains(msg.guild.id));
  else if (command === "flipcap" && isAdmin(msg)) msg.channel.send(await FlipCaptains(msg.guild.id));
  else if (command === "clear" && isAdmin(msg)) msg.channel.send(await ClearQueue(msg.guild.id));
  else msg.channel.send(ErrorEmbed("Command Not Found", "That is not a valid command."));

  msg.channel.stopTyping();
});

client.login(process.env.token);
connect(
  process.env.mongodb ?? "",
  { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false },
  () => console.log("Connected to MongoDB!")
);
