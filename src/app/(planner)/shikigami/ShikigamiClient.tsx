'use client';
import Link from 'next/link';

import { toggleShikigamiOwnership } from '@/app/actions/roster';

import { useState, useEffect } from 'react';
import { useRosterStore, OwnedShikigami } from '@/store/roster-store';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import EditShikigamiModal from '@/components/EditShikigamiModal';
import { useRouter } from "next/navigation";
import { stripHtml } from '@/lib/utils';
import QuickPresetModal, { ShikigamiPresetData, PresetResult } from '@/components/roster/QuickPresetModal';

interface Rarity {
  id: string;
  name: string;
  sortOrder: number;
}

interface Shikigami {
  id: string;
  name: string;
  rarityId: string;
  rarityRef: Rarity;
  icon: string | null;
}

export default function ShikigamiClient({ shikigamiData, roles = [], categories = [], rarities = [] }: { shikigamiData: any, roles?: any[], categories?: any[], rarities?: any[] }) {
  const { owned, toggleOwnership } = useRosterStore();
  const [activeRarity, setActiveRarity] = useState<string>('All');
  const [activeRole, setActiveRole] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBeginnerOnly, setShowBeginnerOnly] = useState(false);
  const [selectedShiki, setSelectedShiki] = useState<any | null>(null);
  const [visibleCount, setVisibleCount] = useState(24);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const router = useRouter();
  const [sortBy, setSortBy] = useState<'rarity' | 'nameAsc' | 'nameDesc'>('rarity');
  const [user, setUser] = useState<User | null>(null);
  const [presetModalTarget, setPresetModalTarget] = useState<ShikigamiPresetData | null>(null);
  const [userProjects, setUserProjects] = useState<{ id: string; title: string }[]>([]);

  const handleRarityChange = (r: string) => {
    setActiveRarity(r);
    setVisibleCount(24);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setVisibleCount(24);
  };
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const [rosterRes, projectsRes] = await Promise.all([
          supabase
            .from('UserRoster')
            .select('shikigamiId, grade, level, skills:UserRosterSkill(skillId, level)')
            .eq('userId', data.user.id),
          supabase
            .from('UserProject')
            .select('id, title')
            .eq('userId', data.user.id)
            .neq('status', 'COMPLETED')
            .order('createdAt', { ascending: false })
        ]);
          
        if (rosterRes.data) {
          const dbOwned = rosterRes.data.reduce((acc: Record<string, OwnedShikigami>, curr) => {
            if (curr.shikigamiId) {
              acc[curr.shikigamiId] = { 
                id: curr.shikigamiId, 
                grade: curr.grade || 6, 
                level: curr.level || 40,
                skills: (curr.skills as any[]) || []
              };
            }
            return acc;
          }, {});
          useRosterStore.setState({ owned: dbOwned });
        }

        if (projectsRes.data) {
          setUserProjects(projectsRes.data);
        }
      }
    });
  }, [supabase]);


  const handleToggle = async (shiki: any) => {
    if (!user) {
      toast.error('Gagal Menyimpan!', {
        description: 'Kamu harus Login terlebih dahulu untuk menyimpan data Roster.',
        action: { label: 'Log In', onClick: () => window.location.href = '/login' }
      });
      return;
    }
    
    const isOwned = !!owned[shiki.id];
    
    if (!isOwned) {
      setPresetModalTarget({
        id: shiki.id,
        name: shiki.name,
        icon: shiki.icon,
        skills: shiki.skills || []
      });
    } else {
      // If already owned, remove it immediately (like before)
      toggleOwnership(shiki.id);
      try {
        await toggleShikigamiOwnership(shiki.id, false);
        toast(`${shiki.name} dihapus dari Roster.`);
      } catch (error) {
        toggleOwnership(shiki.id);
        toast.error('Gagal menghapus data.');
      }
    }
  };

  const confirmAddPreset = async (preset: PresetResult) => {
    if (!presetModalTarget) return;
    const { id, name } = presetModalTarget;
    setPresetModalTarget(null);

    toggleOwnership(id, preset);
    try {
      await toggleShikigamiOwnership(id, true, preset);
      toast.success(`${name} ditambahkan ke Roster!`);
    } catch (error) {
      toggleOwnership(id); // Revert
      toast.error('Gagal menyimpan data.');
    }
  };

  let filteredShikigami = shikigamiData.filter((s: any) => {
    if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (activeRarity !== 'All' && s.rarityId !== activeRarity) return false;
    if (showBeginnerOnly && !s.beginnerFriendly) return false;
    if (activeRole !== 'All' && !s.roleAssignments?.some((ra: any) => ra.roleId === activeRole)) return false;
    return true;
  });

  filteredShikigami.sort((a: any, b: any) => {
    if (sortBy === 'nameAsc') return a.name.localeCompare(b.name);
    if (sortBy === 'nameDesc') return b.name.localeCompare(a.name);
    
    // Default rarity sort
    const aOrder = a.rarityRef?.sortOrder ?? 99;
    const bOrder = b.rarityRef?.sortOrder ?? 99;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-6 relative flex h-full">
      <div className={`flex-1 transition-all ${selectedShiki ? 'pr-80' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-display text-foreground tracking-wide">Roster Manager</h1>
            <p className="text-text-secondary mt-1 font-mono text-sm">
              Manage your personal Shikigami collection.
            </p>
          </div>
          {user && (
            <div className="flex items-center gap-6">
              <button 
                onClick={() => {
                  setSelectedShiki(null);
                  setIsEditModalOpen(true);
                }}
                className="hidden sm:flex text-sm font-mono text-accent-gold border border-accent-gold px-3 py-1 hover:bg-accent-gold hover:text-background transition-colors"
              >
                + Add Shikigami
              </button>
              <div className="text-right">
                <div className="text-2xl font-display text-accent-vermillion">
                  {Object.keys(owned).length} <span className="text-sm text-text-secondary">/ {shikigamiData.length}</span>
                </div>
                <div className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">
                  Owned
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-surface p-4 border-l-2 border-border-ink mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar max-w-full">
            <button
              onClick={() => setActiveRarity('All')}
              className={`px-4 py-1.5 text-sm font-mono border border-border-ink transition-colors whitespace-nowrap ${
                activeRarity === 'All' ? 'bg-accent-vermillion text-surface' : 'text-text-secondary hover:text-foreground hover:border-text-secondary'
              }`}
            >
              All
            </button>
            {rarities.map((r) => (
              <button
                key={r.id}
                onClick={() => handleRarityChange(r.id)}
                className={`px-4 py-1.5 text-sm font-mono border border-border-ink transition-colors ${
                  activeRarity === r.id ? 'bg-accent-gold text-surface' : 'text-text-secondary hover:text-foreground hover:border-text-secondary'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Search Shikigami..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-background border border-border-ink text-foreground pl-9 pr-4 py-2 font-mono text-sm focus:outline-none focus:border-accent-vermillion transition-colors"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto bg-background border border-border-ink text-foreground px-4 py-2 font-mono text-sm focus:outline-none focus:border-accent-vermillion transition-colors appearance-none cursor-pointer"
            >
              <option value="rarity">Sort: Rarity</option>
              <option value="nameAsc">Sort: Name (A-Z)</option>
              <option value="nameDesc">Sort: Name (Z-A)</option>
            </select>
            
            {roles && roles.length > 0 && (
              <select
                value={activeRole}
                onChange={(e) => setActiveRole(e.target.value)}
                className="w-full sm:w-auto bg-background border border-border-ink text-foreground px-4 py-2 font-mono text-sm focus:outline-none focus:border-accent-vermillion transition-colors appearance-none cursor-pointer"
              >
                <option value="All">Role: All</option>
                {roles.map((r: any) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            )}

            <button
              onClick={() => setShowBeginnerOnly(!showBeginnerOnly)}
              className={`w-full sm:w-auto px-4 py-2 font-mono text-sm border border-green-800 transition-colors whitespace-nowrap ${
                showBeginnerOnly ? 'bg-green-900/50 text-green-400' : 'bg-background text-text-secondary hover:text-green-500'
              }`}
            >
              🔰 Beginner Only
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {filteredShikigami.slice(0, visibleCount).map((shiki: any) => {
            const isVisitor = !user;
            const isOwned = isVisitor ? false : !!owned[shiki.id];
            
            return (
              <div
                key={shiki.id}
                className={`relative group flex flex-col items-center gap-2 p-2 border transition-all ${
                  isOwned
                    ? 'border-accent-gold bg-surface'
                    : 'border-border-ink hover:border-text-secondary bg-background'
                }`}
              >
                {/* Avatar area to toggle ownership */}
                <div 
                  className="group/avatar relative w-16 h-16 bg-surface overflow-hidden border border-border-ink cursor-pointer transition-all"
                  onClick={() => handleToggle(shiki)}
                  title={isVisitor ? "Log in to manage roster" : "Click to toggle ownership"}
                >
                  {shiki.icon ? (
                    <img 
                      src={shiki.icon} 
                      alt={shiki.name} 
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                      className={`w-full h-full object-cover transition-opacity group-hover/avatar:opacity-40 ${(!isOwned && !isVisitor) ? 'grayscale opacity-50' : ''}`} 
                    />
                  ) : null}
                  
                  {/* Fallback dummy image if img fails or is empty */}
                  <div className={`w-full h-full flex items-center justify-center text-text-secondary font-mono text-xs bg-border-ink/10 transition-opacity group-hover/avatar:opacity-40 ${shiki.icon ? 'hidden' : ''}`}>
                    ?
                  </div>
                  
                  {/* Hover Overlay Icon */}
                  {!isVisitor && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity pointer-events-none">
                      {isOwned ? (
                        <div className="w-8 h-8 rounded-full bg-red-900/80 border border-red-500 flex items-center justify-center text-red-100 text-xl font-bold shadow-lg shadow-red-900/50">
                          -
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-green-900/80 border border-green-500 flex items-center justify-center text-green-100 text-xl font-bold shadow-lg shadow-green-900/50">
                          +
                        </div>
                      )}
                    </div>
                  )}

                  {isOwned && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-accent-gold pointer-events-none" />
                  )}
                  {(shiki as any).beginnerFriendly && (
                    <div className="absolute top-0 left-0 bg-green-600/90 text-white text-[8px] font-bold px-1 py-0.5 pointer-events-none" title="Beginner Friendly">🔰</div>
                  )}
                  {!(shiki as any).availableGlobal && (
                    <div className="absolute bottom-0 left-0 right-0 bg-red-600/90 text-white text-[10px] font-bold font-mono text-center py-0.5 z-10 pointer-events-none">
                      CN ONLY
                    </div>
                  )}
                </div>
                
                {/* Name area to open details */}
                <div 
                  className="text-center w-full cursor-pointer hover:text-accent-vermillion transition-colors"
                  onClick={() => setSelectedShiki(shiki)}
                  title="View Details"
                >
                  <div className={`mt-2 font-mono font-bold text-sm ${owned[shiki.id] ? 'text-accent-gold' : 'text-text-secondary group-hover:text-foreground'} transition-colors`}>
                    {shiki.name}
                  </div>
                  <div className={`text-[10px] font-mono mt-0.5 ${
                    shiki.rarityId === 'SP' || shiki.rarityId === 'SSR' ? 'text-accent-gold' : 'text-text-secondary'
                  }`}>
                    {shiki.rarityId}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredShikigami.length === 0 && (
          <div className="text-center py-12 border border-border-ink border-dashed">
            <p className="text-text-secondary font-mono">No Shikigami found.</p>
          </div>
        )}

        {visibleCount < filteredShikigami.length && (
          <div className="flex justify-center gap-4 mt-12 mb-8">
            <button
              onClick={() => setVisibleCount(prev => prev + 24)}
              className="px-8 py-3 bg-surface border border-border-ink text-foreground font-mono font-bold hover:border-accent-gold hover:text-accent-gold transition-colors shadow-sm"
            >
              Load More Shikigami ↓
            </button>
            <button
              onClick={() => setVisibleCount(filteredShikigami.length)}
              className="px-8 py-3 bg-background border border-border-ink text-text-secondary font-mono hover:text-foreground transition-colors shadow-sm"
            >
              View All ({filteredShikigami.length})
            </button>
          </div>
        )}
      </div>

      {/* Slide-out Sheet for Details */}
      {selectedShiki && (
        <div className="fixed top-0 right-0 h-screen w-80 bg-surface border-l border-border-ink shadow-2xl z-50 p-6 overflow-y-auto flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-4 items-center">
              <img src={selectedShiki.icon} alt={selectedShiki.name} className="w-12 h-12 border border-border-ink bg-background object-cover" />
              <div>
                <h3 className="text-xl font-display text-foreground flex items-center gap-2">
                  {selectedShiki.name}
                  {selectedShiki.beginnerFriendly && <span title="Beginner Friendly" className="text-xs">🔰</span>}
                </h3>
                <div className="flex gap-2 items-center mt-1">
                  <span className="text-xs font-mono text-accent-gold border border-accent-gold px-1 py-0.5">{selectedShiki.rarityId}</span>
                  {selectedShiki.roleAssignments?.map((ra: any) => ra.role).filter((value: any, index: number, self: any[]) => self.findIndex((r: any) => r.id === value.id) === index).map((r: any) => (
                    <span key={r.id} className="text-xs bg-surface border border-border-ink px-2 py-1 font-mono text-text-secondary">
                      {r.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <button onClick={() => setSelectedShiki(null)} className="text-text-secondary hover:text-foreground">
                ✕
              </button>
            </div>
          </div>
          
          <div className="flex-1 space-y-6">
            
            {/* Dynamic Evaluations */}
            {selectedShiki.evaluations && selectedShiki.evaluations.length > 0 && (
              <div>
                <h3 className="text-sm font-mono text-text-secondary border-b border-border-ink pb-1 mb-3">Evaluations</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedShiki.evaluations.map((ev: any) => (
                    <div key={ev.id} className="bg-background border border-border-ink p-2 flex flex-col">
                      <span className="text-[10px] text-text-secondary uppercase">{ev.category.name}</span>
                      <div className="flex justify-between items-end mt-1">
                        <span className="text-lg font-display text-accent-gold">{ev.score}</span>
                      </div>
                      {ev.notes && (
                        <span 
                          className="text-[10px] text-text-secondary mt-1 block truncate" 
                          title={stripHtml(ev.notes)}
                        >
                          {stripHtml(ev.notes)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedShiki.skills && selectedShiki.skills.length > 0 && (
              <div>
                <h3 className="text-sm font-mono text-text-secondary border-b border-border-ink pb-1 mb-3">Skills (Preview)</h3>
                <div className="space-y-3">
                  {selectedShiki.skills.map((skill: any, idx: number) => (
                    <div key={skill.id || idx} className="bg-background p-3 border border-border-ink flex gap-3">
                      {skill.icon && (
                        <div className="w-10 h-10 shrink-0 bg-surface border border-border-ink overflow-hidden">
                          <img src={skill.icon} alt={skill.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-mono text-sm text-foreground truncate mr-2">{skill.name}</span>
                          {skill.cost !== null && <span className="text-[10px] font-mono text-blue-400 whitespace-nowrap flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 block"></span> {skill.cost}</span>}
                          {skill.cooldown !== null && skill.cooldown > 0 && <span className="text-[10px] font-mono text-text-secondary whitespace-nowrap border border-border-ink px-1">CD: {skill.cooldown}</span>}
                        </div>
                        <div 
                          className="prose prose-invert prose-sm max-w-none text-xs font-mono text-text-secondary line-clamp-2 [&_img]:inline-block [&_img]:h-4 [&_img]:w-4 [&_img]:align-middle [&_img]:mx-1 [&_p]:inline" 
                          dangerouslySetInnerHTML={{ __html: skill.description }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Strengths & Weaknesses */}
            {(selectedShiki.strengths?.length > 0 || selectedShiki.weaknesses?.length > 0) && (
              <div>
                <h3 className="text-sm font-mono text-text-secondary border-b border-border-ink pb-1 mb-3">Analysis</h3>
                <div className="flex flex-col gap-3">
                  {selectedShiki.strengths?.length > 0 && (
                    <div className="bg-green-900/10 border border-green-900/50 p-3">
                      <h4 className="text-xs font-bold text-green-500 uppercase tracking-wider mb-2">Strengths</h4>
                      <ul className="list-disc pl-4 text-xs font-mono text-text-secondary space-y-1">
                        {selectedShiki.strengths.map((s: string, i: number) => (
                          <li key={i}>
                            <div className="prose prose-invert prose-sm max-w-none inline-block [&_img]:inline-block [&_img]:h-3 [&_img]:w-3 [&_img]:align-middle [&_p]:inline" dangerouslySetInnerHTML={{ __html: s }} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedShiki.weaknesses?.length > 0 && (
                    <div className="bg-red-900/10 border border-red-900/50 p-3">
                      <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Weaknesses</h4>
                      <ul className="list-disc pl-4 text-xs font-mono text-text-secondary space-y-1">
                        {selectedShiki.weaknesses.map((w: string, i: number) => (
                          <li key={i}>
                            <div className="prose prose-invert prose-sm max-w-none inline-block [&_img]:inline-block [&_img]:h-3 [&_img]:w-3 [&_img]:align-middle [&_p]:inline" dangerouslySetInnerHTML={{ __html: w }} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {user && (
              <div>
                <h3 className="text-sm font-mono text-text-secondary border-b border-border-ink pb-1 mb-3">My Roster Status</h3>
                <div className="bg-background p-4 border border-border-ink flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-mono text-foreground">Owned</span>
                    <button 
                      onClick={() => handleToggle(selectedShiki)}
                      className={`px-3 py-1 text-xs font-mono border transition-colors ${owned[selectedShiki.id] ? 'bg-accent-vermillion text-surface border-accent-vermillion' : 'bg-transparent text-text-secondary border-border-ink'}`}
                    >
                      {owned[selectedShiki.id] ? 'Yes' : 'No'}
                    </button>
                  </div>
                  
                  {owned[selectedShiki.id] && (
                    <>
                      <div className="flex justify-between items-center mt-2 border-t border-border-ink pt-2">
                        <span className="text-sm font-mono text-text-secondary">Grade</span>
                        <span className="text-sm font-mono text-foreground font-bold text-accent-gold">G{owned[selectedShiki.id].grade || 6}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm font-mono text-text-secondary">Level</span>
                        <span className="text-sm font-mono text-foreground font-bold">{owned[selectedShiki.id].level || 40}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {user && (
            <div className="mt-4 pt-4 border-t border-border-ink shrink-0 flex gap-2 justify-center">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                title={`Edit ${selectedShiki.name}`}
                className="flex items-center justify-center p-3 bg-surface border border-border-ink hover:border-accent-gold transition-colors text-text-secondary hover:text-accent-gold"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button 
                onClick={async () => {
                  if (confirm(`Are you sure you want to hard delete ${selectedShiki.name}? This will turn any slot using them into a Flex slot.`)) {
                    const { deleteShikigami } = await import('@/app/actions/admin');
                    await deleteShikigami(selectedShiki.id);
                    toast.success(`${selectedShiki.name} deleted successfully!`);
                    setSelectedShiki(null);
                    router.refresh();
                  }
                }}
                title="Delete"
                className="flex items-center justify-center p-3 bg-surface border border-border-ink hover:border-red-500 transition-colors text-text-secondary hover:text-red-500"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="mt-4 shrink-0">
            <Link 
              href={`/shikigami/${selectedShiki.id}`}
              className="flex items-center justify-center w-full bg-accent-vermillion hover:bg-accent-vermillion/90 text-white font-display py-3 px-4 transition-colors"
            >
              View Full Profile ➔
            </Link>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      <EditShikigamiModal
        shikigami={selectedShiki}
        roles={roles}
        categories={categories}
        rarities={rarities}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaveSuccess={() => {
          toast.success("Shikigami saved successfully!");
          router.refresh();
        }}
      />
      {/* Quick Preset Modal */}
      {presetModalTarget && (
        <QuickPresetModal
          shikigami={presetModalTarget}
          userProjects={userProjects}
          onClose={() => setPresetModalTarget(null)}
          onConfirm={confirmAddPreset}
        />
      )}
    </div>
  );
}