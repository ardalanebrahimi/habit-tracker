# Cheer API Endpoints Documentation

## Required Backend Endpoints for Friends Cheering System

Based on the frontend implementation, the following API endpoints need to be implemented in the backend:

### Base URL: `{apiUrl}/cheer`

### 1. Send Cheer

- **Endpoint**: `POST /cheer`
- **Purpose**: Send a cheer to a friend for their habit completion
- **Request Body**:

```json
{
  "habitId": "string",
  "toUserId": "string",
  "emoji": "string",
  "message": "string"
}
```

- **Response**: `void` (204 No Content)

### 2. Get Cheers for Habit

- **Endpoint**: `GET /cheer/habit/{habitId}`
- **Purpose**: Get all cheers received for a specific habit
- **Response**:

```json
[
  {
    "id": "string",
    "habitId": "string",
    "fromUserId": "string",
    "fromUsername": "string",
    "toUserId": "string",
    "emoji": "string",
    "message": "string",
    "createdAt": "string (ISO date)",
    "habitName": "string"
  }
]
```

### 3. Get Received Cheers

- **Endpoint**: `GET /cheer/received`
- **Purpose**: Get all cheers received by the current user
- **Response**: Same format as above

### 4. Get Sent Cheers

- **Endpoint**: `GET /cheer/sent`
- **Purpose**: Get all cheers sent by the current user
- **Response**: Same format as above

### 5. Get Cheer Summary

- **Endpoint**: `GET /cheer/summary`
- **Purpose**: Get cheer counts/summary for user's habits
- **Response**:

```json
[
  {
    "habitId": "string",
    "habitName": "string",
    "totalCheers": "number",
    "recentCheers": "number"
  }
]
```

### 6. Delete Cheer

- **Endpoint**: `DELETE /cheer/{cheerId}`
- **Purpose**: Delete a cheer (only by sender)
- **Response**: `void` (204 No Content)

## Notification Integration

When a cheer is sent, the backend should also create a notification:

- **Type**: `CheerReceived`
- **Data**: Include `CheerFrom`, `CheerFromUsername`, `HabitId`, `HabitName`

## Database Schema Considerations

### Cheer Table

```sql
CREATE TABLE Cheers (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    HabitId UNIQUEIDENTIFIER NOT NULL,
    FromUserId UNIQUEIDENTIFIER NOT NULL,
    ToUserId UNIQUEIDENTIFIER NOT NULL,
    Emoji NVARCHAR(10) NOT NULL,
    Message NVARCHAR(500),
    CreatedAt DATETIME2 NOT NULL,
    FOREIGN KEY (HabitId) REFERENCES Habits(Id),
    FOREIGN KEY (FromUserId) REFERENCES Users(Id),
    FOREIGN KEY (ToUserId) REFERENCES Users(Id)
)
```

## Security & Validation

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**:
   - Users can only send cheers to friends' habits
   - Users can only delete their own cheers
   - Users cannot cheer their own habits
3. **Validation**:
   - Habit must exist and be public
   - FromUser and ToUser must be friends
   - Emoji and message length limits
   - Rate limiting to prevent spam

## Implementation Notes

1. The frontend uses `CheerFactory.createFromResponse()` to map API responses
2. Error handling should return appropriate HTTP status codes
3. Consider implementing pagination for large cheer lists
4. Add indexes on HabitId, FromUserId, ToUserId for performance
