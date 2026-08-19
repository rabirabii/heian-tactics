'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Edit } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import EditShikigamiModal from '@/components/EditShikigamiModal';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

// Score weights for sorting (SS is highest, D is lowest)
const SCORE_WEIGHTS: Record<string, number> = {
  'SS': 6,
  'S': 5,
  'A': 4,
  'B': 3,
  'C': 2,
  'D': 1,
};

export default function TierListClient({ 
  shikigamis, 
  roles, 
  categories, 
  rarities = [],
  publicTierLists = [],
  myTierLists = [],
  currentTierListId = null,
  isAdmin = false,
  currentUserId = null
}: { 
  shikigamis: any[], 
  roles: any[], 
  categories: any[], 
  rarities?: any[],
  publicTierLists?: any[],
  myTierLists?: any[],
  currentTierListId?: string | null,
  isAdmin?: boolean,
  currentUserId?: string | null
}) {
  const [activeMode, setActiveMode] = useState<'pve' | 'pvp' | 'uncategorized'>('pve');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const router = useRouter();
  const [selectedShikiForEdit, setSelectedShikiForEdit] = useState<any | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  // Filter categories by mode
  const modeCategories = categories.filter(c => c.group === activeMode);
  const overallCategory = modeCategories.find(c => c.isOverall);
  const subCategories = modeCategories.filter(c => !c.isOverall);

  // Process Shikigamis
  let filteredShikigamis = shikigamis.filter(shiki => {
    if (searchQuery && !shiki.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    // For PvE and PvP, must have at least one evaluation in the active mode
    if (activeMode !== 'uncategorized') {
      const hasModeEval = shiki.evaluations?.some((ev: any) => ev.category?.group === activeMode);
      return hasModeEval;
    }
    
    // For Uncategorized, they are grouped later if they have no roles. 
    // We just pass them through here.
    return true;
  });

  // Group by Role
  const grouped: Record<string, any[]> = {};
  roles.forEach(r => {
    grouped[r.id] = [];
  });
  // Also an "Uncategorized" role
  grouped['uncategorized'] = [];

  filteredShikigamis.forEach(shiki => {
    // Role Fallback Logic:
    // 1. Try to get roles assigned specifically in the current tier list
    // 2. If none exist (or if we're on the global tier list), fallback to global roles (tierListId === null)
    
    let modeRoles = shiki.roleAssignments?.filter((ra: any) => 
      ra.mode.toLowerCase() === activeMode && ra.tierListId === currentTierListId
    ) || [];

    if (modeRoles.length === 0) {
      modeRoles = shiki.roleAssignments?.filter((ra: any) => 
        ra.mode.toLowerCase() === activeMode && ra.tierListId === null
      ) || [];
    }
    
    if (modeRoles.length === 0) {
      grouped['uncategorized'].push(shiki);
    } else {
      modeRoles.forEach((ra: any) => {
        if (grouped[ra.roleId]) {
          grouped[ra.roleId].push(shiki);
        }
      });
    }
  });

  // Sort within groups
  Object.keys(grouped).forEach(roleId => {
    grouped[roleId].sort((a, b) => {
      // Find overall score for a
      const evA = a.evaluations?.find((ev: any) => ev.category?.isOverall && ev.category?.group === activeMode);
      const scoreA = evA ? (SCORE_WEIGHTS[evA.score] || 0) : -1;
      
      // Find overall score for b
      const evB = b.evaluations?.find((ev: any) => ev.category?.isOverall && ev.category?.group === activeMode);
      const scoreB = evB ? (SCORE_WEIGHTS[evB.score] || 0) : -1;

      if (scoreA !== scoreB) {
        return scoreB - scoreA; // Descending
      }
      
      // Fallback to rarity
      const orderA = a.rarityRef?.sortOrder ?? 99;
      const orderB = b.rarityRef?.sortOrder ?? 99;
      if (orderA !== orderB) return orderA - orderB;

      return a.name.localeCompare(b.name);
    });
  });

  // Helper to render score badge
  const getScoreColor = (score: string) => {
    switch (score) {
      case 'SS': return 'text-orange-500 border-orange-500/50 bg-orange-500/10 shadow-[0_0_10px_rgba(249,115,22,0.3)]';
      case 'S': return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10';
      case 'A': return 'text-green-500 border-green-500/50 bg-green-500/10';
      case 'B': return 'text-blue-500 border-blue-500/50 bg-blue-500/10';
      case 'C': return 'text-gray-400 border-gray-500/50 bg-gray-500/10';
      case 'D': return 'text-red-500 border-red-500/50 bg-red-500/10';
      default: return 'text-text-secondary border-border-ink bg-surface';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display text-foreground tracking-wide">Meta Tier List</h1>
          <p className="text-text-secondary mt-1 font-mono text-sm">
            Discover the best Shikigami across different roles.
          </p>
          <div className="mt-4 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2">
              <select 
                className="bg-surface border border-border-ink text-foreground px-3 py-1.5 font-mono text-sm w-full md:w-auto"
                value={currentTierListId || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  router.push(val ? `/meta/tier-list?tierListId=${val}` : '/meta/tier-list');
                }}
              >
                <option value="">System Default (Global)</option>
                {myTierLists.length > 0 && (
                  <optgroup label="My Tier Lists">
                    {myTierLists.map((tl: any) => (
                      <option key={tl.id} value={tl.id}>
                        {tl.title} [{tl.status}]
                      </option>
                    ))}
                  </optgroup>
                )}
                {publicTierLists.length > 0 && (
                  <optgroup label="Community Tier Lists">
                    {publicTierLists.map((tl: any) => (
                      <option key={tl.id} value={tl.id}>{tl.title} by {tl.author?.username || 'Unknown'}</option>
                    ))}
                  </optgroup>
                )}
              </select>
              {user && (
                <button 
                  onClick={async () => {
                    const title = prompt("Enter new Tier List title:");
                    if (title) {
                      const { upsertTierList } = await import('@/app/actions/tierlists');
                      try {
                        const newList = await upsertTierList({ title, status: 'PRIVATE' });
                        router.push(`/meta/tier-list?tierListId=${newList.id}`);
                      } catch(e) {
                        toast.error("Failed to create Tier List");
                      }
                    }
                  }}
                  className="bg-accent-gold/20 text-accent-gold border border-accent-gold px-3 py-1.5 font-mono text-sm hover:bg-accent-gold hover:text-background transition-colors"
                >
                  + New Tier List
                </button>
              )}
            </div>
            
            {/* Status & Review Controls */}
            {currentTierListId && myTierLists.find((tl: any) => tl.id === currentTierListId) && (() => {
              const tl = myTierLists.find((tl: any) => tl.id === currentTierListId);
              
              if (tl.status === 'PRIVATE' || tl.status === 'REJECTED') {
                return (
                  <button
                    onClick={async () => {
                      if (confirm("Submit this Tier List for public community review?")) {
                        const { upsertTierList } = await import('@/app/actions/tierlists');
                        try {
                          await upsertTierList({ id: tl.id, title: tl.title, status: 'PENDING_REVIEW' });
                          toast.success("Submitted for review!");
                          router.refresh();
                        } catch(e) {
                          toast.error("Failed to submit");
                        }
                      }
                    }}
                    className="bg-blue-500/20 text-blue-400 border border-blue-500 px-3 py-1.5 font-mono text-sm hover:bg-blue-500 hover:text-background transition-colors"
                  >
                    {tl.status === 'REJECTED' ? 'Revise & Resubmit' : 'Submit for Review'}
                  </button>
                );
              } else if (tl.status === 'PENDING_REVIEW') {
                return (
                  <span className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 font-mono text-sm">
                    Awaiting Approval
                  </span>
                );
              } else if (tl.status === 'PUBLISHED') {
                return (
                  <span className="px-3 py-1.5 bg-green-500/10 border border-green-500/50 text-green-500 font-mono text-sm">
                    Published
                  </span>
                );
              }
              return null;
            })()}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search Shikigami..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-background border border-border-ink text-foreground font-mono text-sm focus:outline-none focus:border-accent-vermillion transition-colors w-64"
            />
          </div>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex border-b border-border-ink overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveMode('pve')}
          className={`px-8 py-4 font-display text-lg transition-colors ${
            activeMode === 'pve' 
              ? 'text-accent-vermillion border-b-2 border-accent-vermillion bg-accent-vermillion/5' 
              : 'text-text-secondary hover:text-foreground'
          }`}
        >
          PVE TIER LIST
        </button>
        <button
          onClick={() => setActiveMode('pvp')}
          className={`px-8 py-4 font-display text-lg transition-colors ${
            activeMode === 'pvp' 
              ? 'text-blue-500 border-b-2 border-blue-500 bg-blue-500/5' 
              : 'text-text-secondary hover:text-foreground'
          }`}
        >
          PVP TIER LIST
        </button>
        <button
          onClick={() => setActiveMode('uncategorized')}
          className={`px-8 py-4 font-display text-lg transition-colors ${
            activeMode === 'uncategorized' 
              ? 'text-text-secondary border-b-2 border-text-secondary bg-surface' 
              : 'text-text-secondary/50 hover:text-foreground'
          }`}
        >
          UNCATEGORIZED
        </button>
      </div>

      {/* Render Groups */}
      <div className="space-y-12">
        {activeMode !== 'uncategorized' && [...roles, { id: 'uncategorized', name: 'Other / No Role' }].map(role => {
          const shikisInRole = grouped[role.id];
          if (!shikisInRole || shikisInRole.length === 0) return null;

          return (
            <div key={role.id} className="space-y-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-display text-foreground">{role.name}</h2>
                <div className="flex-1 h-px bg-border-ink" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {shikisInRole.map(shiki => {
                  const overallEv = shiki.evaluations?.find((ev: any) => ev.category?.isOverall && ev.category?.group === activeMode);
                  const subEvs = shiki.evaluations?.filter((ev: any) => !ev.category?.isOverall && ev.category?.group === activeMode) || [];
                  
                  // Sort subEvs by category sortOrder
                  subEvs.sort((a: any, b: any) => (a.category?.sortOrder || 0) - (b.category?.sortOrder || 0));

                  return (
                    <div
                      key={shiki.id} 
                      className="group flex flex-col bg-surface border border-border-ink hover:border-accent-vermillion transition-all hover:shadow-lg relative"
                    >
                      {/* Edit Button */}
                      {user && (
                        (currentTierListId === null && isAdmin) || // Admin editing global
                        (currentTierListId !== null && myTierLists.some((t: any) => t.id === currentTierListId)) // Owner editing their own tier list
                      ) && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedShikiForEdit(shiki);
                              setIsEditModalOpen(true);
                            }}
                            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-background/90 border border-border-ink text-text-secondary hover:text-accent-vermillion hover:border-accent-vermillion z-10 transition-colors shadow-sm"
                            title="Edit Shikigami"
                          >
                            <Edit className="w-3 h-3" />
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Edit</span>
                          </button>
                      )}
                      
                      <Link href={`/shikigami/${shiki.id}`} className="flex items-start p-4 gap-4 border-b border-border-ink/50">
                        <div className="w-16 h-16 shrink-0 bg-background border border-border-ink relative">
                          {shiki.icon ? (
                            <img src={shiki.icon} alt={shiki.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-secondary text-xs">?</div>
                          )}
                          <span className="absolute -top-2 -left-2 text-[10px] font-mono text-accent-gold bg-surface border border-accent-gold px-1">
                            {shiki.rarityId}
                          </span>
                          {!shiki.availableGlobal && (
                            <div className="absolute -bottom-2 -left-2 text-[8px] font-mono font-bold text-white bg-red-600/90 border border-red-800 px-1 whitespace-nowrap">
                              CN ONLY
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-display text-foreground group-hover:text-accent-vermillion transition-colors leading-tight">
                            {shiki.name}
                          </h3>
                          
                          {overallEv && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className={`px-2 py-0.5 border text-sm font-bold font-mono ${getScoreColor(overallEv.score)}`}>
                                {overallEv.score}
                              </span>
                              <span className="text-[10px] text-text-secondary font-mono uppercase tracking-wider">
                                Overall
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>
                      {/* Sub-ratings Grid */}
                      <div className="p-3 bg-background/50 grid grid-cols-2 gap-2">
                        {subEvs.map((ev: any) => (
                          <div key={ev.id} className="flex justify-between items-center bg-surface border border-border-ink px-2 py-1">
                            <span className="text-[10px] text-text-secondary font-mono truncate mr-2" title={ev.category.name}>
                              {ev.category.name}
                            </span>
                            <span className={`text-[10px] font-bold font-mono ${
                              ev.score === 'SS' ? 'text-orange-500' : 
                              ev.score === 'S' ? 'text-yellow-500' : 
                              ev.score === 'A' ? 'text-green-500' : 'text-text-secondary'
                            }`}>
                              {ev.score}
                            </span>
                          </div>
                        ))}
                        {subEvs.length === 0 && (
                          <div className="col-span-2 text-xs text-text-secondary font-mono text-center py-2">
                            No specific data
                          </div>
                        )}
                      </div>
                      
                      {/* Radar Chart (PvP Mode Only) */}
                      {activeMode === 'pvp' && (() => {
                        const pvpEvs = shiki.evaluations?.filter((ev: any) => ev.metrics && Object.keys(ev.metrics).length > 0 && ev.category?.group === 'pvp') || [];
                        if (pvpEvs.length === 0) return null;
                        
                        // Prioritize 'isOverall' first, then lower sortOrder (e.g., Duel)
                        pvpEvs.sort((a: any, b: any) => {
                          if (a.category?.isOverall && !b.category?.isOverall) return -1;
                          if (!a.category?.isOverall && b.category?.isOverall) return 1;
                          return (a.category?.sortOrder || 0) - (b.category?.sortOrder || 0);
                        });
                        
                        const pvpEv = pvpEvs[0];
                        
                        const m = pvpEv.metrics;
                        const chartData = [
                          { subject: 'Flex', A: m.flexibility || 0, fullMark: 10 },
                          { subject: 'Resist', A: m.counterResist || 0, fullMark: 10 },
                          { subject: 'Impact', A: m.draftImpact || 0, fullMark: 10 },
                          { subject: 'Util', A: m.utility || 0, fullMark: 10 },
                          { subject: 'Dmg', A: m.damage || 0, fullMark: 10 },
                        ];
                        
                        return (
                          <div className="p-3 bg-surface border-t border-border-ink/30">
                            <div className="text-[10px] text-text-secondary font-mono mb-2 flex items-center justify-between">
                               <span>{pvpEv.category.name} Profile</span>
                            </div>
                            <div className="h-28 w-full -my-2">
                              <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
                                  <PolarGrid stroke="#333" />
                                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 8 }} />
                                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                                  <Radar name="Metrics" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                                </RadarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Uncategorized */}
        {activeMode === 'uncategorized' && grouped['uncategorized'] && (
          <div className="space-y-4">
            <p className="text-text-secondary font-mono text-sm mb-4">
              These Shikigami have not been assigned any roles yet.
            </p>
            {grouped['uncategorized'].length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {grouped['uncategorized'].map(shiki => (
                  <div key={shiki.id} className="group flex flex-col bg-surface border border-border-ink hover:border-accent-vermillion transition-all relative">
                    {/* Edit Button */}
                    {user && (
                      (currentTierListId === null && isAdmin) ||
                      (currentTierListId !== null && myTierLists.some((t: any) => t.id === currentTierListId))
                    ) && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                          e.stopPropagation();
                          setSelectedShikiForEdit(shiki);
                          setIsEditModalOpen(true);
                        }}
                        className="absolute top-1 right-1 flex items-center gap-1 px-1.5 py-0.5 bg-background/90 border border-border-ink text-text-secondary hover:text-accent-vermillion hover:border-accent-vermillion z-10 transition-colors shadow-sm"
                        title="Edit Shikigami"
                      >
                        <Edit className="w-3 h-3" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Edit</span>
                      </button>
                    )}
                    <Link href={`/shikigami/${shiki.id}`} className="w-full h-full flex flex-col items-center">
                      <div className="relative w-16 h-16 bg-surface overflow-hidden border border-border-ink">
                        {shiki.icon ? (
                          <img src={shiki.icon} alt={shiki.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-secondary font-mono text-xs bg-border-ink/10">?</div>
                        )}
                        <span className="absolute -top-1 -left-1 text-[8px] font-mono text-accent-gold bg-surface border border-accent-gold px-1">
                          {shiki.rarityId}
                        </span>
                      </div>
                      
                      <div className="w-full text-center mt-1">
                        <div className="text-sm font-bold text-foreground font-display truncate">
                          {shiki.name}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-text-secondary font-mono text-sm py-8 text-center bg-background border border-border-ink border-dashed">
                All Shikigami have roles assigned!
              </div>
            )}
          </div>
        )}
      </div>

      <EditShikigamiModal
        shikigami={selectedShikiForEdit}
        roles={roles}
        categories={categories}
        rarities={rarities}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaveSuccess={() => {
          setSelectedShikiForEdit(null);
          toast.success("Shikigami saved successfully!");
          router.refresh();
        }}
        currentTierListId={currentTierListId}
        currentTierListName={publicTierLists.find(t => t.id === currentTierListId)?.title}
      />
    </div>
  );
}
