import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';

export default function ShikigamiSelectorModal({
  isOpen,
  onClose,
  onSelect,
  shikigamiData,
  onmyojiData,
  mode
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string, mode?: 'shikigami' | 'onmyoji') => void;
  shikigamiData: any[];
  onmyojiData?: any[];
  mode?: 'shikigami' | 'onmyoji';
}) {
  const currentMode = mode || 'shikigami';
  const [searchQuery, setSearchQuery] = useState('');
  const [rarityFilter, setRarityFilter] = useState('All');

  const rarities = useMemo(() => {
    return Array.from(new Set(shikigamiData.map(s => s.rarityId))).filter(Boolean);
  }, [shikigamiData]);

  const filteredShiki = useMemo(() => {
    if (currentMode === 'onmyoji') return [];
    return shikigamiData
      .filter(s => rarityFilter === 'All' || s.rarityId === rarityFilter)
      .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [shikigamiData, searchQuery, rarityFilter, currentMode]);

  const filteredOnmyoji = useMemo(() => {
    if (currentMode !== 'onmyoji' || !onmyojiData) return [];
    return onmyojiData.filter(o => o.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [onmyojiData, searchQuery, currentMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-3xl h-[80vh] flex flex-col border border-border-ink shadow-2xl relative animate-in fade-in zoom-in-95">
        
        {/* Header & Search */}
        <div className="p-4 border-b border-border-ink bg-background/50 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-lg text-accent-gold">
              {currentMode === 'onmyoji' ? 'Select Onmyoji' : 'Select Shikigami'}
            </h3>
            <button onClick={onClose} className="text-text-secondary hover:text-red-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search Shikigami..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border-ink pl-10 p-2 font-mono text-sm focus:border-accent-vermillion outline-none"
            />
          </div>

          {currentMode === 'shikigami' && (
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {['All', ...rarities].map(r => (
                <button 
                  key={r as string}
                  onClick={() => setRarityFilter(r as string)}
                  className={`shrink-0 px-3 py-1 text-xs font-mono border ${rarityFilter === r ? 'border-accent-vermillion text-accent-vermillion bg-accent-vermillion/10' : 'border-border-ink text-text-secondary hover:text-foreground'}`}
                >
                  {r as string}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {currentMode === 'shikigami' ? (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {filteredShiki.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    onSelect(s.id, 'shikigami');
                    onClose();
                  }}
                  className="relative aspect-square border border-border-ink hover:border-accent-vermillion transition-colors group"
                  title={s.name}
                >
                  <img src={s.icon} alt={s.name} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-[10px] font-display text-white text-center px-1 truncate w-full">{s.name}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {filteredOnmyoji.map(o => (
                <button
                  key={o.id}
                  onClick={() => {
                    onSelect(o.id, 'onmyoji');
                    onClose();
                  }}
                  className="relative aspect-square border border-border-ink rounded-full overflow-hidden hover:border-accent-gold transition-colors group"
                  title={o.name}
                >
                  <img src={o.icon} alt={o.name} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-[10px] font-display text-white text-center px-1 truncate w-full">{o.name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
