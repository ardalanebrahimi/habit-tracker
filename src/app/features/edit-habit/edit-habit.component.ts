import { Component } from '@angular/core';
import { HabitFormComponent } from '../habit-form/habit-form.component';

@Component({
  selector: 'app-edit-habit',
  standalone: true,
  imports: [HabitFormComponent],
  template: '<app-habit-form></app-habit-form>',
})
export class EditHabitComponent {}
