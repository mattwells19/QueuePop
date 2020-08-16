export interface ICurrentQueue {
  queue: Array<IBallChaser>;
  orangeCap: IBallChaser;
  blueCap: IBallChaser;
  blueTeam: Array<IBallChaser>;
  orangeTeam: Array<IBallChaser>;
}

export interface IBallChaser {
  id: string;
  name: string;
  mention: string;
  queueTime?: Date;
}
