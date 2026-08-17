import { useState } from 'react';
import { Plus, X, ArrowLeft, Copy } from 'lucide-react';
import { useLineupBuilderStore } from '@/store/lineup-builder-store';
import ShikigamiSelectorModal from '@/components/ui/ShikigamiSelectorModal';

export default function ScenarioBuilderPanel({
  shikigamiData,
  onmyojiData,
  lineupsData,
  isNew,
  handleSave
}: {
  shikigamiData: any[];
  onmyojiData?: any[];
  lineupsData: any[];
  isNew: boolean;
  handleSave: () => void;
}) {
  const {
    scenarios,
    addScenario,
    updateScenario,
    removeScenario,
    addScenarioPick,
    removeScenarioPick,
    setConfigSlotData,
    setBuilderStep,
    isNewVersion,
    setMetadata,
    isSaving,
  } = useLineupBuilderStore();

  const [selectorTarget, setSelectorTarget] = useState<{ sIdx: number, type: 'pick' | 'condition' | 'responseSlot' | 'enemySlot', cIdx?: number, pIdx?: number } | null>(null);
  const [importTarget, setImportTarget] = useState<{ sIdx: number, type: 'solution' | 'enemy' } | null>(null);

  return (
    <div className="w-full flex flex-col bg-surface overflow-y-auto p-6 space-y-8 custom-scrollbar relative">
      <div>
        <h3 className="font-display text-lg text-accent-gold mb-2">Scenarios & Counter-Picks</h3>
        <p className="text-xs font-mono text-text-secondary mb-4">Define variations of this lineup based on the opponent's draft or specific PvE conditions.</p>
        
        <div className="space-y-4">
          {scenarios.map((sc, sIdx) => (
            <div key={sIdx} className="border border-border-ink bg-background p-4 relative">
              <div className="absolute top-2 right-2 flex gap-2">
                <button 
                  onClick={() => {
                    const newScenarios = [...scenarios];
                    newScenarios.splice(sIdx + 1, 0, JSON.parse(JSON.stringify(scenarios[sIdx])));
                    useLineupBuilderStore.getState().setScenarios(newScenarios);
                  }} 
                  className="text-text-secondary hover:text-accent-gold"
                  title="Duplicate Scenario"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => removeScenario(sIdx)} 
                  className="text-text-secondary hover:text-red-500"
                  title="Remove Scenario"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-[10px] font-mono text-text-secondary uppercase block mb-1">Scenario Name</label>
                  <input 
                    value={sc.scenarioName || ''} 
                    onChange={e => updateScenario(sIdx, { scenarioName: e.target.value })}
                    className="w-full bg-surface border border-border-ink p-1.5 font-mono text-sm outline-none focus:border-accent-vermillion" 
                    placeholder="e.g. Against SP Ara"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-text-secondary uppercase block mb-1">Type</label>
                  <select 
                    value={sc.type || 'PVP_DRAFT'} 
                    onChange={e => updateScenario(sIdx, { type: e.target.value })}
                    className="w-full bg-surface border border-border-ink p-1.5 font-mono text-sm outline-none focus:border-accent-vermillion"
                  >
                    <option value="PVP_DRAFT">PvP Draft Counter</option>
                    <option value="PVP_WIN_CON">PvP Win Condition</option>
                    <option value="PVE_ALTERNATIVE">PvE Alternative</option>
                  </select>
                </div>
              </div>

              {/* BANS PHASE */}
              <div className="mb-4">
                <label className="text-[10px] font-mono text-text-secondary uppercase block mb-2">Ban Phase</label>
                <div className="grid grid-cols-2 gap-6 bg-background border border-border-ink p-4">
                  
                  {/* ENEMY BANS */}
                  <div className="border-r border-border-ink/30 pr-6">
                    <div className="text-[10px] font-mono text-red-400 mb-2 uppercase">Enemy Bans</div>
                    <div className="flex flex-wrap gap-2">
                      {sc.conditions?.map((cond: any, cIdx: number) => {
                        if (cond.type !== 'ENEMY_BAN') return null;
                        const shiki = shikigamiData.find((s: any) => s.id === cond.shikigamiId);
                        return (
                          <div key={cIdx} className="relative group w-12 h-12 border border-border-ink cursor-pointer hover:border-red-500 transition-colors"
                            onClick={() => setSelectorTarget({ sIdx, type: 'condition', cIdx })}
                          >
                            {shiki?.icon ? (
                              <img src={shiki.icon} alt="" className="w-full h-full object-cover grayscale-[30%]" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-surface text-text-secondary text-xs font-mono">?</div>
                            )}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const newConds = [...(sc.conditions || [])];
                                newConds.splice(cIdx, 1);
                                updateScenario(sIdx, { conditions: newConds });
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                      <button 
                        onClick={() => {
                          const newConds = [...(sc.conditions || [])];
                          newConds.push({ type: 'ENEMY_BAN' });
                          updateScenario(sIdx, { conditions: newConds });
                        }}
                        className="w-12 h-12 border border-dashed border-border-ink flex items-center justify-center text-text-secondary hover:text-red-400 hover:border-red-400 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* OUR BANS */}
                  <div>
                    <div className="text-[10px] font-mono text-accent-vermillion mb-2 uppercase">Our Bans</div>
                    <div className="flex flex-wrap gap-2">
                      {sc.conditions?.map((cond: any, cIdx: number) => {
                        if (cond.type !== 'OUR_BAN') return null;
                        const shiki = shikigamiData.find((s: any) => s.id === cond.shikigamiId);
                        return (
                          <div key={cIdx} className="relative group w-12 h-12 border border-border-ink cursor-pointer hover:border-accent-vermillion transition-colors"
                            onClick={() => setSelectorTarget({ sIdx, type: 'condition', cIdx })}
                          >
                            {shiki?.icon ? (
                              <img src={shiki.icon} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-surface text-text-secondary text-xs font-mono">?</div>
                            )}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const newConds = [...(sc.conditions || [])];
                                newConds.splice(cIdx, 1);
                                updateScenario(sIdx, { conditions: newConds });
                              }}
                              className="absolute -top-2 -right-2 bg-accent-vermillion text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                      <button 
                        onClick={() => {
                          const newConds = [...(sc.conditions || [])];
                          newConds.push({ type: 'OUR_BAN' });
                          updateScenario(sIdx, { conditions: newConds });
                        }}
                        className="w-12 h-12 border border-dashed border-border-ink flex items-center justify-center text-text-secondary hover:text-accent-vermillion hover:border-accent-vermillion transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* CUSTOM TEXT CONTEXT */}
              <div className="mb-4">
                <label className="text-[10px] font-mono text-text-secondary uppercase block mb-2">Custom Matchup Notes</label>
                <div className="space-y-2">
                  {sc.conditions?.map((cond: any, cIdx: number) => {
                    if (cond.type !== 'TEXT') return null;
                    return (
                      <div key={cIdx} className="flex gap-2">
                        <input 
                          value={cond.customText || ''}
                          onChange={e => {
                            const newConds = [...(sc.conditions || [])];
                            newConds[cIdx] = { ...cond, customText: e.target.value };
                            updateScenario(sIdx, { conditions: newConds });
                          }}
                          className="flex-1 bg-surface border border-border-ink p-2 font-mono text-xs outline-none focus:border-accent-vermillion"
                          placeholder="e.g. Must out-speed enemy puller..."
                        />
                        <button 
                          onClick={() => {
                            const newConds = [...(sc.conditions || [])];
                            newConds.splice(cIdx, 1);
                            updateScenario(sIdx, { conditions: newConds });
                          }}
                          className="text-red-500 hover:text-red-400 p-2 border border-border-ink bg-surface"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                  <button 
                    onClick={() => {
                      const newConds = [...(sc.conditions || [])];
                      newConds.push({ type: 'TEXT' });
                      updateScenario(sIdx, { conditions: newConds });
                    }}
                    className="w-full py-1.5 border border-dashed border-border-ink text-[10px] font-mono text-text-secondary hover:text-foreground hover:border-text-secondary transition-colors"
                  >
                    + Add Note
                  </button>
                </div>
              </div>
              
              <div className="mb-6 grid grid-cols-2 gap-6">
                {/* OPPONENT DRAFT */}
                <div className="space-y-2 border-r border-border-ink/30 pr-6">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono text-text-secondary uppercase">Opponent Draft</label>
                    <button 
                      onClick={() => setImportTarget({ sIdx, type: 'enemy' })}
                      className="text-[10px] font-mono text-accent-gold border border-accent-gold px-2 py-1 hover:bg-accent-gold/10 transition-colors flex items-center gap-1"
                    >
                      Import Existing
                    </button>
                  </div>
                  
                  {sc.enemySlots && sc.enemySlots.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {sc.enemySlots.map((slot: any, slIdx: number) => {
                        const isFlex = slot.shikigamiId === 'flex' || slot.indicator?.toUpperCase().includes('FLEX');
                        const isSlot6 = slot.slotNumber === 6 || slIdx === 5;
                        const shiki = isSlot6 && slot.onmyojiId
                          ? onmyojiData?.find((o: any) => o.id === slot.onmyojiId)
                          : shikigamiData.find((s: any) => s.id === slot.shikigamiId);
                        
                        return (
                          <div key={slIdx} className="flex flex-col border border-border-ink bg-surface p-1.5 relative w-[80px]">
                            <div 
                              className="w-full h-12 flex items-center justify-center bg-background border border-border-ink/50 mb-1 relative group cursor-pointer hover:border-accent-gold transition-colors"
                              onClick={() => setSelectorTarget({ sIdx, type: 'enemySlot', pIdx: slIdx })}
                            >
                              {shiki?.icon ? (
                                <img src={shiki.icon} alt="" className="w-10 h-10 object-cover" />
                              ) : (
                                <span className="text-[10px] text-text-secondary font-mono">
                                  {isFlex ? 'FLEX' : `Slot ${slot.slotNumber || (slIdx + 1)}`}
                                </span>
                              )}
                              {slot.slotType === 'SUB' && (
                                <div className="absolute top-0 left-0 bg-text-secondary text-background text-[8px] px-1 font-bold">FLEX</div>
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-[8px] text-white font-mono uppercase font-bold">Select</span>
                              </div>
                            </div>
                            <button
                              onClick={() => setConfigSlotData(slot, { type: 'enemy_scenario', sIdx, pIdx: slIdx })}
                              className="text-accent-gold hover:text-yellow-400 text-[10px] font-mono w-full text-center bg-accent-gold/10 py-0.5"
                            >
                              Config
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-[10px] text-text-secondary font-mono italic p-2 border border-dashed border-border-ink text-center">
                      No opponent draft configured. Click "Import Existing" to load a Meta Lineup.
                    </div>
                  )}
                </div>

                {/* OUR DRAFT */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono text-text-secondary uppercase">Our Draft (Response)</label>
                    <button 
                      onClick={() => setImportTarget({ sIdx, type: 'solution' })}
                      className="text-[10px] font-mono text-accent-gold border border-accent-gold px-2 py-1 hover:bg-accent-gold/10 transition-colors flex items-center gap-1"
                    >
                      Import Existing
                    </button>
                  </div>
                  
                  {sc.solutionSlots && sc.solutionSlots.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {sc.solutionSlots.map((slot: any, slIdx: number) => {
                        const isFlex = slot.shikigamiId === 'flex' || slot.indicator?.toUpperCase().includes('FLEX');
                        const isSlot6 = slot.slotNumber === 6 || slIdx === 5;
                        const shiki = isSlot6 && slot.onmyojiId
                          ? onmyojiData?.find((o: any) => o.id === slot.onmyojiId)
                          : shikigamiData.find((s: any) => s.id === slot.shikigamiId);
                        
                        return (
                          <div key={slIdx} className="flex flex-col border border-border-ink bg-surface p-1.5 relative w-[80px]">
                            <div 
                              className="w-full h-12 flex items-center justify-center bg-background border border-border-ink/50 mb-1 relative group cursor-pointer hover:border-accent-gold transition-colors"
                              onClick={() => setSelectorTarget({ sIdx, type: 'responseSlot', pIdx: slIdx })}
                            >
                              {shiki?.icon ? (
                                <img src={shiki.icon} alt="" className="w-10 h-10 object-cover" />
                              ) : (
                                <span className="text-[10px] text-text-secondary font-mono">
                                  {isFlex ? 'FLEX' : `Slot ${slot.slotNumber || (slIdx + 1)}`}
                                </span>
                              )}
                              {slot.slotType === 'SUB' && (
                                <div className="absolute top-0 left-0 bg-text-secondary text-background text-[8px] px-1 font-bold">FLEX</div>
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-[8px] text-white font-mono uppercase font-bold">Select</span>
                              </div>
                            </div>
                            <button
                              onClick={() => setConfigSlotData(slot, { type: 'scenario', sIdx, pIdx: slIdx })}
                              className="text-accent-gold hover:text-yellow-400 text-[10px] font-mono w-full text-center bg-accent-gold/10 py-0.5"
                            >
                              Config
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-[10px] text-text-secondary font-mono italic p-2 border border-dashed border-border-ink text-center">
                      No variant configured. Click "Import Existing" to start configuring a response.
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-text-secondary uppercase">Detailed Solution / Notes</label>
                <textarea 
                  value={sc.solution || ''} 
                  onChange={e => updateScenario(sIdx, { solution: e.target.value })}
                  className="w-full bg-surface border border-border-ink p-2 font-mono text-sm h-16 outline-none focus:border-accent-vermillion" 
                  placeholder="Explain the strategy here..."
                />
              </div>
            </div>
          ))}
          
          <button 
            onClick={addScenario}
            className="w-full py-3 border-2 border-dashed border-border-ink text-text-secondary font-mono text-sm hover:text-foreground hover:border-text-secondary flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Scenario
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-border-ink shrink-0 flex justify-between items-center">
        <button 
          onClick={() => setBuilderStep(1)}
          className="px-6 py-2 border border-border-ink text-text-secondary font-mono font-bold hover:bg-surface transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Config
        </button>
        <div className="flex items-center gap-4">
          {!isNew && (
            <label className="flex items-center gap-2 text-sm font-mono text-accent-gold cursor-pointer border border-accent-gold/50 bg-accent-gold/10 px-3 py-1.5 transition-colors hover:bg-accent-gold/20">
              <input 
                type="checkbox" 
                checked={isNewVersion}
                onChange={e => setMetadata({ isNewVersion: e.target.checked })}
                className="w-4 h-4 bg-background border border-border-ink accent-accent-gold"
              />
              Update as New Version
            </label>
          )}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-2 bg-accent-vermillion text-white font-mono font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Finish & Save Lineup'}
          </button>
        </div>
      </div>

      {selectorTarget && (
        <ShikigamiSelectorModal 
          isOpen={true}
          onClose={() => setSelectorTarget(null)}
          shikigamiData={shikigamiData}
          onmyojiData={onmyojiData}
          mode={(selectorTarget.type === 'responseSlot' || selectorTarget.type === 'enemySlot') && selectorTarget.pIdx === 5 ? 'onmyoji' : 'shikigami'}
          onSelect={(id, mode) => {
            const { sIdx, type, cIdx } = selectorTarget;
            if (type === 'condition' && cIdx !== undefined) {
              const newConds = [...(scenarios[sIdx].conditions || [])];
              newConds[cIdx] = { ...newConds[cIdx], shikigamiId: id };
              updateScenario(sIdx, { conditions: newConds });
            } else if (type === 'responseSlot' && selectorTarget.pIdx !== undefined) {
              const newSolutionSlots = [...(scenarios[sIdx].solutionSlots || [])];
              if (mode === 'onmyoji') {
                newSolutionSlots[selectorTarget.pIdx] = { ...newSolutionSlots[selectorTarget.pIdx], onmyojiId: id, shikigamiId: null };
              } else {
                newSolutionSlots[selectorTarget.pIdx] = { ...newSolutionSlots[selectorTarget.pIdx], shikigamiId: id, onmyojiId: null };
              }
              updateScenario(sIdx, { solutionSlots: newSolutionSlots });
            } else if (type === 'enemySlot' && selectorTarget.pIdx !== undefined) {
              const newEnemySlots = [...(scenarios[sIdx].enemySlots || [])];
              if (mode === 'onmyoji') {
                newEnemySlots[selectorTarget.pIdx] = { ...newEnemySlots[selectorTarget.pIdx], onmyojiId: id, shikigamiId: null };
              } else {
                newEnemySlots[selectorTarget.pIdx] = { ...newEnemySlots[selectorTarget.pIdx], shikigamiId: id, onmyojiId: null };
              }
              updateScenario(sIdx, { enemySlots: newEnemySlots });
            }
          }}
        />
      )}

      {importTarget !== null && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border-ink w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border-ink bg-background">
              <h3 className="font-display text-lg text-accent-gold">Import Existing Lineup</h3>
              <button onClick={() => setImportTarget(null)} className="text-text-secondary hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-2">
              <div className="mb-4 text-xs font-mono text-text-secondary">
                Select a Meta Lineup to use as the base response for this scenario.
              </div>
              {lineupsData?.map(l => (
                <div key={l.id} className="flex items-center justify-between p-3 border border-border-ink bg-background hover:border-accent-gold hover:bg-surface cursor-pointer transition-colors"
                     onClick={() => {
                       if (importTarget.type === 'enemy') {
                         updateScenario(importTarget.sIdx, { enemySlots: l.slots, baseEnemyLineupId: l.id });
                       } else {
                         updateScenario(importTarget.sIdx, { solutionSlots: l.slots, baseLineupId: l.id });
                       }
                       setImportTarget(null);
                     }}>
                  <div>
                    <div className="font-bold font-display text-foreground">{l.name}</div>
                    <div className="text-[10px] font-mono text-text-secondary flex gap-2">
                      <span>Author: {l.author}</span>
                      {l.subcategory?.category?.name && (
                        <>
                          <span>•</span>
                          <span>{l.subcategory.category.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button className="text-xs font-mono bg-accent-gold/10 text-accent-gold px-3 py-1 border border-accent-gold">Import</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
