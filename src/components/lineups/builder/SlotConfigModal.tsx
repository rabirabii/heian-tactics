import { useState } from 'react';
import { Search, X, Settings2 } from 'lucide-react';
import { useLineupBuilderStore } from '@/store/lineup-builder-store';
import ShikigamiSelectorModal from '@/components/ui/ShikigamiSelectorModal';
import SlotConfigForm from './SlotConfigForm';

export default function SlotConfigModal({
  shikigamiData,
  onmyojiData,
  soulsData,
  rolesData
}: {
  shikigamiData: any[];
  onmyojiData: any[];
  soulsData: any[];
  rolesData: any[];
}) {
  const {
    configTarget,
    configSlotData,
    setConfigSlotData,
    applyConfigSlot,
    showSubsPanel,
    setShowSubsPanel,
    soulSearchQuery,
    setSoulSearchQuery,
  } = useLineupBuilderStore();

  const [isSubSelectorOpen, setIsSubSelectorOpen] = useState(false);
  const [activeSubIndex, setActiveSubIndex] = useState<number | null>(null);

  if (!configSlotData) return null;

  const isScenario = configTarget?.type === 'scenario';

  return (
    <div className="absolute inset-0 z-[110] bg-background/90 backdrop-blur-md flex items-center justify-center p-8">
      <div className={`bg-surface border border-border-ink shadow-2xl flex transition-all duration-300 ${showSubsPanel ? (activeSubIndex !== null ? 'max-w-7xl' : 'max-w-5xl') : 'max-w-3xl'} w-full`}>
        {/* Main Config Panel */}
        <div className="flex-1 min-w-0 flex flex-col max-h-[85vh]">
          <div className="p-4 border-b border-border-ink flex justify-between items-center bg-background/50 shrink-0">
            <h3 className="font-display text-lg text-accent-gold flex items-center gap-2">
              {isScenario ? 'Configure Scenario Pick' : `Configure Slot ${configSlotData.slotNumber}`}
              {configSlotData.shikigamiId && configSlotData.shikigamiId !== 'flex' && (
                <img src={shikigamiData.find(s=>s.id === configSlotData.shikigamiId)?.icon} className="w-6 h-6 object-cover" />
              )}
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={applyConfigSlot} 
                className="px-4 py-1 bg-accent-vermillion text-white text-xs font-mono font-bold hover:bg-red-600"
              >
                {isScenario ? 'Apply Pick' : 'Apply Slot'}
              </button>
              <button 
                onClick={() => setConfigSlotData(null)}
                className="text-text-secondary hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <SlotConfigForm 
            data={configSlotData} 
            onChange={setConfigSlotData} 
            shikigamiData={shikigamiData}
            onmyojiData={onmyojiData}
            soulsData={soulsData}
            rolesData={rolesData}
            soulSearchQuery={soulSearchQuery}
            setSoulSearchQuery={setSoulSearchQuery}
          />
        </div>

        {/* Substitutes Sidebar */}
        {configSlotData.shikigamiId && configSlotData.shikigamiId !== 'flex' && !isScenario && (
          <div className={`transition-all duration-300 border-l border-border-ink flex flex-col ${showSubsPanel ? (activeSubIndex !== null ? 'w-[600px]' : 'w-96') : 'w-12 bg-background/50 items-center justify-center'}`}>
            {showSubsPanel ? (
              <div className="flex flex-col h-full max-h-[85vh]">
                <div className="p-4 border-b border-border-ink flex justify-between items-center bg-background/50">
                  <h3 className="font-display text-sm text-foreground flex items-center gap-2">
                    {activeSubIndex !== null ? (
                      <>
                        <button onClick={() => setActiveSubIndex(null)} className="text-text-secondary hover:text-accent-gold mr-2 text-xs">← Back</button>
                        <span className="text-accent-gold">Substitute Config</span>
                      </>
                    ) : 'Substitutes'}
                  </h3>
                  <button onClick={() => setShowSubsPanel(false)} className="text-text-secondary hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {activeSubIndex !== null ? (
                  <SlotConfigForm 
                    data={configSlotData.substitutes[activeSubIndex]} 
                    onChange={(newData) => {
                      const newSubs = [...configSlotData.substitutes];
                      newSubs[activeSubIndex] = newData;
                      setConfigSlotData({...configSlotData, substitutes: newSubs});
                    }} 
                    shikigamiData={shikigamiData}
                    onmyojiData={onmyojiData}
                    soulsData={soulsData}
                    rolesData={rolesData}
                    soulSearchQuery={soulSearchQuery}
                    setSoulSearchQuery={setSoulSearchQuery}
                  />
                ) : (
                  <div className="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                    {configSlotData.substitutes?.map((sub: any, sIdx: number) => {
                      const shiki = shikigamiData.find(s => s.id === sub.shikigamiId);
                      return (
                        <div key={sIdx} className="border border-border-ink p-3 space-y-2 bg-background relative group">
                          <button onClick={() => {
                            const newSubs = [...(configSlotData.substitutes || [])];
                            newSubs.splice(sIdx, 1);
                            setConfigSlotData({...configSlotData, substitutes: newSubs});
                          }} className="absolute top-2 right-2 text-text-secondary hover:text-red-500">
                            <X className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-3">
                            {shiki?.icon && <img src={shiki.icon} alt="" className="w-10 h-10 object-cover border border-border-ink" />}
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-display block truncate">{shiki?.name}</span>
                              {sub.primarySouls?.length > 0 && (
                                <span className="text-[10px] font-mono text-accent-vermillion truncate block">
                                  Souls: {sub.primarySouls.map((id:string) => soulsData.find(x=>x.id===id)?.name).filter(Boolean).join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => setActiveSubIndex(sIdx)}
                            className="w-full mt-2 py-1.5 flex items-center justify-center gap-2 bg-surface border border-border-ink text-xs font-mono text-text-secondary hover:text-accent-gold hover:border-accent-gold transition-colors"
                          >
                            <Settings2 className="w-3 h-3" /> Configure Substitute
                          </button>
                        </div>
                      );
                    })}
                    
                    <div className="space-y-2 mt-4 pt-4 border-t border-border-ink">
                      <label className="text-[10px] font-mono text-text-secondary block">Add Substitute</label>
                      <button 
                        onClick={() => setIsSubSelectorOpen(true)}
                        className="w-full bg-surface border border-dashed border-border-ink p-3 text-xs font-mono outline-none text-text-secondary hover:text-foreground hover:border-accent-vermillion transition-colors text-left flex items-center justify-center"
                      >
                        + Select Shikigami...
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setShowSubsPanel(true)}
                className="h-full w-full hover:bg-surface transition-colors flex items-center justify-center"
                title="Manage Substitutes"
              >
                <div className="-rotate-90 whitespace-nowrap text-xs font-mono text-text-secondary tracking-widest">
                  SUBSTITUTES ({configSlotData.substitutes?.length || 0})
                </div>
              </button>
            )}
          </div>
        )}
      </div>

      <ShikigamiSelectorModal 
        isOpen={isSubSelectorOpen}
        onClose={() => setIsSubSelectorOpen(false)}
        shikigamiData={shikigamiData}
        onSelect={(id) => {
          const newSubs = [...(configSlotData.substitutes || [])];
          newSubs.push({ shikigamiId: id });
          setConfigSlotData({...configSlotData, substitutes: newSubs});
          setActiveSubIndex(newSubs.length - 1); // Open config immediately
        }}
      />
    </div>
  );
}
