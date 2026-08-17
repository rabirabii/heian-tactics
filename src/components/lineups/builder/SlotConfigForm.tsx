import React from 'react';
import { Search, X } from 'lucide-react';

export default function SlotConfigForm({
  data,
  onChange,
  shikigamiData,
  onmyojiData,
  soulsData,
  rolesData,
  soulSearchQuery,
  setSoulSearchQuery
}: {
  data: any;
  onChange: (newData: any) => void;
  shikigamiData: any[];
  onmyojiData: any[];
  soulsData: any[];
  rolesData: any[];
  soulSearchQuery: string;
  setSoulSearchQuery: (q: string) => void;
}) {
  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const decodeHtml = (html: string) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  return (
    <div className="overflow-y-auto custom-scrollbar flex-1 p-6">
      {data.onmyojiId ? (() => {
        const onmyoji = onmyojiData.find(o => o.id === data.onmyojiId);
        const selectedSkills = data.onmyojiSkills || [];
        const toggleSkill = (skillId: string) => {
            let newSkills = [...selectedSkills];
            if (newSkills.includes(skillId)) {
              newSkills = newSkills.filter(id => id !== skillId);
            } else {
              if (newSkills.length < 2) {
                  newSkills.push(skillId);
              } else {
                  alert('You can only select a maximum of 2 skills.');
              }
            }
            onChange({...data, onmyojiSkills: newSkills});
        };
        return (
          <div className="space-y-4">
              <label className="text-xs font-mono text-text-secondary border-b border-border-ink pb-2 flex justify-between items-end">
                <span>Onmyoji Skills (Max 2)</span>
                <span className="text-[10px] text-accent-vermillion">{selectedSkills.length} selected</span>
              </label>

              {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2 p-2 bg-background border border-border-ink border-dashed">
                  <span className="text-[10px] font-mono text-text-secondary mr-2 self-center">Selected:</span>
                  {selectedSkills.map((skillId: string) => {
                    const skill = onmyoji?.skills?.find((s: any) => s.id === skillId);
                    if (!skill) return null;
                    return (
                      <div key={skillId} className="flex items-center gap-1 bg-surface border border-accent-vermillion/50 px-2 py-1 rounded-sm">
                        {skill.icon && <img src={skill.icon} alt={skill.name} className="w-4 h-4 rounded-full" />}
                        <span className="text-xs font-mono text-accent-vermillion">{skill.name}</span>
                        <button 
                          onClick={() => toggleSkill(skillId)}
                          className="ml-1 text-text-secondary hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-4 flex-wrap">
                {onmyoji?.skills?.filter((skill: any) => {
                  const t = skill.type?.toLowerCase() || '';
                  return !t.includes('normal') && !t.includes('passive');
                }).map((skill: any) => (
                    <div 
                      key={skill.id}
                      onClick={() => toggleSkill(skill.id)}
                      className={`flex items-center gap-3 border p-3 cursor-pointer transition-colors ${selectedSkills.includes(skill.id) ? 'border-accent-vermillion bg-accent-vermillion/10' : 'border-border-ink hover:border-text-secondary bg-surface'}`}
                    >
                      {skill.icon && <img src={skill.icon} alt={skill.name} className="w-10 h-10 object-cover border border-border-ink" />}
                      <span className="text-sm font-display font-bold">{skill.name}</span>
                    </div>
                ))}
              </div>
          </div>
        );
      })() : (
        <div className="grid grid-cols-2 gap-6">
          {data.shikigamiId && data.shikigamiId !== 'flex' && (
            <div className="col-span-2 space-y-2 mb-2 p-3 bg-background border border-accent-gold/30">
              <label className="text-xs font-mono text-accent-gold">Import Community Build (Auto-fill)</label>
              <select 
                value={data.buildId || ''}
                onChange={e => {
                  const buildId = e.target.value;
                  if (!buildId) {
                      onChange({...data, buildId: null});
                      return;
                  }
                  const shiki = shikigamiData.find(s => s.id === data.shikigamiId);
                  const build = shiki?.builds?.find((b: any) => b.id === buildId);
                  if (build) {
                      const indicatorStr = build.tags?.length > 0 ? build.tags[0] : (build.roleRef?.name || build.roleId);
                      
                      onChange({
                        ...data,
                        buildId: build.id,
                        indicator: indicatorStr,
                        primarySouls: build.soulChoices?.map((name: string) => soulsData.find((s: any) => s.name === name)?.id).filter(Boolean) || [],
                        statReq: decodeHtml(stripHtml(build.breakpoint)),
                        slot2: build.slot2 || '',
                        slot4: build.slot4 || '',
                        slot6: build.slot6 || '',
                      });
                  }
                }}
                className="w-full bg-surface border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none"
              >
                <option value="">-- Manual Configuration --</option>
                {shikigamiData.find(s => s.id === data.shikigamiId)?.builds?.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      [{b.tags?.join(', ') || b.roleRef?.name || b.roleId}] {b.soulChoices?.join(', ')} - {decodeHtml(stripHtml(b.breakpoint))}
                    </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="space-y-2 col-span-2">
            <label className="text-xs font-mono text-text-secondary">Stat Requirement (e.g. "+120 SPD, 100% Crit")</label>
            <input 
              value={data.statReq || ''} 
              onChange={e => onChange({...data, statReq: e.target.value})}
              className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" 
            />
          </div>
          
          <div className="col-span-2 grid grid-cols-5 gap-2">
            <div>
              <label className="text-[10px] font-mono text-text-secondary">Min SPD</label>
              <input type="number" value={data.minSpeed || ''} onChange={e => onChange({...data, minSpeed: e.target.value ? parseInt(e.target.value) : null})} className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-mono text-text-secondary">Min HIT (%)</label>
              <input type="number" value={data.minEffectHit || ''} onChange={e => onChange({...data, minEffectHit: e.target.value ? parseFloat(e.target.value) : null})} className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-mono text-text-secondary">Min RES (%)</label>
              <input type="number" value={data.minEffectRes || ''} onChange={e => onChange({...data, minEffectRes: e.target.value ? parseFloat(e.target.value) : null})} className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-mono text-text-secondary">Min CRIT (%)</label>
              <input type="number" value={data.minCrit || ''} onChange={e => onChange({...data, minCrit: e.target.value ? parseFloat(e.target.value) : null})} className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-mono text-text-secondary">Min CDMG (%)</label>
              <input type="number" value={data.minCritDmg || ''} onChange={e => onChange({...data, minCritDmg: e.target.value ? parseFloat(e.target.value) : null})} className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-text-secondary">Role Indicator (e.g. "ST DPS", "FLEX")</label>
            <input 
              list="rolesList"
              value={data.indicator || ''} 
              onChange={e => onChange({...data, indicator: e.target.value})}
              className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" 
              placeholder="e.g. ST DPS, Healer, FLEX"
            />
            <datalist id="rolesList">
              <option value="FLEX" />
              {rolesData?.map(r => (
                <option key={r.id} value={r.name} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-text-secondary">Slot Type</label>
            <select 
              value={data.slotType || 'CORE'} 
              onChange={e => onChange({...data, slotType: e.target.value})}
              className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none"
            >
              <option value="CORE">CORE (Required)</option>
              <option value="SUB">SUB (Substitute / Flex)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-text-secondary">Skill Requirement (e.g. "x-4-5")</label>
            <input 
              value={data.skillReq || ''} 
              onChange={e => onChange({...data, skillReq: e.target.value})}
              className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-text-secondary">Slot 2 Main Stat</label>
            <input 
              list="lineup-slot2-options"
              value={data.slot2 || ''} 
              onChange={e => onChange({...data, slot2: e.target.value})}
              className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" 
              placeholder="e.g. SPD"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono text-text-secondary">Slot 4 Main Stat</label>
            <input 
              list="lineup-slot4-options"
              value={data.slot4 || ''} 
              onChange={e => onChange({...data, slot4: e.target.value})}
              className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" 
              placeholder="e.g. Effect HIT"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono text-text-secondary">Slot 6 Main Stat</label>
            <input 
              list="lineup-slot6-options"
              value={data.slot6 || ''} 
              onChange={e => onChange({...data, slot6: e.target.value})}
              className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" 
              placeholder="e.g. CRIT"
            />
          </div>
          
          <div className="space-y-2 col-span-2 pt-4 border-t border-border-ink">
            <label className="text-xs font-mono text-text-secondary block flex justify-between items-end">
              <span>Primary Soul Sets (Alternatives)</span>
              <span className="text-[10px] text-accent-vermillion">{data.primarySouls?.length || 0} selected</span>
            </label>
            
            {data.primarySouls?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 p-2 bg-background border border-border-ink border-dashed">
                <span className="text-[10px] font-mono text-text-secondary mr-2 self-center">Selected:</span>
                {data.primarySouls.map((id: string) => {
                  const s = soulsData.find(x => x.id === id);
                  if (!s) return null;
                  return (
                    <div key={id} className="flex items-center gap-1 bg-surface border border-accent-vermillion/50 px-2 py-1 rounded-sm">
                      <img src={s.icon || ''} alt={s.name} className="w-4 h-4 rounded-full" />
                      <span className="text-xs font-mono text-accent-vermillion">{s.name}</span>
                      <button 
                        onClick={() => onChange({...data, primarySouls: data.primarySouls.filter((sid: string) => sid !== id)})}
                        className="ml-1 text-text-secondary hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                <input 
                  type="text" 
                  placeholder="Search souls..." 
                  value={soulSearchQuery}
                  onChange={e => setSoulSearchQuery(e.target.value)}
                  className="w-full bg-background border border-border-ink pl-10 p-2 font-mono text-sm focus:border-accent-vermillion outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {soulsData.filter(s => s.name.toLowerCase().includes(soulSearchQuery.toLowerCase()) || s.type?.toLowerCase().includes(soulSearchQuery.toLowerCase())).map(s => {
                const isSelected = data.primarySouls?.includes(s.id);
                return (
                  <div 
                    key={s.id}
                    onClick={() => {
                      const current = data.primarySouls || [];
                      if (isSelected) {
                        onChange({...data, primarySouls: current.filter((id: string) => id !== s.id)});
                      } else {
                        onChange({...data, primarySouls: [...current, s.id]});
                      }
                    }}
                    className={`flex items-center gap-2 p-2 border cursor-pointer transition-colors ${isSelected ? 'border-accent-vermillion bg-accent-vermillion/10' : 'border-border-ink hover:border-text-secondary bg-surface'}`}
                  >
                    {s.icon && <img src={s.icon} alt={s.name} className="w-6 h-6 object-contain" />}
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold font-mono text-foreground truncate">{s.name}</div>
                      <div className="text-[8px] font-mono text-text-secondary truncate">{s['2pc']}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes & Warnings */}
          <div className="space-y-2 col-span-2 pt-4 border-t border-border-ink">
            <label className="text-xs font-mono text-text-secondary flex flex-col gap-1">
              <span className="text-accent-gold">Notes & Warnings (Optional)</span>
              <span className="text-[10px] opacity-80">Explain any limitations, conditions, or differences when using this configuration or substitute.</span>
            </label>
            <textarea 
              value={data.notes || ''} 
              onChange={e => onChange({...data, notes: e.target.value})}
              className="w-full bg-background border border-border-ink p-3 font-mono text-xs focus:border-accent-vermillion outline-none min-h-[80px] custom-scrollbar" 
              placeholder="e.g. Using this substitute will make the team slightly weaker to fast control setups. Minimum +130 SPD required to take the first turn."
            />
          </div>
        </div>
      )}
    </div>
  );
}
