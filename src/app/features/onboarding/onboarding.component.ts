import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HabitsService } from '../../services/habits.service';
import { UserService, UserTokenInfo } from '../../services/user.service';
import { OnboardingService } from '../../services/onboarding.service';
import {
  OnboardingRequest,
  OnboardingQuestion,
  OnboardingSuggestion,
} from '../../models/onboarding.model';
import { CreateHabitDTO } from '../../models/create-habit-dto.model';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
})
export class OnboardingComponent implements OnInit {
  currentStep = 0;
  isLoading = false;
  errorMessage: string | null = null;
  showSuggestions = false;
  isGeneratingSuggestions = false;
  isCreatingHabits = false;
  showPaywall = false;
  tokenInfo: UserTokenInfo | null = null;

  answers: OnboardingRequest = {
    primaryGoal: '',
    currentStruggle: '',
    motivationLevel: '',
    availableTime: '',
    preferredSchedule: '',
  };

  suggestions: OnboardingSuggestion[] = [];
  selectedSuggestions: Set<number> = new Set();

  questions: OnboardingQuestion[] = [
    {
      id: 'primaryGoal',
      title: "What's your main goal?",
      subtitle: 'Tell us what you want to achieve with new habits',
      icon: '🎯',
      options: [
        {
          value: 'improve health and fitness',
          label: 'Improve Health & Fitness',
          icon: '💪',
        },
        {
          value: 'boost productivity',
          label: 'Boost Productivity',
          icon: '🚀',
        },
        {
          value: 'enhance learning and skills',
          label: 'Learn New Skills',
          icon: '🧠',
        },
        {
          value: 'better work-life balance',
          label: 'Better Work-Life Balance',
          icon: '⚖️',
        },
        {
          value: 'reduce stress and anxiety',
          label: 'Reduce Stress',
          icon: '🧘',
        },
        {
          value: 'improve relationships',
          label: 'Improve Relationships',
          icon: '❤️',
        },
      ],
      allowCustom: true,
    },
    {
      id: 'currentStruggle',
      title: "What's your biggest challenge?",
      subtitle: 'Understanding your obstacles helps us create better habits',
      icon: '🚧',
      options: [
        { value: 'lack of time', label: 'Not Enough Time', icon: '⏰' },
        { value: 'lack of motivation', label: 'Staying Motivated', icon: '😴' },
        {
          value: 'forgetting to do things',
          label: 'Remembering to Act',
          icon: '🤯',
        },
        { value: 'being too busy', label: 'Too Many Commitments', icon: '📅' },
        {
          value: 'perfectionism',
          label: 'All-or-Nothing Thinking',
          icon: '🎭',
        },
        { value: 'distractions', label: 'Too Many Distractions', icon: '📱' },
      ],
      allowCustom: true,
    },
    {
      id: 'motivationLevel',
      title: 'How motivated are you?',
      subtitle: 'Your energy level helps us suggest the right difficulty',
      icon: '🔥',
      options: [
        {
          value: 'very high - ready for big changes',
          label: 'Very High',
          description: 'Ready for major changes',
          icon: '🚀',
        },
        {
          value: 'moderate - want steady progress',
          label: 'Moderate',
          description: 'Steady, sustainable progress',
          icon: '🎯',
        },
        {
          value: 'low - need to start small',
          label: 'Low but Trying',
          description: 'Small steps are fine',
          icon: '🌱',
        },
        {
          value: 'unsure - exploring options',
          label: 'Just Exploring',
          description: 'Still figuring things out',
          icon: '🤔',
        },
      ],
    },
    {
      id: 'availableTime',
      title: 'How much time can you commit?',
      subtitle: "Be honest about your schedule - we'll work with what you have",
      icon: '⏱️',
      options: [
        {
          value: '5-10 minutes daily',
          label: '5-10 minutes',
          description: 'Quick micro-habits',
          icon: '⚡',
        },
        {
          value: '15-30 minutes daily',
          label: '15-30 minutes',
          description: 'Short focused sessions',
          icon: '🎯',
        },
        {
          value: '30-60 minutes daily',
          label: '30-60 minutes',
          description: 'Dedicated practice time',
          icon: '📚',
        },
        {
          value: '1+ hours daily',
          label: '1+ hours',
          description: 'Deep commitment',
          icon: '🎪',
        },
        {
          value: 'weekends only',
          label: 'Weekends Only',
          description: 'Busy weekdays',
          icon: '📅',
        },
      ],
    },
    {
      id: 'preferredSchedule',
      title: 'When do you prefer to be active?',
      subtitle: 'Timing your habits right makes them much easier to stick to',
      icon: '🌅',
      options: [
        {
          value: 'early morning (6-9 AM)',
          label: 'Early Bird',
          description: '6-9 AM',
          icon: '🌅',
        },
        {
          value: 'late morning (9-12 PM)',
          label: 'Morning Person',
          description: '9 AM-12 PM',
          icon: '☀️',
        },
        {
          value: 'afternoon (12-6 PM)',
          label: 'Afternoon Active',
          description: '12-6 PM',
          icon: '🌞',
        },
        {
          value: 'evening (6-9 PM)',
          label: 'Evening Energy',
          description: '6-9 PM',
          icon: '🌆',
        },
        {
          value: 'night (9 PM+)',
          label: 'Night Owl',
          description: '9 PM+',
          icon: '🌙',
        },
        {
          value: 'flexible schedule',
          label: 'Flexible',
          description: 'Whenever I can',
          icon: '🔄',
        },
      ],
    },
  ];

