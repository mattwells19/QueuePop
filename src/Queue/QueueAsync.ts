import CurrentQueue from "../Schemas/CurrentQueue";
import { ICurrentQueue, IBallChaser } from "../Utils/types";
import { Document } from "mongoose";
import { playerInQueue } from "../Utils/utils";

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

// Not quite implemented yet
export async function cleanseStaleQueues(): Promise<void> {
  const allGuildQueues = await CurrentQueue.find();
  allGuildQueues.forEach((guildQueue) => {
    const dataJson = ConvertDocumentToQueue(guildQueue);
    if (dataJson.orangeCap !== null) return;

    const newQueue = dataJson.queue.map((player) => {
      if (player.queueTime) {
        const diffTimeMillis = Math.abs(player.queueTime.getTime() - new Date().getTime());
        const diffTimeMins = diffTimeMillis / 60000;
        if (diffTimeMins >= 5) return null;
      }
      return player;
    });
    console.log(newQueue);
  });
}

export async function getQueue(guildId: string): Promise<ICurrentQueue | null> {
  const guildQueue = await CurrentQueue.findOne({ guildId: guildId });

  if (guildQueue) return ConvertDocumentToQueue(guildQueue);
  else return null;
}

export async function addPlayerToQueue(guildId: string, player: IBallChaser): Promise<ICurrentQueue | string> {
  const guildQueue = await CurrentQueue.findOne({ guildId: guildId });

  if (guildQueue) {
    const queueJson = ConvertDocumentToQueue(guildQueue);

    if (playerInQueue(queueJson.queue, player)) return "Player already in queue.";
    else if (queueJson.queue.length === 6) return "Queue is full. Wait for teams to be set and try again.";
    else if (queueJson.orangeCap !== null) return "Queue has already popped. Wait for teams to be set and try again.";

    const newQueue = await CurrentQueue.findByIdAndUpdate(
      guildQueue._id,
      {
        $addToSet: {
          queue: player,
        },
      },
      { new: true }
    );

    if (newQueue) return ConvertDocumentToQueue(newQueue);
  }

  const createdQueue = await new CurrentQueue({
    guildId: guildId,
    queue: [player],
    orangeCap: null,
    blueCap: null,
    blueTeam: [],
    orangeTeam: [],
  }).save();

  return ConvertDocumentToQueue(createdQueue);
}

export async function removePlayerFromQueue(
  guildId: string,
  player: IBallChaser
): Promise<ICurrentQueue | string | null> {
  const guildQueue = await CurrentQueue.findOne({ guildId: guildId });

  if (guildQueue) {
    const dataJson = ConvertDocumentToQueue(guildQueue);
    if (!playerInQueue(dataJson.queue, player)) return "Player not in queue.";

    const newQueue = await CurrentQueue.findByIdAndUpdate(
      guildQueue._id,
      {
        $pull: {
          queue: player,
        },
      },
      { new: true }
    );
    if (newQueue) {
      const q = ConvertDocumentToQueue(newQueue);

      if (q.queue.length === 0) {
        await CurrentQueue.findOneAndRemove({ guildId: guildId });
        return null;
      } else return q;
    }
  }

  return "Player not in queue.";
}
