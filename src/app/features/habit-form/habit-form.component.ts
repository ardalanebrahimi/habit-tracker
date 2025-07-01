import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitsService } from '../../services/habits.service';
import { CreateHabitDTO } from '../../models/create-habit-dto.model';
import { UserService, UserTokenInfo } from '../../services/user.service';
import { PaywallService } from '../../services/paywall.service';
import { TokenBalanceComponent } from '../../components/token-balance/token-balance.component';
import { PaywallModalComponent } from '../../components/paywall-modal/paywall-modal.component';

@Component({
  selector: 'app-habit-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TokenBalanceComponent,
    PaywallModalComponent,
  ],
  templateUrl: './habit-form.component.html',
  styleUrls: ['./habit-form.component.scss'],
})
export class HabitFormComponent implements OnInit {
  step = 1;
  isEditMode = false;
  habitId: string | null = null;
  pageTitle = 'Create a New Habit';
  habit: CreateHabitDTO = {
    name: '',
    description: '',
    frequency: 'daily',
    goalType: 'binary',
    targetType: 'ongoing',
    allowedGaps: 1,
    isPrivate: false,
  };

  minDate = new Date().toISOString().split('T')[0];
  isLoading = false;
  errorMessage: string | null = null;
  startType: string = 'Immediate';

  // AI suggestion properties
  showAiModal = false;
  aiPrompt = '';
  isAiLoading = false;
  aiErrorMessage: string | null = null;
  aiSuggestion: CreateHabitDTO | null = null;
  showAiPreview = false;

  // Token and paywall properties
  tokenInfo: UserTokenInfo | null = null;

  constructor(
    private habitsService: HabitsService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private paywallService: PaywallService
  ) {}

  ngOnInit(): void {
    // Check if we're in edit mode
    this.habitId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.habitId;
    this.pageTitle = this.isEditMode ? 'Edit Habit' : 'Create a New Habit';

    // Load user token information
    this.userService.getTokenInfoObservable().subscribe((tokenInfo) => {
      this.tokenInfo = tokenInfo;
    });

    if (this.isEditMode && this.habitId) {
      this.loadHabitForEditing();
    }
  }

  private loadHabitForEditing(): void {
    this.isLoading = true;
    this.habitsService.getHabitById(this.habitId!).subscribe({
      next: (habit) => {
        if (habit) {
          // Map HabitWithProgressDTO to CreateHabitDTO format
          this.habit = {
            name: habit.name || '',
            description: habit.description || '',
            frequency: habit.frequency,
            goalType: habit.goalType,
            targetValue: habit.targetValue,
            targetType: habit.targetType || 'ongoing',
            streakTarget: habit.streakTarget,
            endDate: habit.endDate,
            allowedGaps: habit.allowedGaps || 1,
            startDate: habit.startDate,
            isPrivate: habit.isPrivate || false,
          };
        } else {
          this.errorMessage = 'Habit not found.';
        }
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load habit details.';
        this.isLoading = false;
      },
    });
  }

  nextStep(): void {
    this.step++;
  }

  previousStep(): void {
    this.step--;
  }

  saveHabit(): void {
    // Check habit limit for new habits (not when editing)
    if (!this.isEditMode) {
      this.paywallService
        .checkActionPermission('habit_creation', 1)
        .then((canProceed) => {
          if (!canProceed) {
            // Paywall was shown, don't proceed
            return;
          }
          this.proceedWithSave();
        });
    } else {
      this.proceedWithSave();
    }
  }

  private proceedWithSave(): void {
    this.isLoading = true;
    this.errorMessage = null;

    if (this.habit.startDate) {
      this.habit.startDate = new Date(this.habit.startDate).toISOString();
    }
    if (this.habit.endDate) {
      this.habit.endDate = new Date(this.habit.endDate).toISOString();
    }

    const request = this.isEditMode
      ? this.habitsService.updateHabit(this.habitId!, this.habit)
      : this.habitsService.addHabit(this.habit);

    request.subscribe({
      next: () => {
        this.isLoading = false;
        // Refresh token info after habit creation
        if (!this.isEditMode) {
          this.userService.refreshTokenInfo();
        }
        this.router.navigate(['/habits']);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = `Failed to ${
          this.isEditMode ? 'update' : 'add'
        } habit. Please try again.`;
      },
    });
  }