  constructor(
    private habitsService: HabitsService,
    private userService: UserService,
    private onboardingService: OnboardingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load user token information
    this.userService.getTokenInfoObservable().subscribe((tokenInfo) => {
      this.tokenInfo = tokenInfo;
    });
  }

  getCurrentQuestion(): OnboardingQuestion {
    return this.questions[this.currentStep];
  }

  getProgress(): number {
    return ((this.currentStep + 1) / this.questions.length) * 100;
  }

  selectOption(value: string): void {
    const questionId = this.getCurrentQuestion().id;
    this.answers[questionId] = value;
  }

  handleCustomInput(value: string): void {
    const questionId = this.getCurrentQuestion().id;
    this.answers[questionId] = value;
  }

  canProceed(): boolean {
    const questionId = this.getCurrentQuestion().id;
    return !!this.answers[questionId]?.trim();
  }

  nextStep(): void {
    if (!this.canProceed()) return;

    if (this.currentStep < this.questions.length - 1) {
      this.currentStep++;
    } else {
      this.generateSuggestions();
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  async generateSuggestions(): Promise<void> {
    // Check if user has tokens available
    if (!this.userService.hasTokensAvailable()) {
      this.showPaywall = true;
      return;
    }

    this.isGeneratingSuggestions = true;
    this.errorMessage = null;

    try {
      // Consume a token before making the request
      const updatedTokenInfo = await this.userService
        .consumeToken()
        .toPromise();
      if (updatedTokenInfo) {
        this.userService.updateTokenInfo(updatedTokenInfo);
      }

      this.suggestions =
        (await this.habitsService
          .generateOnboardingSuggestions(this.answers)
          .toPromise()) || [];
      this.showSuggestions = true;
      this.isGeneratingSuggestions = false;
    } catch (error) {
      this.errorMessage =
        'Failed to generate habit suggestions. Please try again.';
      this.isGeneratingSuggestions = false;
      console.error('Error generating suggestions:', error);
    }
  }

  toggleSuggestionSelection(index: number): void {
    if (this.selectedSuggestions.has(index)) {
      this.selectedSuggestions.delete(index);
    } else {
      this.selectedSuggestions.add(index);
    }
  }

  isSuggestionSelected(index: number): boolean {
    return this.selectedSuggestions.has(index);
  }

  canStartHabits(): boolean {
    return this.selectedSuggestions.size > 0;
  }

  async startSelectedHabits(): Promise<void> {
    if (!this.canStartHabits()) return;

    this.isCreatingHabits = true;
    this.errorMessage = null;

    try {
      const selectedHabits = Array.from(this.selectedSuggestions).map(
        (index) => this.suggestions[index]
      );

      // Create each selected habit
      const habitPromises = selectedHabits.map((suggestion) => {
        const habitData: CreateHabitDTO = {
          name: suggestion.name,
          description: suggestion.description,
          frequency: suggestion.frequency,
          goalType: suggestion.goalType,
          targetType: suggestion.targetType || 'ongoing',
          targetValue: suggestion.targetValue,
          streakTarget: suggestion.streakTarget,
          endDate: suggestion.endDate,
          allowedGaps: suggestion.allowedGaps || 1,
          isPrivate: suggestion.isPrivate || false,
        };
        return this.habitsService.addHabit(habitData).toPromise();
      });

      await Promise.all(habitPromises);

      // Mark onboarding as completed
      this.onboardingService.markOnboardingCompleted();

      // Navigate to habits page with success
      this.router.navigate(['/habits'], {
        queryParams: {
          onboardingComplete: 'true',
          habitsCreated: this.selectedSuggestions.size,
        },
      });
    } catch (error) {
      this.errorMessage = 'Failed to create some habits. Please try again.';
      this.isCreatingHabits = false;
      console.error('Error creating habits:', error);
    }
  }

  skipOnboarding(): void {
    // Mark onboarding as dismissed so we don't keep prompting
    this.onboardingService.dismissOnboardingPrompts();
    this.router.navigate(['/add-habit']);
  }

  tryAgain(): void {
    this.showSuggestions = false;
    this.suggestions = [];
    this.selectedSuggestions.clear();
    this.errorMessage = null;
  }

  closePaywall(): void {
    this.showPaywall = false;
  }

  async purchaseTokens(): Promise<void> {
    try {
      // For demo purposes, purchase 10 tokens
      const updatedTokenInfo = await this.userService
        .purchaseTokens(10)
        .toPromise();
      if (updatedTokenInfo) {
        this.userService.updateTokenInfo(updatedTokenInfo);
        this.showPaywall = false;
        // Proceed with generating suggestions
        this.generateSuggestions();
      }
    } catch (error) {
      this.errorMessage = 'Failed to purchase tokens. Please try again.';
      console.error('Error purchasing tokens:', error);
    }
  }

  restartOnboarding(): void {
    this.currentStep = 0;
    this.showSuggestions = false;
    this.showPaywall = false;
    this.suggestions = [];
    this.selectedSuggestions.clear();
    this.errorMessage = null;
    this.answers = {
      primaryGoal: '',
      currentStruggle: '',
      motivationLevel: '',
      availableTime: '',
      preferredSchedule: '',
    };
  }
}
