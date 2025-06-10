import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CheeringService } from './cheering.service';
import { environment } from '../../environments/environment';
import { CheerRequest, Cheer } from '../models/cheer.model';

describe('CheeringService', () => {
  let service: CheeringService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/cheer`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CheeringService],
    });
    service = TestBed.inject(CheeringService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send a cheer', () => {
    const cheerRequest: CheerRequest = {
      habitId: 'habit-123',
      toUserId: 'user-456',
      emoji: '👏',
      message: 'Great job!',
    };

    service.sendCheer(cheerRequest).subscribe();

    const req = httpMock.expectOne(`${apiUrl}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(cheerRequest);
    req.flush(null);
  });

  it('should get cheers for habit', () => {
    const habitId = 'habit-123';
    const mockCheers = [
      {
        id: 'cheer-1',
        habitId: 'habit-123',
        fromUserId: 'user-456',
        fromUsername: 'TestUser',
        toUserId: 'user-789',
        emoji: '👏',
        message: 'Great job!',
        createdAt: '2024-01-15T10:00:00Z',
        habitName: 'Exercise',
      },
    ];

    service.getCheersForHabit(habitId).subscribe((cheers) => {
      expect(cheers).toHaveLength(1);
      expect(cheers[0].id).toBe('cheer-1');
    });

    const req = httpMock.expectOne(`${apiUrl}/habit/${habitId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCheers);
  });

  it('should get received cheers', () => {
    const mockCheers = [
      {
        id: 'cheer-1',
        habitId: 'habit-123',
        fromUserId: 'user-456',
        fromUsername: 'TestUser',
        toUserId: 'user-789',
        emoji: '👏',
        message: 'Great job!',
        createdAt: '2024-01-15T10:00:00Z',
        habitName: 'Exercise',
      },
    ];

    service.getReceivedCheers().subscribe((cheers) => {
      expect(cheers).toHaveLength(1);
    });

    const req = httpMock.expectOne(`${apiUrl}/received`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCheers);
  });

  it('should get sent cheers', () => {
    const mockCheers = [
      {
        id: 'cheer-1',
        habitId: 'habit-123',
        fromUserId: 'user-456',
        fromUsername: 'TestUser',
        toUserId: 'user-789',
        emoji: '👏',
        message: 'Great job!',
        createdAt: '2024-01-15T10:00:00Z',
        habitName: 'Exercise',
      },
    ];

    service.getSentCheers().subscribe((cheers) => {
      expect(cheers).toHaveLength(1);
    });

    const req = httpMock.expectOne(`${apiUrl}/sent`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCheers);
  });

  it('should get cheer summary', () => {
    const mockSummary = [
      {
        habitId: 'habit-123',
        habitName: 'Exercise',
        totalCheers: 5,
        recentCheers: 2,
      },
    ];

    service.getCheerSummary().subscribe((summary) => {
      expect(summary).toHaveLength(1);
      expect(summary[0].totalCheers).toBe(5);
    });

    const req = httpMock.expectOne(`${apiUrl}/summary`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSummary);
  });

  it('should delete a cheer', () => {
    const cheerId = 'cheer-123';

    service.deleteCheer(cheerId).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/${cheerId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should determine if user can cheer for habit', () => {
    // User cannot cheer their own habits
    expect(service.canCheerForHabit('user-123', 'user-123')).toBeFalse();

    // User can cheer friends' habits
    expect(service.canCheerForHabit('user-456', 'user-123')).toBeTrue();
  });

  it('should return random cheer message', () => {
    const message = service.getRandomCheerMessage();
    expect(message).toBeTruthy();
    expect(typeof message).toBe('string');
  });

  it('should return random cheer emoji', () => {
    const emoji = service.getRandomCheerEmoji();
    expect(emoji).toBeTruthy();
    expect(typeof emoji).toBe('string');
  });
});
