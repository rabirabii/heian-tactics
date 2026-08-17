import React from "react";

export interface LineupSlotCardProps {
  col: {
    type: "shikigami" | "onmyoji";
    data: any;
    displayHero: any;
    isFlex?: boolean;
    isPrimaryOwned?: boolean;
    subUsed?: boolean;
    isMissing?: boolean;
  };
  getSoul: (id: string) => any;
  getOnmyoji: (id: string) => any;
  getOnmyojiSkill?: (id: string) => any;
  setSubsModal?: (data: any) => void;
  lineup?: any;
}

export default function LineupSlotCard({
  col,
  getSoul,
  getOnmyoji,
  getOnmyojiSkill,
  setSubsModal,
  lineup,
}: LineupSlotCardProps) {
  return (
    <div className="flex-shrink-0 w-44 bg-background border border-border-ink flex flex-col relative group">
      {/* Header: Avatar */}
      <div className="relative h-28 border-b border-border-ink bg-surface flex items-center justify-center overflow-hidden">
        {col.isFlex ? (
          <div className="w-full h-full flex items-center justify-center font-display text-2xl text-text-secondary bg-surface border-4 border-dashed border-border-ink">
            FLEX
          </div>
        ) : col.displayHero?.icon ? (
          <>
            <img
              src={col.displayHero.icon}
              alt={col.displayHero.name}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
              className={`w-full h-full object-cover ${col.isMissing ? "grayscale opacity-60" : ""}`}
            />
            <div className="w-full h-full flex items-center justify-center font-display text-3xl text-text-secondary bg-border-ink/10 hidden">
              {col.type === "onmyoji"
                ? col.displayHero?.name.substring(0, 2)
                : "?"}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center font-display text-3xl text-text-secondary bg-border-ink/10">
            {col.type === "onmyoji"
              ? col.displayHero?.name?.substring(0, 2)
              : "?"}
          </div>
        )}

        {/* Slot Type Badge */}
        {col.data?.slotType === "SUB" && (
          <div className="absolute top-2 left-2 bg-text-secondary text-surface text-[9px] font-bold px-1.5 py-0.5 shadow-sm opacity-90 tracking-widest z-10">
            FLEX
          </div>
        )}

        {/* Status Badges for Shikigami */}
        {col.type === "shikigami" && !col.isFlex && (
          <div className="absolute top-2 right-2">
            {col.isPrimaryOwned ? (
              <div className="bg-accent-gold text-surface text-[10px] font-bold px-1.5 py-0.5 shadow-sm">
                OWNED
              </div>
            ) : col.subUsed && !col.isMissing ? (
              <div className="bg-blue-500 text-surface text-[10px] font-bold px-1.5 py-0.5 shadow-sm">
                SUB
              </div>
            ) : col.isMissing === false ? null : (
              <div className="bg-accent-vermillion text-surface text-[10px] font-bold px-1.5 py-0.5 shadow-sm">
                MISS
              </div>
            )}
          </div>
        )}
      </div>

      {/* Name & Soul area */}
      <div className="p-3 border-b border-border-ink text-center flex flex-col items-center gap-2">
        <div
          className="text-sm font-display font-bold text-foreground truncate w-full"
          title={col.displayHero?.name}
        >
          {col.displayHero?.name || "Unknown"}
        </div>

        {/* Souls display */}
        <div className="flex gap-1 items-center h-6 justify-center flex-wrap">
          {Array.isArray(col.data?.primarySouls) &&
            col.data.primarySouls.map((s1Id: string, i: number) => {
              const s1 = getSoul(s1Id);
              if (!s1?.icon) return null;
              return (
                <div key={`p-${i}`} className="flex items-center gap-1">
                  {i > 0 && (
                    <span className="text-[10px] text-text-secondary font-mono">
                      /
                    </span>
                  )}
                  <img
                    src={s1.icon}
                    alt={`Soul 1-${i}`}
                    className="w-6 h-6 object-contain"
                    title={s1.name}
                  />
                </div>
              );
            })}
          {(!col.data?.primarySouls || col.data.primarySouls.length === 0) &&
            col.type === "shikigami" && (
              <span className="text-[10px] w-6 h-6 flex items-center justify-center border border-border-ink">
                ?
              </span>
            )}
          {col.type === "onmyoji" && (
            <div className="w-6 h-6 rounded-full border border-border-ink border-dashed"></div>
          )}
          {Array.isArray(col.data?.secondarySouls) &&
            col.data.secondarySouls.map((s2Id: string, i: number) => {
              const s2 = getSoul(s2Id);
              if (!s2?.icon) return null;
              return (
                <img
                  key={`s-${i}`}
                  src={s2.icon}
                  alt={`Soul 2-${i}`}
                  className="w-6 h-6 object-contain"
                  title={s2.name}
                />
              );
            })}
        </div>
      </div>

      {/* Stats List */}
      <div className="p-3 flex-1 flex flex-col gap-2 font-mono text-[11px]">
        {col.type === "shikigami" ? (
          <>
            <div className="flex justify-between border-b border-border-ink/30 pb-1">
              <span className="text-text-secondary">Slot 2</span>
              <span className="text-foreground font-bold">
                {col.data?.slot2}
              </span>
            </div>
            <div className="flex justify-between border-b border-border-ink/30 pb-1">
              <span className="text-text-secondary">Slot 4</span>
              <span className="text-foreground font-bold">
                {col.data?.slot4}
              </span>
            </div>
            <div className="flex justify-between border-b border-border-ink/30 pb-1">
              <span className="text-text-secondary">Slot 6</span>
              <span className="text-foreground font-bold">
                {col.data?.slot6}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 pt-1">
              <span className="text-text-secondary">Build Goal:</span>
              <span className="text-accent-gold font-bold break-words">
                {col.data?.statReq || "-"}
              </span>
            </div>
            {(col.data?.minSpeed ||
              col.data?.minEffectHit ||
              col.data?.minEffectRes ||
              col.data?.minCrit ||
              col.data?.minCritDmg) && (
              <div className="flex flex-col gap-1 pt-1 border-t border-border-ink/30 mt-1">
                <span className="text-[9px] font-mono text-text-secondary uppercase tracking-wider">
                  Minimum Stats:
                </span>
                <div className="flex flex-wrap gap-1">
                  {col.data.minSpeed && (
                    <span className="bg-accent-gold/20 text-accent-gold px-1 rounded-sm">
                      {col.data.minSpeed}+ SPD
                    </span>
                  )}
                  {col.data.minEffectHit && (
                    <span className="bg-blue-500/20 text-blue-400 px-1 rounded-sm">
                      {col.data.minEffectHit}% HIT
                    </span>
                  )}
                  {col.data.minEffectRes && (
                    <span className="bg-green-500/20 text-green-400 px-1 rounded-sm">
                      {col.data.minEffectRes}% RES
                    </span>
                  )}
                  {col.data.minCrit && (
                    <span className="bg-red-500/20 text-red-400 px-1 rounded-sm">
                      {col.data.minCrit}% CR
                    </span>
                  )}
                  {col.data.minCritDmg && (
                    <span className="bg-purple-500/20 text-purple-400 px-1 rounded-sm">
                      {col.data.minCritDmg}% CD
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="mt-auto pt-2 grid grid-cols-2 gap-1 text-[10px]">
              <div
                className="bg-surface px-1 py-0.5 text-center truncate border border-border-ink"
                title={col.data?.indicator}
              >
                {col.data?.indicator}
              </div>
              <div className="bg-surface px-1 py-0.5 text-center truncate border border-border-ink">
                {col.data?.skillReq}
              </div>
            </div>
            {/* View Subs Button */}
            {col.data?.substitutes &&
              Array.isArray(col.data.substitutes) &&
              col.data.substitutes.length > 0 &&
              setSubsModal && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSubsModal({ slotData: col.data, lineup });
                  }}
                  className="mt-2 w-full text-[10px] font-mono text-blue-400 border border-blue-400/30 bg-blue-400/5 py-1 hover:bg-blue-400/15 transition-colors"
                >
                  View Subs ({col.data.substitutes.length})
                </button>
              )}
          </>
        ) : (
          <div className="flex flex-col gap-2 h-full pt-1">
            <span className="text-text-secondary font-bold border-b border-border-ink/30 pb-1">
              Selected Skills:
            </span>
            {col.data?.onmyojiSkills?.length > 0 ? (
              <div className="flex flex-col gap-2 mt-1">
                {col.data.onmyojiSkills.map((skillId: string) => {
                  let skill;
                  if (getOnmyojiSkill) {
                    skill = getOnmyojiSkill(skillId);
                  } else {
                    skill = getOnmyoji(col.data.onmyojiId)?.skills?.find(
                      (s: any) => s.id === skillId,
                    );
                  }
                  if (!skill) return null;
                  return (
                    <div
                      key={skillId}
                      className="flex items-center gap-1.5 bg-surface p-3 border border-border-ink"
                    >
                      {skill.icon && (
                        <img
                          src={skill.icon}
                          alt={skill.name}
                          className="w-6 h-6 object-cover border border-border-ink/50"
                        />
                      )}
                      <span className="text-[12px] text-accent-gold font-display">
                        {skill.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className="text-text-secondary/50 mt-2 italic flex justify-center py-4">
                -
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
