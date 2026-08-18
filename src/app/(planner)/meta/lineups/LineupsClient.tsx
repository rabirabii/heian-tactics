"use client";

import { useState, useEffect } from "react";
import { useRosterStore } from "@/store/roster-store";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import LineupBuilderModal from "@/components/lineups/builder/LineupBuilderModal";
import LineupSlotCard from "@/components/lineups/LineupSlotCard";
import LineupHistoryModal from "@/components/lineups/LineupHistoryModal";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LineupsClient({
  shikigamiData,
  onmyojiData,
  soulsData,
  lineupsData,
  lineupTypesData,
  raritiesData,
  rolesData,
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

  const [activeType, setActiveType] = useState<string>(
    lineupTypesData[0]?.id || "PvE",
  );

  const currentType = lineupTypesData.find((t) => t.id === activeType);
  const categories = currentType?.categories || [];

  const [activeCategory, setActiveCategory] = useState<string>(
    categories[0]?.id || "",
  );

  const currentCategory = categories.find((c: any) => c.id === activeCategory);
  const subcategories = currentCategory?.subcategories || [];

  const [activeSubcategory, setActiveSubcategory] = useState<string>("All");
  
  const router = useRouter();
  const [visibleCount, setVisibleCount] = useState(10);

  const [user, setUser] = useState<User | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedLineupForEdit, setSelectedLineupForEdit] = useState<
    any | null
  >(null);

  // Subs Modal
  const [subsModal, setSubsModal] = useState<{
    slotData: any;
    lineup: any;
  } | null>(null);

  // History Modal
  const [historyModalLineup, setHistoryModalLineup] = useState<any | null>(null);

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
    const newCat = lineupTypesData.find((t) => t.id === typeId)?.categories[0];
    if (newCat) {
      setActiveCategory(newCat.id);
      setActiveSubcategory("All");
    } else {
      setActiveCategory("");
      setActiveSubcategory("All");
    }
  };

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    setActiveSubcategory("All");
    setVisibleCount(10);
  };

  const handleSubcategoryChange = (subId: string) => {
    setActiveSubcategory(subId);
    setVisibleCount(10);
  };

  const filteredLineups = lineupsData.filter((l) => {
    const isRightType = l.subcategory?.category?.type?.id === activeType;
    if (!isRightType) return false;

    const isRightCategory = l.subcategory?.category?.id === activeCategory;
    if (!isRightCategory) return false;

    if (activeSubcategory !== "All" && l.subcategoryId !== activeSubcategory)
      return false;

    return true;
  }).sort((a, b) => {
    const aDep = a.status === 'DEPRECATED' ? 1 : 0;
    const bDep = b.status === 'DEPRECATED' ? 1 : 0;
    if (aDep !== bDep) return aDep - bDep;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const getShiki = (id: string) => shikigamiData.find((s) => s.id === id);
  const getOnmyoji = (id: string) => onmyojiData.find((o) => o.id === id);
  const getSoul = (id: string) => soulsData.find((s) => s.id === id);

  const handleEditLineup = async (lineup: any) => {
    // The grid payload is stripped of heavy fields. Fetch full data for the builder.
    const supabase = createClient();
    const { data } = await supabase.from('MetaLineup').select(`
      id,
      name,
      subcategoryId,
      subcategory:LineupSubcategory(
        id, name,
        category:LineupCategory(
          id, name,
          type:LineupType(id, name)
        )
      ),
      description,
      notes,
      beginnerFriendly,
      strengths,
      weaknesses,
      author,
      status,
      referenceUrl,
      createdAt,
      updatedAt,
      banId,
      slots:LineupSlot(*),
      scenarios:LineupScenario(*)
    `).eq('id', lineup.id).single();

    if (data) {
      setSelectedLineupForEdit(data);
      setIsBuilderOpen(true);
    } else {
      console.error('Failed to fetch full lineup data for editing');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display text-foreground tracking-wide">
            Meta Lineups
          </h1>
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
              activeType === t.id
                ? "border-accent-vermillion text-accent-vermillion"
                : "border-transparent text-text-secondary hover:text-foreground"
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
                activeCategory === c.id
                  ? "bg-surface text-accent-gold border-accent-gold"
                  : "text-text-secondary hover:text-foreground hover:border-text-secondary"
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
            onClick={() => handleSubcategoryChange("All")}
            className={`px-3 py-1 text-xs font-mono transition-colors whitespace-nowrap rounded-full ${
              activeSubcategory === "All"
                ? "bg-accent-gold text-surface"
                : "bg-background text-text-secondary border border-border-ink hover:text-foreground"
            }`}
          >
            All Subcategories
          </button>
          {subcategories.map((sub: any) => (
            <button
              key={sub.id}
              onClick={() => handleSubcategoryChange(sub.id)}
              className={`px-3 py-1 text-xs font-mono transition-colors whitespace-nowrap rounded-full ${
                activeSubcategory === sub.id
                  ? "bg-accent-gold text-surface"
                  : "bg-background text-text-secondary border border-border-ink hover:text-foreground"
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-8">
        {filteredLineups.slice(0, visibleCount).map((lineup) => {
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
            <div
              key={lineup.id}
              className="bg-surface border border-border-ink p-6 relative group"
            >
              <div className="absolute top-0 right-0 bg-background border-b border-l border-border-ink px-3 py-1 font-mono text-xs text-text-secondary flex items-center gap-4">
                <span>
                  {lineup.subcategory?.category?.type?.name} /{" "}
                  {lineup.subcategory?.category?.name} /{" "}
                  {lineup.subcategory?.name}
                </span>
                {user && (
                  <button
                    onClick={() => handleEditLineup(lineup)}
                    className="p-1 hover:text-accent-vermillion transition-colors"
                    title="Edit Lineup"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>

              <h2 className="text-2xl font-display text-foreground mb-2 flex flex-wrap items-center gap-3">
                {lineup.name}
                {lineup.status === "DEPRECATED" && (
                  <span className="text-xs px-2 py-1 rounded-sm font-mono tracking-widest uppercase bg-gray-900/50 text-gray-400 border border-gray-800">
                    DEPRECATED
                  </span>
                )}
                {lineup.status === "OUTDATED" && (
                  <span className="text-xs px-2 py-1 rounded-sm font-mono tracking-widest uppercase bg-orange-900/50 text-orange-400 border border-orange-800">
                    OUTDATED
                  </span>
                )}
                {lineup.beginnerFriendly && (
                  <span className="text-xs bg-green-900/50 text-green-400 border border-green-800 px-2 py-1 rounded-sm font-mono tracking-widest uppercase">
                    🔰 Beginner Friendly
                  </span>
                )}
              </h2>

              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6">
                <div className="text-xs font-mono text-text-secondary">
                  <span className="text-foreground">Author:</span>{" "}
                  {lineup.author}
                </div>
                <div className="text-xs font-mono text-text-secondary">
                  <span className="text-foreground">Updated:</span>{" "}
                  {new Date(lineup.updatedAt).toLocaleDateString()}
                </div>
              </div>

              {/* Banned Shikigami */}
              {lineup.banId &&
                (() => {
                  const banShiki = getShiki(lineup.banId);
                  if (!banShiki) return null;
                  return (
                    <div className="mb-6 flex flex-col items-start gap-2">
                      <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">
                        Banned Shikigami
                      </span>
                      <div className="flex items-center gap-3 bg-surface border border-border-ink p-2 w-full sm:w-auto min-w-[200px] relative overflow-hidden group">
                        <div className="relative w-10 h-10 flex-shrink-0">
                          <img
                            src={banShiki.icon}
                            alt={banShiki.name}
                            className="w-full h-full object-cover grayscale opacity-70 mix-blend-luminosity border border-border-ink"
                          />
                          <div className="absolute inset-0 bg-red-900/20"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-0.5 bg-red-500 rotate-45 shadow-[0_0_8px_rgba(239,68,68,1)]"></div>
                          </div>
                        </div>
                        <span className="text-sm font-mono font-bold text-foreground relative z-10">
                          {banShiki.name}
                        </span>
                      </div>
                    </div>
                  );
                })()}

              {/* Card-based tactical layout */}
              <div className="flex flex-col gap-4">
                <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                  {coreColumns.map((col: any, idx: number) => (
                    <LineupSlotCard
                      key={`core-${idx}`}
                      col={col}
                      getSoul={getSoul}
                      getOnmyoji={getOnmyoji}
                      setSubsModal={setSubsModal}
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
                          setSubsModal={setSubsModal}
                          lineup={lineup}
                        />
                      ))}
                    </>
                  )}
                </div>
                
              </div>
              
              <div className="mt-6 border-t border-border-ink pt-6 flex justify-between items-center">
                <div>
                  {lineup.version_count > 1 && (
                    <button
                      onClick={() => setHistoryModalLineup(lineup)}
                      className="px-4 py-2 border border-border-ink text-text-secondary font-mono text-xs hover:border-foreground hover:text-foreground transition-colors"
                    >
                      History · v{lineup.version_count}
                    </button>
                  )}
                </div>
                <a
                  href={`/meta/lineups/${lineup.id}`}
                  className="px-6 py-2 bg-accent-vermillion text-surface font-mono font-bold hover:bg-accent-gold transition-colors"
                >
                  View Flex Options & Scenarios →
                </a>
              </div>
            </div>
          );
        })}

        {filteredLineups.length === 0 && (
          <div className="text-center py-12 border border-border-ink border-dashed">
            <p className="text-text-secondary font-mono">
              No lineups found in this category.
            </p>
          </div>
        )}

        {visibleCount < filteredLineups.length && (
          <div className="flex justify-center mt-12 mb-8">
            <button
              onClick={() => setVisibleCount((prev) => prev + 10)}
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
        lineupsData={lineupsData}
        onSaveSuccess={() => {
          toast.success("Lineup saved successfully!");
          router.refresh();
        }}
      />

      <LineupHistoryModal
        isOpen={!!historyModalLineup}
        onClose={() => setHistoryModalLineup(null)}
        headLineup={historyModalLineup}
        shikigamiData={shikigamiData}
        onmyojiData={onmyojiData}
        soulsData={soulsData}
      />

      {/* Subs Modal */}
      {subsModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSubsModal(null)}
        >
          <div
            className="bg-surface border border-border-ink max-w-2xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border-ink flex justify-between items-center bg-background/50">
              <h3 className="font-display text-lg text-accent-gold">
                Substitutes for{" "}
                {getShiki(subsModal.slotData.shikigamiId)?.name || "Unknown"}
              </h3>
              <button
                onClick={() => setSubsModal(null)}
                className="text-text-secondary hover:text-foreground text-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {(subsModal.slotData.substitutes || []).map(
                (sub: any, idx: number) => {
                  const subShiki = getShiki(sub.shikigamiId);
                  const isOwned = owned[sub.shikigamiId];
                  return (
                    <div
                      key={idx}
                      className="bg-background border border-border-ink flex flex-col md:flex-row gap-0"
                    >
                      <div className="p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border-ink w-full md:w-40 shrink-0 bg-surface/50">
                        <div className="w-16 h-16 border border-border-ink overflow-hidden bg-background mb-3">
                          {subShiki?.icon ? (
                            <img
                              src={subShiki.icon}
                              alt={subShiki.name}
                              className={`w-full h-full object-cover ${!isOwned ? "grayscale opacity-50" : ""}`}
                            />
                          ) : (
                            <span className="flex items-center justify-center w-full h-full text-text-secondary">
                              ?
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-display font-bold text-foreground text-center mb-2">
                          {subShiki?.name || sub.shikigamiId}
                        </span>
                        {isOwned ? (
                          <span className="text-[9px] font-bold px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30">
                            SUB AVAILABLE
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-2 py-1 bg-accent-vermillion/20 text-accent-vermillion border border-accent-vermillion/30">
                            MISS
                          </span>
                        )}
                      </div>

                      <div className="p-4 flex-1 flex flex-col gap-3 min-w-0">
                        <div className="flex gap-1 items-center flex-wrap">
                          <span className="text-xs font-mono text-text-secondary mr-2">
                            Souls:
                          </span>
                          {sub.primarySouls?.length > 0 ? (
                            sub.primarySouls.map((s1Id: string, i: number) => {
                              const s1 = getSoul(s1Id);
                              if (!s1?.icon) return null;
                              return (
                                <div
                                  key={`p-${i}`}
                                  className="flex items-center gap-1"
                                >
                                  {i > 0 && (
                                    <span className="text-[10px] text-text-secondary font-mono">
                                      /
                                    </span>
                                  )}
                                  <img
                                    src={s1.icon}
                                    alt={s1.name}
                                    className="w-5 h-5 object-contain"
                                    title={s1.name}
                                  />
                                  <span className="text-[10px] font-mono text-accent-gold">
                                    {s1.name}
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <span className="text-xs font-mono text-text-secondary">
                              Any
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 font-mono text-[10px] bg-surface p-2 border border-border-ink">
                          <div className="flex flex-col">
                            <span className="text-text-secondary mb-0.5">
                              Slot 2
                            </span>
                            <span
                              className="font-bold text-foreground truncate"
                              title={sub.slot2}
                            >
                              {sub.slot2 || "-"}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-text-secondary mb-0.5">
                              Slot 4
                            </span>
                            <span
                              className="font-bold text-foreground truncate"
                              title={sub.slot4}
                            >
                              {sub.slot4 || "-"}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-text-secondary mb-0.5">
                              Slot 6
                            </span>
                            <span
                              className="font-bold text-foreground truncate"
                              title={sub.slot6}
                            >
                              {sub.slot6 || "-"}
                            </span>
                          </div>
                        </div>

                        {(sub.statReq || sub.indicator) && (
                          <div className="flex flex-col gap-1">
                            {sub.statReq && (
                              <div className="text-[11px] font-mono">
                                <span className="text-text-secondary">
                                  Stat Req:{" "}
                                </span>
                                <span className="text-accent-gold font-bold">
                                  {sub.statReq}
                                </span>
                              </div>
                            )}
                            {sub.indicator && (
                              <div className="text-[11px] font-mono">
                                <span className="text-text-secondary">
                                  Role:{" "}
                                </span>
                                <span className="text-foreground">
                                  {sub.indicator}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {(sub.minSpeed ||
                          sub.minEffectHit ||
                          sub.minEffectRes ||
                          sub.minCrit ||
                          sub.minCritDmg) && (
                          <div className="flex flex-wrap gap-1 mt-1 text-[10px] font-mono">
                            {sub.minSpeed && (
                              <span className="bg-accent-gold/20 text-accent-gold px-1.5 py-0.5 border border-accent-gold/30">
                                {sub.minSpeed}+ SPD
                              </span>
                            )}
                            {sub.minEffectHit && (
                              <span className="bg-blue-500/20 text-blue-400 px-1.5 py-0.5 border border-blue-500/30">
                                {sub.minEffectHit}% HIT
                              </span>
                            )}
                            {sub.minEffectRes && (
                              <span className="bg-green-500/20 text-green-400 px-1.5 py-0.5 border border-green-500/30">
                                {sub.minEffectRes}% RES
                              </span>
                            )}
                            {sub.minCrit && (
                              <span className="bg-red-500/20 text-red-400 px-1.5 py-0.5 border border-red-500/30">
                                {sub.minCrit}% CR
                              </span>
                            )}
                            {sub.minCritDmg && (
                              <span className="bg-purple-500/20 text-purple-400 px-1.5 py-0.5 border border-purple-500/30">
                                {sub.minCritDmg}% CD
                              </span>
                            )}
                          </div>
                        )}

                        {sub.notes && (
                          <div className="mt-2 pt-3 border-t border-border-ink">
                            <span className="text-[10px] font-mono text-accent-vermillion block mb-1">
                              Notes / Warnings:
                            </span>
                            <p className="text-[11px] font-mono text-text-secondary leading-relaxed whitespace-pre-line">
                              {sub.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
