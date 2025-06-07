import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { GameEngineService } from '../../services/game-engine.service';
import { GameSettings } from '../../models/game-settings.model';
import { CommonModule } from '@angular/common';
import { filter, pairwise, startWith } from 'rxjs/operators';

interface FormFieldConfig {
  name: string;
  validators: any[];
}

@Component({
  selector: 'app-settings-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings-form.component.html',
  styleUrls: ['./settings-form.component.scss'],
})
export class SettingsFormComponent implements OnInit {
  settingsForm!: FormGroup;
  private prevGameTime: number | null = null;

  readonly formFields: FormFieldConfig[] = [
    {
      name: 'fallingSpeed',
      validators: [
        Validators.required,
        Validators.min(1),
        Validators.pattern('^[0-9]*$'),
      ],
    },
    {
      name: 'fallingFrequency',
      validators: [
        Validators.required,
        Validators.min(16),
        Validators.pattern('^[0-9]*$'),
      ],
    },
    {
      name: 'playerSpeed',
      validators: [
        Validators.required,
        Validators.min(1),
        Validators.pattern('^[0-9]*$'),
      ],
    },
    {
      name: 'gameTime',
      validators: [
        Validators.required,
        Validators.min(1),
        Validators.max(600),
        Validators.pattern('^[0-9]*$'),
      ],
    },
  ];

  constructor(private fb: FormBuilder, private gameEngine: GameEngineService) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.setupFormValueChanges();
  }

  private initializeForm(): void {
    const formControls = this.formFields.reduce(
      (acc, field) => ({
        ...acc,
        [field.name]: ['', field.validators],
      }),
      {}
    );

    this.settingsForm = this.fb.group(formControls);
  }

  private setupFormValueChanges(): void {
    this.settingsForm.valueChanges
      .pipe(
        startWith(this.settingsForm.value),
        pairwise(),
        filter(() => this.settingsForm.valid)
      )
      .subscribe(([prev, curr]) => {
        const changedField = this.getChangedField(prev, curr);
        const settings: GameSettings = this.createGameSettings(
          this.settingsForm.value
        );
        this.updateGame(settings, changedField);
      });
  }

  private getChangedField(prev: any, curr: any): string | null {
    for (const key of Object.keys(curr)) {
      if (prev[key] !== curr[key]) {
        return key;
      }
    }
    return null;
  }

  private createGameSettings(values: any): GameSettings {
    return {
      fallingSpeed: Number(values.fallingSpeed),
      fallingFrequency: Number(values.fallingFrequency),
      playerSpeed: Number(values.playerSpeed),
      gameTime: Number(values.gameTime),
    };
  }

  private updateGame(
    settings: GameSettings,
    changedField: string | null
  ): void {
    if (!this.gameEngine.hasGameStarted) {
      this.gameEngine.startGame(settings);
      this.gameEngine.updateSettings(settings);
      return;
    }

    switch (changedField) {
      case 'gameTime':
        this.gameEngine.restartGameWithSettings(settings);
        break;

      case 'fallingSpeed':
      case 'fallingFrequency':
        this.gameEngine.updateSettings(settings);
        break;

      default:
        this.gameEngine.updateSettings(settings);
    }
  }

  getErrorMessage(control: AbstractControl | null): string {
    if (!control?.errors || !control.touched) {
      return '';
    }

    const errors = control.errors;

    if (errors['required']) {
      return 'This field is required';
    }
    if (errors['pattern']) {
      return 'Only positive numbers are allowed';
    }
    if (errors['min']) {
      return `Minimum value is ${errors['min'].min}`;
    }
    if (errors['max']) {
      return `Maximum value is ${errors['max'].max}`;
    }

    return 'Invalid value';
  }
}
