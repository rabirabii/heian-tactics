'use client';

import { useParams, useRouter } from 'next/navigation';
import { useRosterStore } from '@/store/roster-store';
import shikigamiData from '@/data/shikigami.json';
import soulsData from '@/data/souls.json';
import lineupsData from '@/data/meta-lineups.json';

export default function LineupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  
  const lineup = lineupsData.find(l => l.id === id);
  const { owned } = useRosterStore();

  if (!lineup) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h1 className="text-3xl font-display text-accent-vermillion">Lineup Not Found</h1>
        <button onClick={() => router.push('/meta/lineups')} className="mt-4 px-4 py-2 bg-surface border border-border-ink hover:text-foreground">
          Return to Lineups
        </button>
      </div>
    );
  }

  const getShiki = (shikiId: string) => shikigamiData.find(s => s.id === shikiId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <button onClick={() => router.push('/meta/lineups')} className="text-sm font-mono text-text-secondary hover:text-foreground mb-4">
          ← Back to Lineups
        </button>
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-display text-foreground">{lineup.name}</h1>
          <span className="px-3 py-1 bg-surface border border-border-ink text-xs font-mono text-text-secondary">
            {lineup.category}
          </span>
        </div>
        <p className="mt-2 text-text-secondary font-mono">{lineup.description}</p>
      </div>

      {/* Weaknesses */}
      {lineup.weaknesses && lineup.weaknesses.length > 0 && (
        <div className="bg-surface border-l-4 border-red-500 p-6">
          <h2 className="text-lg font-display text-red-500 mb-3 flex items-center gap-2">
            <span className="text-2xl">⚠</span> Known Weaknesses
          </h2>
          <ul className="list-disc list-inside space-y-2 text-sm font-mono text-foreground">
            {lineup.weaknesses.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Scenarios Section */}
      <div>
        <h2 className="text-2xl font-display text-foreground mb-6 border-b border-border-ink pb-2">Lineup Scenarios & Match-ups</h2>
        
        {/* PvE Scenarios */}
        {lineup.pveScenarios && lineup.pveScenarios.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-display text-accent-gold mb-4">PvE Scenarios</h3>
            <div className="space-y-4">
              {lineup.pveScenarios.map((scen: any, idx: number) => (
                <div key={idx} className="bg-background border border-border-ink p-4">
                   <h4 className="font-display text-foreground">{scen.scenarioName}</h4>
                   <p className="text-sm font-mono text-text-secondary mt-1"><span className="text-accent-vermillion">Condition:</span> {scen.condition}</p>
                   <p className="text-sm font-mono text-text-secondary mt-1"><span className="text-blue-400">Solution:</span> {scen.solution}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PvP Matchups */}
        {lineup.pvpMatchups && lineup.pvpMatchups.length > 0 && (
          <div>
            <h3 className="text-xl font-display text-accent-gold mb-4">PvP Draft Match-ups</h3>
            <div className="space-y-6">
              {lineup.pvpMatchups.map((matchup: any, idx: number) => (
                <div key={idx} className="bg-surface border border-border-ink p-6">
                  <div className="mb-4 pb-4 border-b border-border-ink">
                    <h3 className="text-xl font-display text-accent-gold">{matchup.scenarioName}</h3>
                    <p className="text-sm font-mono text-text-secondary mt-1">Condition: {matchup.condition}</p>
                  </div>

                  <h4 className="text-xs font-mono font-bold text-foreground mb-3 uppercase tracking-wider">Recommended Counter Picks:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchup.picks.map((pick: any, pIdx: number) => {
                      const shiki = getShiki(pick.shikigamiId);
                      const isOwned = owned[pick.shikigamiId];

                      return (
                        <div key={pIdx} className={`flex gap-4 p-4 border transition-colors ${isOwned ? 'border-accent-gold bg-background' : 'border-red-500/50 bg-background/50'}`}>
                          {/* Shiki Avatar */}
                          <div className="relative w-16 h-16 shrink-0 border border-border-ink bg-background">
                            {shiki?.icon ? (
                              <img src={shiki.icon} alt={shiki.name} className={`w-full h-full object-cover ${!isOwned ? 'grayscale opacity-50' : ''}`} />
                            ) : (
                              <span className="flex items-center justify-center w-full h-full text-xs">?</span>
                            )}
                            {!isOwned && (
                               <div className="absolute -bottom-2 -right-2 bg-red-500 text-surface text-[10px] font-bold px-1 py-0.5 border border-surface">MISSING</div>
                            )}
                          </div>

                          {/* Pick Info */}
                          <div className="flex-1 flex flex-col justify-center">
                            <div className="font-display font-bold text-lg text-foreground">{shiki?.name || pick.shikigamiId}</div>
                            <div className="text-xs font-mono text-accent-vermillion mt-0.5">Soul: {pick.soulRecommended}</div>
                            {pick.soulStats && (
                              <div className="text-[10px] font-mono text-accent-gold mt-1 bg-surface p-1 border border-border-ink/50 inline-block">
                                Stat Req: {pick.soulStats}
                              </div>
                            )}
                            <p className="text-[11px] font-mono text-text-secondary mt-2 leading-relaxed">
                              {pick.reason}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {(!lineup.pveScenarios || lineup.pveScenarios.length === 0) && (!lineup.pvpMatchups || lineup.pvpMatchups.length === 0) && (
          <div className="text-center py-12 border border-border-ink border-dashed">
            <p className="text-text-secondary font-mono">No specific scenarios documented for this lineup yet.</p>
          </div>
        )}
      </div>

    </div>
  );
}
