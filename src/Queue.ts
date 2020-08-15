import { User, MessageEmbed } from "discord.js";
import { addPlayerToQueue, getQueue, removePlayerFromQueue } from "./AsyncFunctions";
import { QueueUpdateEmbed, InfoEmbed } from "./EmbedHelper";
import { queueSizeAndList } from "./Utils";
import { ICurrentQueue } from "./types";

export async function PlayerQueued(guildId: string, player: User): Promise<MessageEmbed> {
  const currQueue: ICurrentQueue = await addPlayerToQueue(guildId, player);

  return QueueUpdateEmbed(
    "Player Added to Queue",
    `${player.username} has been added to the queue.` + "\n\n" + queueSizeAndList(currQueue.queue)
  );
}

export async function ListQueue(guildId: string): Promise<MessageEmbed> {
  const currQueue: ICurrentQueue | null = await getQueue(guildId);

  if (currQueue) return InfoEmbed("Current Queue", queueSizeAndList(currQueue.queue));
  else return InfoEmbed("Current Queue", "Queue is empty.");
}

export async function PlayerLeavingQueue(guildId: string, player: User): Promise<MessageEmbed> {
  const newQueue: ICurrentQueue | null = await removePlayerFromQueue(guildId, player);

  if (newQueue) return InfoEmbed("Player Left", queueSizeAndList(newQueue.queue));
  else return InfoEmbed("Player Left", "Queue is empty.");
}
