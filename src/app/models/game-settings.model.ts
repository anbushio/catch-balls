export interface GameSettings {
  fallingSpeed: number;
  fallingFrequency: number;
  playerSpeed: number;
  gameTime: number;
}

export const DEFAULT_SETTINGS: GameSettings = {
  fallingSpeed: 0,
  fallingFrequency: 0,
  playerSpeed: 0,
  gameTime: 0,
};
