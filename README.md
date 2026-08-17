# Heian Tactics

**Heian Tactics** is an advanced Meta Lineup Builder, Matchup Simulator, and Roster Management tool for the mobile game *Onmyoji*.

## Features
- **Meta Lineups:** Explore and build optimized team compositions for PvE and PvP (Zenith).
- **Matchup Scenarios:** Visually simulate enemy drafts and plan your counter-responses (bans, flex picks, and onmyoji substitutions).
- **Lineup Versioning:** Track historical versions of the meta as strategies evolve.
- **Roster & Builds:** Manage your Shikigami pool, track their exact Soul builds, and evaluate their stats against the meta requirements.
- **Tier List:** Interactive and dynamic tier lists based on current evaluations.

## Tech Stack
- [Next.js](https://nextjs.org/) (App Router)
- [Supabase](https://supabase.com/) (PostgreSQL & Auth)
- [Prisma](https://www.prisma.io/) (ORM)
- [Tailwind CSS v4](https://tailwindcss.com/) (Styling)
- [Zustand](https://github.com/pmndrs/zustand) (State Management)
- [Sonner](https://sonner.emilkowal.ski/) (Toast Notifications)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/rabirabii/heian-tactics.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
