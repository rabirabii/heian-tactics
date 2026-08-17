import { create } from 'zustand';

export interface LineupBuilderState {
  // Modal UI State
  builderStep: 1 | 2;
  activeTab: 'shikigami' | 'onmyoji';
  searchQuery: string;
  rarityFilter: string;
  activeSlotNumber: number | null;
  configTarget: { type: 'slot', index: number } | { type: 'scenario', sIdx: number, pIdx: number } | { type: 'enemy_scenario', sIdx: number, pIdx: number } | null;
  configSlotData: any | null;
  soulSearchQuery: string;
  showSubsPanel: boolean;
  
  // Lineup Metadata
  lineupId: string | null;
  isNewVersion: boolean;
  name: string;
  description: string;
  notes: string;
  beginnerFriendly: boolean;
  strengthsStr: string;
  weaknessesStr: string;
  status: string;
  author: string;
  referenceUrl: string;
  
  // Categorization
  selectedType: string;
  selectedCategoryId: string;
  selectedSubcategoryId: string;
  
  // Entities
  banId: string | null;
  slots: any[];
  scenarios: any[];

  // Form State
  isSaving: boolean;

  // Actions
  initLineup: (lineup: any | null, lineupTypesData: any[]) => void;
  reset: () => void;
  
  // UI Actions
  setBuilderStep: (step: 1 | 2) => void;
  setActiveTab: (tab: 'shikigami' | 'onmyoji') => void;
  setSearchQuery: (q: string) => void;
  setRarityFilter: (f: string) => void;
  setActiveSlotNumber: (n: number | null) => void;
  setConfigSlotData: (data: any | null, target?: { type: 'slot', index: number } | { type: 'scenario', sIdx: number, pIdx: number } | { type: 'enemy_scenario', sIdx: number, pIdx: number } | null) => void;
  setSoulSearchQuery: (q: string) => void;
  setShowSubsPanel: (show: boolean) => void;
  setIsSaving: (isSaving: boolean) => void;
  
  // Metadata Actions
  setMetadata: (updates: Partial<LineupBuilderState>) => void;
  
  // Slot Actions
  updateSlot: (index: number, updates: any) => void;
  fillUnoccupiedToFlex: () => void;
  applyConfigSlot: () => void;
  
  // Scenario Actions
  setScenarios: (scenarios: any[]) => void;
  addScenario: () => void;
  updateScenario: (index: number, updates: any) => void;
  removeScenario: (index: number) => void;
  addScenarioPick: (sIdx: number, shikigamiId: string) => void;
  removeScenarioPick: (sIdx: number, pIdx: number) => void;
  updateScenarioPick: (sIdx: number, pIdx: number, updates: any) => void;
}

const initialState = {
  builderStep: 1 as const,
  activeTab: 'shikigami' as const,
  searchQuery: '',
  rarityFilter: 'All',
  activeSlotNumber: null,
  configTarget: null,
  configSlotData: null,
  soulSearchQuery: '',
  showSubsPanel: false,
  
  lineupId: null,
  isNewVersion: false,
  name: '',
  description: '',
  notes: '',
  beginnerFriendly: false,
  strengthsStr: '',
  weaknessesStr: '',
  status: 'CURRENT',
  author: 'System',
  referenceUrl: '',
  
  selectedType: '',
  selectedCategoryId: '',
  selectedSubcategoryId: '',
  
  banId: null,
  slots: [],
  scenarios: [],
  
  isSaving: false,
};

