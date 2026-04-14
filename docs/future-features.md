# Future Features

This document outlines planned features and improvements for Orbit.

## Authentication System

### Overview
Implement multi-user support with authentication, allowing each user to have their own isolated data and personalized experience.

### Authentication Provider Options

We are evaluating the following authentication solutions:

1. **Google OAuth**
   - Pros: Simple integration, widely used, no password management
   - Cons: Requires Google account, less control over user experience
   - Best for: Quick implementation, users comfortable with Google

2. **Better Auth**
   - Pros: Modern, TypeScript-first, flexible, built-in security features
   - Cons: Newer library, smaller community
   - Best for: Full control, modern stack alignment

3. **Clerk**
   - Pros: Comprehensive solution, excellent UX, built-in user management
   - Cons: Paid service (with free tier), vendor lock-in
   - Best for: Rapid development, production-ready features

4. **Resend (Magic Links)**
   - Pros: Passwordless, clean UX, email-based
   - Cons: Requires email service setup, less traditional
   - Best for: Modern passwordless experience

### Implementation Requirements

- User registration and login flows
- Session management
- Password reset functionality (if applicable)
- Email verification
- Social login options (optional)
- Account deletion

## Multi-User Data Isolation

### Database Architecture

**Option 1: Row-Level Security (RLS)**
- Single database with user ID on all tables
- PostgreSQL RLS policies for automatic filtering
- Pros: Simpler schema, easier migrations
- Cons: Requires careful RLS setup, potential performance impact

**Option 2: Separate Databases per User**
- Each user gets their own database instance
- Pros: Complete isolation, better performance scaling
- Cons: Complex management, higher infrastructure costs

**Option 3: Schema-Based Isolation**
- Single database, separate schemas per user
- Pros: Good balance of isolation and management
- Cons: PostgreSQL-specific, schema management complexity

**Recommended Approach:** Row-Level Security with user ID foreign keys on all tables.

### Schema Changes Required

- Add `User` model to Prisma schema
- Add `userId` field to all existing models:
  - Person
  - Interaction
  - FollowUp
  - Event
  - Paper
  - Tag
  - Positioning
  - CalendarSync
- Add indexes on `userId` for performance
- Create database migration strategy for existing single-user data

### Data Migration Strategy

1. **For Existing Users:**
   - Create a default user account
   - Assign all existing data to this user
   - Provide migration script/tool

2. **For New Users:**
   - Start with empty database
   - Guide through onboarding

## Career-Agnostic Design

### Overview
Transform Orbit from an ML-specific tool to a career-agnostic platform that adapts to any professional field.

### Changes Required

#### 1. Remove ML-Specific Terminology

**Current → Future:**
- "ML mastery" → "Professional growth" or user-defined
- "Papers" → "Resources", "Articles", "Learning Materials" (user-configurable)
- "ML engineer" → Generic professional terms
- Tagline: Remove "ML" references, make it dynamic

#### 2. Dynamic Terminology System

**User Profile Settings:**
- Career field selection (e.g., "Software Engineering", "Design", "Marketing", "Finance", "Healthcare", etc.)
- Custom terminology preferences:
  - "Papers" → User can rename to "Articles", "Resources", "Case Studies", etc.
  - "Coffee Chats" → "Networking Calls", "Mentor Sessions", etc.
  - "Events" → "Conferences", "Meetups", "Workshops", etc.

#### 3. Adaptive UI Components

- Dynamic labels based on user's career field
- Context-aware suggestions and prompts
- Field-specific templates and examples
- Customizable reflection prompts

#### 4. Template Customization

- AI Studio templates adapt to user's field
- Message templates use field-appropriate language
- Question generators tailored to profession

### Implementation Phases

**Phase 1: User Profile & Settings**
- Add `User` model with `careerField` field
- Create user profile/settings page
- Add terminology customization options

**Phase 2: Dynamic Labels**
- Replace hardcoded strings with dynamic labels
- Create label mapping system
- Update all UI components

**Phase 3: Template Adaptation**
- Update AI Studio templates
- Create field-specific template variants
- Add template selection based on career field

**Phase 4: Content Migration**
- Update documentation
- Update README
- Update onboarding flow

## Multi-Tenant Architecture

### User Preferences Storage

**New Model: `UserPreferences`**
```prisma
model UserPreferences {
  id            String   @id @default(cuid())
  userId        String   @unique
  careerField   String?
  terminology   Json?    // Custom terminology mappings
  theme         String?  // UI theme preferences
  notifications Json?    // Notification preferences
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Data Isolation Strategy

1. **Middleware/API Layer:**
   - Extract user ID from session
   - Automatically filter queries by `userId`
   - Prevent cross-user data access

2. **Database Layer:**
   - RLS policies enforce user isolation
   - Foreign key constraints ensure data integrity

3. **Application Layer:**
   - Type-safe query builders that include user context
   - Validation to prevent user ID manipulation

## Implementation Phases

### Phase 1: Authentication Integration
- Choose and integrate authentication provider
- Implement login/registration flows
- Add session management
- Create user model and migrations

### Phase 2: User Management & Profiles
- User profile pages
- Settings management
- Account deletion
- User preferences storage

### Phase 3: Career Field Customization
- Career field selection
- Terminology customization UI
- Dynamic label system
- Update existing content

### Phase 4: Multi-Tenant Data Isolation
- Add `userId` to all models
- Implement RLS policies
- Update all API routes for user context
- Data migration for existing users

### Phase 5: UI/UX Updates
- Update all UI components for dynamic labels
- Career-agnostic onboarding
- Field-specific templates
- Update documentation

## Technical Considerations

### Database Migration Strategy

1. **Backward Compatibility:**
   - Support both authenticated and anonymous users during transition
   - Graceful degradation for unauthenticated access

2. **Data Export/Import:**
   - Users can export their data before migration
   - Import functionality for data portability

3. **Performance:**
   - Index optimization for `userId` queries
   - Query optimization for multi-tenant queries
   - Caching strategies per user

### Security Considerations

- Row-level security policies
- API route authentication middleware
- Input validation and sanitization
- Rate limiting per user
- Secure session management

### Backward Compatibility

- Existing single-user installations should continue working
- Migration path for existing data
- Clear upgrade instructions

## Future Enhancements (Post-MVP)

- Team/organization support
- Shared workspaces
- Collaboration features
- Advanced analytics per user
- Mobile app with authentication
- Cloud sync (optional, user-controlled)
- API access for integrations
- Webhooks for external systems

## Notes

- All features should maintain Orbit's core philosophy: local-first, reflection-focused, calm UI
- Career-agnostic design should feel natural, not forced
- Authentication should be optional initially, with clear migration path
- User data privacy and security are paramount
