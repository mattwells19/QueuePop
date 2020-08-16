import { MessageEmbed } from "discord.js";

export const InfoEmbed = (title: string, desc: string): MessageEmbed => {
  return new MessageEmbed().setTitle(title).setDescription(desc).setColor("BLUE");
};

export const ErrorEmbed = (title: string, desc: string): MessageEmbed => {
  return new MessageEmbed().setTitle(title).setDescription(desc).setColor("RED");
};

export const AdminEmbed = (title: string, desc: string): MessageEmbed => {
  return new MessageEmbed().setTitle(title).setDescription(desc).setColor("DARK_GOLD");
};

export const QueueUpdateEmbed = (title: string, desc: string): MessageEmbed => {
  return new MessageEmbed().setTitle(title).setDescription(desc).setColor("GREEN");
};
