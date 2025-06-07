export interface GameState {
  caughtObjects: number;
  timeRemaining: number; // seconds
  running: boolean;
}

export interface Ball {
  x: number;
  y: number;
  radius: number;
}

export interface Player {
  x: number; // centre
  width: number;
  height: number;
}

export const initialState = (): GameState => ({
  caughtObjects: 0,
  timeRemaining: 0,
  running: false,
});
