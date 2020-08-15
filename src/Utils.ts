import { IBallChaser } from "./types";

export const playerList = (players: Array<IBallChaser>): string => {
  return players.map((p) => p.name).join(",");
};

export const queueSizeAndList = (queue: Array<IBallChaser>): string => {
  return `Queue Size: ${queue.length}/6\n\n` + "Current Queue:\n" + playerList(queue);
};
