export interface PlayerStats {
  gamesPlayed: number;
  atBats: number;
  runs: number;
  hits: number;
  homeRuns: number;
  rbi: number;
  avg: string;
  ops: string;
  obp: string;
  slg: string;
  doubles: number;
  triples: number;
  stolenBases: number;
  baseOnBalls: number;
  strikeOuts: number;
  plateAppearances: number;
}

export interface Player {
  id: number;
  fullName: string;
  birthCity: string;
  birthDate: string;
  height: string;
  weight: number;
  batSide: string;
  pitchHand: string;
  primaryPosition: string;
  stats: PlayerStats | null;
}
