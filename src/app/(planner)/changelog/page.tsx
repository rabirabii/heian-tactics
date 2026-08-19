import React from 'react';

const changelogData = [
  {
    version: '1.3.0',
    date: 'August 19, 2026',
    title: 'Community Tier Lists',
    description: 'Tier Lists are now entirely community-driven! You can now create, customize, and share your own Tier Lists.',
    changes: [
      { type: 'NEW', text: 'You can now create Personal Tier Lists and submit them for review to be published to the community.' },
      { type: 'NEW', text: 'Shikigami Roles can now be scoped per Tier List (e.g., set a Shikigami as Core DPS for your list, while the Global list uses Flex).' },
      { type: 'IMPROVEMENT', text: 'Tier List selection dropdown separates My Tier Lists and Community Tier Lists.' },
      { type: 'FIX', text: 'Fixed bug where the Edit button was visible on other players\' Tier Lists.' },
    ]
  },
  {
    version: '1.2.0',
    date: 'August 19, 2026',
    title: 'Community Builds Phase 1',
    description: 'We have introduced the highly requested Community Builds feature!',
    changes: [
      { type: 'NEW', text: 'You can now toggle your builds between Private ("My Builds") and Public ("Community Builds").' },
      { type: 'NEW', text: "Published builds will now show the author's username." },
      { type: 'NEW', text: 'Changelog page added so you never miss an update.' },
      { type: 'IMPROVEMENT', text: 'Removed the legacy Author input field when creating a build.' },
    ]
  },
  {
    version: '1.1.0',
    date: 'August 18, 2026',
    title: 'Domain & Database Migration',
    description: 'Moved the platform to its new home at heiantactics.space and completed the Supabase integration.',
    changes: [
      { type: 'NEW', text: 'Live at heiantactics.space!' },
      { type: 'NEW', text: 'Google OAuth login is now supported.' },
      { type: 'IMPROVEMENT', text: 'Full database migration to Prisma.' },
      { type: 'FIX', text: 'Lineup UI cleanup: flex slots moved to detail page to reduce clutter.' },
    ]
  },
  {
    version: '1.0.0',
    date: 'August 2026',
    title: 'Initial Release',
    description: 'The very first version of the Onmyoji Planner & Meta tool.',
    changes: [
      { type: 'NEW', text: 'Basic Shikigami Roster management.' },
      { type: 'NEW', text: 'Meta Tier List.' },
      { type: 'NEW', text: 'Draft Lineup Builder.' },
    ]
  }
];

export default function ChangelogPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-4xl font-display text-foreground tracking-wide">Changelog</h1>
        <p className="text-text-secondary mt-2 font-mono">
          Stay up to date with the latest features, improvements, and bug fixes.
        </p>
      </div>

      <div className="space-y-12 mt-8">
        {changelogData.map((log) => (
          <div key={log.version} className="relative pl-8 border-l-2 border-border-ink">
            {/* Timeline Dot */}
            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-surface border-2 border-accent-gold"></div>
            
            <div className="mb-2 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
              <h2 className="text-2xl font-display text-foreground">v{log.version}</h2>
              <span className="text-sm font-mono text-text-secondary">{log.date}</span>
            </div>
            
            <h3 className="text-lg font-mono text-accent-gold mb-2">{log.title}</h3>
            <p className="text-sm font-mono text-text-secondary mb-4">{log.description}</p>
            
            <ul className="space-y-3">
              {log.changes.map((change, i) => (
                <li key={i} className="flex gap-3 text-sm font-mono text-foreground">
                  <span className={`px-2 py-0.5 text-[10px] uppercase font-bold shrink-0 self-start mt-0.5 border
                    ${change.type === 'NEW' ? 'text-green-500 border-green-500/30 bg-green-500/10' : ''}
                    ${change.type === 'IMPROVEMENT' ? 'text-blue-500 border-blue-500/30 bg-blue-500/10' : ''}
                    ${change.type === 'FIX' ? 'text-orange-500 border-orange-500/30 bg-orange-500/10' : ''}
                  `}>
                    {change.type}
                  </span>
                  <span>{change.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
