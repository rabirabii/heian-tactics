'use client';

import { useRouter } from 'next/navigation';
import { useRosterStore } from '@/store/roster-store';
import LineupSlotCard from '@/components/lineups/LineupSlotCard';

export default function LineupDetailClient({ 
  lineup, 
  shikigamiData, 
  soulsData, 
  onmyojiData, 
  onmyojiSkillData,
  relatedLineups 
}: { 
  lineup: any, 
  shikigamiData: any[], 
  soulsData: any[], 
  onmyojiData: any[], 
  onmyojiSkillData: any[],
  relatedLineups?: any[]
}) {
  const router = useRouter();
  const { owned } = useRosterStore();

  const getShiki = (shikiId: string) => shikigamiData.find(s => s.id === shikiId);
  const getSoul = (soulId: string) => soulsData.find(s => s.id === soulId);
  const getOnmyoji = (onmyojiId: string) => onmyojiData?.find(o => o.id === onmyojiId);
  const getOnmyojiSkill = (skillId: string) => onmyojiSkillData?.find(s => s.id === skillId);

  const pveScenarios = lineup.scenarios?.filter((s: any) => s.type === 'PVE' || s.type === 'PVE_ALTERNATIVE') || [];
  const pvpMatchups = lineup.scenarios?.filter((s: any) => s.type === 'PVP' || s.type === 'PVP_DRAFT' || s.type === 'PVP_WIN_CON') || [];

  const getMergedSlots = (slots: any[], baseLineupId?: string) => {
    if (!slots || !Array.isArray(slots)) return [];
    
    // Default to the current lineup if no specific baseLineupId is provided
    let baseSlots = lineup.slots || [];
    
    if (baseLineupId) {
      const related = relatedLineups?.find((l: any) => l.id === baseLineupId);
      if (related?.slots) {
        baseSlots = related.slots;
      }
    }

    return slots.map(scenarioSlot => {
      const baseSlot = baseSlots.find((s: any) => s.slotNumber === scenarioSlot.slotNumber && s.shikigamiId === scenarioSlot.shikigamiId);
      if (!baseSlot) return scenarioSlot;
      
      // Merge, preferring scenario overrides, but keeping base properties if scenario properties are empty
      return {
        ...baseSlot,
        ...scenarioSlot,
        primarySouls: scenarioSlot.primarySouls?.length ? scenarioSlot.primarySouls : baseSlot.primarySouls,
        secondarySouls: scenarioSlot.secondarySouls?.length ? scenarioSlot.secondarySouls : baseSlot.secondarySouls,
        slot2: scenarioSlot.slot2 || baseSlot.slot2,
        slot4: scenarioSlot.slot4 || baseSlot.slot4,
        slot6: scenarioSlot.slot6 || baseSlot.slot6,
        statReq: scenarioSlot.statReq || baseSlot.statReq,
        indicator: scenarioSlot.indicator || baseSlot.indicator,
        minSpeed: scenarioSlot.minSpeed || baseSlot.minSpeed,
        buildId: scenarioSlot.buildId || baseSlot.buildId
      };
    });
  };

  const onmyojiSlots = lineup.slots?.filter((s: any) => s.slotType === 'ONMYOJI' || s.onmyojiId).sort((a: any, b: any) => a.slotNumber - b.slotNumber) || [];
  const coreSlots = lineup.slots?.filter((s: any) => s.slotType === 'CORE' && !s.onmyojiId).sort((a: any, b: any) => a.slotNumber - b.slotNumber) || [];
  const flexSlots = lineup.slots?.filter((s: any) => s.slotType === 'FLEX').sort((a: any, b: any) => a.slotNumber - b.slotNumber) || [];

  const mapSlotToCol = (slot: any, type: string) => {
    const isFlex = !slot.shikigamiId && slot.indicator?.toUpperCase().includes("FLEX") || slot.shikigamiId === 'flex';
    const entity = type === 'onmyoji' 
      ? (slot.onmyojiId ? getOnmyoji(slot.onmyojiId) : null)
      : (slot.shikigamiId && !isFlex ? getShiki(slot.shikigamiId) : null);
    
    return {
      type,
      data: slot,
      displayHero: entity,
      isPrimaryOwned: type === 'onmyoji' ? true : (entity ? owned[slot.shikigamiId] : false),
      isMissing: type === 'onmyoji' || isFlex ? false : !owned[slot.shikigamiId],
      isFlex,
      subUsed: null,
    };
  };

  const coreColumns = coreSlots.map((s: any) => mapSlotToCol(s, 'shikigami'));
  const onmyojiColumns = onmyojiSlots.map((s: any) => mapSlotToCol(s, 'onmyoji'));
  const flexColumns = flexSlots.map((s: any) => mapSlotToCol(s, 'shikigami'));

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
            {lineup.subcategory?.category?.type?.name} / {lineup.subcategory?.category?.name} / {lineup.subcategory?.name}
          </span>
        </div>
      </div>

      {/* Full Lineup Roster */}
      <div className="bg-surface border border-border-ink p-6 mb-8">
        <h2 className="text-xl font-display text-accent-gold mb-6 border-b border-border-ink pb-2">Full Draft Pool</h2>
        <div className="flex flex-col gap-6">
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
            {coreColumns.map((col: any, idx: number) => (
              <LineupSlotCard 
                key={`core-${idx}`}
                col={col}
                getSoul={getSoul}
                getOnmyoji={getOnmyoji}
                getOnmyojiSkill={getOnmyojiSkill}
                lineup={lineup}
              />
            ))}
            {onmyojiColumns.length > 0 && (
              <>
                <div className="w-px bg-border-ink mx-2 shrink-0"></div>
                {onmyojiColumns.map((col: any, idx: number) => (
                  <LineupSlotCard 
                    key={`onm-${idx}`}
                    col={col}
                    getSoul={getSoul}
                    getOnmyoji={getOnmyoji}
                    getOnmyojiSkill={getOnmyojiSkill}
                    lineup={lineup}
                  />
                ))}
              </>
            )}
          </div>
          
          {flexColumns.length > 0 && (
            <div>
              <h4 className="text-xs font-mono font-bold text-blue-400 mb-2 uppercase tracking-wider">Flex / Situational:</h4>
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                {flexColumns.map((col: any, idx: number) => (
                  <LineupSlotCard 
                    key={`flex-${idx}`}
                    col={col}
                    getSoul={getSoul}
                    getOnmyoji={getOnmyoji}
                    getOnmyojiSkill={getOnmyojiSkill}
                    lineup={lineup}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description and Notes
      {(lineup.description || lineup.notes) && (
        <div className="bg-surface border border-border-ink p-6">
          <h2 className="text-lg font-display text-accent-gold mb-4 flex items-center gap-2">
             Strategy & Notes
          </h2>
          {lineup.description && (
             <p className="text-sm font-mono text-foreground whitespace-pre-line mb-4">{lineup.description}</p>
          )}
          {lineup.notes && (
             <div className={`text-sm font-mono text-text-secondary whitespace-pre-line ${lineup.description ? 'border-t border-border-ink pt-4' : ''}`}>
               {lineup.notes}
             </div>
          )}
        </div>
      )} */}

      {/* Weaknesses */}
      {lineup.weaknesses && lineup.weaknesses.length > 0 && (
        <div className="bg-surface border-l-4 border-red-500 p-6">
          <h2 className="text-lg font-display text-red-500 mb-3 flex items-center gap-2">
            <span className="text-2xl">⚠</span> Known Weaknesses
          </h2>
          <ul className="list-disc list-inside space-y-2 text-sm font-mono text-foreground">
            {lineup.weaknesses.map((w: string, idx: number) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Scenarios Section */}
      <div>
        <h2 className="text-2xl font-display text-foreground mb-6 border-b border-border-ink pb-2">Lineup Scenarios & Match-ups</h2>
        
        {/* PvE Scenarios */}
        {pveScenarios.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-display text-accent-gold mb-4">PvE Scenarios</h3>
            <div className="space-y-4">
              {pveScenarios.map((scen: any, idx: number) => (
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
        {pvpMatchups.length > 0 && (
          <div>
            <h3 className="text-xl font-display text-accent-gold mb-4">PvP Draft Match-ups</h3>
            <div className="space-y-6">
              {pvpMatchups.map((matchup: any, idx: number) => (
                <div key={idx} className="bg-surface border border-border-ink p-6">
                  <div className="mb-4 pb-4 border-b border-border-ink">
                    <h3 className="text-xl font-display text-accent-gold mb-3">{matchup.scenarioName}</h3>
                    
                    {/* Render Bans Phase */}
                    {matchup.conditions?.some((c: any) => c.type === 'ENEMY_BAN' || c.type === 'OUR_BAN') && (
                      <div className="mb-4 bg-background border border-border-ink p-4 flex gap-8">
                        {['ENEMY_BAN', 'OUR_BAN'].map(banType => {
                          const bans = matchup.conditions.filter((c: any) => c.type === banType);
                          if (bans.length === 0) return null;
                          return (
                            <div key={banType} className="flex-1">
                              <h4 className={`text-[10px] font-mono mb-2 uppercase ${banType === 'ENEMY_BAN' ? 'text-red-400' : 'text-accent-vermillion'}`}>
                                {banType === 'ENEMY_BAN' ? 'Enemy Bans' : 'Our Bans'}
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {bans.map((cond: any, cIdx: number) => {
                                  const shiki = getShiki(cond.shikigamiId);
                                  return (
                                    <div key={cIdx} className="relative w-10 h-10 border border-border-ink bg-surface flex items-center justify-center overflow-hidden" title={shiki?.name || cond.shikigamiId}>
                                      {shiki?.icon ? (
                                        <>
                                          <img src={shiki.icon} alt={shiki?.name} className="w-full h-full object-cover grayscale opacity-70 mix-blend-luminosity" />
                                          <div className="absolute inset-0 bg-red-900/20"></div>
                                          <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-14 h-0.5 bg-red-500 rotate-45 shadow-[0_0_8px_rgba(239,68,68,1)]"></div>
                                          </div>
                                        </>
                                      ) : (
                                        <span className="text-[10px] text-text-secondary font-mono">?</span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Render Text Conditions */}
                    {matchup.conditions?.some((c: any) => c.type === 'TEXT') && (
                      <div className="flex flex-col gap-2 mb-3">
                        <span className="text-xs font-mono text-text-secondary uppercase">Matchup Notes:</span>
                        <div className="flex flex-col gap-1">
                          {matchup.conditions.filter((c: any) => c.type === 'TEXT').map((cond: any, cIdx: number) => (
                            <div key={cIdx} className="bg-background border border-border-ink px-3 py-2 text-xs font-mono text-foreground flex items-start gap-2">
                              <span className="text-accent-gold mt-0.5">•</span>
                              <span>{cond.customText}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {matchup.solution && (
                      <p className="text-sm font-mono text-green-400 mt-2 border-t border-border-ink pt-2">Solution Notes: {matchup.solution}</p>
                    )}
                  </div>

                  {/* Render Stacked Draft Variants */}
                  <div className="flex flex-col gap-8 mt-4">
                    
                    {/* OUR DRAFT (Response) */}
                    <div>
                      <h4 className="text-xs font-mono font-bold text-accent-vermillion mb-3 uppercase tracking-wider">Our Draft (Response):</h4>
                      {matchup.solutionSlots?.length > 0 ? (
                        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                          {getMergedSlots(matchup.solutionSlots, matchup.baseLineupId).map((slot: any, slIdx: number) => {
                            const isFlex = slot.shikigamiId === 'flex' || (!slot.shikigamiId && slot.indicator?.toUpperCase().includes('FLEX'));
                            const isOnmyoji = slot.slotType === 'ONMYOJI' || slot.onmyojiId; // Fallback to onmyojiId if slotType is missing from old data
                            const entity = isOnmyoji ? getOnmyoji(slot.onmyojiId) : getShiki(slot.shikigamiId);
                            
                            const col = {
                              type: isOnmyoji ? 'onmyoji' : 'shikigami',
                              data: slot,
                              displayHero: entity,
                              isFlex,
                              isPrimaryOwned: isOnmyoji ? true : (entity ? !!owned[entity.id] : false),
                              isMissing: false
                            };

                            return (
                              <LineupSlotCard 
                                key={`our-${slIdx}`}
                                col={col as any}
                                getSoul={getSoul}
                                getOnmyoji={getOnmyoji}
                                getOnmyojiSkill={getOnmyojiSkill}
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-sm text-text-secondary font-mono italic">No specific variant lineup configured.</div>
                      )}
                    </div>

                    {/* OPPONENT DRAFT */}
                    {matchup.enemySlots?.length > 0 && (
                      <div className="mt-8">
                        <h4 className="text-xs font-mono font-bold text-red-400 mb-3 uppercase tracking-wider">Opponent Draft:</h4>
                        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                          {getMergedSlots(matchup.enemySlots, matchup.baseEnemyLineupId).map((slot: any, slIdx: number) => {
                            const isFlex = slot.shikigamiId === 'flex' || (!slot.shikigamiId && slot.indicator?.toUpperCase().includes('FLEX'));
                            const isOnmyoji = slot.slotType === 'ONMYOJI' || slot.onmyojiId;
                            const entity = isOnmyoji ? getOnmyoji(slot.onmyojiId) : getShiki(slot.shikigamiId);
                            
                            const col = {
                              type: isOnmyoji ? 'onmyoji' : 'shikigami',
                              data: slot,
                              displayHero: entity,
                              isFlex,
                              isPrimaryOwned: isOnmyoji ? true : (entity ? !!owned[entity.id] : false),
                              isMissing: false
                            };

                            return (
                              <LineupSlotCard 
                                key={`enemy-${slIdx}`}
                                col={col as any}
                                getSoul={getSoul}
                                getOnmyoji={getOnmyoji}
                                getOnmyojiSkill={getOnmyojiSkill}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {pveScenarios.length === 0 && pvpMatchups.length === 0 && (
          <div className="text-center py-12 border border-border-ink border-dashed">
            <p className="text-text-secondary font-mono">No specific scenarios documented for this lineup yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
