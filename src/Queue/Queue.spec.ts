import { mocked } from "ts-jest/utils";
import { PlayerQueued, ListQueue, PlayerLeavingQueue, QueuePopRandom, QueuePopCaptains } from "./Queue";
import { ICurrentQueue } from "../Utils/types";
import * as QueueAsync from "./QueueAsync";
import { getFakeBallChasers, getFakeBallChaser } from "../Utils/testUtils";

jest.mock("./QueueAsync");

describe("Queue tests", () => {
  describe("basic queue tests", () => {
    it.each<[string | ICurrentQueue, string]>([
      ["error", "Could Not Add Player to Queue"],
      [{ queue: getFakeBallChasers(1) } as ICurrentQueue, "Queue has Started"],
      [{ queue: getFakeBallChasers(2) } as ICurrentQueue, "Player Added to Queue"],
      [{ queue: getFakeBallChasers(6) } as ICurrentQueue, "Queue is Full!"],
    ])("PlayerQueued returns correct embedded message", async (resolvedValue, expectedTitle) => {
      mocked(QueueAsync.addPlayerToQueue).mockResolvedValue(resolvedValue);
      const returnedMessage = await PlayerQueued("0000", getFakeBallChaser());
      expect(returnedMessage).toHaveProperty("title", expectedTitle);
    });

    it.each<[ICurrentQueue | null, string]>([
      [{ queue: getFakeBallChasers(1) } as ICurrentQueue, "Queue Size: 1/6"],
      [null, "Queue is empty."],
    ])("ListQueue returns correct embedded message", async (resolvedValue, expectedDescription) => {
      mocked(QueueAsync.getQueue).mockResolvedValue(resolvedValue);
      const returnedMessage = await ListQueue("0000");
      expect(returnedMessage).toHaveProperty("description", expect.stringContaining(expectedDescription));
    });

    it.each<[ICurrentQueue | string | null, string, string]>([
      ["error", "Could Not Remove Player from Queue", "error"],
      [{ queue: getFakeBallChasers(1) } as ICurrentQueue, "Player Left Queue", "Queue Size: 1/6"],
      [null, "Player Left Queue", "Queue is now empty."],
    ])(
      "PlayerLeavingQueue returns correct embedded message",
      async (resolvedValue, expectedTitle, expectedDescription) => {
        mocked(QueueAsync.removePlayerFromQueue).mockResolvedValue(resolvedValue);
        const returnedMessage = await PlayerLeavingQueue("0000", getFakeBallChaser());
        expect(returnedMessage).toHaveProperty("title", expectedTitle);
        expect(returnedMessage).toHaveProperty("description", expect.stringContaining(expectedDescription));
      }
    );
  });

  describe("random queue tests", () => {
    it.each<[ICurrentQueue | null, string]>([
      [null, "Queue Not Full"],
      [{ queue: getFakeBallChasers(1) } as ICurrentQueue, "Queue Not Full"],
      [{ queue: getFakeBallChasers(6) } as ICurrentQueue, "Teams are Set!"],
      [{ queue: getFakeBallChasers(4), orangeCap: getFakeBallChaser() } as ICurrentQueue, "Captains Already Selected"],
    ])("QueuePopRandom returns correct embedded message", async (resolvedValue, expectedTitle) => {
      mocked(QueueAsync.getQueue).mockResolvedValue(resolvedValue);
      mocked(QueueAsync.removeQueue).mockResolvedValue();
      const returnedMessage = await QueuePopRandom("0000");
      expect(returnedMessage).toHaveProperty("title", expectedTitle);
    });

    it("teams are randomly assigned correctly", async () => {
      const mockPlayers = getFakeBallChasers(6);
      mocked(QueueAsync.getQueue).mockResolvedValue({ queue: mockPlayers } as ICurrentQueue);
      mocked(QueueAsync.removeQueue).mockResolvedValue();
      const returnedMessage = await QueuePopRandom("0000");
      expect(returnedMessage).toHaveProperty("title", "Teams are Set!");
      expect(returnedMessage.fields.length).toBe(2);

      const mockPlayerFound = Array(mockPlayers.length).fill(false);
      returnedMessage.fields.forEach((field) => {
        field.value.split("\n").forEach((mention) => {
          const foundMockPlayerIndex = mockPlayers.findIndex((player) => player.mention == mention);
          expect(foundMockPlayerIndex).not.toBe(-1);
          expect(mockPlayerFound[foundMockPlayerIndex]).toBe(false);
          mockPlayerFound[foundMockPlayerIndex] = true;
        });
      });
    });
  });

  describe("captain queue tests", () => {
    it.each<[ICurrentQueue | null, string]>([
      [null, "Queue Not Full"],
      [{ queue: getFakeBallChasers(1) } as ICurrentQueue, "Queue Not Full"],
      [{ queue: getFakeBallChasers(6) } as ICurrentQueue, "Captains Set"],
      [{ queue: getFakeBallChasers(4), orangeCap: getFakeBallChaser() } as ICurrentQueue, "Captains Already Selected"],
    ])("QueuePopCaptains returns correct embedded message", async (resolvedValue, expectedTitle) => {
      mocked(QueueAsync.getQueue).mockResolvedValue(resolvedValue);
      mocked(QueueAsync.updateQueue).mockResolvedValue();
      const returnedMessage = await QueuePopCaptains("0000");
      expect(returnedMessage).toHaveProperty("title", expectedTitle);
    });

    it("captains are randomly picked correctly", async () => {
      const mockPlayers = getFakeBallChasers(6);
      mocked(QueueAsync.getQueue).mockResolvedValue({ queue: mockPlayers } as ICurrentQueue);
      mocked(QueueAsync.updateQueue).mockResolvedValue();
      const returnedMessage = await QueuePopCaptains("0000");
      expect(returnedMessage).toHaveProperty("title", "Captains Set");
      expect(returnedMessage.fields.length).toBe(2);

      const mockPlayerFound = Array(mockPlayers.length).fill(false);
      returnedMessage.fields.forEach((field) => {
        field.value.split("\n").forEach((mention) => {
          const foundMockPlayerIndex = mockPlayers.findIndex((player) => player.mention == mention);
          expect(foundMockPlayerIndex).not.toBe(-1);
          expect(mockPlayerFound[foundMockPlayerIndex]).toBe(false);
          mockPlayerFound[foundMockPlayerIndex] = true;
        });
      });
    });

    it("captain picking blocks invalid picks correctly", async () => {
      const mockPlayers = getFakeBallChasers(6);
      mocked(QueueAsync.getQueue).mockResolvedValue({ queue: mockPlayers } as ICurrentQueue);
      mocked(QueueAsync.updateQueue).mockResolvedValue();
      const returnedMessage = await QueuePopCaptains("0000");
      expect(returnedMessage).toHaveProperty("title", "Captains Set");
      expect(returnedMessage.fields.length).toBe(2);

      const mockPlayerFound = Array(mockPlayers.length).fill(false);
      returnedMessage.fields.forEach((field) => {
        field.value.split("\n").forEach((mention) => {
          const foundMockPlayerIndex = mockPlayers.findIndex((player) => player.mention == mention);
          expect(foundMockPlayerIndex).not.toBe(-1);
          expect(mockPlayerFound[foundMockPlayerIndex]).toBe(false);
          mockPlayerFound[foundMockPlayerIndex] = true;
        });
      });
    });
  });
});
