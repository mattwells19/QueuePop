import { IBallChaser, ICurrentQueue } from "../Utils/types";
import { AdminEmbed, ErrorEmbed } from "./EmbedHelper";
import { MessageEmbed } from "discord.js";
import { getQueue } from "../Queue/QueueAsync";
import CurrentQueue from "..";

export async function FillQueue(guildId: string): Promise<MessageEmbed> {
  const queueToAdd: Array<IBallChaser> = [
    {
      id: "346838372649795595",
      name: "Tux",
      mention: "<@346838372649795595>",
    },
    {
      id: "227273256820801536",
      name: "twan",
      mention: "<@227273256820801536>",
    },
    {
      id: "430517075870482433",
      name: "cre8",
      mention: "<@430517075870482433>",
    },
    {
      id: "209084277223194624",
      name: "DaffyJr",
      mention: "<@209084277223194624>",
    },
    {
      id: "94264612811186176",
      name: "IncognitoTurtle",
      mention: "<@94264612811186176>",
    },
    {
      id: "146095425475182592",
      name: "furrywolfman33",
      mention: "<@146095425475182592>",
    },
  ];

  const guildQueue = await CurrentQueue.doc(guildId);
  const guildQueueData = await guildQueue.get();

  if (guildQueueData.exists) {
    await guildQueue.set({ ...guildQueueData, queue: queueToAdd });
  } else {
    await guildQueue.set({
      guildId: guildId,
      queue: queueToAdd,
      orangeCap: null,
      blueCap: null,
      blueTeam: [],
      orangeTeam: [],
    });
  }

  return AdminEmbed("Queue Filled", "Queue successfully filled.");
}

export async function ClearQueue(guildId: string): Promise<MessageEmbed> {
  await CurrentQueue.doc(guildId).delete();
  return AdminEmbed("Queue Cleared", "Queue has been cleared.");
}

export async function FillCaptains(guildId: string): Promise<MessageEmbed> {
  const queueToAdd: ICurrentQueue = {
    queue: [
      {
        name: "Speed",
        id: "71812906886365184",
        mention: "<@71812906886365184>",
      },
      {
        name: "DaffyJr",
        id: "209084277223194624",
        mention: "<@209084277223194624>",
      },
      {
        name: "Don",
        id: "528369347807412227",
        mention: "<@528369347807412227>",
      },
      {
        name: "Onion",
        id: "177896719734800384",
        mention: "<@177896719734800384>",
      },
    ],
    orangeCap: {
      name: "Tux",
      id: "346838372649795595",
      mention: "<@346838372649795595>",
    },
    blueCap: {
      name: "Quintic",
      id: "258025608200585227",
      mention: "<@258025608200585227>",
    },
    orangeTeam: [
      {
        name: "Tux",
        id: "346838372649795595",
        mention: "<@346838372649795595>",
      },
    ],
    blueTeam: [
      {
        name: "Quintic",
        id: "258025608200585227",
        mention: "<@258025608200585227>",
      },
    ],
  };

  const guildQueue = await CurrentQueue.doc(guildId);
  const guildQueueData = await guildQueue.get();

  if (guildQueueData.exists) {
    await guildQueue.set({ ...guildQueueData, queue: queueToAdd });
  } else {
    await guildQueue.set(queueToAdd);
  }

  return AdminEmbed("Captain Queue Filled", "Queue successfully filled with captains.");
}

export async function FlipCaptains(guildId: string): Promise<MessageEmbed> {
  const guildQueue = await getQueue(guildId);

  if (!guildQueue) return ErrorEmbed("No Queue", "No queue available to flip captains.");
  if (guildQueue.blueCap === null || guildQueue.orangeCap === null)
    return ErrorEmbed("No Queue", "No queue available to flip captains.");

  const blueTeam = Array.from(guildQueue.blueTeam).filter((x) => x.id !== guildQueue.blueCap?.id);
  blueTeam.push(guildQueue.orangeCap);
  const orangeTeam = Array.from(guildQueue.orangeTeam).filter((x) => x.id !== guildQueue.orangeCap?.id);
  orangeTeam.push(guildQueue.blueCap);

  await CurrentQueue.doc(guildId).set({
    blueCap: guildQueue.orangeCap,
    orangeCap: guildQueue.blueCap,
    blueTeam,
    orangeTeam,
  });

  return AdminEmbed("Captains Flipped", "Captains have been flipped.");
}
