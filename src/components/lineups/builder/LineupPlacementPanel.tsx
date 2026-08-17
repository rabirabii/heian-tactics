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

  return (
    <div>
      <div className="flex justify-between items-end mb-4">
        <h3 className="font-display text-lg text-accent-gold">Lineup Placement</h3>
        <button 
          onClick={() => {
            if (window.confirm("Are you sure you want to fill unoccupied slots (1-5) with Flex?")) {
              fillUnoccupiedToFlex();
            }
          }}
          className="text-[10px] font-mono px-2 py-1 bg-surface border border-border-ink hover:text-accent-vermillion hover:border-accent-vermillion transition-colors"
        >
          Fill unoccupied to flex
        </button>
      </div>
      
      <div className="flex gap-4 items-center">
        <div className="flex gap-4 bg-background p-4 border border-border-ink flex-1 justify-center">
          {slots.slice(0, 5).map((slot, idx) => {
            const entity = getEntityForSlot(slot);
            const isFlex = entity?.isFlex;
            return (
              <div key={idx} className="flex flex-col items-center gap-2">
                <button
                  onClick={() => {
                    setActiveSlotNumber(idx + 1);
                    if (entity) setConfigSlotData(slot, { type: 'slot', index: idx });
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
                      const updatedSlot = {
                        ...slots[idx],
                        shikigamiId: shikiId,
                        onmyojiId: null,
                        slotType: 'CORE'
                      };
                      updateSlot(idx, updatedSlot);
                      setActiveSlotNumber(idx + 1);
                    }
                  }}
                  className={`w-16 h-16 border-2 flex items-center justify-center transition-all ${activeSlotNumber === idx + 1 ? 'border-accent-vermillion scale-110 shadow-[0_0_15px_rgba(255,87,34,0.3)]' : 'border-border-ink hover:border-text-secondary'}`}
                >
                  {isFlex ? (
                    <div className="w-full h-full flex items-center justify-center text-text-secondary font-display bg-surface border-2 border-dashed border-border-ink">F</div>
                  ) : entity ? (
                    <img src={entity.icon} alt={entity.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-display text-text-secondary opacity-50">{idx + 1}</span>
                  )}
                </button>
                <div className="flex gap-1 min-h-[16px]">
                  {entity && (
                    <button onClick={() => {
                      setActiveSlotNumber(idx + 1);
                      setConfigSlotData(slot, { type: 'slot', index: idx });
                    }} className="text-xs text-blue-400 hover:text-blue-300">⚙️</button>
                  )}
                  {entity && (
                    <button onClick={() => {
                      updateSlot(idx, { shikigamiId: null, buildId: null, primarySouls: [] });
                      if (useLineupBuilderStore.getState().configSlotData?.slotNumber === idx + 1) {
                        setConfigSlotData(null);
                      }
                    }} className="text-xs text-red-500 hover:text-red-400">✕</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex gap-4 items-center justify-center">
          <div className="flex flex-col items-center gap-2 bg-background p-4 border border-border-ink">
            {(() => {
              const slot6 = slots[5];
              const entity = getEntityForSlot(slot6);
              return (
                <>
                  <button
                    onClick={() => {
                      setActiveSlotNumber(6);
                      if (entity) setConfigSlotData(slot6, { type: 'slot', index: 5 });
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'copy';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const data = e.dataTransfer.getData('text/plain');
                      if (data.startsWith('onmyoji:')) {
                        const onmyojiId = data.split(':')[1];
                        const updatedSlot = {
                          ...slots[5],
                          onmyojiId: onmyojiId,
                          shikigamiId: null
                        };
                        updateSlot(5, updatedSlot);
                        setActiveSlotNumber(6);
                      }
                    }}
                    className={`w-16 h-16 border-2 flex items-center justify-center rounded-full overflow-hidden transition-all ${activeSlotNumber === 6 ? 'border-accent-gold scale-110 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'border-border-ink hover:border-text-secondary'}`}
                  >
                    {entity ? (
                      <img src={entity.icon} alt={entity.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-display text-text-secondary opacity-50">ONM</span>
                    )}
                  </button>
                  <div className="flex gap-1 min-h-[16px]">
                    {entity && (
                      <button onClick={() => {
                        setActiveSlotNumber(6);
                        setConfigSlotData(slot6, { type: 'slot', index: 5 });
                      }} className="text-xs text-blue-400 hover:text-blue-300">⚙️</button>
                    )}
                    {entity && (
                      <button onClick={() => {
                        updateSlot(5, { onmyojiId: null, onmyojiSkills: [] });
                        if (useLineupBuilderStore.getState().configSlotData?.slotNumber === 6) {
                          setConfigSlotData(null);
                        }
                      }} className="text-xs text-red-500 hover:text-red-400">✕</button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>

          {showBanUI && (
            <div className="flex flex-col items-center gap-2 bg-background p-4 border border-accent-vermillion/30">
              <div className="text-[10px] font-mono text-accent-vermillion font-bold mb-1">BAN SLOT</div>
              <button
                onClick={() => setActiveSlotNumber(7)}
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
                    setActiveSlotNumber(7);
                  }
                }}
                className={`w-16 h-16 border-2 flex items-center justify-center transition-all ${activeSlotNumber === 7 ? 'border-accent-vermillion scale-110 shadow-[0_0_15px_rgba(255,87,34,0.3)]' : 'border-border-ink border-dashed hover:border-text-secondary'}`}
              >
                {banId ? (
                  <img src={shikigamiData.find(s => s.id === banId)?.icon} alt="Ban" className="w-full h-full object-cover grayscale brightness-50 sepia-[.5] hue-rotate-[-50deg] saturate-200" />
                ) : (
                  <span className="font-display text-text-secondary opacity-50">BAN</span>
                )}
              </button>
              <div className="flex gap-1 min-h-[16px]">
                {banId && (
                  <button onClick={() => setMetadata({ banId: null })} className="text-xs text-red-500 hover:text-red-400">✕</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
