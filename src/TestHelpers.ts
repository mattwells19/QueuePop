import { IBallChaser, ICurrentQueue } from "./types";
import CurrentQueue from "../Schemas/CurrentQueue";
import { AdminEmbed, ErrorEmbed } from "./EmbedHelper";
import { MessageEmbed } from "discord.js";
import { getQueue } from "./AsyncFunctions";

export async function FillQueue(guildId: string): Promise<MessageEmbed> {
  const queueToAdd: Array<IBallChaser> = [
    {
      id: "346838372649795595",
      name: "Tux",
    },
    {
      id: "227273256820801536",
      name: "twan",
    },
    {
      id: "430517075870482433",
      name: "cre8",
    },
    {
      id: "209084277223194624",
      name: "DaffyJr",
    },
    {
      id: "94264612811186176",
      name: "IncognitoTurtle",
    },
    {
      id: "146095425475182592",
      name: "furrywolfman33",
    },
  ];

  const guildQueue = await CurrentQueue.findOne({ guildId: guildId });

  if (guildQueue) {
    await CurrentQueue.findByIdAndUpdate(guildQueue._id, { queue: queueToAdd });
  } else {
    await new CurrentQueue({
      guildId: guildId,
      queue: queueToAdd,
      orangeCap: null,
      blueCap: null,
      blueTeam: [],
      orangeTeam: [],
    }).save();
  }

  return AdminEmbed("Queue Filled", "Queue successfully filled.");
}

export async function ClearQueue(guildId: string): Promise<MessageEmbed> {
  await CurrentQueue.findOneAndRemove({ guildId: guildId });
  return AdminEmbed("Queue Cleared", "Queue has been cleared.");
}

export async function FillCaptains(guildId: string): Promise<MessageEmbed> {
  const queueToAdd: ICurrentQueue = {
    queue: [
      {
        name: "Speed",
        id: "71812906886365184",
      },
      {
        name: "DaffyJr",
        id: "209084277223194624",
      },
      {
        name: "Don",
        id: "528369347807412227",
      },
      {
        name: "Onion",
        id: "177896719734800384",
      },
    ],
    orangeCap: {
      name: "Tux",
      id: "346838372649795595",
    },
    blueCap: {
      name: "Quintic",
      id: "258025608200585227",
    },
    orangeTeam: [
      {
        name: "Tux",
        id: "346838372649795595",
      },
    ],
    blueTeam: [
      {
        name: "Quintic",
        id: "258025608200585227",
      },
    ],
  };

  const guildQueue = await CurrentQueue.findOne({ guildId: guildId });

  if (guildQueue) {
    await CurrentQueue.findByIdAndUpdate(guildQueue._id, { ...queueToAdd });
  } else {
    await new CurrentQueue({ guildId: guildId, ...queueToAdd }).save();
  }

  return AdminEmbed("Captain Queue Filled", "Queue successfully filled with captains.");
}

export async function FlipCaptains(guildId: string): Promise<MessageEmbed> {
  const guildQueue = await getQueue(guildId);

  if (!guildQueue) return ErrorEmbed("No Queue", "No queue available to flip captains.");

  const blueTeam = Array.from(guildQueue.blueTeam).filter((x) => x.id !== guildQueue.blueCap.id);
  blueTeam.push(guildQueue.orangeCap);
  const orangeTeam = Array.from(guildQueue.orangeTeam).filter((x) => x.id !== guildQueue.orangeCap.id);
  orangeTeam.push(guildQueue.blueCap);

  await CurrentQueue.findOneAndUpdate(
    { guildId: guildId },
    {
      blueCap: guildQueue.orangeCap,
      orangeCap: guildQueue.blueCap,
      blueTeam,
      orangeTeam,
    }
  );

  return AdminEmbed("Captains Flipped", "Captains have been flipped.");
}
