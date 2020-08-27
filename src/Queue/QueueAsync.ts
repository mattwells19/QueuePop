import CurrentQueue from "..";
import { ICurrentQueue, IBallChaser } from "../Utils/types";
import { playerInQueue, removeAtIndex } from "../Utils/utils";
import IQueueSchema from "../Schemas/CurrentQueue";

// Not quite implemented yet
export async function cleanseStaleQueues(): Promise<void> {
  const allGuildQueues = await CurrentQueue.get();
  allGuildQueues.forEach((guildQueue) => {
    const dataJson = guildQueue.data() as ICurrentQueue;
    if (dataJson.orangeCap !== null) return;

    const newQueue = dataJson.queue.map((player) => {
      if (player.queueTime) {
        const diffTimeMillis = Math.abs(player.queueTime.getTime() - new Date().getTime());
        const diffTimeMins = diffTimeMillis / 60000;
        if (diffTimeMins >= 5) return null;
      }
      return player;
    });
  });
}

export async function getQueue(guildId: string): Promise<ICurrentQueue | null> {
  const guildQueue = await CurrentQueue.doc(guildId).get();
  if (guildQueue.exists) return guildQueue.data() as ICurrentQueue;
  else return null;
}

export async function addPlayerToQueue(guildId: string, player: IBallChaser): Promise<ICurrentQueue | string> {
  const guildQueue = CurrentQueue.doc(guildId);
  const guildQueueData = await guildQueue.get();

  if (guildQueueData.exists) {
    const queueJson = guildQueueData.data() as ICurrentQueue;

    if (playerInQueue(queueJson.queue, player)) return "Player already in queue.";
    else if (queueJson.queue.length === 6) return "Queue is full. Wait for teams to be set and try again.";
    else if (queueJson.orangeCap !== null) return "Queue has already popped. Wait for teams to be set and try again.";

    queueJson.queue.push(player);
    guildQueue.set(queueJson);
  }

  const newQueue: IQueueSchema = {
    guildId: guildId,
    queue: [player],
    orangeCap: null,
    blueCap: null,
    blueTeam: [],
    orangeTeam: [],
  };

  await guildQueue.set(newQueue);
  return newQueue;
}

export async function removePlayerFromQueue(
  guildId: string,
  player: IBallChaser
): Promise<ICurrentQueue | string | null> {
  const guildQueue = CurrentQueue.doc(guildId);
  const guildQueueData = await guildQueue.get();

  if (guildQueueData.exists) {
    const dataJson = guildQueueData.data() as ICurrentQueue;
    if (!playerInQueue(dataJson.queue, player)) return "Player not in queue.";

    const newQueue = removeAtIndex(
      dataJson.queue,
      dataJson.queue.findIndex((x) => x.id === player.id)
    );
    if (newQueue.length === 0) {
      await guildQueue.delete();
      return null;
    } else {
      guildQueue.set({ ...dataJson, queue: newQueue });
      return { ...dataJson, queue: newQueue };
    }
  }

  return "Player not in queue.";
}
