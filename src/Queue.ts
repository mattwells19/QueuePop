import { User, MessageEmbed, MessageMentions } from "discord.js";
import { addPlayerToQueue, getQueue, removePlayerFromQueue } from "./AsyncFunctions";
import { QueueUpdateEmbed, InfoEmbed, ErrorEmbed } from "./EmbedHelper";
import { queueSizeAndList, teamList, removeAtIndex } from "./Utils";
import { ICurrentQueue } from "./types";
import CurrentQueue from "../Schemas/CurrentQueue";

export async function PlayerQueued(guildId: string, player: User): Promise<MessageEmbed> {
  const currQueue: ICurrentQueue | string = await addPlayerToQueue(guildId, player);

  if (typeof currQueue === "string") return ErrorEmbed("Could Not Add Player to Queue", currQueue);

  if (currQueue.queue.length === 1)
    return QueueUpdateEmbed("Queue has Started", `${player} wants to queue!` + "\n\nType **!q** to queue.");

  if (currQueue.queue.length === 6)
    return QueueUpdateEmbed(
      "Queue is Full!",
      `${player} has been added to the queue.` +
        "\n\n**Queue is now full!**\n\nType `!random` for random teams.\nType `!captains` to pick teams."
    );

  return QueueUpdateEmbed(
    "Player Added to Queue",
    `${player} has been added to the queue.` + "\n\n" + queueSizeAndList(currQueue.queue)
  );
}

export async function ListQueue(guildId: string): Promise<MessageEmbed> {
  const currQueue: ICurrentQueue | null = await getQueue(guildId);

  if (currQueue) return InfoEmbed("Current Queue", queueSizeAndList(currQueue.queue));
  else return InfoEmbed("Current Queue", "Queue is empty.");
}

export async function PlayerLeavingQueue(guildId: string, player: User): Promise<MessageEmbed> {
  const newQueue: ICurrentQueue | string | null = await removePlayerFromQueue(guildId, player);

  if (typeof newQueue === "string") return ErrorEmbed("Could Not Remove Player from Queue", newQueue);

  if (newQueue) return InfoEmbed("Player Left Queue", queueSizeAndList(newQueue.queue));
  else return InfoEmbed("Player Left Queue", "Queue is now empty.");
}

export async function QueuePopRandom(guildId: string): Promise<MessageEmbed> {
  const guildQueue = await getQueue(guildId);

  if (guildQueue) {
    if (guildQueue.queue.length < 6 && guildQueue.orangeCap === null)
      return ErrorEmbed("Queue Not Full", "You need 6 players before random teams can be assigned.");
    if (guildQueue.orangeCap !== null)
      return ErrorEmbed("Captains Already Selected", "Captains are already set. Captains must pick players.");

    const blueTeam = [];
    const modifiedQueue = Array.from(guildQueue.queue);

    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * modifiedQueue.length);
      blueTeam.push(modifiedQueue.splice(randomIndex, 1)[0]);
    }

    await CurrentQueue.findOneAndRemove({ guildId: guildId });

    return QueueUpdateEmbed("Teams are Set!", "")
      .addField("🔹 BLUE TEAM 🔹", teamList(blueTeam))
      .addField("🔸 ORANGE TEAM 🔸", teamList(modifiedQueue));
  }
  return ErrorEmbed("Queue Not Full", "You need 6 players before random teams can be assigned.");
}

export async function QueuePopCaptains(guildId: string): Promise<MessageEmbed> {
  const guildQueue = await getQueue(guildId);

  if (guildQueue) {
    if (guildQueue.queue.length < 6 && guildQueue.orangeCap === null)
      return ErrorEmbed("Queue Not Full", "You need 6 players before captains can be assigned.");
    if (guildQueue.orangeCap !== null)
      return ErrorEmbed("Captains Already Selected", "Captains are already set. Captains must pick players.");

    const modifiedQueue = Array.from(guildQueue.queue);

    const blueCap = modifiedQueue.splice(Math.floor(Math.random() * modifiedQueue.length), 1)[0];
    const orangeCap = modifiedQueue.splice(Math.floor(Math.random() * modifiedQueue.length), 1)[0];

    await CurrentQueue.findOneAndUpdate(
      { guildId: guildId },
      {
        queue: modifiedQueue,
        blueCap: { id: blueCap.id, name: blueCap.name },
        orangeCap: { id: orangeCap.id, name: orangeCap.name },
        blueTeam: [blueCap],
        orangeTeam: [orangeCap],
      }
    );

    return QueueUpdateEmbed("Captains Set", "")
      .addField("🔹 BLUE TEAM CAPTAIN 🔹", teamList([blueCap]))
      .addField("🔸 ORANGE TEAM CAPTAIN 🔸", teamList([orangeCap]));
  }
  return ErrorEmbed("Queue Not Full", "You need 6 players before captains can be assigned.");
}

