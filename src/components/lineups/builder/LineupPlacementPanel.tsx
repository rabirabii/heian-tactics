import { useLineupBuilderStore } from '@/store/lineup-builder-store';

export default function LineupPlacementPanel({
  shikigamiData,
  onmyojiData,
  showBanUI
}: {
  shikigamiData: any[];
  onmyojiData: any[];
  showBanUI: boolean;
}) {
  const {
    slots,
    activeSlotNumber,
    setActiveSlotNumber,
    setConfigSlotData,
    fillUnoccupiedToFlex,
    updateSlot,
    addSlot,
    removeSlot,
    banId,
    setMetadata
  } = useLineupBuilderStore();

  const getEntityForSlot = (slot: any) => {
    if (!slot) return null;
    if (slot.shikigamiId === 'flex') return { id: 'flex', name: 'Flex', icon: null, isFlex: true };
    if (slot.shikigamiId) return shikigamiData.find(s => s.id === slot.shikigamiId);
    if (slot.onmyojiId) return onmyojiData.find(o => o.id === slot.onmyojiId);
    return null;
  };

  const renderSlot = (item: { slot: any, idx: number }, type: 'CORE' | 'ONMYOJI' | 'FLEX') => {
    const { slot, idx } = item;
    const entity = getEntityForSlot(slot);
    const isFlex = entity?.isFlex;
    const isCore = type === 'CORE';
    const isOnmyoji = type === 'ONMYOJI';
    const isActive = activeSlotNumber === slot.slotNumber;
    
    let activeBorder = 'border-accent-vermillion shadow-[0_0_15px_rgba(255,87,34,0.3)]';
    if (isOnmyoji) activeBorder = 'border-accent-gold shadow-[0_0_15px_rgba(234,179,8,0.3)]';
    if (!isCore && !isOnmyoji) activeBorder = 'border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.3)]';

    return (
      <div key={idx} className="flex flex-col items-center gap-2 relative group">
        <button
          onClick={() => {
            setActiveSlotNumber(slot.slotNumber);
            if (entity) setConfigSlotData(slot, { type: 'slot', index: idx });
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
          }}
          onDrop={(e) => {
            e.preventDefault();
            const data = e.dataTransfer.getData('text/plain');
            if (isOnmyoji && data.startsWith('onmyoji:')) {
              const onmyojiId = data.split(':')[1];
              updateSlot(idx, { onmyojiId, shikigamiId: null });
              setActiveSlotNumber(slot.slotNumber);
            } else if (!isOnmyoji && data.startsWith('shiki:')) {
              const shikiId = data.split(':')[1];
              updateSlot(idx, { shikigamiId: shikiId, onmyojiId: null });
              setActiveSlotNumber(slot.slotNumber);
            }
          }}
          className={`w-16 h-16 border-2 flex items-center justify-center transition-all ${isOnmyoji ? 'rounded-full overflow-hidden' : ''} ${isActive ? `${activeBorder} scale-110` : 'border-border-ink hover:border-text-secondary'}`}
        >
          {isFlex ? (
            <div className="w-full h-full flex items-center justify-center text-text-secondary font-display bg-surface border-2 border-dashed border-border-ink">F</div>
          ) : entity ? (
            <img src={entity.icon} alt={entity.name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-display text-text-secondary opacity-50">{isOnmyoji ? 'ONM' : slot.slotNumber}</span>
          )}
        </button>
        <div className="flex gap-1 min-h-[16px] opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5">
          {entity && (
            <button onClick={() => {
              setActiveSlotNumber(slot.slotNumber);
              setConfigSlotData(slot, { type: 'slot', index: idx });
            }} className="text-xs text-blue-400 hover:text-blue-300">⚙️</button>
          )}
          {entity && (
            <button onClick={() => {
              updateSlot(idx, { shikigamiId: null, onmyojiId: null, buildId: null, primarySouls: [] });
              if (useLineupBuilderStore.getState().configSlotData?.slotNumber === slot.slotNumber) {
                setConfigSlotData(null);
              }
            }} className="text-xs text-red-500 hover:text-red-400">✕</button>
          )}
        </div>
      </div>
    );
  };

  const coreSlots = slots.map((s, idx) => ({ slot: s, idx })).filter(item => item.slot.slotType === 'CORE');
  const onmyojiSlots = slots.map((s, idx) => ({ slot: s, idx })).filter(item => item.slot.slotType === 'ONMYOJI');
  const flexSlots = slots.map((s, idx) => ({ slot: s, idx })).filter(item => item.slot.slotType === 'FLEX');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-2">
        <h3 className="font-display text-lg text-accent-gold">Lineup Placement</h3>
        <button 
          onClick={() => {
            if (window.confirm("Are you sure you want to fill unoccupied core slots with Flex?")) {
              fillUnoccupiedToFlex();
            }
          }}
          className="text-[10px] font-mono px-2 py-1 bg-surface border border-border-ink hover:text-accent-vermillion hover:border-accent-vermillion transition-colors"
        >
          Fill unoccupied to flex
        </button>
      </div>
      
      {/* Core + Onmyoji Row */}
      <div className="flex gap-4 items-start">
        <div className="bg-background p-4 border border-border-ink flex-1 relative">
          <div className="absolute -top-3 left-3 bg-surface px-2 text-xs font-mono text-text-secondary border border-border-ink">Core Picks</div>
          <div className="flex flex-wrap gap-4 items-center justify-center mt-2">
            {coreSlots.map(item => renderSlot(item, 'CORE'))}
            <button onClick={() => addSlot('CORE')} className="w-16 h-16 border-2 border-dashed border-border-ink flex items-center justify-center text-text-secondary hover:border-accent-vermillion hover:text-accent-vermillion transition-colors">
              +
            </button>
          </div>
        </div>
        
        <div className="bg-background p-4 border border-border-ink shrink-0 relative flex justify-center items-center">
          <div className="absolute -top-3 left-3 bg-surface px-2 text-xs font-mono text-text-secondary border border-border-ink">Onmyoji</div>
          <div className="flex gap-4 mt-2">
            {onmyojiSlots.map(item => renderSlot(item, 'ONMYOJI'))}
            <button onClick={() => addSlot('ONMYOJI')} className="w-16 h-16 rounded-full border-2 border-dashed border-border-ink flex items-center justify-center text-text-secondary hover:border-accent-gold hover:text-accent-gold transition-colors">
              +
            </button>
          </div>
        </div>
      </div>

      {/* Flex Rows */}
      <div className="bg-background p-4 border border-border-ink relative">
        <div className="absolute -top-3 left-3 bg-surface px-2 text-xs font-mono text-text-secondary border border-border-ink">Flex / Situational Picks</div>
        <div className="flex flex-wrap gap-4 items-center mt-2">
          {flexSlots.map(item => renderSlot(item, 'FLEX'))}
          <button onClick={() => addSlot('FLEX')} className="w-16 h-16 border-2 border-dashed border-border-ink flex items-center justify-center text-text-secondary hover:border-blue-400 hover:text-blue-400 transition-colors">
            +
          </button>
        </div>
        {flexSlots.length === 0 && (
          <p className="text-center text-sm font-mono text-text-secondary w-full opacity-50">Add flex slots for draft variations.</p>
        )}
      </div>

      {showBanUI && (
        <div className="mt-4 pt-4 border-t border-border-ink">
          <label className="block font-mono text-sm text-text-secondary mb-2">Pre-Ban (Optional)</label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (banId) setMetadata({ banId: null });
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
              }}
              onDrop={(e) => {
                e.preventDefault();
                const data = e.dataTransfer.getData('text/plain');
                if (data.startsWith('shiki:')) {
                  const shikiId = data.split(':')[1];
                  setMetadata({ banId: shikiId });
                }
              }}
              className={`w-12 h-12 border-2 flex items-center justify-center rounded-sm overflow-hidden transition-all ${banId ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-border-ink border-dashed hover:border-text-secondary'}`}
            >
              {banId && shikigamiData.find(s => s.id === banId) ? (
                <img src={shikigamiData.find(s => s.id === banId)?.icon} alt="Ban" className="w-full h-full object-cover grayscale" />
              ) : (
                <span className="font-display text-text-secondary text-xs opacity-50">BAN</span>
              )}
            </button>
            <p className="text-xs font-mono text-text-secondary">Drag a Shikigami here to mark as Pre-Ban for this lineup.</p>
          </div>
        </div>
      )}
    </div>
  );
}
