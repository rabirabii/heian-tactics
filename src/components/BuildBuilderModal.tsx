'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Search, Trash2 } from 'lucide-react';
import { upsertShikigamiBuild, deleteShikigamiBuild } from '@/app/actions/builds';
import { revalidateMetaCache } from '@/app/actions/revalidate';
import RichTextEditor from '@/components/RichTextEditor';

export default function BuildBuilderModal({
  isOpen,
  onClose,
  build,
  shikigamiData,
  rolesData,
  soulsData,
  lineupTypes,
  lineupCategories,
  onSaveSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  build: any;
  shikigamiData: any[];
  rolesData: any[];
  soulsData: any[];
  lineupTypes?: any[];
  lineupCategories?: any[];
  onSaveSuccess: () => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [shikigamiId, setShikigamiId] = useState('');
  const [roleId, setRoleId] = useState('');
  const [soulChoices, setSoulChoices] = useState<string[]>([]);
  const [slot2, setSlot2] = useState('');
  const [slot4, setSlot4] = useState('');
  const [slot6, setSlot6] = useState('');
  const [substats, setSubstats] = useState('');
  const [breakpoint, setBreakpoint] = useState('');
  const [notes, setNotes] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [typeId, setTypeId] = useState('PvE');
  const [categoryId, setCategoryId] = useState('');
  const [beginnerFriendly, setBeginnerFriendly] = useState(false);
  const [author, setAuthor] = useState('System');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [isNewVersion, setIsNewVersion] = useState(false);
  
  const [shikiSearch, setShikiSearch] = useState('');
  const [soulSearch, setSoulSearch] = useState('');
  
  // Rarity filtering for shikigami (optional but nice)
  const [activeRarity, setActiveRarity] = useState('All');
  const rarities = useMemo(() => {
    const unique = Array.from(new Set(shikigamiData.map(s => s.rarityId))).filter(Boolean);
    const order = ['UR', 'SP', 'SSR', 'SR', 'R', 'N'];
    unique.sort((a, b) => {
      const idxA = order.indexOf(a as string);
      const idxB = order.indexOf(b as string);
      if (idxA === -1 && idxB === -1) return (a as string).localeCompare(b as string);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
    return ['All', ...unique];
  }, [shikigamiData]);

  useEffect(() => {
    if (isOpen) {
      if (build) {
        setShikigamiId(build.shikigamiId || '');
        setRoleId(build.roleId || '');
        setSoulChoices(build.soulChoices || []);
        setSlot2(build.slot2 || '');
        setSlot4(build.slot4 || '');
        setSlot6(build.slot6 || '');
        setSubstats(build.substats || '');
        setBreakpoint(build.breakpoint || '');
        setNotes(build.notes || '');
        setTagsStr(build.tags ? build.tags.join(', ') : '');
        setTypeId(build.typeId || 'PvE');
        setCategoryId(build.categoryId || '');
        setBeginnerFriendly(build.beginnerFriendly || false);
        setAuthor(build.author || 'System');
        setReferenceUrl(build.referenceUrl || '');
        setIsNewVersion(false);
      } else {
        setShikigamiId('');
        setRoleId(rolesData[0]?.id || '');
        setSoulChoices([]);
        setSlot2('');
        setSlot4('');
        setSlot6('');
        setSubstats('');
        setBreakpoint('');
        setNotes('');
        setTagsStr('');
        setTypeId('PvE');
        setCategoryId('');
        setBeginnerFriendly(false);
        setAuthor('System');
        setReferenceUrl('');
        setIsNewVersion(false);
      }
    }
  }, [isOpen, build, rolesData]);

  const filteredShiki = useMemo(() => {
    let result = shikigamiData;
    if (activeRarity !== 'All') {
      result = result.filter(s => s.rarityId === activeRarity);
    }
    if (shikiSearch) {
      result = result.filter(s => s.name.toLowerCase().includes(shikiSearch.toLowerCase()));
    }
    return result;
  }, [shikiSearch, activeRarity, shikigamiData]);

  const filteredSouls = useMemo(() => {
    if (!soulSearch) return soulsData;
    return soulsData.filter(s => s.name.toLowerCase().includes(soulSearch.toLowerCase()));
  }, [soulSearch, soulsData]);

  if (!isOpen) return null;

  const handleToggleSoul = (soulName: string) => {
    if (soulChoices.includes(soulName)) {
      setSoulChoices(soulChoices.filter(s => s !== soulName));
    } else {
      setSoulChoices([...soulChoices, soulName]);
    }
  };

  const handleSave = async () => {
    if (!shikigamiId || !roleId) {
      alert("Shikigami and Role are required.");
      return;
    }
    setIsSaving(true);
    try {
      const tagsArray = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
      await upsertShikigamiBuild(build ? build.id : 'new', {
        shikigamiId,
        roleId,
        typeId,
        categoryId: categoryId || null,
        beginnerFriendly,
        soulChoices,
        slot2,
        slot4,
        slot6,
        substats,
        breakpoint,
        notes,
        tags: tagsArray,
        author,
        referenceUrl,
        isNewVersion
      });
      await revalidateMetaCache('meta-builds');
      onSaveSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      alert("Failed to save build.");
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!build || !confirm("Are you sure you want to delete this build?")) return;
    setIsSaving(true);
    try {
      await deleteShikigamiBuild(build.id);
      await revalidateMetaCache('meta-builds');
      onSaveSuccess();
      onClose();
    } catch(e) {
      console.error(e);
      alert("Failed to delete build.");
    }
    setIsSaving(false);
  };

  const selectedShikiObj = shikigamiData.find(s => s.id === shikigamiId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-surface border border-border-ink w-full max-w-6xl max-h-[90vh] h-full flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border-ink bg-background/50 shrink-0">
          <h2 className="text-xl font-display text-accent-gold flex items-center gap-2">
            {build ? 'Edit Community Build' : 'Create Community Build'}
            {selectedShikiObj && (
              <span className="text-sm font-mono text-text-secondary bg-border-ink/20 px-2 py-1 rounded ml-2">
                Target: {selectedShikiObj.name}
              </span>
            )}
          </h2>
          <button onClick={onClose} className="p-1 text-text-secondary hover:text-foreground hover:bg-border-ink/50 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body Split */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Column: Shikigami Selection (w-1/3) */}
          <div className="w-1/3 border-r border-border-ink flex flex-col bg-background/30 hidden md:flex">
            
            {/* Rarity Tabs */}
            <div className="p-4 border-b border-border-ink">
              <div className="flex gap-1 overflow-x-auto hide-scrollbar">
                {rarities.map(r => (
                  <button 
                    key={r}
                    onClick={() => setActiveRarity(r)} 
                    className={`px-3 py-1.5 text-xs font-mono whitespace-nowrap \${activeRarity === r ? 'bg-accent-vermillion text-white' : 'text-text-secondary hover:text-foreground'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-border-ink relative">
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input 
                type="text" 
                placeholder="Search Shikigami..."
                value={shikiSearch}
                onChange={e => setShikiSearch(e.target.value)}
                className="w-full bg-background border border-border-ink text-foreground pl-10 pr-4 py-2 font-mono text-sm focus:border-accent-vermillion outline-none"
              />
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
              <div className="grid grid-cols-4 lg:grid-cols-5 gap-2">
                {filteredShiki.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setShikigamiId(s.id)}
                    className={`relative aspect-square border overflow-hidden group transition-all \${
                      shikigamiId === s.id ? 'border-accent-gold ring-2 ring-accent-gold shadow-lg shadow-accent-gold/20' : 'border-border-ink hover:border-text-secondary'
                    }`}
                  >
                    {s.icon ? (
                      <img src={s.icon} alt={s.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-background flex items-center justify-center text-xs text-text-secondary font-mono">?</div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-black/70 p-1 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center pointer-events-none">
                       <span className="text-[9px] text-white font-mono truncate w-full text-center">{s.name}</span>
                       <span className="text-[8px] text-accent-gold font-mono">{s.rarityId}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Build Form (w-2/3) */}
          <div className="flex-1 flex flex-col relative overflow-hidden bg-surface">
            
            <div className="p-6 overflow-y-auto hide-scrollbar space-y-6 flex-1">
              
              {/* Mobile Fallback for Shikigami Selection */}
              <div className="md:hidden space-y-2 mb-6">
                <label className="text-xs font-mono text-text-secondary">Shikigami</label>
                <select 
                  value={shikigamiId} 
                  onChange={e => setShikigamiId(e.target.value)}
                  className="w-full bg-background border border-border-ink p-2 font-mono text-sm outline-none focus:border-accent-vermillion"
                >
                  <option value="">Select Shikigami</option>
                  {shikigamiData.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {!shikigamiId && (
                <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
                  <div className="text-accent-gold font-mono mb-2">No Shikigami Selected</div>
                  <div className="text-sm text-text-secondary font-mono">Please select a Shikigami from the left panel to continue.</div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-2">
                  <label className="text-xs font-mono text-text-secondary">Build Type</label>
                  <select 
                    value={typeId} 
                    onChange={e => {
                      setTypeId(e.target.value);
                      setCategoryId('');
                    }}
                    className="w-full bg-background border border-border-ink p-2 font-mono text-sm outline-none focus:border-accent-vermillion"
                  >
                    {lineupTypes?.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-text-secondary">Specific Category (Optional)</label>
                  <select 
                    value={categoryId} 
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full bg-background border border-border-ink p-2 font-mono text-sm outline-none focus:border-accent-vermillion"
                  >
                    <option value="">-- All / General --</option>
                    {lineupCategories?.filter((c: any) => c.typeId === typeId).map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2 md:col-span-2 flex items-center gap-2 border-b border-border-ink/30 pb-4">
                  <input 
                    type="checkbox" 
                    id="beginnerFriendly"
                    checked={beginnerFriendly}
                    onChange={e => setBeginnerFriendly(e.target.checked)}
                    className="w-4 h-4 bg-background border border-border-ink accent-accent-gold"
                  />
                  <label htmlFor="beginnerFriendly" className="text-sm font-mono text-foreground cursor-pointer">Beginner Friendly Build (Easier stat requirements / Alternative souls)</label>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-text-secondary">Base Role</label>
                  <select 
                    value={roleId} 
                    onChange={e => setRoleId(e.target.value)}
                    className="w-full bg-background border border-border-ink p-2 font-mono text-sm outline-none focus:border-accent-vermillion"
                  >
                    {rolesData.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label className="text-xs font-mono text-text-secondary">Tags (Comma separated, e.g. "High-Speed CC")</label>
                  <input 
                    value={tagsStr} 
                    onChange={e => setTagsStr(e.target.value)}
                    className="w-full bg-background border border-border-ink p-2 font-mono text-sm outline-none focus:border-accent-vermillion"
                    placeholder="High-Speed CC, Flex"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-mono text-text-secondary">Soul Choices</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="text"
                      placeholder="Search souls..."
                      value={soulSearch}
                      onChange={e => setSoulSearch(e.target.value)}
                      className="w-full bg-background border border-border-ink pl-9 pr-4 py-2 font-mono text-sm outline-none focus:border-accent-vermillion mb-2"
                    />
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-48 overflow-y-auto p-2 hide-scrollbar border border-border-ink/50 bg-background/30">
                    {filteredSouls.map(s => {
                      const isSelected = soulChoices.includes(s.name);
                      return (
                        <button
                          key={s.id}
                          onClick={() => handleToggleSoul(s.name)}
                          className={`flex flex-col items-center justify-center gap-1 p-2 border transition-colors aspect-square ${isSelected ? 'border-accent-gold bg-accent-gold/20 shadow-[inset_0_0_10px_rgba(255,215,0,0.1)]' : 'border-border-ink bg-surface hover:border-text-secondary'}`}
                        >
                          <img src={s.icon} alt={s.name} className="w-8 h-8 object-contain" />
                          <span className="text-[9px] font-mono truncate w-full text-center mt-1">{s.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  {soulChoices.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {soulChoices.map(sc => (
                        <span key={sc} className="text-xs font-mono bg-accent-gold/20 text-accent-gold border border-accent-gold px-2 py-1 flex items-center gap-1">
                          {sc} <X className="w-3 h-3 cursor-pointer" onClick={() => handleToggleSoul(sc)} />
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-xs font-mono text-text-secondary">Main Stats (Combo-box: type or select)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-text-secondary">Slot 2</label>
                      <input 
                        list="slot2-options"
                        value={slot2} 
                        onChange={e => setSlot2(e.target.value)}
                        className="w-full bg-background border border-border-ink p-2 font-mono text-sm outline-none focus:border-accent-vermillion"
                        placeholder="e.g. SPD"
                      />
                      <datalist id="slot2-options">
                        <option value="ATK Bonus" />
                        <option value="SPD" />
                        <option value="DEF Bonus" />
                        <option value="HP Bonus" />
                        <option value="SPD or ATK Bonus" />
                      </datalist>
                    </div>
                    <div>
                      <label className="text-[10px] text-text-secondary">Slot 4</label>
                      <input 
                        list="slot4-options"
                        value={slot4} 
                        onChange={e => setSlot4(e.target.value)}
                        className="w-full bg-background border border-border-ink p-2 font-mono text-sm outline-none focus:border-accent-vermillion"
                        placeholder="e.g. Effect HIT"
                      />
                      <datalist id="slot4-options">
                        <option value="Eff Hit" />
                        <option value="Eff Res" />
                        <option value="ATK Bonus" />
                        <option value="DEF Bonus" />
                        <option value="HP Bonus" />
                        <option value="Eff Hit or Eff Res" />
                      </datalist>
                    </div>
                    <div>
                      <label className="text-[10px] text-text-secondary">Slot 6</label>
                      <input 
                        list="slot6-options"
                        value={slot6} 
                        onChange={e => setSlot6(e.target.value)}
                        className="w-full bg-background border border-border-ink p-2 font-mono text-sm outline-none focus:border-accent-vermillion"
                        placeholder="e.g. CRIT or CDMG"
                      />
                      <datalist id="slot6-options">
                        <option value="Crit DMG" />
                        <option value="Crit" />
                        <option value="ATK Bonus" />
                        <option value="DEF Bonus" />
                        <option value="HP Bonus" />
                        <option value="Crit or Crit DMG" />
                      </datalist>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-text-secondary">Priority Substats e.g. SPD &gt; RES</label>
                  <input 
                    value={substats} 
                    onChange={e => setSubstats(e.target.value)}
                    className="w-full bg-background border border-border-ink p-2 font-mono text-sm outline-none focus:border-accent-vermillion"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-mono text-text-secondary">Breakpoint / Target</label>
                  <RichTextEditor 
                    content={breakpoint} 
                    onChange={setBreakpoint} 
                    placeholder="e.g. +140 SPD, or detailed stat requirements..."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label className="text-xs font-mono text-text-secondary">Author</label>
                  <input 
                    value={author} 
                    onChange={e => setAuthor(e.target.value)}
                    className="w-full bg-background border border-border-ink p-2 font-mono text-sm outline-none focus:border-accent-vermillion"
                    placeholder="e.g. System, NGA, or Player Name"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-1">
                  <label className="text-xs font-mono text-text-secondary">Reference URL (Optional)</label>
                  <input 
                    value={referenceUrl} 
                    onChange={e => setReferenceUrl(e.target.value)}
                    className="w-full bg-background border border-border-ink p-2 font-mono text-sm outline-none focus:border-accent-vermillion"
                    placeholder="e.g. Bilibili/NGA link"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-mono text-text-secondary">Notes & Restrictions</label>
                  <RichTextEditor 
                    content={notes} 
                    onChange={setNotes} 
                    placeholder="Add detailed notes, specific team synergies, or restrictions..."
                    className="min-h-[120px]"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border-ink flex justify-between bg-background/50 mt-auto shrink-0 z-20 relative">
              {build ? (
                <button 
                  onClick={handleDelete}
                  disabled={isSaving}
                  className="px-4 py-2 text-accent-vermillion border border-accent-vermillion/50 hover:bg-accent-vermillion/10 font-mono text-sm flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              ) : <div></div>}
              
              <div className="flex gap-4 items-center">
                {build && (
                  <label className="flex items-center gap-2 text-sm font-mono text-accent-gold cursor-pointer mr-2">
                    <input 
                      type="checkbox" 
                      checked={isNewVersion}
                      onChange={e => setIsNewVersion(e.target.checked)}
                      className="w-4 h-4 bg-background border border-border-ink accent-accent-gold"
                    />
                    Update as New Version
                  </label>
                )}
                <button onClick={onClose} className="px-6 py-2 text-text-secondary hover:text-foreground font-mono text-sm transition-colors">Cancel</button>
                <button 
                  onClick={handleSave} 
                  disabled={isSaving || !shikigamiId}
                  className="px-6 py-2 bg-accent-gold text-background font-bold font-mono text-sm hover:bg-accent-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Build'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
