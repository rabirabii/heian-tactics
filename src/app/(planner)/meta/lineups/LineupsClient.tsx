'use client';

import { useState, useEffect } from 'react';
import { useRosterStore } from '@/store/roster-store';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import LineupBuilderModal from '@/components/LineupBuilderModal';
import { Edit } from 'lucide-react';

export default function LineupsClient({
  shikigamiData,
  onmyojiData,
  soulsData,
  lineupsData,
  lineupTypesData,
  raritiesData,
  rolesData
}: {
  shikigamiData: any[];
  onmyojiData: any[];
  soulsData: any[];
  lineupsData: any[];
  lineupTypesData: any[];
  raritiesData: any[];
  rolesData: any[];
}) {
  const { owned } = useRosterStore();
  
  const [activeType, setActiveType] = useState<string>(lineupTypesData[0]?.id || 'PvE');
  
  const currentType = lineupTypesData.find(t => t.id === activeType);
  const categories = currentType?.categories || [];
  
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || '');

  const currentCategory = categories.find((c: any) => c.id === activeCategory);
  const subcategories = currentCategory?.subcategories || [];
  
  const [activeSubcategory, setActiveSubcategory] = useState<string>('All');
  const [visibleCount, setVisibleCount] = useState(10);
  
  const [user, setUser] = useState<User | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedLineupForEdit, setSelectedLineupForEdit] = useState<any | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  // When type changes, reset category and subcategory
  const handleTypeChange = (typeId: string) => {
    setActiveType(typeId);
    setVisibleCount(10);
    const newCat = lineupTypesData.find(t => t.id === typeId)?.categories[0];
    if (newCat) {
      setActiveCategory(newCat.id);
      setActiveSubcategory('All');
    } else {
      setActiveCategory('');
      setActiveSubcategory('All');
    }
  };

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    setActiveSubcategory('All');
    setVisibleCount(10);
  };

  const handleSubcategoryChange = (subId: string) => {
    setActiveSubcategory(subId);
    setVisibleCount(10);
  };

  const filteredLineups = lineupsData.filter(l => {
    const isRightType = l.subcategory?.category?.type?.id === activeType;
    if (!isRightType) return false;
    
    const isRightCategory = l.subcategory?.category?.id === activeCategory;
    if (!isRightCategory) return false;

    if (activeSubcategory !== 'All' && l.subcategoryId !== activeSubcategory) return false;

    return true;
  });

  const getShiki = (id: string) => shikigamiData.find(s => s.id === id);
  const getOnmyoji = (id: string) => onmyojiData.find(o => o.id === id);
  const getSoul = (id: string) => soulsData.find(s => s.id === id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display text-foreground tracking-wide">Meta Lineups</h1>
          <p className="text-text-secondary mt-1 font-mono text-sm">
            Curated team compositions for every game mode.
          </p>
        </div>
        {user && (
          <button 
            onClick={() => {
              setSelectedLineupForEdit(null);
              setIsBuilderOpen(true);
            }}
            className="px-6 py-2 bg-accent-gold text-background font-bold font-mono text-sm hover:bg-accent-gold/90 transition-colors"
          >
            + Create New Lineup
          </button>
        )}
      </div>

      {/* Level 1: PvP / PvE Tabs */}
      <div className="flex gap-4 border-b border-border-ink">
        {lineupTypesData.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTypeChange(t.id)}
            className={`px-4 py-2 text-sm font-mono border-b-2 transition-colors whitespace-nowrap ${
              activeType === t.id ? 'border-accent-vermillion text-accent-vermillion' : 'border-transparent text-text-secondary hover:text-foreground'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Level 2: Categories */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {categories.map((c: any) => (
            <button
              key={c.id}
              onClick={() => handleCategoryChange(c.id)}
              className={`px-4 py-1.5 text-sm font-mono border border-border-ink transition-colors whitespace-nowrap ${
                activeCategory === c.id ? 'bg-surface text-accent-gold border-accent-gold' : 'text-text-secondary hover:text-foreground hover:border-text-secondary'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Level 3: Subcategories */}
      {subcategories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          <button
            onClick={() => handleSubcategoryChange('All')}
            className={`px-3 py-1 text-xs font-mono transition-colors whitespace-nowrap rounded-full ${
              activeSubcategory === 'All' ? 'bg-accent-gold text-surface' : 'bg-background text-text-secondary border border-border-ink hover:text-foreground'
            }`}
          >
            All Subcategories
          </button>
          {subcategories.map((sub: any) => (
            <button
              key={sub.id}
              onClick={() => handleSubcategoryChange(sub.id)}
              className={`px-3 py-1 text-xs font-mono transition-colors whitespace-nowrap rounded-full ${
                activeSubcategory === sub.id ? 'bg-accent-gold text-surface' : 'bg-background text-text-secondary border border-border-ink hover:text-foreground'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-8">
        {filteredLineups.slice(0, visibleCount).map((lineup) => {
          const shikiSlots = [...(lineup.slots || [])]
            .filter((s: any) => s.slotNumber >= 1 && s.slotNumber <= 5)
            .sort((a, b) => a.slotNumber - b.slotNumber);
            
          const onmyojiSlot = lineup.slots?.find((s: any) => s.slotNumber === 6);
          const champ = onmyojiSlot?.onmyojiId ? getOnmyoji(onmyojiSlot.onmyojiId) : null;
          
          const columns = [
            ...shikiSlots.map((slot: any) => {
              const primary = slot.shikigamiId ? getShiki(slot.shikigamiId) : null;
              let subUsed = null;
              let isMissing = !owned[slot.shikigamiId];

              if (isMissing && slot.substituteIds && slot.substituteIds.length > 0) {
                for (const subId of slot.substituteIds) {
                  if (owned[subId]) {
                    subUsed = getShiki(subId);
                    isMissing = false;
                    break;
                  }
                }
                if (!subUsed) subUsed = getShiki(slot.substituteIds[0]);
              }

              const isFlex = !slot.shikigamiId && slot.indicator?.toUpperCase().includes('FLEX');

              return {
                type: 'shikigami',
                data: slot,
                displayHero: subUsed || primary,
                isPrimaryOwned: owned[slot.shikigamiId],
                isMissing: isFlex ? false : isMissing,
                isFlex,
                subUsed
              };
            }),
            {
              type: 'onmyoji',
              data: onmyojiSlot || {},
              displayHero: champ
            }
          ];

          return (
            <div key={lineup.id} className="bg-surface border border-border-ink p-6 relative group">
              <div className="absolute top-0 right-0 bg-background border-b border-l border-border-ink px-3 py-1 font-mono text-xs text-text-secondary flex items-center gap-4">
                <span>{lineup.subcategory?.category?.type?.name} / {lineup.subcategory?.category?.name} / {lineup.subcategory?.name}</span>
                {user && (
                  <button
                    onClick={() => {
                      setSelectedLineupForEdit(lineup);
                      setIsBuilderOpen(true);
                    }}
                    className="p-1 hover:text-accent-vermillion transition-colors"
                    title="Edit Lineup"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <h2 className="text-2xl font-display text-foreground mb-2 flex flex-wrap items-center gap-3">
                {lineup.name}
                {lineup.status && lineup.status !== 'CURRENT' && (
                  <span className={`text-xs px-2 py-1 rounded-sm font-mono tracking-widest uppercase ${lineup.status === 'HISTORICAL' ? 'bg-red-900/50 text-red-400 border border-red-800' : 'bg-orange-900/50 text-orange-400 border border-orange-800'}`}>
                    {lineup.status}
                  </span>
                )}
                {lineup.beginnerFriendly && (
                  <span className="text-xs bg-green-900/50 text-green-400 border border-green-800 px-2 py-1 rounded-sm font-mono tracking-widest uppercase">
                    🔰 Beginner Friendly
                  </span>
                )}
              </h2>
              <p className="text-sm font-mono text-text-secondary mb-4">{lineup.description}</p>
              
              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6">
                 <div className="text-xs font-mono text-text-secondary">
                   <span className="text-foreground">Author:</span> {lineup.author}
                 </div>
                 <div className="text-xs font-mono text-text-secondary">
                   <span className="text-foreground">Updated:</span> {new Date(lineup.updatedAt).toLocaleDateString()}
                 </div>
              </div>

              {/* Strengths & Weaknesses */}
              {(lineup.strengths?.length > 0 || lineup.weaknesses?.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {lineup.strengths?.length > 0 && (
                    <div className="border border-green-900/50 bg-green-900/10 p-3">
                      <h4 className="text-xs font-bold text-green-500 uppercase tracking-wider mb-2">Strengths</h4>
                      <ul className="list-disc pl-4 text-xs font-mono text-text-secondary space-y-1">
                        {lineup.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                  {lineup.weaknesses?.length > 0 && (
                    <div className="border border-red-900/50 bg-red-900/10 p-3">
                      <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Weaknesses</h4>
                      <ul className="list-disc pl-4 text-xs font-mono text-text-secondary space-y-1">
                        {lineup.weaknesses.map((w: string, i: number) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Card-based tactical layout */}
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                {columns.map((col, idx) => (
                  <div key={idx} className="flex-shrink-0 w-44 bg-background border border-border-ink flex flex-col relative group">
                    {/* Header: Avatar */}
                    <div className="relative h-28 border-b border-border-ink bg-surface flex items-center justify-center overflow-hidden">
                      {(col as any).isFlex ? (
                        <div className={`w-full h-full flex items-center justify-center font-display text-2xl text-text-secondary bg-surface border-4 border-dashed border-border-ink`}>
                          FLEX
                        </div>
                      ) : (col.displayHero as any)?.icon ? (
                        <>
                          <img 
                            src={(col.displayHero as any).icon} 
                            alt={col.displayHero?.name} 
                            loading="lazy"
                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                            className={`w-full h-full object-cover ${(col as any).isMissing ? 'grayscale opacity-60' : ''}`} 
                          />
                          <div className={`w-full h-full flex items-center justify-center font-display text-3xl text-text-secondary bg-border-ink/10 hidden`}>
                            {col.type === 'onmyoji' ? col.displayHero?.name.substring(0,2) : '?'}
                          </div>
                        </>
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center font-display text-3xl text-text-secondary bg-border-ink/10`}>
                          {col.type === 'onmyoji' ? col.displayHero?.name.substring(0,2) : '?'}
                        </div>
                      )}

                      {/* Status Badges for Shikigami */}
                      {col.type === 'shikigami' && (
                        <div className="absolute top-2 right-2">
                           {(col as any).isPrimaryOwned ? (
                             <div className="bg-accent-gold text-surface text-[10px] font-bold px-1.5 py-0.5 shadow-sm">OWNED</div>
                           ) : ((col as any).subUsed && !(col as any).isMissing) ? (
                             <div className="bg-blue-500 text-surface text-[10px] font-bold px-1.5 py-0.5 shadow-sm">SUB</div>
                           ) : (
                             <div className="bg-accent-vermillion text-surface text-[10px] font-bold px-1.5 py-0.5 shadow-sm">MISS</div>
                           )}
                        </div>
                      )}
                    </div>
                    
                    {/* Name & Soul area */}
                    <div className="p-3 border-b border-border-ink text-center flex flex-col items-center gap-2">
                      <div className="text-sm font-display font-bold text-foreground truncate w-full" title={col.displayHero?.name}>
                        {col.displayHero?.name || 'Unknown'}
                      </div>
                      
                      {/* Souls display */}
                      <div className="flex gap-1 items-center h-6 justify-center flex-wrap">
                        {Array.isArray(col.data.soulPrimary) && col.data.soulPrimary.map((s1Id: string, i: number) => {
                          const s1 = getSoul(s1Id);
                          if (!s1?.icon) return null;
                          return (
                            <div key={`p-${i}`} className="flex items-center gap-1">
                              {i > 0 && <span className="text-[10px] text-text-secondary font-mono">/</span>}
                              <img src={s1.icon} alt={`Soul 1-${i}`} className="w-6 h-6 object-contain" title={s1.name} />
                            </div>
                          );
                        })}
                        {(!col.data.soulPrimary || col.data.soulPrimary.length === 0) && col.type === 'shikigami' && (
                           <span className="text-[10px] w-6 h-6 flex items-center justify-center border border-border-ink">?</span>
                        )}
                        {col.type === 'onmyoji' && (
                           <div className="w-6 h-6 rounded-full border border-border-ink border-dashed"></div>
                        )}
                        {Array.isArray(col.data.soulSecondary) && col.data.soulSecondary.map((s2Id: string, i: number) => {
                          const s2 = getSoul(s2Id);
                          if (!s2?.icon) return null;
                          return (
                            <img key={`s-${i}`} src={s2.icon} alt={`Soul 2-${i}`} className="w-6 h-6 object-contain" title={s2.name} />
                          );
                        })}
                      </div>
                    </div>

                    {/* Stats List */}
                    <div className="p-3 flex-1 flex flex-col gap-2 font-mono text-[11px]">
                       <div className="flex justify-between border-b border-border-ink/30 pb-1">
                         <span className="text-text-secondary">Slot 2</span>
                         <span className="text-foreground font-bold">{col.data.slot2}</span>
                       </div>
                       <div className="flex justify-between border-b border-border-ink/30 pb-1">
                         <span className="text-text-secondary">Slot 4</span>
                         <span className="text-foreground font-bold">{col.data.slot4}</span>
                       </div>
                       <div className="flex justify-between border-b border-border-ink/30 pb-1">
                         <span className="text-text-secondary">Slot 6</span>
                         <span className="text-foreground font-bold">{col.data.slot6}</span>
                       </div>
                       <div className="flex flex-col gap-0.5 pt-1">
                         <span className="text-text-secondary">Stat Req:</span>
                         <span className="text-accent-gold font-bold break-words">{col.data.statReq}</span>
                       </div>
                       {(col.data.minSpeed || col.data.minEffectHit || col.data.minEffectRes || col.data.minCrit || col.data.minCritDmg) && (
                         <div className="flex flex-wrap gap-1 pt-1 border-t border-border-ink/30 mt-1">
                           {col.data.minSpeed && <span className="bg-accent-gold/20 text-accent-gold px-1 rounded-sm">{col.data.minSpeed}+ SPD</span>}
                           {col.data.minEffectHit && <span className="bg-blue-500/20 text-blue-400 px-1 rounded-sm">{col.data.minEffectHit}% HIT</span>}
                           {col.data.minEffectRes && <span className="bg-green-500/20 text-green-400 px-1 rounded-sm">{col.data.minEffectRes}% RES</span>}
                           {col.data.minCrit && <span className="bg-red-500/20 text-red-400 px-1 rounded-sm">{col.data.minCrit}% CR</span>}
                           {col.data.minCritDmg && <span className="bg-purple-500/20 text-purple-400 px-1 rounded-sm">{col.data.minCritDmg}% CD</span>}
                         </div>
                       )}
                       <div className="mt-auto pt-2 grid grid-cols-2 gap-1 text-[10px]">
                         <div className="bg-surface px-1 py-0.5 text-center truncate border border-border-ink" title={col.data.indicator}>
                           {col.data.indicator}
                         </div>
                         <div className="bg-surface px-1 py-0.5 text-center truncate border border-border-ink">
                           {col.data.skillReq}
                         </div>
                       </div>
                    </div>

                  </div>
                ))}
              </div>

              {/* Action Button to Details */}
              <div className="mt-6 border-t border-border-ink pt-6 flex justify-end">
                <a 
                  href={`/meta/lineups/${lineup.id}`}
                  className="px-6 py-2 bg-accent-vermillion text-surface font-mono font-bold hover:bg-accent-gold transition-colors"
                >
                  {lineup.subcategory?.category?.type?.id === 'PvP' ? 'View Draft Scenarios & Match-ups →' : 'View Details & PvE Scenarios →'}
                </a>
              </div>

              {/* Notes */}
              <div className="mt-6 pt-4 border-t border-border-ink flex flex-col gap-6">
                 <div>
                   <h4 className="text-sm font-mono font-bold text-foreground mb-2 underline decoration-accent-vermillion underline-offset-4">Notes:</h4>
                   <p className="text-sm font-mono text-text-secondary whitespace-pre-line leading-relaxed">
                     {lineup.notes}
                   </p>
                 </div>
              </div>

            </div>
          );
        })}
        
        {filteredLineups.length === 0 && (
          <div className="text-center py-12 border border-border-ink border-dashed">
            <p className="text-text-secondary font-mono">No lineups found in this category.</p>
          </div>
        )}

        {visibleCount < filteredLineups.length && (
          <div className="flex justify-center mt-12 mb-8">
            <button
              onClick={() => setVisibleCount(prev => prev + 10)}
              className="px-8 py-3 bg-surface border border-border-ink text-foreground font-mono font-bold hover:border-accent-gold hover:text-accent-gold transition-colors shadow-sm"
            >
              Load More Lineups ↓
            </button>
          </div>
        )}
      </div>
      
      {/* Builder Modal */}
      <LineupBuilderModal 
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        lineup={selectedLineupForEdit}
        shikigamiData={shikigamiData}
        onmyojiData={onmyojiData}
        soulsData={soulsData}
        lineupTypesData={lineupTypesData}
        raritiesData={raritiesData}
        rolesData={rolesData}
        onSaveSuccess={() => window.location.reload()}
      />
    </div>
  );
}
