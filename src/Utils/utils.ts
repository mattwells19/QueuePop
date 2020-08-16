import { IBallChaser } from "./types";
import { User, Message } from "discord.js";

export const playerList = (players: Array<IBallChaser>): string => {
  return players.map((p) => p.name).join(", ");
};

export const teamList = (players: Array<IBallChaser>): string => {
  return players.map((p) => `<@${p.id}>`).join("\n");
};

export const queueSizeAndList = (queue: Array<IBallChaser>): string => {
  return `Queue Size: ${queue.length}/6\n\n` + "Current Queue:\n" + playerList(queue);
};

export const playerInQueue = (queue: Array<IBallChaser>, player: IBallChaser | User): boolean => {
  const found = queue.find((p) => p.id === player.id);
  return !!found;
};

export const isAdmin = (msg: Message): boolean => {
  return !!(msg.member && msg.member.roles.cache.some((role) => role.name === "Bot Admin"));
};

export const removeAtIndex = (queue: Array<IBallChaser>, index: number): Array<IBallChaser> => {
  const temp = Array.from(queue);
  temp.splice(index, 1);
  return temp;
};

export const userToBallChaser = (player: User): IBallChaser => {
  return {
    id: player.id,
    name: player.username,
    mention: `<@${player.id}>`,
  };
};
