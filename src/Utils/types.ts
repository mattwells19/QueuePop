export interface ICurrentQueue {
  queue: Array<IBallChaser>;
  orangeCap: IBallChaser | null;
  blueCap: IBallChaser | null;
  blueTeam: Array<IBallChaser>;
  orangeTeam: Array<IBallChaser>;
}

export interface IBallChaser {
  id: string;
  name: string;
  mention: string;
  queueTime?: Date;
}
