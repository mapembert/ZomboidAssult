// Runtime game state types

export interface GameState {
  currentChapter: string;
  currentWave: number;
  score: number;
  heroCount: number;
  currentWeapon: string;
  isGameOver: boolean;
  isPaused: boolean;
}

export interface Vector2D {
  x: number;
  y: number;
}

export enum Column {
  Left = 0,
  Right = 1,
}

export interface SpawnEvent {
  time: number;
  type: 'zomboid' | 'timer';
  entityId: string;
  column: Column;
}
