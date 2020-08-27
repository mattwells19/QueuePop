import { Client, Message, User } from "discord.js";
import dotenv from "dotenv";
import { prefix } from "./Utils/constants";
import admin from "firebase-admin";
import {
  PlayerQueued,
  ListQueue,
  PlayerLeavingQueue,
  QueuePopRandom,
  QueuePopCaptains,
  CaptainsPick,
} from "./Queue/Queue";
import { FillQueue, ClearQueue, FillCaptains, FlipCaptains } from "./Helpers/TestHelpers";
import { isAdmin, userToBallChaser } from "./Utils/utils";
import { ErrorEmbed } from "./Helpers/EmbedHelper";
import { IBallChaser } from "./Utils/types";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require("../firebase.json");

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
  const command = msg.content.slice(1).trim().split(" ")[0].toLowerCase();
  const guildId: string = msg.guild.id;
  const author: IBallChaser = userToBallChaser(msg.author);

  const mentions: Array<IBallChaser> = msg.mentions.users.map(
    (p: User): IBallChaser => ({ id: p.id, name: p.username, mention: `<@${p.id}>` })
  );

  if (command === "q") msg.channel.send(await PlayerQueued(guildId, author));
  else if (command === "list") msg.channel.send(await ListQueue(guildId));
  else if (command === "leave") msg.channel.send(await PlayerLeavingQueue(guildId, author));
  else if (command === "random") msg.channel.send(await QueuePopRandom(guildId));
  else if (command === "captains") msg.channel.send(await QueuePopCaptains(guildId));
  else if (command === "pick") msg.channel.send(await CaptainsPick(guildId, author, mentions));
  else if (command === "fill" && isAdmin(msg)) msg.channel.send(await FillQueue(guildId));
  else if (command === "fillcap" && isAdmin(msg)) msg.channel.send(await FillCaptains(guildId));
  else if (command === "flipcap" && isAdmin(msg)) msg.channel.send(await FlipCaptains(guildId));
  else if (command === "clear" && isAdmin(msg)) msg.channel.send(await ClearQueue(guildId));
  else msg.channel.send(ErrorEmbed("Command Not Found", "That is not a valid command."));

  await msg.channel.stopTyping();
});

client.login(process.env.token);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const CurrentQueue = admin.firestore().collection("CurrentQueue");
export default CurrentQueue;
