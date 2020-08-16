import { PlayerQueued } from "./Queue";
import { addPlayerToQueue } from "./QueueAsync";
import { IBallChaser } from "../Utils/types";

jest.mock("./QueueAsync");
const mockAddPlayerToQueue = jest.fn(addPlayerToQueue);

const mockBallChaser: IBallChaser = {
  name: "Matt",
  id: "12345",
  mention: "<@12345>",
};

it("adds player to queue correctly", async () => {
  mockAddPlayerToQueue.mockResolvedValue("error");
  const returnedMessage = await PlayerQueued("0000", mockBallChaser);
  expect(returnedMessage).toBe(expect.objectContaining({ title: "Could Not Add Player to Queue" }));
});