export async function CaptainsPick(guildId: string, author: User, mentions: MessageMentions): Promise<MessageEmbed> {
  const guildQueue = await getQueue(guildId);

  if (!guildQueue) return ErrorEmbed("Queue Not Full", "You need 6 players and set captains before picking teams.");

  const mentionedPlayerIds = mentions.users.map((p) => p.id);

  // Check if captains have been assigned
  if (guildQueue.orangeCap === null && guildQueue.queue.length === 6)
    return ErrorEmbed("Captains Not Set", "Type `!captains` to pick captains.");
  // Check if it is blue team's turn to pick and the person picking is the blue team captain
  else if (guildQueue.blueTeam.length === 1 && author.id !== guildQueue.blueCap.id)
    return ErrorEmbed(
      "Not Blue Team Captain",
      `It is blue team's turn to pick. The blue team captain is <@${guildQueue.blueCap.id}> which isn't you.`
    );
  // Check if it is orange team's turn to pick and the person picking is the orange team captain
  else if (guildQueue.blueTeam.length === 2 && author.id !== guildQueue.orangeCap.id)
    return ErrorEmbed(
      "Not Orange Team Captain",
      `It is orange team's turn to pick. The orange team captain is <@${guildQueue.orangeCap.id}> which isn't you.`
    );
  // Check if it is blue team's turn to pick and there was only one person mentioned
  else if (guildQueue.blueTeam.length === 1 && mentions.users.size !== 1)
    return ErrorEmbed("Too Many Mentions", "Blue team only picks one player. Please only mention one player.");
  // Check if it is orange team's turn to pick and there two people mentioned
  else if (guildQueue.blueTeam.length === 2 && mentions.users.size !== 2)
    return ErrorEmbed("Not Enough Mentions", "Orange team picks two players. Please mention two players.");

  // If blue team's turn to pick
  if (guildQueue.blueTeam.length === 1) {
    const pickedPlayerIndex = guildQueue.queue.findIndex((x) => x.id === mentionedPlayerIds[0]);
    if (pickedPlayerIndex === -1)
      return ErrorEmbed("Player Not Found", "The player you mentioned is not in the queue. Please try again.");

    const blueTeam = Array.from(guildQueue.blueTeam);
    blueTeam.push(guildQueue.queue[pickedPlayerIndex]);

    const newQueue: Partial<ICurrentQueue> = {
      queue: removeAtIndex(guildQueue.queue, pickedPlayerIndex),
      blueTeam,
    };
    await CurrentQueue.findOneAndUpdate({ guildId: guildId }, { ...newQueue });
    return QueueUpdateEmbed(
      "Player Added to Blue Team",
      `<@${mentionedPlayerIds[0]}> has been added to Blue team.\n\n<@${guildQueue.orangeCap.id}> please pick TWO people.`
    );
  }

  // If orange team's turn to pick
  else {
    const pickedPlayerIndex = guildQueue.queue.findIndex((x) => x.id === mentionedPlayerIds[0]);
    const secondPickedPlayerIndex = guildQueue.queue.findIndex((x) => x.id === mentionedPlayerIds[1]);
    if (pickedPlayerIndex === -1 || secondPickedPlayerIndex === -1)
      return ErrorEmbed(
        "Player Not Found",
        "Either one or both of the players you mentioned is not in the queue. Please try again."
      );

    const modifiedQueue = Array.from(guildQueue.queue);
    modifiedQueue.splice(pickedPlayerIndex, 1);
    modifiedQueue.splice(secondPickedPlayerIndex, 1);

    const orangeTeam = Array.from(guildQueue.orangeTeam);
    orangeTeam.push(guildQueue.queue[pickedPlayerIndex]);
    orangeTeam.push(guildQueue.queue[secondPickedPlayerIndex]);

    const blueTeam = Array.from(guildQueue.blueTeam);
    blueTeam.push(modifiedQueue[0]);

    await CurrentQueue.findOneAndRemove({ guildId: guildId });

    return QueueUpdateEmbed("Teams are Set!", "")
      .addField("🔹 BLUE TEAM 🔹", teamList(blueTeam))
      .addField("🔸 ORANGE TEAM 🔸", teamList(orangeTeam));
  }
}
