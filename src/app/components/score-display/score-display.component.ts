import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameEngineService } from '../../services/game-engine.service';
import { Subscription } from 'rxjs';
import { GameState } from '../../models/game-state.model';

@Component({
  selector: 'app-score-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './score-display.component.html',
  styleUrls: ['./score-display.component.scss'],
})
export class ScoreDisplayComponent implements OnInit, OnDestroy {
  state: GameState = {
    caughtObjects: 0,
    timeRemaining: 0,
    running: false,
  };

  private subscription = new Subscription();

  constructor(private gameEngine: GameEngineService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.gameEngine.connect().subscribe((state) => {
        this.state = state;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
