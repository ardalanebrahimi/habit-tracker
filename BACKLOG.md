# Habit Tracker - Development Backlog

## 🚨 CRITICAL MVP BLOCKERS

_These features are essential for MVP launch and must be completed first._

### 📱 Android-Specific Functionality

- [ ] **Android Back Button Handling**

  - Priority: **CRITICAL**
  - Description: Implement proper back button behavior using Capacitor App API
  - Acceptance Criteria:
    - Back button navigates properly within the app
    - Back button minimizes app when on main screen
    - Proper handling in different screen contexts
  - Technical Notes: Use Capacitor's `@capacitor/app` plugin

- [ ] **Android Reload Functionality**
  - Priority: **HIGH**
  - Description: Implement pull-to-refresh or reload mechanism for Android
  - Acceptance Criteria:
    - Users can refresh data on mobile
    - Proper loading states during refresh
    - Error handling for failed refreshes

### 🌐 Social & Virality Features

- [ ] **Public/Private Habit Toggle**

  - Priority: **CRITICAL**
  - Description: Allow users to set habits as public or private
  - Acceptance Criteria:
    - Toggle in habit creation/edit forms
    - Update `CreateHabitDTO` model to include privacy setting
    - Private habits not visible to connections
    - Clear UI indication of habit privacy status
  - Files to modify:
    - `src/app/models/create-habit-dto.model.ts`
    - `src/app/features/habit-form/`
    - `src/app/features/edit-habit/`

- [ ] **Basic Social Media Sharing**
  - Priority: **CRITICAL**
  - Description: Implement basic sharing functionality for progress
  - Acceptance Criteria:
    - Share habit progress to social platforms
    - Share streak achievements
    - Generate shareable progress images/text
    - Integration with native sharing on mobile
  - Technical Notes: Use Capacitor's `@capacitor/share` plugin

### 🔔 Notification System

- [ ] **Push Notifications Infrastructure**

  - Priority: **CRITICAL**
  - Description: Set up push notification system for habit reminders
  - Acceptance Criteria:
    - Daily habit reminders
    - Streak milestone notifications
    - Configurable notification preferences
    - Works on both web and mobile
  - Technical Notes:
    - Use Capacitor's `@capacitor/push-notifications`
    - Consider Firebase Cloud Messaging
    - Backend integration required

- [ ] **App Update Notifications**
  - Priority: **HIGH**
  - Description: Notify users when app updates are available
  - Acceptance Criteria:
    - Detect when new version is available
    - Show update prompt to users
    - Handle update process gracefully
  - Technical Notes: Use Capacitor's `@capacitor/app-update`

## 🟡 NICE-TO-HAVE (MVP+)

_Enhance UX but not blocking for launch._

### 📊 Habit Organization & Display

- [ ] **Habit Categorization (Current/Old/Upcoming)**
  - Priority: **MEDIUM**
  - Description: Split habits into time-based categories
  - Acceptance Criteria:
    - Current habits (active today)
    - Old habits (past due or completed)
    - Upcoming habits (future scheduled)
    - Proper filtering and display logic
  - Files to modify:
    - `src/app/features/today/today.component.ts`
    - `src/app/features/all-habits/`

### 🏆 Motivation & Gamification

- [ ] **Basic Milestones System**

  - Priority: **MEDIUM**
  - Description: Celebrate progress at key intervals
  - Acceptance Criteria:
    - Define milestone points (7, 30, 100 day streaks)
    - Show celebration UI when milestones reached
    - Track milestone history
  - Files to create:
    - `src/app/models/milestone.model.ts`
    - `src/app/services/milestone.service.ts`

- [ ] **Award System**
  - Priority: **MEDIUM**
  - Description: Show achievements/badges for habit completion
  - Acceptance Criteria:
    - Pop-up celebration when habit completed
    - Visual feedback for achievements
    - Badge collection system
  - Dependencies: Milestones system

### ✏️ Data Management

- [ ] **Edit Previous Days' Logs**
  - Priority: **MEDIUM**
  - Description: Allow users to modify past habit completions
  - Acceptance Criteria:
    - Access historical habit data
    - Modify completion status for past dates
    - Recalculate streaks after edits
    - Clear audit trail of changes
  - Files to modify:
    - `src/app/services/habits.service.ts`
    - `src/app/features/habit-details/`

## ⚪️ POST-MVP FEATURES

_Future enhancements for later releases._

### 📈 Advanced Analytics

- [ ] **Daily Overall State Tracking**
  - Priority: **LOW**
  - Description: Aggregate view of all habits for each day
  - Acceptance Criteria:
    - Daily completion percentage
    - Overall progress visualization
    - Historical daily performance
  - Files to create:
    - `src/app/features/daily-overview/`

### 👥 Enhanced Social Features

- [ ] **Friends Cheering System**

  - Priority: **LOW**
  - Description: Allow friends to send encouragement
  - Acceptance Criteria:
    - React to friends' habit completions
    - Send encouraging messages
    - Notification when receiving cheers
  - Dependencies: Enhanced notification system

- [ ] **Advanced Social Sharing**

  - Priority: **LOW**
  - Description: Auto-generated summaries, badges, stories
  - Acceptance Criteria:
    - Weekly/monthly progress summaries
    - Achievement badges for sharing
    - Story-format progress updates
  - Dependencies: Basic sharing system

- [ ] **Habit Groups/Teams**
  - Priority: **LOW**
  - Description: Teams working towards common goals
  - Acceptance Criteria:
    - Create/join habit groups
    - Group progress tracking
    - Team challenges and competitions
  - Files to create:
    - `src/app/models/group.model.ts`
    - `src/app/services/groups.service.ts`
    - `src/app/features/groups/`

### 🔧 Technical Improvements

- [ ] **Enhanced Timezone Handling**

  - Priority: **MEDIUM**
  - Description: Robust client vs server time handling
  - Acceptance Criteria:
    - Consistent habit tracking across timezones
    - Proper date calculations for streaks
    - User timezone preference settings
  - Files to modify:
    - `src/app/services/habits.service.ts`
    - All date-handling components

- [ ] **Habit Reset Functionality**
  - Priority: **LOW**
  - Description: Allow users to reset habit streaks
  - Acceptance Criteria:
    - Reset individual habit streaks
    - Confirmation dialog for destructive action
    - Option to keep historical data
  - Files to modify:
    - `src/app/services/habits.service.ts`
    - `src/app/features/habit-details/`

## 📋 Implementation Notes

### Priority Levels:

- **CRITICAL**: Must be completed before MVP launch
- **HIGH**: Important for user experience, complete soon after MVP
- **MEDIUM**: Enhances functionality, plan for next release cycle
- **LOW**: Future enhancements, long-term roadmap

### Dependencies:

- Most Android functionality requires Capacitor plugins
- Social features may need backend API updates
- Push notifications require server-side infrastructure
- Advanced features build upon basic implementations

### Estimated Development Timeline:

- **MVP Blockers**: 2-3 weeks
- **MVP+ Features**: 3-4 weeks
- **Post-MVP Features**: 8-12 weeks (spread over multiple releases)

---

_Last Updated: June 9, 2025_
_Status: Initial backlog creation_
