'use client';

import Link from 'next/link';

export default function OnmyojiDetailClient({ onmyoji }: { onmyoji: any }) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in">
      {/* Header section */}
      <div className="flex items-center gap-4 text-sm font-mono text-text-secondary">
        <Link href="/shikigami" className="hover:text-foreground hover:underline">Shikigami</Link>
        <span>/</span>
        <Link href="/shikigami/champions" className="hover:text-foreground hover:underline">Champions</Link>
        <span>/</span>
        <span className="text-foreground">{onmyoji.name}</span>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-4">
        {/* Left Col: Avatar */}
        <div className="flex flex-col gap-4 w-full md:w-1/3 shrink-0">
          <div className="aspect-square bg-surface border border-border-ink w-full relative overflow-hidden flex items-center justify-center p-4">
            {onmyoji.icon ? (
              <img src={onmyoji.icon} alt={onmyoji.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-6xl font-display text-border-ink">{onmyoji.name.substring(0, 2)}</span>
            )}
          </div>
          
          <div className="bg-surface border border-border-ink p-6 flex flex-col gap-2">
            <h1 className="text-3xl font-display text-foreground leading-tight">
              {onmyoji.name}
            </h1>
            <div className="flex gap-2 items-center flex-wrap mt-2">
              <span className="text-sm font-mono text-accent-gold border border-accent-gold px-2 py-1 uppercase font-bold">
                {onmyoji.role || 'Champion'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: Skills */}
        <div className="flex flex-col gap-8 w-full">
          {/* Skills Details Section */}
          <div className="bg-surface border border-border-ink p-6 md:p-8">
            <h2 className="text-xl font-display text-foreground border-b border-border-ink pb-4 mb-6">Skills & Abilities</h2>
            
            {onmyoji.skills && onmyoji.skills.length > 0 ? (
              <div className="space-y-8">
                {onmyoji.skills.map((skill: any, index: number) => (
                  <div key={skill.id || index} className="flex flex-col sm:flex-row gap-6 items-start">
                    {/* Skill Icon */}
                    <div className="w-16 h-16 shrink-0 bg-background border border-border-ink overflow-hidden flex items-center justify-center">
                      {skill.icon ? (
                        <img src={skill.icon} alt={skill.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-xl text-border-ink">?</span>
                      )}
                    </div>
                    
                    {/* Skill Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2 items-center flex-wrap">
                          <h3 className="text-lg font-display text-accent-gold">{skill.name}</h3>
                          {skill.type && <span className="text-[10px] font-mono bg-border-ink/30 text-text-secondary px-2 py-1">{skill.type}</span>}
                          {skill.cooldown !== null && skill.cooldown > 0 && (
                            <span className="text-[10px] font-mono border border-border-ink text-text-secondary px-2 py-1">
                              CD: {skill.cooldown}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-background border border-border-ink">
                        <div 
                          className="prose prose-invert max-w-none text-sm font-mono text-text-secondary leading-relaxed [&_img]:inline-block [&_img]:h-5 [&_img]:w-5 [&_img]:align-middle [&_img]:mx-1 [&_p]:inline"
                          dangerouslySetInnerHTML={{ __html: skill.description || 'No description provided.' }}
                        />
                      </div>

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
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-border-ink border-dashed">
                <p className="text-text-secondary font-mono">No skills available for this Onmyoji yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
