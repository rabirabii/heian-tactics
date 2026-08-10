'use client';

import Link from 'next/link';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function ShikigamiDetailClient({ shikigami }: { shikigami: any }) {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Navigation */}
      <div>
        <Link href="/shikigami" className="text-text-secondary hover:text-foreground font-mono text-sm inline-flex items-center gap-2">
          ← Back to Shikigami
        </Link>
      </div>

      {/* Hero Section */}
      <div className="bg-surface border border-border-ink p-6 md:p-10 flex flex-col md:flex-row gap-8 items-start">
        <div className="w-32 h-32 md:w-48 md:h-48 border-2 border-border-ink bg-background shrink-0 relative">
          {shikigami.icon ? (
            <img src={shikigami.icon} alt={shikigami.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-secondary font-mono text-xl bg-border-ink/10">?</div>
          )}
          {shikigami.beginnerFriendly && (
            <div className="absolute top-0 left-0 bg-green-600/90 text-white text-xs font-bold px-2 py-1" title="Beginner Friendly">🔰 Beginner</div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex gap-3 items-center mb-2">
            <span className="text-sm font-mono text-accent-gold border border-accent-gold px-2 py-1">{shikigami.rarityId}</span>
            {shikigami.roles?.map((r: any) => (
              <span key={r.id} className="text-xs font-mono bg-border-ink/30 text-text-secondary px-2 py-1">
                {r.name}
              </span>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl font-display text-foreground mb-4 tracking-wide">{shikigami.name}</h1>
          <p className="text-text-secondary font-mono max-w-2xl leading-relaxed">
            {/* Lore or short description can go here later */}
          </p>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Evaluations */}
        <div className="bg-surface border border-border-ink p-6">
          <h2 className="text-xl font-display text-foreground border-b border-border-ink pb-2 mb-4">Evaluations</h2>
          {shikigami.evaluations?.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {shikigami.evaluations.map((ev: any) => {
                const hasMetrics = ev.metrics && Object.keys(ev.metrics).length > 0;
                let chartData: any[] = [];
                if (hasMetrics) {
                  const m = ev.metrics;
                  chartData = [
                    { subject: 'Flexibility', A: m.flexibility || 0, fullMark: 10 },
                    { subject: 'Counter Resist', A: m.counterResist || 0, fullMark: 10 },
                    { subject: 'Draft Impact', A: m.draftImpact || 0, fullMark: 10 },
                    { subject: 'Utility', A: m.utility || 0, fullMark: 10 },
                    { subject: 'Damage', A: m.damage || 0, fullMark: 10 },
                  ];
                }

                return (
                  <div key={ev.id} className="bg-background border border-border-ink p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs text-text-secondary uppercase font-mono">{ev.category.name}</span>
                        <div className="text-3xl font-display text-accent-gold mt-1">{ev.score}</div>
                      </div>
                      {hasMetrics && (
                        <div className="w-24 h-24 shrink-0 -mt-2 -mr-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
                              <PolarGrid stroke="#333" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 8 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                              <Radar name="Metrics" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                    {ev.notes && (
                      <div 
                        className="mt-3 pt-3 border-t border-border-ink/50 text-xs text-text-secondary font-mono prose prose-invert prose-sm max-w-none [&_p]:m-0"
                        dangerouslySetInnerHTML={{ __html: ev.notes }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-text-secondary font-mono text-sm py-4">No evaluations available.</div>
          )}
        </div>

        {/* Strengths & Weaknesses */}
        <div className="bg-surface border border-border-ink p-6">
          <h2 className="text-xl font-display text-foreground border-b border-border-ink pb-2 mb-4">Analysis</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-green-500 font-mono text-sm mb-2 flex items-center gap-2">
                <span>+</span> Strengths
              </h3>
              {shikigami.strengths?.length > 0 ? (
                <ul className="list-disc list-inside text-text-secondary font-mono text-sm space-y-1">
                  {shikigami.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              ) : (
                <span className="text-text-secondary font-mono text-xs">Unknown</span>
              )}
            </div>
            <div>
              <h3 className="text-red-500 font-mono text-sm mb-2 flex items-center gap-2">
                <span>-</span> Weaknesses
              </h3>
              {shikigami.weaknesses?.length > 0 ? (
                <ul className="list-disc list-inside text-text-secondary font-mono text-sm space-y-1">
                  {shikigami.weaknesses.map((w: string, i: number) => <li key={i}>{w}</li>)}
                </ul>
              ) : (
                <span className="text-text-secondary font-mono text-xs">Unknown</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-surface border border-border-ink p-6 md:p-10">
        <h2 className="text-2xl font-display text-foreground border-b border-border-ink pb-4 mb-6">Skills</h2>
        {shikigami.skills?.length > 0 ? (
          <div className="space-y-8">
            {shikigami.skills.map((skill: any) => (
              <div key={skill.id} className="flex gap-6 items-start bg-background border border-border-ink p-6">
                <div className="w-16 h-16 shrink-0 bg-surface border border-border-ink">
                  {skill.icon ? (
                    <img src={skill.icon} alt={skill.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-secondary font-mono text-xs">?</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3">
                    <h3 className="text-xl font-display text-foreground">{skill.name}</h3>
                    <div className="flex gap-2 items-center mt-2 md:mt-0">
                      {skill.type && <span className="text-xs font-mono bg-border-ink/30 text-text-secondary px-2 py-1">{skill.type}</span>}
                      {skill.cost !== null && (
                        <span className="text-xs font-mono border border-blue-500/30 text-blue-400 px-2 py-1 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500 block"></span> {skill.cost} Onibi
                        </span>
                      )}
                      {skill.cooldown !== null && skill.cooldown > 0 && (
                        <span className="text-xs font-mono border border-border-ink text-text-secondary px-2 py-1">
                          CD: {skill.cooldown}
                        </span>
                      )}
                    </div>
                  </div>
                  <div 
                    className="prose prose-invert max-w-none text-text-secondary font-mono text-sm leading-relaxed mb-4 [&_img]:inline-block [&_img]:h-5 [&_img]:w-5 [&_img]:align-middle [&_img]:mx-1"
                    dangerouslySetInnerHTML={{ __html: skill.description }}
                  />
                  
                  {skill.levelUpgrades?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border-ink/50">
                      <h4 className="text-xs font-mono text-foreground mb-2">Level Upgrades:</h4>
                      <ul className="space-y-1">
                        {skill.levelUpgrades.map((lvl: string, i: number) => (
                          <li key={i} className="text-xs font-mono text-text-secondary flex gap-2">
                            <span className="text-accent-gold/70 shrink-0">Lv.{i+2}</span>
                            <span>{lvl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {skill.levelReq && (
                    <div className="mt-4 inline-block bg-accent-vermillion/10 border border-accent-vermillion/30 px-3 py-1 text-xs font-mono text-accent-vermillion">
                      Requirement: {skill.levelReq}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-text-secondary font-mono text-sm py-8 text-center bg-background border border-border-ink border-dashed">
            Skill data is not yet available for this Shikigami.
          </div>
        )}
      </div>

    </div>
  );
}
