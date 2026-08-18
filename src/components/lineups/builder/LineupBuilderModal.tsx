'use client';

import { useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { useLineupBuilderStore } from '@/store/lineup-builder-store';
import { revalidateMetaCache } from '@/app/actions/revalidate';
import { upsertMetaLineup } from '@/app/actions/lineups';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import BuilderSidebar from './BuilderSidebar';
import LineupPlacementPanel from './LineupPlacementPanel';
import LineupMetadataForm from './LineupMetadataForm';
import ScenarioBuilderPanel from './ScenarioBuilderPanel';
import SlotConfigModal from './SlotConfigModal';

export default function LineupBuilderModal({
  lineup,
  shikigamiData,
  onmyojiData,
  soulsData,
  lineupTypesData,
  raritiesData,
  rolesData,
  lineupsData,
  isOpen,
  onClose,
  onSaveSuccess
}: {
  lineup: any;
  shikigamiData: any[];
  onmyojiData: any[];
  soulsData: any[];
  lineupTypesData: any[];
  raritiesData: any[];
  rolesData: any[];
  lineupsData: any[];
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
}) {
  const {
    builderStep,
    setBuilderStep,
    initLineup,
    name,
    description,
    notes,
    beginnerFriendly,
    strengthsStr,
    weaknessesStr,
    status,
    author,
    referenceUrl,
    isNewVersion,
    banId,
    selectedType,
    selectedSubcategoryId,
    slots,
    scenarios,
    isSaving,
    setIsSaving,
    reset
  } = useLineupBuilderStore();

  const isNew = !lineup;

  useEffect(() => {
    if (isOpen) {
      initLineup(lineup, lineupTypesData);
    } else {
      reset();
    }
  }, [lineup, isOpen, lineupTypesData, initLineup, reset]);

  if (!isOpen) return null;

  const currentType = lineupTypesData.find((t: any) => t.id === selectedType);
  const categories = currentType?.categories || [];
  const currentCategory = categories.find((c: any) => c.id === useLineupBuilderStore.getState().selectedCategoryId);
  const subcategories = currentCategory?.subcategories || [];

  const isPvP = currentType?.name?.toUpperCase().includes('PVP');
  const isCeleb = subcategories.find((s: any) => s.id === selectedSubcategoryId)?.name.toUpperCase().includes('CELEB');
  const showBanUI = isPvP && isCeleb;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (!name || !selectedSubcategoryId) {
        alert("Name and Subcategory are required!");
        return;
      }
      
      const payload = {
        isNewVersion,
        name,
        description,
        notes,
        beginnerFriendly,
        strengths: strengthsStr.split(',').map(s => s.trim()).filter(Boolean),
        weaknesses: weaknessesStr.split(',').map(s => s.trim()).filter(Boolean),
        status,
        author,
        referenceUrl,
        subcategoryId: selectedSubcategoryId,
        banId: showBanUI ? banId : null,
        slots: slots.map(s => ({
          slotNumber: s.slotNumber,
          shikigamiId: s.shikigamiId === 'flex' ? null : s.shikigamiId,
          onmyojiId: s.onmyojiId,
          buildId: s.buildId,
          slotType: s.slotType || 'CORE',
          minSpeed: s.minSpeed,
          minEffectHit: s.minEffectHit,
          minEffectRes: s.minEffectRes,
          minCrit: s.minCrit,
          minCritDmg: s.minCritDmg,
          skillReq: s.skillReq,
          slot2: s.slot2,
          slot4: s.slot4,
          slot6: s.slot6,
          statReq: s.statReq,
          primarySouls: s.primarySouls,
          indicator: s.shikigamiId === 'flex' && !s.indicator ? 'FLEX' : s.indicator,
          substitutes: s.substitutes || [],
          onmyojiSkills: s.onmyojiSkills || []
        })).filter(s => s.shikigamiId || s.onmyojiId || s.indicator?.toUpperCase().includes('FLEX')),
        scenarios: scenarios
      };

      await upsertMetaLineup(isNew ? 'new' : lineup.id, payload);
      await revalidateMetaCache('meta-lineups');
      toast.success(isNew ? 'Lineup created successfully' : 'Lineup updated successfully');
      
      onSaveSuccess();
      onClose();
    } catch (e: any) {
      alert("Failed to save: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-[95vw] h-[95vh] overflow-hidden flex flex-col border border-border-ink shadow-2xl relative animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-ink shrink-0 bg-background/50">
          <h2 className="text-xl font-display text-foreground flex gap-4 items-center">
            {isNew ? 'Create Meta Lineup' : `Edit Lineup: ${name}`}
            <span className="text-xs font-mono text-text-secondary bg-surface px-2 py-1">Step {builderStep} of 2</span>
          </h2>
          
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="text-text-secondary hover:text-foreground transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {builderStep === 1 ? (
            <>
              <BuilderSidebar 
                shikigamiData={shikigamiData}
                onmyojiData={onmyojiData}
                raritiesData={raritiesData}
                showBanUI={showBanUI || false}
              />

              <div className="w-2/3 flex flex-col bg-surface overflow-y-auto p-6 space-y-8 custom-scrollbar">
                <LineupPlacementPanel 
                  shikigamiData={shikigamiData}
                  onmyojiData={onmyojiData}
                  showBanUI={showBanUI || false}
                />

                <LineupMetadataForm 
                  lineupTypesData={lineupTypesData}
                  categories={categories}
                  subcategories={subcategories}
                />

                <div className="pt-4 border-t border-border-ink shrink-0 flex justify-end items-center gap-4">
                  <button 
                    onClick={() => setBuilderStep(2)}
                    className="px-6 py-2 bg-accent-gold text-background font-mono font-bold hover:bg-yellow-500 transition-colors flex items-center gap-2"
                  >
                    Next: Add Scenarios & Counters <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <ScenarioBuilderPanel 
              shikigamiData={shikigamiData}
              onmyojiData={onmyojiData}
              lineupsData={lineupsData}
              isNew={isNew}
              handleSave={handleSave}
            />
          )}
        </div>
      </div>

      <SlotConfigModal 
        shikigamiData={shikigamiData}
        onmyojiData={onmyojiData}
        soulsData={soulsData}
        rolesData={rolesData}
      />
    </div>
  );
}
