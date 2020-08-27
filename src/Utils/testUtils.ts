/* istanbul ignore file */
import { IBallChaser } from "../Utils/types";
import * as faker from "faker";

export const getFakeBallChaser = (): IBallChaser => {
  const fakeId = faker.random.uuid();
  return {
    id: fakeId,
    name: faker.name.firstName(),
    mention: `<@${fakeId}>`,
  };
};

export const getFakeBallChasers = (count = 1): Array<IBallChaser> => {
  const fakes: Array<IBallChaser> = [];
  for (let i = 0; i < count; i++) fakes.push(getFakeBallChaser());
  return fakes;
};
