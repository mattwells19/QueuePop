import { Schema, model } from "mongoose";

const CurrentQueueSchema = new Schema(
  {
    guildId: String,
    queue: Array,
    orangeCap: String,
    blueCap: String,
    blueTeam: Array,
    orangeTeam: Array,
  },
  { collection: "CurrentQueue" }
);

export default model("CurrentQueue", CurrentQueueSchema);