export const useLineupBuilderStore = create<LineupBuilderState>((set, get) => ({
  ...initialState,

  initLineup: (lineup, lineupTypesData) => {
    let selectedType = lineupTypesData[0]?.id || '';
    let selectedCategoryId = '';
    let selectedSubcategoryId = '';

    if (lineup?.subcategory) {
      selectedSubcategoryId = lineup.subcategory.id;
      selectedCategoryId = lineup.subcategory.category?.id || '';
      selectedType = lineup.subcategory.category?.type?.id || lineupTypesData[0]?.id || '';
    }

    const initialSlots = [];
    for (let i = 1; i <= 6; i++) {
      const existingSlot = lineup?.slots?.find((s: any) => s.slotNumber === i);
      let parsedSlot;
      
      if (existingSlot) {
        parsedSlot = { ...existingSlot };
        if (parsedSlot.shikigamiId === null && parsedSlot.indicator?.toUpperCase().includes('FLEX')) {
          parsedSlot.shikigamiId = 'flex';
        }
      } else {
        parsedSlot = {
          slotNumber: i,
          shikigamiId: null,
          onmyojiId: null,
          primarySouls: [],
          secondarySouls: [],
          substitutes: [],
          onmyojiSkills: [],
          slotType: i === 6 ? 'CORE' : 'CORE'
        };
      }
      initialSlots.push(parsedSlot);
    }

    set({
      ...initialState,
      lineupId: lineup?.id || null,
      name: lineup?.name || '',
      description: lineup?.description || '',
      notes: lineup?.notes || '',
      beginnerFriendly: lineup?.beginnerFriendly || false,
      strengthsStr: lineup?.strengths?.join(', ') || '',
      weaknessesStr: lineup?.weaknesses?.join(', ') || '',
      status: lineup?.status || 'CURRENT',
      author: lineup?.author || 'System',
      referenceUrl: lineup?.referenceUrl || '',
      banId: lineup?.banId || null,
      selectedType,
      selectedCategoryId,
      selectedSubcategoryId,
      slots: initialSlots,
      scenarios: (lineup?.scenarios || []).map((sc: any) => ({
        ...sc,
        conditions: sc.conditions || [],
        solutionSlots: sc.solutionSlots || [],
        baseLineupId: sc.baseLineupId || null,
        enemySlots: sc.enemySlots || [],
        baseEnemyLineupId: sc.baseEnemyLineupId || null
      })),
    });
  },

  reset: () => set(initialState),

  setBuilderStep: (builderStep) => set({ builderStep }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setRarityFilter: (rarityFilter) => set({ rarityFilter }),
  setActiveSlotNumber: (activeSlotNumber) => set({ activeSlotNumber }),
  setConfigSlotData: (configSlotData, target) => set((state) => ({ 
    configSlotData, 
    configTarget: target !== undefined ? target : state.configTarget 
  })),
  setSoulSearchQuery: (soulSearchQuery) => set({ soulSearchQuery }),
  setShowSubsPanel: (showSubsPanel) => set({ showSubsPanel }),
  setIsSaving: (isSaving) => set({ isSaving }),

  setMetadata: (updates) => set(updates),

  updateSlot: (index, updates) =>
    set((state) => {
      const newSlots = [...state.slots];
      newSlots[index] = { ...newSlots[index], ...updates };
      return { slots: newSlots };
    }),

  fillUnoccupiedToFlex: () =>
    set((state) => {
      const newSlots = [...state.slots];
      for (let i = 0; i < 5; i++) {
        if (!newSlots[i].shikigamiId) {
          newSlots[i].shikigamiId = 'flex';
          newSlots[i].slotType = 'SUB';
        }
      }
      return { slots: newSlots };
    }),

  applyConfigSlot: () =>
    set((state) => {
      if (!state.configSlotData || !state.configTarget) return state;
      if (state.configTarget.type === 'slot') {
        const newSlots = [...state.slots];
        newSlots[state.configTarget.index] = state.configSlotData;
        return { slots: newSlots, configSlotData: null, configTarget: null, showSubsPanel: false };
      } else if (state.configTarget.type === 'scenario') {
        const newSc = [...state.scenarios];
        if (newSc[state.configTarget.sIdx].solutionSlots) {
          newSc[state.configTarget.sIdx].solutionSlots[state.configTarget.pIdx] = state.configSlotData;
        }
        return { scenarios: newSc, configSlotData: null, configTarget: null, showSubsPanel: false };
      } else if (state.configTarget.type === 'enemy_scenario') {
        const newSc = [...state.scenarios];
        if (newSc[state.configTarget.sIdx].enemySlots) {
          newSc[state.configTarget.sIdx].enemySlots[state.configTarget.pIdx] = state.configSlotData;
        }
        return { scenarios: newSc, configSlotData: null, configTarget: null, showSubsPanel: false };
      }
      return state;
    }),

  setScenarios: (scenarios) => set({ scenarios }),

  addScenario: () =>
    set((state) => ({
      scenarios: [
        ...state.scenarios,
        { scenarioName: 'New Scenario', type: 'PVP_DRAFT', picks: [], conditions: [], solutionSlots: [], baseLineupId: null, enemySlots: [], baseEnemyLineupId: null },
      ],
    })),

  updateScenario: (index, updates) =>
    set((state) => {
      const newSc = [...state.scenarios];
      newSc[index] = { ...newSc[index], ...updates };
      return { scenarios: newSc };
    }),

  removeScenario: (index) =>
    set((state) => {
      const newSc = [...state.scenarios];
      newSc.splice(index, 1);
      return { scenarios: newSc };
    }),

  addScenarioPick: (sIdx, shikigamiId) =>
    set((state) => {
      const newSc = [...state.scenarios];
      if (!newSc[sIdx].picks) newSc[sIdx].picks = [];
      newSc[sIdx].picks.push({ shikigamiId, notes: '' });
      return { scenarios: newSc };
    }),

  removeScenarioPick: (sIdx, pIdx) =>
    set((state) => {
      const newSc = [...state.scenarios];
      newSc[sIdx].picks.splice(pIdx, 1);
      return { scenarios: newSc };
    }),

  updateScenarioPick: (sIdx, pIdx, updates) =>
    set((state) => {
      const newSc = [...state.scenarios];
      newSc[sIdx].picks[pIdx] = { ...newSc[sIdx].picks[pIdx], ...updates };
      return { scenarios: newSc };
    }),
}));
