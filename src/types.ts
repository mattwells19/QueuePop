export interface ICurrentQueue {
  queue: Array<IBallChaser>;
  orangeCap: string;
  blueCap: string;
  blueTeam: Array<IBallChaser>;
  orangeTeam: Array<IBallChaser>;
}

export interface IBallChaser {
  id: string;
  name: string;
}
