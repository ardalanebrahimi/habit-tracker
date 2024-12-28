import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllHabitsComponent } from './all-habits.component';

describe('AllHabitsComponent', () => {
  let component: AllHabitsComponent;
  let fixture: ComponentFixture<AllHabitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllHabitsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllHabitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
