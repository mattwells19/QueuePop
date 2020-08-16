import { Schema, model } from "mongoose";

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

export default model("CurrentQueue", CurrentQueueSchema);