  // AI suggestion methods
  openAiModal(): void {
    // Check if user has tokens for AI suggestions
    this.paywallService
      .checkActionPermission('ai_simple', 1)
      .then((canProceed) => {
        if (!canProceed) {
          // Paywall was shown, don't proceed
          return;
        }

        this.showAiModal = true;
        this.aiPrompt = '';
        this.aiErrorMessage = null;
        this.aiSuggestion = null;
        this.showAiPreview = false;
      });
  }

  closeAiModal(): void {
    this.showAiModal = false;
    this.aiPrompt = '';
    this.aiErrorMessage = null;
    this.aiSuggestion = null;
    this.showAiPreview = false;
  }

  generateAiSuggestion(): void {
    if (!this.aiPrompt.trim() || this.aiPrompt.length > 500) {
      this.aiErrorMessage = 'Please enter a valid prompt (1-500 characters)';
      return;
    }

    // Check tokens again before spending
    this.paywallService
      .checkActionPermission('ai_simple', 1)
      .then((canProceed) => {
        if (!canProceed) {
          this.closeAiModal();
          return;
        }

        this.isAiLoading = true;
        this.aiErrorMessage = null;

        // Spend token for AI suggestion
        this.userService
          .spendTokens({
            transactionType: 'ai_suggestion',
            description: 'AI habit suggestion',
            amount: 1,
          })
          .subscribe({
            next: (updatedTokenInfo) => {
              // Update token info after spending
              this.userService.updateTokenInfo(updatedTokenInfo);
              this.tokenInfo = updatedTokenInfo;

              // Generate AI suggestion
              this.habitsService
                .generateHabitSuggestion(this.aiPrompt)
                .subscribe({
                  next: (suggestion) => {
                    this.aiSuggestion = suggestion;
                    this.showAiPreview = true;
                    this.isAiLoading = false;
                  },
                  error: (err) => {
                    this.aiErrorMessage =
                      'Failed to generate suggestion. Please try again.';
                    this.isAiLoading = false;
                    console.error('AI suggestion error:', err);
                  },
                });
            },
            error: (err) => {
              this.aiErrorMessage =
                'Not enough tokens. Please get more tokens to use AI features.';
              this.isAiLoading = false;
              console.error('Token spending error:', err);
            },
          });
      });
  }

  useAiSuggestion(): void {
    if (!this.aiSuggestion) return;

    // Remove AI-specific fields and use the rest directly
    const { ...habitData } = this.aiSuggestion;

    // Direct assignment - no conversion needed since AI response extends CreateHabitDTO
    this.habit = { ...this.habit, ...habitData };

    // Close modal and advance to next step
    this.closeAiModal();
    this.step = 2; // Move to frequency & type step
  }

  tryAgain(): void {
    this.showAiPreview = false;
    this.aiSuggestion = null;
  }

  // Helper methods for UI
  canUseAi(): boolean {
    return this.userService.hasTokensAvailable();
  }

  canCreateMoreHabits(): boolean {
    return this.userService.canCreateHabits();
  }

  getTokenCount(): number {
    return this.tokenInfo?.tokenBalance || 0;
  }

  // Display helpers for AI suggestion preview
  formatFrequency(frequency: string): string {
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  }

  formatGoalType(goalType: string): string {
    return goalType === 'binary'
      ? 'Yes/No (Binary)'
      : 'Count/Measure (Numeric)';
  }

  formatTargetType(targetType: string): string {
    switch (targetType) {
      case 'ongoing':
        return 'Ongoing';
      case 'streak':
        return 'Streak Target';
      case 'endDate':
        return 'End Date Target';
      default:
        return targetType;
    }
  }
}
