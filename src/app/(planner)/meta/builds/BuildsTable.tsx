'use client';

import { useState, useEffect } from 'react';
import { Search, Edit } from 'lucide-react';
import BuildBuilderModal from '@/components/BuildBuilderModal';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

interface ShikiBuild {
  id: string;
  roleId: string;
  roleRef: { id: string, name: string };
  soulChoices: string[];
  slot2: string | null;
  slot4: string | null;
  slot6: string | null;
  substats: string;
  breakpoint: string;
  notes: string | null;
  typeId?: string;
  categoryId?: string;
  beginnerFriendly?: boolean;
  tags?: string[];
}

interface Rarity {
  id: string;
  name: string;
  sortOrder: number;
}

interface ShikigamiWithBuilds {
  id: string;
  name: string;
  rarityId: string;
  rarityRef: Rarity;
  icon: string | null;
  builds: ShikiBuild[];
}

import { toggleBuildVisibility } from '@/app/actions/builds';
import { Globe, Lock } from 'lucide-react';

export function BuildsTable({ data, rarities, allShikigami, rolesData, soulsData, lineupTypes, lineupCategories, currentUserId }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRarity, setActiveRarity] = useState<string>('All');
  const [activeType, setActiveType] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'COMMUNITY' | 'MINE'>('COMMUNITY');
  const [visibleCount, setVisibleCount] = useState(10);
  const router = useRouter();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBuild, setSelectedBuild] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleTogglePublish = async (buildId: string, currentPublicState: boolean) => {
    try {
      await toggleBuildVisibility(buildId, !currentPublicState);
      toast.success(currentPublicState ? 'Build changed to Private' : 'Build published to Community');
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || 'Failed to change build visibility');
    }
  };

  const handleRarityChange = (r: string) => {
    setActiveRarity(r);
    setVisibleCount(10);
  };

  const handleTypeChange = (t: string) => {
    setActiveType(t);
    setVisibleCount(10);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setVisibleCount(10);
  };

  // Filter shikigami based on search (name OR role), rarity, type, and activeTab
  const filteredData = data.map((shiki: any) => {
    // 1. Filter the builds based on Type and Tab
    let filteredBuilds = shiki.builds;
    if (activeType !== 'All') {
      filteredBuilds = filteredBuilds.filter((b: any) => b.typeId === activeType);
    }
    if (activeTab === 'COMMUNITY') {
      filteredBuilds = filteredBuilds.filter((b: any) => b.isPublic);
    } else {
      // My Builds
      filteredBuilds = filteredBuilds.filter((b: any) => b.authorId === currentUserId);
    }
    return { ...shiki, builds: filteredBuilds };
  }).filter((shiki: any) => {
    // Drop shiki if no builds match the filters
    if (shiki.builds.length === 0) return false;

    // 2. Rarity check
    if (activeRarity !== 'All' && shiki.rarityId !== activeRarity) return false;
    
    // 3. Search check (Name or Roles)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = shiki.name.toLowerCase().includes(q);
      const matchRole = shiki.builds.some((b: any) => b.roleRef?.name.toLowerCase().includes(q));
      if (!matchName && !matchRole) return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-border-ink">
        <button
          onClick={() => { setActiveTab('COMMUNITY'); setVisibleCount(10); }}
          className={`px-4 py-2 font-mono text-sm transition-colors border-b-2 ${
            activeTab === 'COMMUNITY' ? 'border-accent-gold text-accent-gold' : 'border-transparent text-text-secondary hover:text-foreground'
          }`}
        >
          <Globe className="w-4 h-4 inline mr-2" />
          Community Builds
        </button>
        {currentUserId && (
          <button
            onClick={() => { setActiveTab('MINE'); setVisibleCount(10); }}
            className={`px-4 py-2 font-mono text-sm transition-colors border-b-2 ${
              activeTab === 'MINE' ? 'border-accent-vermillion text-accent-vermillion' : 'border-transparent text-text-secondary hover:text-foreground'
            }`}
          >
            <Lock className="w-4 h-4 inline mr-2" />
            My Builds
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-surface p-4 border-l-2 border-border-ink">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar max-w-full">
          <select 
            value={activeType}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="px-3 py-1.5 text-sm font-mono border border-border-ink bg-background text-foreground focus:border-accent-vermillion outline-none"
          >
            <option value="All">All Types</option>
            <option value="PvE">PvE Only</option>
            <option value="PvP">PvP Only</option>
          </select>

          <div className="w-px h-8 bg-border-ink mx-1"></div>

          <button
            onClick={() => setActiveRarity('All')}
            className={`px-4 py-1.5 text-sm font-mono border border-border-ink transition-colors whitespace-nowrap ${
              activeRarity === 'All' ? 'bg-accent-vermillion text-surface' : 'text-text-secondary hover:text-foreground hover:border-text-secondary'
            }`}
          >
            All Rarities
          </button>
          {rarities.map((r: any) => (
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

        <div className="relative w-full sm:w-80 ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search Shikigami or Role..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-background border border-border-ink text-foreground pl-9 pr-4 py-2 font-mono text-sm focus:outline-none focus:border-accent-vermillion transition-colors"
          />
        </div>
        {user && (
          <button 
            onClick={() => {
              setSelectedBuild(null);
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto px-6 py-2 bg-accent-gold text-background font-bold font-mono text-sm hover:bg-accent-gold/90 transition-colors whitespace-nowrap"
          >
            + Create Build
          </button>
        )}
      </div>

      <div className="overflow-x-auto bg-surface border border-border-ink">
        <table className="w-full text-left font-mono text-sm border-collapse">
          <thead>
            <tr className="border-b border-border-ink bg-background/50">
              <th className="p-4 font-bold text-text-secondary min-w-[200px]">Shikigami</th>
              <th className="p-4 font-bold text-text-secondary">Role</th>
              <th className="p-4 font-bold text-text-secondary">Soul Choices</th>
              <th className="p-4 font-bold text-text-secondary min-w-[150px]">2 / 4 / 6</th>
              <th className="p-4 font-bold text-text-secondary min-w-[150px]">Substats</th>
              <th className="p-4 font-bold text-text-secondary min-w-[200px]">Breakpoint</th>
              <th className="p-4 font-bold text-text-secondary min-w-[200px]">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-ink">
            {filteredData.slice(0, visibleCount).map((shiki: any) => (
              shiki.builds.map((build: any, index: number) => (
                <tr key={build.id} className="hover:bg-background/50 transition-colors border-t border-border-ink/30">
                  {/* Only render the Shikigami cell for the first build, spanning all rows for this Shikigami */}
                  {index === 0 && (
                    <td className="p-4 align-top border-r border-border-ink/50" rowSpan={shiki.builds.length}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-background border border-border-ink overflow-hidden shrink-0">
                          {shiki.icon ? (
                            <img 
                              src={shiki.icon} 
                              alt={shiki.name} 
                              loading="lazy"
                              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                              className="w-full h-full object-cover" 
                            />
                          ) : null}
                          <div className={`w-full h-full flex items-center justify-center text-xs text-text-secondary bg-border-ink/10 ${shiki.icon ? 'hidden' : ''}`}>
                            ?
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{shiki.name}</div>
                          <div className={`text-[10px] ${shiki.rarityId === 'SP' || shiki.rarityId === 'SSR' ? 'text-accent-gold' : 'text-text-secondary'}`}>
                            {shiki.rarityId}
                          </div>
                        </div>
                      </div>
                    </td>
                  )}
                  {/* The rest of the cells */}
                  <td className="p-4 text-foreground font-bold group relative">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span>{build.roleRef?.name || build.roleId}</span>
                        {build.typeId && (
                          <span className={`text-[9px] px-1.5 py-0.5 border ${build.typeId === 'PvP' ? 'border-accent-vermillion text-accent-vermillion' : 'border-accent-gold text-accent-gold'}`}>
                            {build.typeId}
                          </span>
                        )}
                        {build.beginnerFriendly && (
                          <span className="text-[9px] px-1.5 py-0.5 border border-green-500 text-green-500" title="Beginner Friendly">
                            EASY
                          </span>
                        )}
                        {build.status === 'OUTDATED' && (
                          <span className="text-[9px] px-1.5 py-0.5 border border-yellow-500 text-yellow-500" title="Outdated">
                            OUTDATED
                          </span>
                        )}
                        {build.status === 'HISTORICAL' && (
                          <span className="text-[9px] px-1.5 py-0.5 border border-red-500 text-red-500" title="Historical">
                            HISTORICAL
                          </span>
                        )}
                        {user && (build.authorId === user.id || user.user_metadata?.role === 'ADMIN') && (
                          <div className="ml-auto opacity-0 group-hover:opacity-100 flex gap-2">
                            {build.authorId === user.id && (
                              <button
                                onClick={() => handleTogglePublish(build.id, build.isPublic)}
                                className={`px-2 py-0.5 text-[10px] border transition-colors ${
                                  build.isPublic 
                                    ? 'border-green-500 text-green-500 hover:bg-green-500/10' 
                                    : 'border-border-ink text-text-secondary hover:text-foreground'
                                }`}
                                title={build.isPublic ? "Public - Click to make Private" : "Private - Click to Publish"}
                              >
                                {build.isPublic ? "PUBLISHED" : "PUBLISH"}
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                setSelectedBuild({ ...build, shikigamiId: shiki.id });
                                setIsModalOpen(true);
                              }}
                              className="text-text-secondary hover:text-accent-vermillion transition-colors"
                              title="Edit Build"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 items-center text-[10px] text-text-secondary font-normal mt-1">
                        <span>By @{build.userAuthor?.username || build.author}</span>
                        {build.category && (
                          <span>• {build.category.name}</span>
                        )}
                      </div>
                      {build.tags && build.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {build.tags.map((tag: string, i: number) => (
                            <span key={i} className="text-[9px] px-1.5 py-0.5 bg-border-ink/30 text-text-secondary rounded-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-accent-gold">{build.soulChoices.join(', ')}</td>
                  <td className="p-4 text-foreground text-xs">
                    {[build.slot2, build.slot4, build.slot6].filter(Boolean).join(' / ')}
                  </td>
                  <td className="p-4 text-foreground text-xs">{build.substats}</td>
                  <td className="p-4 text-text-secondary text-xs align-top">
                    <div 
                      className="prose prose-invert prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:m-0 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:m-0 [&_p]:m-0 [&_li]:m-0" 
                      dangerouslySetInnerHTML={{ __html: build.breakpoint }} 
                    />
                  </td>
                  <td className="p-4 text-text-secondary text-xs align-top">
                    <div 
                      className="prose prose-invert prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:m-0 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:m-0 [&_p]:m-0 [&_li]:m-0" 
                      dangerouslySetInnerHTML={{ __html: build.notes || '' }} 
                    />
                  </td>
                </tr>
              ))
            ))}
          </tbody>
        </table>
        
        {filteredData.length === 0 && (
          <div className="text-center py-12 text-text-secondary font-mono">
            No builds found matching your criteria.
          </div>
        )}
      </div>

      {visibleCount < filteredData.length && (
        <div className="flex justify-center mt-8 mb-8">
          <button
            onClick={() => setVisibleCount(prev => prev + 10)}
            className="px-8 py-3 bg-surface border border-border-ink text-foreground font-mono font-bold hover:border-accent-gold hover:text-accent-gold transition-colors shadow-sm"
          >
            Load More Builds ↓
          </button>
        </div>
      )}

      <BuildBuilderModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        build={selectedBuild}
        shikigamiData={allShikigami}
        rolesData={rolesData}
        soulsData={soulsData}
        lineupTypes={lineupTypes}
        lineupCategories={lineupCategories}
        onSaveSuccess={() => {
          toast.success("Build saved successfully!");
          router.refresh();
        }}
      />
    </div>
  );
}
