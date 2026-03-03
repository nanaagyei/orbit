# Dynamic Feature System Plan

This document outlines the plan for implementing an AI-driven dynamic feature system that shows users only the features relevant to their career path.

## Goals and Scope

### Goals

1. **Personalization:** Show users only features relevant to their career (ML Engineer, Product Manager, Designer, etc.).
2. **Reduced cognitive load:** Avoid overwhelming new users with every feature.
3. **AI-driven onboarding:** Use OpenAI to infer career path and feature set from onboarding answers.
4. **User control:** Allow users to adjust features later in settings.

### Scope

- Post-sign-up onboarding flow
- Feature registry mapping feature IDs to routes and career relevance
- OpenAI integration for career/feature inference
- Sidebar, command palette, and route protection filtered by enabled features

### Out of Scope (for initial implementation)

- Real-time feature switching without page reload
- A/B testing of feature sets
- Admin override of user features

---

## Feature Registry

A central registry maps feature IDs to routes and metadata. All features are defined here.

| Feature ID | Route | Sidebar Label | Career Relevance |
|------------|-------|---------------|------------------|
| dashboard | / | Dashboard | All |
| people | /people | People | All |
| interactions | /interactions | Interactions | All |
| follow-ups | /follow-ups | Follow-Ups | All |
| papers | /papers | Papers | ML/Research/Engineering |
| events | /events | Events | All |
| calendar | /calendar | Calendar | All |
| network-map | /relationship-map | Network Map | Networking-heavy |
| ai-studio | /ai-studio | AI Studio | All |
| weekly-review | /weekly-review | Weekly Review | All |
| settings | /settings | Settings | All |

**Implementation:** `src/lib/features/registry.ts` exports `FEATURE_REGISTRY` and helper functions.

---

## Data Model

### UserFeature

```prisma
model UserFeature {
  id        String   @id @default(cuid())
  userId    String
  featureId String   // e.g., "papers", "ai-studio"
  enabled   Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, featureId])
  @@index([userId])
}
```

- One record per (userId, featureId)
- `enabled: true` means the feature is shown
- Default: all features enabled for new users (or AI-determined subset)

### Relation to User

The `User` model (from Better Auth) gets:

```prisma
model User {
  // ... Better Auth fields
  features UserFeature[]
}
```

---

## Onboarding Flow

### 1. Trigger

- After sign-up, redirect to `/onboarding` if user has no `UserFeature` records (or a flag like `onboardingComplete`).

### 2. Questions (5–8)

Examples:

1. What best describes your current role? (ML Engineer, Software Engineer, Product Manager, Designer, Researcher, Other)
2. What are your primary goals? (Networking, Learning, Career growth, Research, Building products)
3. Do you read research papers regularly? (Yes, Sometimes, Rarely, No)
4. How important is event networking to you? (Very, Somewhat, Not much)
5. What tools do you use most? (Free-form or multi-select)

### 3. API: POST /api/onboarding

**Request body:**

```json
{
  "answers": {
    "role": "ML Engineer",
    "goals": ["Networking", "Learning"],
    "papersFrequency": "Yes",
    "eventImportance": "Very",
    "tools": ["Python", "PyTorch"]
  }
}
```

**Server flow:**

1. Validate request
2. Call OpenAI with structured prompt (see below)
3. Parse response: `{ careerPath: string, featureIds: string[] }`
4. Upsert `UserFeature` for each featureId with `enabled: true`
5. Optionally set `onboardingComplete` on user
6. Return `{ success: true, featureIds }`

### 4. OpenAI Prompt Design

**System prompt:**

```
You are an assistant that maps user onboarding answers to a career profile and a set of feature IDs.
Feature IDs: dashboard, people, interactions, follow-ups, papers, events, calendar, network-map, ai-studio, weekly-review, settings.
Return a JSON object: { "careerPath": "string", "featureIds": ["id1", "id2", ...] }
- dashboard, people, interactions, follow-ups, settings are always included.
- papers: include for ML/Research/Engineering roles or if they read papers regularly.
- events, calendar: include for most users; exclude only if event importance is very low.
- network-map: include for networking-focused users.
- ai-studio: include for most users.
- weekly-review: include for users focused on growth or reflection.
```

**User message:** Serialize `answers` as JSON.

**Response parsing:** Use JSON mode or extract JSON from response. Validate `featureIds` against registry.

---

## API Endpoints

### POST /api/onboarding

- **Auth:** Required
- **Body:** `{ answers: Record<string, unknown> }`
- **Response:** `{ success: boolean, featureIds?: string[] }`
- **Side effects:** Creates/updates UserFeature records

### GET /api/features

- **Auth:** Required
- **Response:** `{ featureIds: string[] }` (enabled features for current user)
- **Use:** Sidebar, command palette, route protection

### PUT /api/features

- **Auth:** Required
- **Body:** `{ featureIds: string[] }`
- **Response:** `{ success: boolean }`
- **Use:** Settings page for user to customize features

---

## UI Integration Points

### 1. Sidebar (`src/components/layout/sidebar.tsx`)

- Fetch enabled features (e.g., via `useFeatures()` hook or context)
- Filter `navigation` array to only include items whose `featureId` is in `enabledFeatures`
- If no features loaded yet, show all (or loading state)

### 2. Command Palette (`src/components/command-palette.tsx`)

- Filter "Navigate" actions by enabled features
- Filter "Create" actions (e.g., "Add Paper" only if `papers` enabled)

### 3. Route Protection

- Middleware or layout: if user navigates to a route for a disabled feature, redirect to `/` or show "Feature not available" message

### 4. Onboarding Page

- Multi-step form with questions
- Submit to `POST /api/onboarding`
- On success, redirect to `/` or dashboard

### 5. Settings

- Optional "Features" section: checkboxes or toggle list to enable/disable features
- Calls `PUT /api/features`

---

## OpenAI Integration Requirements

- **Environment:** `OPENAI_API_KEY` in `.env`
- **Package:** `openai` (or `@openai/sdk`)
- **Model:** `gpt-4o-mini` or `gpt-4o` for structured output
- **Error handling:** If OpenAI fails, fall back to default feature set (all features or a conservative subset)

---

## Default Behavior

- **New user with no onboarding:** Show all features (or a default set: dashboard, people, interactions, follow-ups, events, calendar, ai-studio, weekly-review, settings).
- **After onboarding:** Show only AI-determined features.
- **User edits in settings:** Persist and use updated feature set.

---

## Future Enhancements

- User-editable feature preferences in Settings
- "Discover features" prompt for disabled features
- Analytics on feature usage per career path
- Admin dashboard to tune career-to-feature mapping
