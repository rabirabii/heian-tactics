'use client';

import { useState, useEffect } from 'react';
import { Save, X, Search, Trash2, Edit } from 'lucide-react';
import { upsertMetaLineup } from '@/app/actions/lineups';

export default function LineupBuilderModal({
  lineup,
  shikigamiData,
  onmyojiData,
  soulsData,
  lineupTypesData,
  raritiesData,
  rolesData,
  isOpen,
  onClose,
  onSaveSuccess
}: {
  lineup: any,
  shikigamiData: any[],
  onmyojiData: any[],
  soulsData: any[],
  lineupTypesData: any[],
  raritiesData: any[],
  rolesData: any[],
  isOpen: boolean,
  onClose: () => void,
  onSaveSuccess: () => void
}) {
  const isNew = !lineup;
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'shikigami' | 'onmyoji'>('shikigami');
  const [searchQuery, setSearchQuery] = useState('');

  // Builder States
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [beginnerFriendly, setBeginnerFriendly] = useState(false);
  const [strengthsStr, setStrengthsStr] = useState('');
  const [weaknessesStr, setWeaknessesStr] = useState('');
  const [status, setStatus] = useState('CURRENT');
  const [author, setAuthor] = useState('System');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [isNewVersion, setIsNewVersion] = useState(false);
  
  const [selectedType, setSelectedType] = useState(lineupTypesData[0]?.id || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
  
  // Slots: Array of 6 slots (1-5 for shiki, 6 for onmyoji)
  const [slots, setSlots] = useState<any[]>([]);

  // Selection state
  const [activeSlotNumber, setActiveSlotNumber] = useState<number | null>(null);
  const [rarityFilter, setRarityFilter] = useState<string>('All');
  
  // Config Modal State
  const [configSlotData, setConfigSlotData] = useState<any | null>(null);
  const [soulSearchQuery, setSoulSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(lineup?.name || '');
      setDescription(lineup?.description || '');
      setNotes(lineup?.notes || '');
      setBeginnerFriendly(lineup?.beginnerFriendly || false);
      setStrengthsStr(lineup?.strengths?.join(', ') || '');
      setWeaknessesStr(lineup?.weaknesses?.join(', ') || '');
      setStatus(lineup?.status || 'CURRENT');
      setAuthor(lineup?.author || 'System');
      setReferenceUrl(lineup?.referenceUrl || '');
      setIsNewVersion(false);
      
      // Auto-select type based on subcategory if editing
      if (lineup?.subcategory) {
        setSelectedSubcategoryId(lineup.subcategory.id);
        setSelectedCategoryId(lineup.subcategory.categoryId);
        // Find type from category
        for (const type of lineupTypesData) {
          if (type.categories.some((c: any) => c.id === lineup.subcategory.categoryId)) {
            setSelectedType(type.id);
            break;
          }
        }
      } else {
        setSelectedType(lineupTypesData[0]?.id || '');
        setSelectedCategoryId('');
        setSelectedSubcategoryId('');
      }

      // Initialize slots (1-6)
      const initialSlots = [];
      for (let i = 1; i <= 6; i++) {
        const existingSlot = lineup?.slots?.find((s: any) => s.slotNumber === i);
        let parsedSlot = existingSlot ? { ...existingSlot } : {
          slotNumber: i,
          shikigamiId: null,
          onmyojiId: null,
          primarySouls: [],
          secondarySouls: [],
        };
        if (!parsedSlot.shikigamiId && !parsedSlot.onmyojiId && parsedSlot.indicator?.toUpperCase().includes('FLEX')) {
          parsedSlot.shikigamiId = 'flex';
        }
        initialSlots.push(parsedSlot);
      }
      setSlots(initialSlots);
      setActiveSlotNumber(null);
      setSearchQuery('');
    }
  }, [isOpen, lineup, lineupTypesData]);

  if (!isOpen) return null;

  const currentTypeObj = lineupTypesData.find(t => t.id === selectedType);
  const currentCategories = currentTypeObj?.categories || [];
  const currentCategoryObj = currentCategories.find((c: any) => c.id === selectedCategoryId);
  const currentSubcategories = currentCategoryObj?.subcategories || [];

  const filteredShikigami = shikigamiData.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRarity = rarityFilter === 'All' || s.rarityId === rarityFilter;
    return matchSearch && matchRarity;
  });

  const handleSelectEntityForSlot = (id: string, type: 'shikigami' | 'onmyoji', targetSlot: number) => {
    // Validate slot assignment
    if (type === 'shikigami' && targetSlot === 6) {
      alert("Slot 6 is reserved for Onmyoji!");
      return;
    }
    if (type === 'onmyoji' && targetSlot !== 6) {
      alert("Onmyoji must be placed in Slot 6!");
      return;
    }

    const newSlots = [...slots];
    const idx = targetSlot - 1;
    if (type === 'shikigami') {
      newSlots[idx].shikigamiId = id;
    } else {
      newSlots[idx].onmyojiId = id;
    }
    setSlots(newSlots);
  };

  const handleSelectEntity = (id: string, type: 'shikigami' | 'onmyoji') => {
    if (!activeSlotNumber) return;
    handleSelectEntityForSlot(id, type, activeSlotNumber);
    setActiveSlotNumber(null); // Optional: clear selection after clicking
  };

  const handleRemoveEntity = (e: React.MouseEvent, slotNumber: number) => {
    e.stopPropagation();
    const newSlots = [...slots];
    const idx = slotNumber - 1;
    newSlots[idx].shikigamiId = null;
    newSlots[idx].onmyojiId = null;
    newSlots[idx].primarySouls = [];
    newSlots[idx].secondarySouls = [];
    newSlots[idx].slot2 = null;
    newSlots[idx].slot4 = null;
    newSlots[idx].slot6 = null;
    newSlots[idx].statReq = null;
    setSlots(newSlots);
  };

  const handleSave = async () => {
    if (!name) return alert("Name is required");
    setIsSaving(true);
    try {
      const strengths = strengthsStr.split(',').map(s => s.trim()).filter(Boolean);
      const weaknesses = weaknessesStr.split(',').map(s => s.trim()).filter(Boolean);
      
      await upsertMetaLineup(isNew ? 'new' : lineup.id, {
        name,
        category: null, // deprecated or handled by relations
        subcategoryId: selectedSubcategoryId || null,
        description,
        notes,
        beginnerFriendly,
        strengths,
        weaknesses,
        status,
        author,
        referenceUrl,
        isNewVersion,
        slots: slots.map(s => {
          if (s.shikigamiId === 'flex') {
            return { ...s, shikigamiId: null, indicator: s.indicator || 'FLEX', buildId: null };
          }
          return {
            slotNumber: s.slotNumber,
            shikigamiId: s.shikigamiId,
            onmyojiId: s.onmyojiId,
            buildId: s.buildId || null,
            slot2: s.slot2,
            slot4: s.slot4,
            slot6: s.slot6,
            statReq: s.statReq,
            primarySouls: s.primarySouls,
            indicator: s.indicator
          };
        }).filter(s => s.shikigamiId || s.onmyojiId || s.indicator?.toUpperCase().includes('FLEX')) // Only save filled slots or flex slots
      });
      
      onSaveSuccess();
      onClose();
    } catch (e: any) {
      alert("Failed to save: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getEntityForSlot = (slot: any) => {
    if (!slot) return null;
    if (slot.shikigamiId === 'flex') return { id: 'flex', name: 'Flex', icon: null, isFlex: true };
    if (slot.shikigamiId) return shikigamiData.find(s => s.id === slot.shikigamiId);
    if (slot.onmyojiId) return onmyojiData.find(o => o.id === slot.onmyojiId);
    return null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-[95vw] h-[95vh] overflow-hidden flex flex-col border border-border-ink shadow-2xl relative animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-ink shrink-0 bg-background/50">
          <h2 className="text-xl font-display text-foreground">
            {isNew ? 'Create Meta Lineup' : `Edit Lineup: ${lineup.name}`}
          </h2>
          
          <div className="flex items-center gap-4">
            {!isNew && (
              <label className="flex items-center gap-2 text-sm font-mono text-accent-gold cursor-pointer border border-accent-gold/50 bg-accent-gold/10 px-3 py-1.5">
                <input 
                  type="checkbox" 
                  checked={isNewVersion}
                  onChange={e => setIsNewVersion(e.target.checked)}
                  className="w-4 h-4 bg-background border border-border-ink accent-accent-gold"
                />
                Update as New Version
              </label>
            )}
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-accent-gold text-background font-bold font-mono text-sm hover:bg-accent-gold/90 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Lineup'}
            </button>
            <button onClick={onClose} className="p-1.5 text-text-secondary hover:text-foreground hover:bg-border-ink/50 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body Split */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Column: Entity Selection (1/3) */}
          <div className="w-1/3 border-r border-border-ink flex flex-col bg-background/30">
            <div className="p-4 border-b border-border-ink space-y-4">
              <div className="flex bg-surface p-1 border border-border-ink rounded-sm">
                <button 
                  onClick={() => setActiveTab('shikigami')} 
                  className={`flex-1 py-1.5 text-xs font-mono \${activeTab === 'shikigami' ? 'bg-accent-vermillion text-white' : 'text-text-secondary'}`}
                >
                  Shikigami
                </button>
                <button 
                  onClick={() => setActiveTab('onmyoji')} 
                  className={`flex-1 py-1.5 text-xs font-mono \${activeTab === 'onmyoji' ? 'bg-accent-vermillion text-white' : 'text-text-secondary'}`}
                >
                  Onmyoji
                </button>
              </div>
              {activeTab === 'shikigami' && (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                    <input
                      type="text"
                      placeholder="Search shikigami..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-surface border border-border-ink text-sm font-mono focus:outline-none focus:border-accent-vermillion transition-colors"
                    />
                  </div>
                  <select 
                    value={rarityFilter} 
                    onChange={e => setRarityFilter(e.target.value)}
                    className="bg-surface border border-border-ink text-sm font-mono focus:outline-none focus:border-accent-vermillion transition-colors px-2"
                  >
                    <option value="All">All Rarity</option>
                    {raritiesData?.map((r: any) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeSlotNumber ? (
                <div className="mb-4 p-3 bg-accent-vermillion/10 border border-accent-vermillion text-accent-vermillion text-xs font-mono animate-pulse">
                  Selecting for Slot {activeSlotNumber}... Tap an icon below.
                </div>
              ) : (
                <div className="mb-4 p-3 bg-surface border border-border-ink text-text-secondary text-xs font-mono">
                  Tap an empty slot on the right, then select a character from here.
                </div>
              )}

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {activeTab === 'shikigami' ? (
                  filteredShikigami.map(s => (
                    <button
                      key={s.id}
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('entityId', s.id);
                        e.dataTransfer.setData('entityType', 'shikigami');
                      }}
                      onClick={() => handleSelectEntity(s.id, 'shikigami')}
                      disabled={!activeSlotNumber && activeTab !== 'shikigami'}
                      className={`relative aspect-square border cursor-grab active:cursor-grabbing \${activeSlotNumber && activeSlotNumber !== 6 ? 'hover:border-accent-vermillion' : 'border-border-ink hover:border-text-secondary'}`}
                    >
                      {s.icon ? (
                        <img src={s.icon} alt={s.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-text-secondary bg-surface">{s.name.substring(0, 3)}</div>
                      )}
                      <div className="absolute -top-1 -left-1 text-[8px] font-mono text-accent-gold bg-surface border border-accent-gold px-1">{s.rarityId}</div>
                    </button>
                  ))
                ) : (
                  onmyojiData.map(o => (
                    <button
                      key={o.id}
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('entityId', o.id);
                        e.dataTransfer.setData('entityType', 'onmyoji');
                      }}
                      onClick={() => handleSelectEntity(o.id, 'onmyoji')}
                      disabled={!activeSlotNumber && activeTab !== 'onmyoji'}
                      className={`relative aspect-square border cursor-grab active:cursor-grabbing \${activeSlotNumber === 6 ? 'hover:border-accent-vermillion' : 'border-border-ink hover:border-text-secondary'}`}
                    >
                      <img src={o.icon} alt={o.name} className="w-full h-full object-cover" />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Lineup Info & Slots (2/3) */}
          <div className="w-2/3 flex flex-col bg-surface overflow-y-auto p-6 space-y-8">
            
            {/* Slots Area */}
            <div>
              <div className="flex justify-between items-end mb-4">
                <h3 className="font-display text-lg text-accent-gold">Lineup Placement</h3>
                <button 
                  onClick={() => {
                    if (window.confirm("Are you sure you want to fill unoccupied slots (1-5) with Flex?")) {
                      const newSlots = [...slots];
                      for (let i = 0; i < 5; i++) {
                        if (!newSlots[i].shikigamiId) {
                          newSlots[i].shikigamiId = 'flex';
                        }
                      }
                      setSlots(newSlots);
                    }
                  }}
                  className="text-[10px] font-mono px-2 py-1 bg-surface border border-border-ink hover:text-accent-vermillion hover:border-accent-vermillion transition-colors"
                >
                  Fill unoccupied slot to flex
                </button>
              </div>
              <div className="flex gap-4 items-center">
                
                <div className="flex gap-4 bg-background p-4 border border-border-ink flex-1 justify-center">
                  {slots.slice(0, 5).map((slot, idx) => {
                    const entity = getEntityForSlot(slot);
                    const isActive = activeSlotNumber === slot.slotNumber;
                    
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-mono text-text-secondary">Slot {idx + 1}</span>
                        <div 
                          onClick={() => setActiveSlotNumber(isActive ? null : slot.slotNumber)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const id = e.dataTransfer.getData('entityId');
                            const type = e.dataTransfer.getData('entityType') as 'shikigami' | 'onmyoji';
                            if (id && type) {
                              handleSelectEntityForSlot(id, type, slot.slotNumber);
                            }
                          }}
                          className={`w-20 h-20 border-2 cursor-pointer transition-all relative group \${
                            isActive 
                              ? 'border-accent-vermillion shadow-[0_0_15px_rgba(255,87,34,0.3)]' 
                              : entity ? 'border-accent-gold' : 'border-border-ink border-dashed hover:border-text-secondary'
                          }`}
                        >
                          {entity ? (
                            <>
                              {entity.isFlex ? (
                                <div className="w-full h-full flex items-center justify-center bg-surface border border-dashed border-text-secondary text-text-secondary">
                                  <span className="text-[10px] font-mono font-bold">FLEX</span>
                                </div>
                              ) : entity.icon ? (
                                <img src={entity.icon} alt={entity.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-text-secondary bg-surface">{entity.name.substring(0, 3)}</div>
                              )}
                              <button 
                                onClick={(e) => handleRemoveEntity(e, slot.slotNumber)}
                                className="absolute -top-2 -right-2 bg-background border border-border-ink rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfigSlotData(slot);
                                }}
                                className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] font-mono py-0.5 flex justify-center items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Edit className="w-2 h-2" /> Config
                              </button>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-border-ink text-2xl font-light">
                              +
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2 items-center">
                  <span className="text-text-secondary font-mono text-sm">+</span>
                </div>

                <div className="flex flex-col items-center gap-2 bg-background p-4 border border-border-ink">
                  <span className="text-[10px] font-mono text-blue-500">ONMYOJI</span>
                  {(() => {
                    const slot = slots[5];
                    const entity = getEntityForSlot(slot);
                    const isActive = activeSlotNumber === 6;
                    return (
                      <div 
                        onClick={() => setActiveSlotNumber(isActive ? null : 6)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const id = e.dataTransfer.getData('entityId');
                          const type = e.dataTransfer.getData('entityType') as 'shikigami' | 'onmyoji';
                          if (id && type) {
                            handleSelectEntityForSlot(id, type, 6);
                          }
                        }}
                        className={`w-20 h-20 border-2 cursor-pointer transition-all relative group \${
                          isActive 
                            ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                            : entity ? 'border-blue-500' : 'border-border-ink border-dashed hover:border-text-secondary'
                        }`}
                      >
                        {entity ? (
                          <>
                            <img src={entity.icon} alt={entity.name} className="w-full h-full object-cover" />
                            <button 
                              onClick={(e) => handleRemoveEntity(e, 6)}
                              className="absolute -top-2 -right-2 bg-background border border-border-ink rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfigSlotData(slot);
                                }}
                                className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] font-mono py-0.5 flex justify-center items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Edit className="w-2 h-2" /> Config
                              </button>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-border-ink text-2xl font-light">
                            +
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

              </div>
            </div>

            {/* Lineup Metadata Form */}
            <div className="space-y-6 flex-1">
              <h3 className="font-display text-lg border-b border-border-ink pb-2">Lineup Details</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2">
                  <label className="text-xs font-mono text-text-secondary">Lineup Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-background border border-border-ink p-2 font-display text-lg focus:border-accent-vermillion outline-none" placeholder="e.g. Asura Fast Farm S11" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-text-secondary">Game Mode (Type)</label>
                  <select 
                    value={selectedType} 
                    onChange={e => {
                      setSelectedType(e.target.value);
                      setSelectedCategoryId('');
                      setSelectedSubcategoryId('');
                    }} 
                    className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none"
                  >
                    {lineupTypesData.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-text-secondary">Category</label>
                  <select 
                    value={selectedCategoryId} 
                    onChange={e => {
                      setSelectedCategoryId(e.target.value);
                      setSelectedSubcategoryId('');
                    }} 
                    className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none"
                  >
                    <option value="">-- Select Category --</option>
                    {currentCategories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-text-secondary">Subcategory (Target)</label>
                  <select 
                    value={selectedSubcategoryId} 
                    onChange={e => setSelectedSubcategoryId(e.target.value)} 
                    className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none"
                    disabled={!selectedCategoryId}
                  >
                    <option value="">-- Select Subcategory --</option>
                    {currentSubcategories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2 flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={beginnerFriendly} onChange={e => setBeginnerFriendly(e.target.checked)} className="accent-accent-vermillion" />
                    <span className="font-mono text-sm text-green-500">Is Beginner Friendly?</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-text-secondary">Lineup Status</label>
                  <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value)} 
                    className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none"
                  >
                    <option value="CURRENT">CURRENT</option>
                    <option value="OUTDATED">OUTDATED</option>
                    <option value="HISTORICAL">HISTORICAL</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-text-secondary">Author</label>
                  <input value={author} onChange={e => setAuthor(e.target.value)} className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" placeholder="e.g. System, NGA" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-text-secondary">Reference URL (Optional)</label>
                  <input value={referenceUrl} onChange={e => setReferenceUrl(e.target.value)} className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" placeholder="e.g. Bilibili Link" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-text-secondary">Strengths (Comma separated)</label>
                  <input value={strengthsStr} onChange={e => setStrengthsStr(e.target.value)} className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" placeholder="Fast, Stable" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-text-secondary">Weaknesses (Comma separated)</label>
                  <input value={weaknessesStr} onChange={e => setWeaknessesStr(e.target.value)} className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" placeholder="High Soul Req" />
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-xs font-mono text-text-secondary">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-background border border-border-ink p-2 font-mono text-sm h-20 focus:border-accent-vermillion outline-none" placeholder="General description of how the lineup works..." />
                </div>
                
                <div className="space-y-2 col-span-2">
                  <label className="text-xs font-mono text-text-secondary">Speed Tuning / Move Order Notes</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-background border border-border-ink p-2 font-mono text-sm h-16 focus:border-accent-vermillion outline-none" placeholder="1. Yamausagi > 2. Ushi no Toki > ..." />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slot Config Sub-Modal */}
        {configSlotData && (
          <div className="absolute inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-8">
            <div className="bg-surface w-full max-w-2xl border border-border-ink shadow-2xl flex flex-col">
              <div className="p-4 border-b border-border-ink flex justify-between items-center bg-background/50">
                <h3 className="font-display text-lg text-accent-gold">
                  Configure Slot {configSlotData.slotNumber}
                </h3>
                <button onClick={() => setConfigSlotData(null)} className="text-text-secondary hover:text-foreground"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="p-4 border-t border-border-ink/50 bg-background/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                {configSlotData.shikigamiId && (
                  <div className="col-span-1 md:col-span-2 space-y-2 mb-2 p-3 bg-surface border border-accent-gold/30">
                    <label className="text-xs font-mono text-accent-gold">Import Community Build (Auto-fill)</label>
                    <select 
                      value={configSlotData.buildId || ''}
                      onChange={e => {
                        const buildId = e.target.value;
                        if (!buildId) {
                           setConfigSlotData({...configSlotData, buildId: null});
                           return;
                        }
                        const shiki = shikigamiData.find(s => s.id === configSlotData.shikigamiId);
                        const build = shiki?.builds?.find((b: any) => b.id === buildId);
                        if (build) {
                           const stats = build.slotStats ? build.slotStats.split('/') : [];
                           const indicatorStr = build.tags?.length > 0 ? build.tags[0] : (build.roleRef?.name || build.roleId);
                           
                           setConfigSlotData({
                             ...configSlotData,
                             buildId: build.id,
                             indicator: indicatorStr,
                             primarySouls: build.soulChoices?.slice(0,2) || [],
                             statReq: build.breakpoint || '',
                             slot2: stats[0] || 'Any',
                             slot4: stats[1] || 'Any',
                             slot6: stats[2] || 'Any',
                           });
                        }
                      }}
                      className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none"
                    >
                      <option value="">-- Manual Configuration --</option>
                      {shikigamiData.find(s => s.id === configSlotData.shikigamiId)?.builds?.map((b: any) => (
                         <option key={b.id} value={b.id}>
                           [{b.tags?.join(', ') || b.roleRef?.name || b.roleId}] {b.soulChoices?.join(', ')} - {b.breakpoint}
                         </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              <div className="p-6 grid grid-cols-2 gap-6 overflow-y-auto max-h-[70vh]">
                <div className="space-y-2 col-span-2">
                  <label className="text-xs font-mono text-text-secondary">Stat Requirement (e.g. "+120 SPD, 100% Crit")</label>
                  <input 
                    value={configSlotData.statReq || ''} 
                    onChange={e => setConfigSlotData({...configSlotData, statReq: e.target.value})}
                    className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" 
                  />
                </div>
                
                <div className="col-span-2 grid grid-cols-5 gap-2">
                  <div>
                    <label className="text-[10px] font-mono text-text-secondary">Min SPD</label>
                    <input type="number" value={configSlotData.minSpeed || ''} onChange={e => setConfigSlotData({...configSlotData, minSpeed: e.target.value ? parseInt(e.target.value) : null})} className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-text-secondary">Min HIT (%)</label>
                    <input type="number" value={configSlotData.minEffectHit || ''} onChange={e => setConfigSlotData({...configSlotData, minEffectHit: e.target.value ? parseFloat(e.target.value) : null})} className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-text-secondary">Min RES (%)</label>
                    <input type="number" value={configSlotData.minEffectRes || ''} onChange={e => setConfigSlotData({...configSlotData, minEffectRes: e.target.value ? parseFloat(e.target.value) : null})} className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-text-secondary">Min CRIT (%)</label>
                    <input type="number" value={configSlotData.minCrit || ''} onChange={e => setConfigSlotData({...configSlotData, minCrit: e.target.value ? parseFloat(e.target.value) : null})} className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-text-secondary">Min CDMG (%)</label>
                    <input type="number" value={configSlotData.minCritDmg || ''} onChange={e => setConfigSlotData({...configSlotData, minCritDmg: e.target.value ? parseFloat(e.target.value) : null})} className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-text-secondary">Role Indicator (e.g. "ST DPS", "FLEX")</label>
                  <input 
                    list="rolesList"
                    value={configSlotData.indicator || ''} 
                    onChange={e => setConfigSlotData({...configSlotData, indicator: e.target.value})}
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
                  <label className="text-xs font-mono text-text-secondary">Skill Requirement (e.g. "x-4-5")</label>
                  <input 
                    value={configSlotData.skillReq || ''} 
                    onChange={e => setConfigSlotData({...configSlotData, skillReq: e.target.value})}
                    className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-text-secondary">Slot 2 Main Stat</label>
                  <select 
                    value={configSlotData.slot2 || ''} 
                    onChange={e => setConfigSlotData({...configSlotData, slot2: e.target.value})}
                    className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" 
                  >
                    <option value="">Any</option>
                    <option value="SPD">SPD</option>
                    <option value="ATK">ATK Bonus</option>
                    <option value="HP">HP Bonus</option>
                    <option value="DEF">DEF Bonus</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-text-secondary">Slot 4 Main Stat</label>
                  <select 
                    value={configSlotData.slot4 || ''} 
                    onChange={e => setConfigSlotData({...configSlotData, slot4: e.target.value})}
                    className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" 
                  >
                    <option value="">Any</option>
                    <option value="ATK">ATK Bonus</option>
                    <option value="HP">HP Bonus</option>
                    <option value="DEF">DEF Bonus</option>
                    <option value="Effect HIT">Effect HIT</option>
                    <option value="Effect RES">Effect RES</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-text-secondary">Slot 6 Main Stat</label>
                  <select 
                    value={configSlotData.slot6 || ''} 
                    onChange={e => setConfigSlotData({...configSlotData, slot6: e.target.value})}
                    className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" 
                  >
                    <option value="">Any</option>
                    <option value="CRIT">CRIT</option>
                    <option value="CRIT DMG">CRIT DMG</option>
                    <option value="ATK">ATK Bonus</option>
                    <option value="HP">HP Bonus</option>
                    <option value="DEF">DEF Bonus</option>
                  </select>
                </div>
                
                <div className="space-y-2 col-span-2 pt-4 border-t border-border-ink">
                  <label className="text-xs font-mono text-text-secondary block flex justify-between items-end">
                    <span>Primary Soul Sets (Select up to 2)</span>
                    <span className="text-[10px] text-accent-vermillion">{configSlotData.primarySouls?.length || 0}/2</span>
                  </label>
                  
                  {configSlotData.primarySouls?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2 p-2 bg-background border border-border-ink border-dashed">
                      <span className="text-[10px] font-mono text-text-secondary mr-2 self-center">Selected:</span>
                      {configSlotData.primarySouls.map((id: string) => {
                        const s = soulsData.find(x => x.id === id);
                        if (!s) return null;
                        return (
                          <div key={id} className="flex items-center gap-1 bg-surface border border-accent-vermillion/50 px-2 py-1 rounded-sm">
                            <img src={s.icon || ''} alt={s.name} className="w-4 h-4 rounded-full" />
                            <span className="text-xs font-mono text-accent-vermillion">{s.name}</span>
                            <button 
                              onClick={() => setConfigSlotData({...configSlotData, primarySouls: configSlotData.primarySouls.filter((sid: string) => sid !== id)})}
                              className="ml-1 text-text-secondary hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="relative mb-2">
                    <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-text-secondary" />
                    <input
                      type="text"
                      placeholder="Search souls..."
                      value={soulSearchQuery}
                      onChange={e => setSoulSearchQuery(e.target.value)}
                      className="w-full pl-7 pr-2 py-1.5 bg-surface border border-border-ink text-xs font-mono focus:outline-none focus:border-accent-vermillion transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto bg-background p-2 border border-border-ink">
                    {soulsData.filter((s: any) => s.name.toLowerCase().includes(soulSearchQuery.toLowerCase())).map(soul => {
                      const isSelected = configSlotData.primarySouls?.includes(soul.id);
                      return (
                        <button
                          key={soul.id}
                          onClick={() => {
                            let newSouls = [...(configSlotData.primarySouls || [])];
                            if (isSelected) {
                              newSouls = newSouls.filter(id => id !== soul.id);
                            } else {
                              if (newSouls.length >= 2) {
                                alert("You can only select up to 2 primary soul sets.");
                                return;
                              }
                              newSouls.push(soul.id);
                            }
                            setConfigSlotData({...configSlotData, primarySouls: newSouls});
                          }}
                          className={`flex flex-col items-center gap-1 p-1 border transition-colors \${isSelected ? 'border-accent-vermillion bg-accent-vermillion/10' : 'border-transparent hover:bg-surface'}`}
                          title={soul.name}
                        >
                          <img src={soul.icon || ''} alt={soul.name} className="w-8 h-8 rounded-full" />
                          <span className="text-[9px] font-mono truncate w-full text-center">{soul.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
              <div className="p-4 border-t border-border-ink bg-background/50 flex justify-end">
                <button 
                  onClick={() => {
                    const newSlots = [...slots];
                    const idx = configSlotData.slotNumber - 1;
                    newSlots[idx] = configSlotData;
                    setSlots(newSlots);
                    setConfigSlotData(null);
                  }}
                  className="px-6 py-2 bg-accent-vermillion text-white font-mono text-sm font-bold hover:bg-red-600 transition-colors"
                >
                  Confirm Config
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
