import { Schema, model } from "mongoose";
import { ICurrentQueue } from "../Utils/types";

const CurrentQueueSchema = new Schema(
  {
    guildId: String,
    queue: Array,
    orangeCap: {
      type: Object,
      required: false,
    },
    blueCap: {
      type: Object,
      required: false,
    },
    blueTeam: Array,
    orangeTeam: Array,
  },
  { collection: "CurrentQueue" }
);

interface IQueueSchema extends ICurrentQueue {
  guildId: string;
}

export default IQueueSchema;
