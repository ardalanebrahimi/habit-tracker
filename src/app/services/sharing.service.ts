import { Injectable } from '@angular/core';
import { Share } from '@capacitor/share';
import { HabitWithProgressDTO } from '../models/habit-with-progress-dto.model';

export interface ShareContent {
  title: string;
  text: string;
  url?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SharingService {
  constructor() {}

  /**
   * Share habit progress to social media platforms
   */
  async shareHabitProgress(habit: HabitWithProgressDTO): Promise<void> {
    const shareContent = this.generateProgressShareContent(habit);
    await this.share(shareContent);
  }

  /**
   * Share streak achievement
   */
  async shareStreakAchievement(habit: HabitWithProgressDTO): Promise<void> {
    const shareContent = this.generateStreakShareContent(habit);
    await this.share(shareContent);
  }

  /**
   * Share habit completion for today
   */
  async shareHabitCompletion(habit: HabitWithProgressDTO): Promise<void> {
    const shareContent = this.generateCompletionShareContent(habit);
    await this.share(shareContent);
  }

  /**
   * Share milestone achievement
   */
  async shareMilestone(
    habit: HabitWithProgressDTO,
    milestone: number
  ): Promise<void> {
    const shareContent = this.generateMilestoneShareContent(habit, milestone);
    await this.share(shareContent);
  }

  /**
   * Generic share method using Capacitor's Share plugin
   */
  private async share(content: ShareContent): Promise<void> {
    try {
      await Share.share({
        title: content.title,
        text: content.text,
        url: content.url,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to Web Share API if available
      if (navigator.share) {
        try {
          await navigator.share({
            title: content.title,
            text: content.text,
            url: content.url,
          });
        } catch (webShareError) {
          console.error('Web Share API also failed:', webShareError);
          this.fallbackShare(content);
        }
      } else {
        this.fallbackShare(content);
      }
    }
  }

  /**
   * Fallback sharing method (copy to clipboard)
   */
  private fallbackShare(content: ShareContent): void {
    const shareText = `${content.title}\n\n${content.text}${
      content.url ? '\n' + content.url : ''
    }`;

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(shareText)
        .then(() => {
          alert(
            'Progress copied to clipboard! You can now paste it anywhere to share.'
          );
        })
        .catch(() => {
          this.showShareDialog(shareText);
        });
    } else {
      this.showShareDialog(shareText);
    }
  }

  /**
   * Show share dialog as final fallback
   */
  private showShareDialog(text: string): void {
    const message = `Copy this text to share:\n\n${text}`;
    prompt('Share your progress:', message);
  }

  /**
   * Generate shareable content for habit progress
   */
  private generateProgressShareContent(
    habit: HabitWithProgressDTO
  ): ShareContent {
    const frequencyText =
      habit.frequency === 'daily'
        ? 'days'
        : habit.frequency === 'weekly'
        ? 'weeks'
        : 'months';

    let progressText = `🎯 ${habit.name}\n`;

    if (habit.streak > 0) {
      progressText += `🔥 ${habit.streak} ${frequencyText} streak!\n`;
    }

    if (
      habit.goalType === 'numeric' &&
      habit.currentValue &&
      habit.targetValue
    ) {
      const percentage = Math.round(
        (habit.currentValue / habit.targetValue) * 100
      );
      progressText += `📊 Progress: ${habit.currentValue}/${habit.targetValue} (${percentage}%)\n`;
    }

    if (habit.isCompleted) {
      progressText += `✅ Completed today!\n`;
    }

    progressText += `\nKeeping up with my habits! 💪 #HabitTracker #Progress`;

    return {
      title: `My ${habit.name} Progress`,
      text: progressText,
    };
  }

  /**
   * Generate shareable content for streak achievements
   */
  private generateStreakShareContent(
    habit: HabitWithProgressDTO
  ): ShareContent {
    const frequencyText =
      habit.frequency === 'daily'
        ? 'days'
        : habit.frequency === 'weekly'
        ? 'weeks'
        : 'months';

    const streakText =
      `🔥 STREAK ACHIEVEMENT! 🔥\n\n` +
      `I've maintained my "${habit.name}" habit for ${habit.streak} ${frequencyText} in a row!\n\n` +
      `Consistency is key! 💪 #HabitTracker #Streak #Consistency`;

    return {
      title: `${habit.streak} ${frequencyText.slice(0, -1)} streak!`,
      text: streakText,
    };
  }

  /**
   * Generate shareable content for habit completion
   */
  private generateCompletionShareContent(
    habit: HabitWithProgressDTO
  ): ShareContent {
    let completionText = `✅ Just completed: ${habit.name}!\n\n`;

    if (habit.streak > 1) {
      const frequencyText =
        habit.frequency === 'daily'
          ? 'days'
          : habit.frequency === 'weekly'
          ? 'weeks'
          : 'months';
      completionText += `🔥 That's ${habit.streak} ${frequencyText} in a row!\n\n`;
    }

    completionText += `One step closer to my goals! 🎯 #HabitTracker #Achievement`;

    return {
      title: `Completed: ${habit.name}`,
      text: completionText,
    };
  }

  /**
   * Generate shareable content for milestone achievements
   */
  private generateMilestoneShareContent(
    habit: HabitWithProgressDTO,
    milestone: number
  ): ShareContent {
    const frequencyText =
      habit.frequency === 'daily'
        ? 'days'
        : habit.frequency === 'weekly'
        ? 'weeks'
        : 'months';

    const milestoneText =
      `🏆 MILESTONE REACHED! 🏆\n\n` +
      `I've hit ${milestone} ${frequencyText} of "${habit.name}"!\n\n` +
      `Building habits one day at a time. 💪 #HabitTracker #Milestone #Goals`;

    return {
      title: `${milestone} ${frequencyText} milestone!`,
      text: milestoneText,
    };
  }

  /**
   * Check if milestone was just reached
   */
  isMilestone(streak: number): boolean {
    const milestones = [7, 14, 30, 50, 100, 200, 365];
    return milestones.includes(streak);
  }

  /**
   * Get milestone number if it's a milestone
   */
  getMilestone(streak: number): number | null {
    const milestones = [7, 14, 30, 50, 100, 200, 365];
    return milestones.includes(streak) ? streak : null;
  }
}
