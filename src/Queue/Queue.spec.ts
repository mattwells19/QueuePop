import { mocked } from "ts-jest/utils";
import { PlayerQueued, ListQueue, PlayerLeavingQueue } from "./Queue";
import { ICurrentQueue } from "../Utils/types";
import * as QueueAsync from "./QueueAsync";
import { getFakeBallChasers, getFakeBallChaser } from "../Utils/testUtils";

jest.mock("./QueueAsync");

it.each<[string | ICurrentQueue, string]>([
  ["error", "Could Not Add Player to Queue"],
  [{ queue: getFakeBallChasers(1) } as ICurrentQueue, "Queue has Started"],
  [{ queue: getFakeBallChasers(2) } as ICurrentQueue, "Player Added to Queue"],
  [{ queue: getFakeBallChasers(6) } as ICurrentQueue, "Queue is Full!"],
])("PlayerQueued returns correct embedded message", async (resolvedValue, expectedTitle) => {
  mocked(QueueAsync.addPlayerToQueue).mockResolvedValue(resolvedValue);
  const returnedMessage = await PlayerQueued("0000", getFakeBallChaser());
  expect(returnedMessage.title).toBe(expectedTitle);
});

it.each<[ICurrentQueue | null, string]>([
  [{ queue: getFakeBallChasers(1) } as ICurrentQueue, "Queue Size: 1/6"],
  [null, "Queue is empty."],
])("ListQueue returns correct embedded message", async (resolvedValue, expectedDescription) => {
  mocked(QueueAsync.getQueue).mockResolvedValue(resolvedValue);
  const returnedMessage = await ListQueue("0000");
  expect(returnedMessage.description).toContain(expectedDescription);
});

it.each<[ICurrentQueue | string | null, string, string]>([
  ["error", "Could Not Remove Player from Queue", "error"],
  [{ queue: getFakeBallChasers(1) } as ICurrentQueue, "Player Left Queue", "Queue Size: 1/6"],
  [null, "Player Left Queue", "Queue is now empty."],
])("PlayerLeavingQueue returns correct embedded message", async (resolvedValue, expectedTitle, expectedDescription) => {
  mocked(QueueAsync.removePlayerFromQueue).mockResolvedValue(resolvedValue);
  const returnedMessage = await PlayerLeavingQueue("0000", getFakeBallChaser());
  expect(returnedMessage.title).toBe(expectedTitle);
  expect(returnedMessage.description).toContain(expectedDescription);
});
