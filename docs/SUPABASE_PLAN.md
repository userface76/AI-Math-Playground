# Supabase integration plan

AI Math Playground will use a dedicated Supabase project, separate from other products.

Planned data model:
- parent_profiles: parent account profile
- child_profiles: child nickname, grade, avatar, stars, XP, level
- learning_progress: world/concept/game-mode mastery, difficulty, preferred help, attempts, correct, hints
- play_sessions: session start/end, attempts, correct, stars earned, XP earned
- answer_events: per-question learning event, difficulty, correctness, hint type, response time

Security:
- Row Level Security on all child learning tables
- Parent accounts can only read/write their own children and learning data
- Child leaderboard should use nickname/avatar only

Rollout:
1. Create dedicated Supabase project
2. Apply schema migration
3. Connect publishable key in web app
4. Add parent sign-in and child profile picker
5. Replace localStorage persistence with Supabase sync while keeping local fallback
6. Add parent report queries
