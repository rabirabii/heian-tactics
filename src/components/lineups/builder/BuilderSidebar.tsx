import { Search } from 'lucide-react';
import { useLineupBuilderStore } from '@/store/lineup-builder-store';

export default function BuilderSidebar({
  shikigamiData,
  onmyojiData,
  raritiesData,
  showBanUI,
}: {
  shikigamiData: any[];
  onmyojiData: any[];
  raritiesData: any[];
  showBanUI: boolean;
}) {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    rarityFilter,
    setRarityFilter,
    activeSlotNumber,
    slots,
    updateSlot,
    setConfigSlotData,
    setMetadata,
  } = useLineupBuilderStore();

  return (
    <div className="w-1/3 border-r border-border-ink flex flex-col bg-background/50">
      {/* Search & Filters */}
      <div className="p-4 border-b border-border-ink space-y-4">
        <div className="flex bg-surface border border-border-ink p-1">
          <button 
            onClick={() => setActiveTab('shikigami')}
            className={`flex-1 py-1.5 text-xs font-mono font-bold transition-colors ${activeTab === 'shikigami' ? 'bg-accent-vermillion text-white' : 'text-text-secondary hover:text-foreground'}`}
          >
            SHIKIGAMI
          </button>
          <button 
            onClick={() => setActiveTab('onmyoji')}
            className={`flex-1 py-1.5 text-xs font-mono font-bold transition-colors ${activeTab === 'onmyoji' ? 'bg-accent-gold text-background' : 'text-text-secondary hover:text-foreground'}`}
          >
            ONMYOJI
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border-ink pl-10 p-2 font-mono text-sm focus:border-accent-vermillion outline-none"
          />
        </div>

        {activeTab === 'shikigami' && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {['All', ...raritiesData.map((r: any) => r.id)].map(r => (
              <button 
                key={r}
                onClick={() => setRarityFilter(r)}
                className={`shrink-0 px-3 py-1 text-xs font-mono border ${rarityFilter === r ? 'border-accent-vermillion text-accent-vermillion bg-accent-vermillion/10' : 'border-border-ink text-text-secondary hover:text-foreground'}`}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Roster Grid */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {activeTab === 'shikigami' ? (
            shikigamiData
              .filter(s => rarityFilter === 'All' || s.rarityId === rarityFilter)
              .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(s => (
                <button
                  key={s.id}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', `shiki:${s.id}`);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => {
                    if (activeSlotNumber !== null && activeSlotNumber !== 6 && activeSlotNumber !== 7) {
                      const updatedSlot = {
                        ...slots[activeSlotNumber - 1],
                        shikigamiId: s.id,
                        onmyojiId: null,
                        slotType: 'CORE'
                      };
                      updateSlot(activeSlotNumber - 1, updatedSlot);
                    } else if (showBanUI && activeSlotNumber === 7) {
                      setMetadata({ banId: s.id });
                    } else {
                      alert("Please select a Shikigami slot (1-5) or Ban slot first.");
                    }
                  }}
                  className={`relative aspect-square border cursor-grab active:cursor-grabbing ${activeSlotNumber !== null && activeSlotNumber !== 6 ? 'hover:border-accent-vermillion' : 'border-border-ink hover:border-text-secondary'}`}
                >
                  <img src={s.icon} alt={s.name} className="w-full h-full object-cover pointer-events-none" draggable={false} loading="lazy" />
                </button>
              ))
          ) : (
            onmyojiData
              .filter(o => o.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(o => (
                <button
                  key={o.id}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', `onmyoji:${o.id}`);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => {
                    if (activeSlotNumber === 6) {
                      const updatedSlot = {
                        ...slots[5],
                        onmyojiId: o.id,
                        shikigamiId: null
                      };
                      updateSlot(5, updatedSlot);
                    } else {
                      alert("Please select the Onmyoji slot (6) first.");
                    }
                  }}
                  className={`relative aspect-square border cursor-grab active:cursor-grabbing ${activeSlotNumber === 6 ? 'hover:border-accent-vermillion' : 'border-border-ink hover:border-text-secondary'}`}
                >
                  <img src={o.icon} alt={o.name} className="w-full h-full object-cover pointer-events-none" draggable={false} />
                </button>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
