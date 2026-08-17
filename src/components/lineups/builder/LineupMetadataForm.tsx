import { useLineupBuilderStore } from '@/store/lineup-builder-store';

export default function LineupMetadataForm({
  lineupTypesData,
  categories,
  subcategories
}: {
  lineupTypesData: any[];
  categories: any[];
  subcategories: any[];
}) {
  const {
    name,
    description,
    notes,
    strengthsStr,
    weaknessesStr,
    selectedType,
    selectedCategoryId,
    selectedSubcategoryId,
    setMetadata
  } = useLineupBuilderStore();

  return (
    <div className="space-y-6 flex-1">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-mono text-text-secondary">Lineup Name</label>
          <input 
            value={name} 
            onChange={e => setMetadata({ name: e.target.value })}
            className="w-full bg-background border border-border-ink p-2 font-display focus:border-accent-vermillion outline-none" 
            placeholder="e.g. Susanoo Speed Team"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-mono text-text-secondary">Category Mapping</label>
          <div className="grid grid-cols-3 gap-2">
            <select 
              value={selectedType}
              onChange={e => {
                setMetadata({
                  selectedType: e.target.value,
                  selectedCategoryId: '',
                  selectedSubcategoryId: ''
                });
              }}
              className="bg-background border border-border-ink p-2 font-mono text-xs focus:border-accent-vermillion outline-none"
            >
              {lineupTypesData.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <select 
              value={selectedCategoryId}
              onChange={e => {
                setMetadata({
                  selectedCategoryId: e.target.value,
                  selectedSubcategoryId: ''
                });
              }}
              disabled={!selectedType}
              className="bg-background border border-border-ink p-2 font-mono text-xs focus:border-accent-vermillion outline-none"
            >
              <option value="">Category...</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select 
              value={selectedSubcategoryId}
              onChange={e => setMetadata({ selectedSubcategoryId: e.target.value })}
              disabled={!selectedCategoryId}
              className="bg-background border border-border-ink p-2 font-mono text-xs focus:border-accent-vermillion outline-none"
            >
              <option value="">Subcategory...</option>
              {subcategories.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-mono text-text-secondary">Description & Guide</label>
        <textarea 
          value={description} 
          onChange={e => setMetadata({ description: e.target.value })}
          className="w-full h-32 bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none custom-scrollbar"
          placeholder="How does this lineup work? Turn order, general strategy..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-mono text-text-secondary">Piloting Notes / Caveats</label>
        <textarea 
          value={notes || ''} 
          onChange={e => setMetadata({ notes: e.target.value })}
          className="w-full h-24 bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none custom-scrollbar"
          placeholder="Operational context, tips, warnings, or conditions (e.g. 'Make sure Seimei uses Protect on Turn 1')"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-mono text-text-secondary">Strengths (Comma separated)</label>
          <input 
            value={strengthsStr} 
            onChange={e => setMetadata({ strengthsStr: e.target.value })}
            className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" 
            placeholder="Fast clears, Auto-friendly..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-mono text-text-secondary">Weaknesses (Comma separated)</label>
          <input 
            value={weaknessesStr} 
            onChange={e => setMetadata({ weaknessesStr: e.target.value })}
            className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" 
            placeholder="Needs specific souls, manual targeting..."
          />
        </div>
      </div>
    </div>
  );
}
