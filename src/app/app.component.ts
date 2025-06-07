import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsFormComponent } from './components/settings-form/settings-form.component';
import { ScoreDisplayComponent } from './components/score-display/score-display.component';
import { GameBoardComponent } from './components/game-board/game-board.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SettingsFormComponent,
    ScoreDisplayComponent,
    GameBoardComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Slots Game';
}
