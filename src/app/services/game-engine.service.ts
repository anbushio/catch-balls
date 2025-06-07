import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  animationFrames,
  interval,
  fromEvent,
  combineLatest,
} from 'rxjs';
import {
  map,
  tap,
  withLatestFrom,
  filter,
  takeUntil,
  switchMap,
} from 'rxjs/operators';
import { GameSettings, DEFAULT_SETTINGS } from '../models/game-settings.model';
import {
  GameState,
  initialState,
  Ball,
  Player,
} from '../models/game-state.model';

@Injectable({
  providedIn: 'root',
})
export class GameEngineService {
  readonly settings$ = new BehaviorSubject<GameSettings>(DEFAULT_SETTINGS);
  private readonly stateSubject = new BehaviorSubject<GameState>(
    initialState()
  );
  private readonly state$ = this.stateSubject.asObservable();
  private _hasGameStarted = false;

  private player: Player = {
    x: 400,
    width: 50,
    height: 20,
  };

  private balls: Ball[] = [];
  private canvasWidth = 800;
  private canvasHeight = 600;

  readonly render$ = animationFrames().pipe(
    withLatestFrom(this.state$),
    tap(([_, state]) => {
      if (state.running) {
        this.checkCollisions();
      }
    })
  );

  public get hasGameStarted(): boolean {
    return this._hasGameStarted;
  }

  constructor() {
    this.initializeGame();
  }

  connect(): Observable<GameState> {
    return this.state$;
  }

  startGame(settings: GameSettings): void {
    if (!this._hasGameStarted) {
      this._hasGameStarted = true;
    }

    this.stateSubject.next({
      caughtObjects: 0,
      timeRemaining: settings.gameTime,
      running: true,
    });
  }

  updateSettings(settings: GameSettings): void {
    this.settings$.next(settings);
  }

  restartGameWithSettings(settings: GameSettings): void {
    // Reset state, balls, and player position
    this.balls = [];
    this.player.x = this.canvasWidth / 2;
    this.startGame(settings);
    this.updateSettings(settings);
  }

  private initializeGame(): void {
    // Create spawn timer
    this.settings$
      .pipe(
        switchMap((settings) =>
          interval(settings.fallingFrequency).pipe(
            takeUntil(this.state$.pipe(filter((state) => !state.running))),
            tap(() => this.spawnBall())
          )
        )
      )
      .subscribe();

    // Timer countdown
    interval(1000)
      .pipe(
        withLatestFrom(this.state$),
        filter(([_, state]) => state.running),
        map(([_, state]) => state.timeRemaining - 1)
      )
      .subscribe((timeRemaining) => {
        const currentState = this.stateSubject.value;
        if (timeRemaining <= 0) {
          this.stateSubject.next({
            ...currentState,
            timeRemaining: 0,
            running: false,
          });
        } else {
          this.stateSubject.next({ ...currentState, timeRemaining });
        }
      });
  }

  onPlayerMove(direction: 'left' | 'right'): void {
    if (!this.stateSubject.value.running) return;

    const settings = this.settings$.value;
    const moveAmount =
      direction === 'left' ? -settings.playerSpeed : settings.playerSpeed;

    // Calculate new position
    const newX = this.player.x + moveAmount;

    // Keep player within bounds
    if (
      newX >= this.player.width / 2 &&
      newX <= this.canvasWidth - this.player.width / 2
    ) {
      this.player.x = newX;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // Clear canvas
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Draw player
    ctx.fillStyle = 'rgb(34 197 94)';
    ctx.fillRect(
      this.player.x - this.player.width / 2,
      this.canvasHeight - this.player.height,
      this.player.width,
      this.player.height
    );

    // Draw balls
    ctx.fillStyle = '#F44336';
    this.balls.forEach((ball) => {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  private spawnBall(): void {
    const settings = this.settings$.value;
    const ball: Ball = {
      x: Math.random() * (this.canvasWidth - 20) + 10, // Random x position
      y: 0,
      radius: 10,
    };
    this.balls.push(ball);
  }

  private checkCollisions(): void {
    const settings = this.settings$.value;
    const currentState = this.stateSubject.value;

    // Move balls and check collisions
    this.balls = this.balls.filter((ball) => {
      ball.y += settings.fallingSpeed;

      // Check if ball is caught by player
      if (
        ball.y + ball.radius >= this.canvasHeight - this.player.height &&
        ball.x >= this.player.x - this.player.width / 2 &&
        ball.x <= this.player.x + this.player.width / 2
      ) {
        // Ball caught
        this.stateSubject.next({
          ...currentState,
          caughtObjects: currentState.caughtObjects + 1,
        });
        return false;
      }

      // Remove ball if it goes below the canvas
      return ball.y - ball.radius <= this.canvasHeight;
    });
  }
}
