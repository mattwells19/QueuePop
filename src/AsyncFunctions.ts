import CurrentQueue from "../Schemas/CurrentQueue";
import { ICurrentQueue } from "./types";
import { User } from "discord.js";
import { Document } from "mongoose";

function ConvertDocumentToQueue(doc: Document): ICurrentQueue {
  const data = doc.toJSON();
  return {
    queue: data.queue,
    blueCap: data.blueCap,
    orangeCap: data.orangeCap,
    blueTeam: data.blueTeam,
    orangeTeam: data.orangeTeam,
  };
}

export async function getQueue(guildId: string): Promise<ICurrentQueue | null> {
  const guildQueue = await CurrentQueue.findOne({ guildId: guildId });

  if (guildQueue) return ConvertDocumentToQueue(guildQueue);
  else return null;
}

export async function addPlayerToQueue(guildId: string, player: User): Promise<ICurrentQueue> {
  const newQueue = await CurrentQueue.findOneAndUpdate(
    {
      guildId: guildId,
    },
    {
      $addToSet: {
        queue: {
          id: player.id,
          name: player.username,
        },
      },
    },
    { new: true, useFindAndModify: false }
  );

  if (newQueue) return ConvertDocumentToQueue(newQueue);

  const createdQueue = await new CurrentQueue({
    guildId: guildId,
    queue: [{ id: player.id, name: player.username }],
    orangeCap: "",
    blueCap: "",
    blueTeam: [],
    orangeTeam: [],
  }).save();

  return ConvertDocumentToQueue(createdQueue);
}

export async function removePlayerFromQueue(guildId: string, player: User): Promise<ICurrentQueue | null> {
  const newQueue = await CurrentQueue.findOneAndUpdate(
    {
      guildId: guildId,
    },
    {
      $pull: {
        queue: {
          id: player.id,
          name: player.username,
        },
      },
    },
    { new: true, useFindAndModify: false }
  );

  if (newQueue) {
    const q = ConvertDocumentToQueue(newQueue);

    if (q.queue.length === 0) {
      await CurrentQueue.findOneAndDelete({ guildId: guildId });
      return null;
    } else return q;
  } else return null;
}
