# Supabase integration plan

AI Math Playground uses a dedicated Supabase project, separate from other products.

## Core data model
- parent_profiles: parent account profile
- child_profiles: child nickname, grade, current quarter, avatar, stars, XP, level
- learning_progress: world/concept/game-mode mastery, curriculum quarter, difficulty, preferred help, attempts, correct, hints
- play_sessions: session start/end, attempts, correct, stars earned, XP earned
- answer_events: per-question learning event, difficulty, correctness, hint type, response time
- weekly_league_scores: weekly ranking score plus grade/quarter/world/mastery scope
- league_public_profiles: nickname/avatar-only public league profile

## League v2
League ranking is segmented by learning context rather than one global list.

Scope:
- grade: 1-6
- quarter: 1-4
- world: current curriculum world
- mastery band: support / growing / secure / mastered

Ranking tie-break order:
1. league points
2. growth points
3. newly secured concepts
4. challenge wins
5. active days
6. earlier update time

Scoring principles:
- Do not reward repetitive grinding of easy questions.
- Reward progress at the learner's current level.
- Give weight to new concept mastery, boss/challenge success, active days and healthy persistence.
- Keep stars as a fun currency separate from league points.
- Keep mastery as an educational measurement separate from league points.
- Show nickname and avatar only in public league views.

## Security
- Row Level Security on child learning tables
- Parent accounts can only read/write their own children and learning data
- Public league surface exposes nickname/avatar and ranking context only
- Google OAuth is the primary parent sign-in method

## Rollout
1. Google parent sign-in
2. Child profile onboarding: nickname, grade, quarter, avatar
3. Account-scoped persistence and cloud sync
4. Curriculum-specific problem engine
5. League scoring engine
6. Grade/quarter/world league UI with Top 100 and personal rank
7. Parent learning report queries
8. PWA install and device sync
