import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameEngineService } from '../../services/game-engine.service';
import { Subscription } from 'rxjs';
import { GameState } from '../../models/game-state.model';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss'],
})
export class GameBoardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private subscription = new Subscription();
  private gameState: GameState = {
    caughtObjects: 0,
    timeRemaining: 0,
    running: false,
  };

  private leftPressed = false;
  private rightPressed = false;

  constructor(private gameEngine: GameEngineService) {}

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    this.ctx = ctx;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Subscribe to game state
    this.subscription.add(
      this.gameEngine.connect().subscribe((state) => {
        this.gameState = state;
      })
    );

    // Start render loop
    this.subscription.add(
      this.gameEngine.render$.subscribe(() => {
        this.movePlayerIfNeeded();
        this.gameEngine.draw(this.ctx);
      })
    );
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.gameState.running) return;

    // Ignore if focus is on an input, textarea, or contenteditable
    const active = document.activeElement;
    if (
      active &&
      (active.tagName === 'INPUT' ||
        active.tagName === 'TEXTAREA' ||
        (active as HTMLElement).isContentEditable)
    ) {
      return;
    }

    if (event.key === 'ArrowLeft') this.leftPressed = true;
    if (event.key === 'ArrowRight') this.rightPressed = true;
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') this.leftPressed = false;
    if (event.key === 'ArrowRight') this.rightPressed = false;
  }

  private movePlayerIfNeeded(): void {
    if (!this.gameState.running) return;
    if (this.leftPressed) this.gameEngine.onPlayerMove('left');
    if (this.rightPressed) this.gameEngine.onPlayerMove('right');
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
