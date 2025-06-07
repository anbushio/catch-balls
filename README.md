# Mini-Game – Developer Guide

## Tech Stack

- Angular
- Typescript
- RxJS
- SCSS
- HTML, Canvas

## 1. Introduction

This repository contains a lightweight arcade-style game built with **Angular**, **TypeScript**, **RxJS 7** and the native **Canvas API**. The player moves a rectangle left or right to catch falling balls; each catch increments the score. Game behaviour (speed, frequency, duration, etc.) is driven entirely by a reactive _Game Settings Form_ and a pure-RxJS _Game Engine_ service.

> **Why RxJS?** By modelling every game element as a stream (settings, keyboard input, object spawns, collisions, timer ticks) we avoid manual `setTimeout` chains and keep side-effects isolated, producing deterministic, easily-testable code.

## 2. Quick Start

| Step | Command            | Notes                                                                     |
| ---- | ------------------ | ------------------------------------------------------------------------- |
| 1    | `git clone <repo>` | Clone the project.                                                        |
| 2    | `npm install`      | Install dependencies.                                                     |
| 3    | `npm run start`    | Runs `ng serve` + open at [http://localhost:4200](http://localhost:4200). |

> **For production** – run `npm run build` to generate a `dist/` bundle.

## 3. Project Layout (`src/`)

```
app/
 ├─ components/
 │   ├─ settings-form/          ← reactive form UI
 │   ├─ game-board/             ← <canvas> renderer + keyboard focus
 │   └─ score-display/          ← live score & timer HUD
 ├─ services/
 │   ├─ game-engine.service.ts  ← RxJS core logic
 │   └─ websocket.service.ts    ← pseudo-WebSocket wrapper
 ├─ models/
 │   ├─ game-settings.model.ts  ← interface GameSettings
 │   └─ game-state.model.ts     ← interface GameState
 └─ app.module.ts               ← declarations & providers
```

> **Single-responsibility:** Components only render & emit DOM events; all timing, physics and state live in services.

## 4. Component Responsibilities

### 4.1 SettingsFormComponent

- Builds a `FormGroup` with **`nonNegativeNumber`** validators.
- Emits typed `GameSettings` into `GameEngineService.settings$`.
- On `gameTime` change ▶ automatically calls `gameEngine.reset()`.

### 4.2 GameBoardComponent

- Hosts a `<canvas #gameCanvas>` element (fixed width × height).
- Subscribes to `GameEngineService.render$` to repaint via `requestAnimationFrame`.
- Listens for `keydown` on the window and forwards to `GameEngineService.onPlayerMove()`.

### 4.3 ScoreDisplayComponent

- Displays `caughtObjects` and `timeRemaining` from `GameEngineService.state$`.
- Shows a simple "Game Over" banner when `running === false`.

## 5. Services

### 5.1 GameEngineService

```typescript
@Injectable({ providedIn: "root" })
export class GameEngineService {
  readonly settings$ = new BehaviorSubject<GameSettings>(DEFAULT_SETTINGS);
  private readonly stateSubject = new BehaviorSubject<GameState>(initialState());
  readonly state$ = this.stateSubject.asObservable();
  // ........
  /* …methods: connect(), initializeGame(), onPlayerMove() … */
}
```

Key patterns:

- **Immutable state** – we `map` to new objects instead of mutating.
- **`animationFrames()`** – RxJS helper emits on every `requestAnimationFrame`.
- **Cold streams** – All operators are inside the service; components only subscribe.

## 6. Validation Rules

| Field            | Rule            | Error Message                                 |
| ---------------- | --------------- | --------------------------------------------- |
| fallingSpeed     | > 0             | "Speed must be positive"                      |
| fallingFrequency | ≥ 16 ms         | "Frequency too low"                           |
| playerSpeed      | 1 – canvasWidth | "Invalid player speed"                        |
| gameTime         | 1 – 600 s       | "Game time must be between 1 and 600 seconds" |

Angular's `Validators.pattern(/^[0-9]+$/)` prevents non-numeric input.
