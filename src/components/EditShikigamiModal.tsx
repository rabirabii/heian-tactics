'use client';

import { useState, useEffect } from 'react';
import { upsertShikigamiBase, upsertShikigamiEvaluations, upsertShikigamiSkills } from '@/app/actions/admin';
import { Save, X, Trash2, Plus, Upload } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { uploadImageToSupabase } from '@/utils/supabase/storage';
import { createClient } from '@/utils/supabase/client';
import { useSubmit } from '@/hooks/useSubmit';
import RichTextEditor from './RichTextEditor';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

type EvalData = { score: string; metrics?: any; notes?: string };

export default function EditShikigamiModal({
  shikigami,
  roles,
  categories,
  rarities,
  isOpen,
  onClose,
  onSaveSuccess,
  currentTierListId,
  currentTierListName
}: {
  shikigami: any,
  roles: any[],
  categories: any[],
  rarities: any[],
  isOpen: boolean,
  onClose: () => void,
  onSaveSuccess: () => void,
  currentTierListId?: string | null,
  currentTierListName?: string | null
}) {
  const isNew = !shikigami;
  const [activeTab, setActiveTab] = useState<'basic' | 'skills' | 'evaluations'>('basic');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form States - Basic
  const [name, setName] = useState(shikigami?.name || '');
  const [rarityId, setRarityId] = useState(shikigami?.rarityId || 'SSR');
  const [icon, setIcon] = useState(shikigami?.icon || '');
  const [isBeginnerFriendly, setIsBeginnerFriendly] = useState(shikigami?.beginnerFriendly || false);
  const [availableGlobal, setAvailableGlobal] = useState(shikigami?.availableGlobal ?? true);
  
  const initialPveRoleIds = shikigami?.roleAssignments?.filter((ra: any) => ra.mode === 'PvE').map((ra: any) => ra.roleId) || [];
  const initialPvpRoleIds = shikigami?.roleAssignments?.filter((ra: any) => ra.mode === 'PvP').map((ra: any) => ra.roleId) || [];
  const [selectedPveRoles, setSelectedPveRoles] = useState<string[]>(initialPveRoleIds);
  const [selectedPvpRoles, setSelectedPvpRoles] = useState<string[]>(initialPvpRoleIds);
  const [strengthsStr, setStrengthsStr] = useState(shikigami?.strengths?.join(', ') || '');
  const [weaknessesStr, setWeaknessesStr] = useState(shikigami?.weaknesses?.join(', ') || '');

  // Form States - Evaluations
  const [evaluations, setEvaluations] = useState<Record<string, EvalData>>({});
  
  // Form States - Skills
  const [skills, setSkills] = useState<any[]>([]);
  const [skillFiles, setSkillFiles] = useState<Record<number, File>>({});

  useEffect(() => {
    if (isOpen) {
      setName(shikigami?.name || '');
      setRarityId(shikigami?.rarityId || 'SSR');
      setIcon(shikigami?.icon || '');
      setIsBeginnerFriendly(shikigami?.beginnerFriendly || false);
      setAvailableGlobal(shikigami?.availableGlobal ?? true);
      setSelectedPveRoles(shikigami?.roleAssignments?.filter((ra: any) => ra.mode === 'PvE').map((ra: any) => ra.roleId) || []);
      setSelectedPvpRoles(shikigami?.roleAssignments?.filter((ra: any) => ra.mode === 'PvP').map((ra: any) => ra.roleId) || []);
      setStrengthsStr(shikigami?.strengths?.join('\n') || '');
      setWeaknessesStr(shikigami?.weaknesses?.join('\n') || '');
      
      const evals: Record<string, EvalData> = {};
      if (shikigami?.evaluations) {
        shikigami.evaluations.forEach((ev: any) => {
          evals[ev.categoryId] = { score: ev.score, metrics: ev.metrics || {}, notes: ev.notes || '' };
        });
      }
      setEvaluations(evals);
      setSkills(shikigami?.skills || []);
      setActiveTab(currentTierListId ? 'evaluations' : 'basic');
      setSelectedFile(null);
      setSkillFiles({});
    }
  }, [isOpen, shikigami, currentTierListId]);

  const { handleSubmit: handleSave, isSubmitting: isSaving } = useSubmit({
    action: async () => {
      if (!name) throw new Error("Name is required");

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in");

      let finalIconUrl = icon;
      if (selectedFile) {
        finalIconUrl = await uploadImageToSupabase(selectedFile, 'shikigami');
      }

      // If we are editing a specific tier list, ONLY save evaluations via a different action
      if (currentTierListId) {
        // We need to import upsertShikigamiEvaluation from tierlists actions
        const { upsertShikigamiEvaluation } = await import('@/app/actions/tierlists');
        const evalsToSave = Object.entries(evaluations);
        
        for (const [categoryId, data] of evalsToSave) {
          await upsertShikigamiEvaluation(shikigami.id, categoryId, data.score, data.notes, currentTierListId, data.metrics);
        }
        return;
      }

      // 1. Save Basic
      const strengths = strengthsStr.split('\n').map((s: string) => s.trim()).filter(Boolean);
      const weaknesses = weaknessesStr.split('\n').map((s: string) => s.trim()).filter(Boolean);
      
      const { id: newId } = await upsertShikigamiBase(
        isNew ? 'new' : shikigami.id,
        { name, rarityId, icon: finalIconUrl, beginnerFriendly: isBeginnerFriendly, availableGlobal, strengths, weaknesses },
        selectedPveRoles,
        selectedPvpRoles
      );

      // 2. Save Evaluations
      const evalsToSave = Object.entries(evaluations)
        .filter(([_, data]) => data.score !== '') // Only save non-empty
        .map(([categoryId, data]) => ({ categoryId, score: data.score, metrics: data.metrics, notes: data.notes }));
      await upsertShikigamiEvaluations(newId, evalsToSave);

      // 3. Save Skills
      const finalSkills = skills.map(s => ({
        ...s,
        levelUpgrades: Array.isArray(s.levelUpgrades) ? s.levelUpgrades.filter((x: string) => x.trim() !== '') : []
      }));
      for (let i = 0; i < finalSkills.length; i++) {
        if (skillFiles[i]) {
          finalSkills[i].icon = await uploadImageToSupabase(skillFiles[i], 'shikigamisub');
        }
      }
      await upsertShikigamiSkills(newId, finalSkills);
    },
    onSuccess: () => {
      onSaveSuccess();
      onClose();
    },
    successMessage: isNew ? 'Shikigami created!' : 'Shikigami updated!',
    errorMessage: 'Failed to save Shikigami. Ensure you are logged in as an admin.',
    debounceMs: 500
  });

  if (!isOpen) return null;

  const handlePveRoleToggle = (roleId: string) => {
    if (selectedPveRoles.includes(roleId)) {
      setSelectedPveRoles(selectedPveRoles.filter(r => r !== roleId));
    } else {
      setSelectedPveRoles([...selectedPveRoles, roleId]);
    }
  };

  const handlePvpRoleToggle = (roleId: string) => {
    if (selectedPvpRoles.includes(roleId)) {
      setSelectedPvpRoles(selectedPvpRoles.filter(r => r !== roleId));
    } else {
      setSelectedPvpRoles([...selectedPvpRoles, roleId]);
    }
  };

  const handleEvalChange = (categoryId: string, field: keyof EvalData, value: any) => {
    setEvaluations(prev => ({ 
      ...prev, 
      [categoryId]: { 
        ...(prev[categoryId] || { score: '', metrics: {}, notes: '' }), 
        [field]: value 
      } 
    }));
  };

  const handleMetricChange = (categoryId: string, metricName: string, value: number) => {
    setEvaluations(prev => {
      const current = prev[categoryId] || { score: '', metrics: {}, notes: '' };
      return {
        ...prev,
        [categoryId]: {
          ...current,
          metrics: { ...(current.metrics || {}), [metricName]: value }
        }
      };
    });
  };

  const handleAddSkill = () => {
    setSkills([...skills, { name: '', description: '', icon: '', type: 'Normal', cost: '0', levelUpgrades: [] }]);
  };

  const handleUpdateSkill = (index: number, field: string, value: any) => {
    const newSkills = [...skills];
    newSkills[index][field] = value;
    setSkills(newSkills);
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-border-ink shadow-2xl relative animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-ink shrink-0">
          <div>
            <h2 className="text-xl font-display text-foreground">
              {isNew ? 'New Shikigami' : `Edit: ${shikigami.rarityId} ${shikigami.name}`}
            </h2>
            <p className="text-xs font-mono mt-1">
              {currentTierListId ? (
                <span className="text-accent-gold">Editing Personal Tier List: {currentTierListName}</span>
              ) : (
                <span className="text-accent-vermillion">Editing Global Default Tier List</span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleSave()}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-accent-gold/20 text-accent-gold border border-accent-gold hover:bg-accent-gold hover:text-background transition-colors disabled:opacity-50 font-mono text-sm"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => onClose()} className="p-1.5 text-text-secondary hover:text-foreground hover:bg-border-ink/50 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-ink shrink-0 overflow-x-auto">
          {!currentTierListId && (
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-6 py-3 font-mono text-sm transition-colors whitespace-nowrap ${
                activeTab === 'basic'
                  ? 'text-accent-vermillion border-b-2 border-accent-vermillion bg-accent-vermillion/5'
                  : 'text-text-secondary hover:text-foreground'
              }`}
            >
              Basic Info
            </button>
          )}
          <button
            onClick={() => setActiveTab('evaluations')}
            className={`px-6 py-3 font-mono text-sm transition-colors whitespace-nowrap ${
              activeTab === 'evaluations'
                ? 'text-accent-gold border-b-2 border-accent-gold bg-accent-gold/5'
                : 'text-text-secondary hover:text-foreground'
            }`}
          >
            Tier Evaluations
          </button>
          {!currentTierListId && (
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-6 py-3 font-mono text-sm transition-colors whitespace-nowrap ${
                activeTab === 'skills'
                  ? 'text-blue-500 border-b-2 border-blue-500 bg-blue-500/5'
                  : 'text-text-secondary hover:text-foreground'
              }`}
            >
              Skills
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Basic Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-text-secondary">Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-background border border-border-ink p-2 font-display text-lg focus:border-accent-vermillion outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-text-secondary">Rarity</label>
                  <select value={rarityId} onChange={e => setRarityId(e.target.value)} className="w-full bg-background border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none">
                    {rarities.map(r => (
                      <option key={r.id} value={r.id}>{r.id}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-xs font-mono text-text-secondary">Icon / Image</label>
                  <ImageUpload 
                    initialImage={icon}
                    onImageSelected={setSelectedFile}
                  />
                  <div className="mt-2">
                    <label className="block text-[10px] font-mono text-text-secondary mb-1">Or image URL</label>
                    <input 
                      value={icon} 
                      onChange={e => setIcon(e.target.value)} 
                      className="w-full bg-background border border-border-ink p-2 font-mono text-xs focus:border-accent-vermillion outline-none" 
                      placeholder="https://..." 
                    />
                  </div>
                </div>
                
                <div className="space-y-2 col-span-2 flex items-center gap-8">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isBeginnerFriendly} onChange={e => setIsBeginnerFriendly(e.target.checked)} className="accent-accent-vermillion" />
                    <span className="font-mono text-sm">Is Beginner Friendly?</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={availableGlobal} onChange={e => setAvailableGlobal(e.target.checked)} className="accent-blue-500" />
                    <span className="font-mono text-sm">Available in Global?</span>
                  </label>
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-xs font-mono text-text-secondary">Strengths</label>
                  <RichTextEditor content={strengthsStr} onChange={setStrengthsStr} />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-xs font-mono text-text-secondary">Weaknesses</label>
                  <RichTextEditor content={weaknessesStr} onChange={setWeaknessesStr} />
                </div>
              </div>

              <div className="bg-surface p-4 border border-border-ink space-y-4">
                <h3 className="font-display text-lg border-b border-border-ink pb-2">PvE Roles</h3>
                <div className="flex flex-wrap gap-2">
                  {roles.map(r => {
                    const isSelected = selectedPveRoles.includes(r.id);
                    return (
                      <button
                        key={`pve-${r.id}`}
                        type="button"
                        onClick={() => handlePveRoleToggle(r.id)}
                        className={`px-3 py-1.5 text-xs font-mono border transition-colors ${
                          isSelected 
                            ? 'bg-accent-vermillion text-white border-accent-vermillion' 
                            : 'bg-background text-text-secondary border-border-ink hover:border-text-secondary hover:text-foreground'
                        }`}
                      >
                        {r.name}
                      </button>
                    )
                  })}
                </div>

                <h3 className="font-display text-lg border-b border-border-ink pb-2 mt-6">PvP Roles</h3>
                <div className="flex flex-wrap gap-2">
                  {roles.map(r => {
                    const isSelected = selectedPvpRoles.includes(r.id);
                    return (
                      <button
                        key={`pvp-${r.id}`}
                        type="button"
                        onClick={() => handlePvpRoleToggle(r.id)}
                        className={`px-3 py-1.5 text-xs font-mono border transition-colors ${
                          isSelected 
                            ? 'bg-accent-vermillion text-white border-accent-vermillion' 
                            : 'bg-background text-text-secondary border-border-ink hover:border-text-secondary hover:text-foreground'
                        }`}
                      >
                        {r.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Evaluations Tab */}
          {activeTab === 'evaluations' && (
            <div className="space-y-8 animate-in fade-in">
              <p className="font-mono text-sm text-text-secondary">Set scores to position this Shikigami in the Meta Tier List. Empty values will remove the rating.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* PVE */}
                <div className="space-y-4">
                  <h3 className="font-display text-lg text-accent-vermillion border-b border-border-ink pb-2">PvE Evaluations</h3>
                  {categories.filter(c => c.group === 'pve').map(cat => {
                    const evalData = evaluations[cat.id] || { score: '', metrics: {}, notes: '' };
                    return (
                      <div key={cat.id} className="bg-background border border-border-ink p-3 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {cat.isOverall && <span className="w-2 h-2 rounded-full bg-accent-gold" title="Overall Category" />}
                            <span className="font-mono text-sm">{cat.name}</span>
                          </div>
                          <select 
                            value={evalData.score} 
                            onChange={e => handleEvalChange(cat.id, 'score', e.target.value)}
                            className="bg-surface border border-border-ink p-1 font-mono text-sm w-24 outline-none focus:border-accent-vermillion"
                          >
                            <option value="">None</option>
                            <option value="SS">SS</option>
                            <option value="S">S</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                          </select>
                        </div>
                        
                        {evalData.score && (
                          <div className="border-t border-border-ink/50 pt-3 space-y-2">
                            <label className="text-xs font-mono text-text-secondary">Evaluation Notes</label>
                            <div className="border border-border-ink">
                              <RichTextEditor 
                                content={evalData.notes || ''} 
                                onChange={(html) => handleEvalChange(cat.id, 'notes', html)} 
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* PVP */}
                <div className="space-y-4">
                  <h3 className="font-display text-lg text-blue-500 border-b border-border-ink pb-2">PvP Evaluations</h3>
                  {categories.filter(c => c.group === 'pvp').map(cat => {
                    const evalData = evaluations[cat.id] || { score: '', metrics: {}, notes: '' };
                    const m = evalData.metrics || {};
                    const chartData = [
                      { subject: 'Flexibility', A: m.flexibility || 0, fullMark: 10 },
                      { subject: 'Counter Resist', A: m.counterResist || 0, fullMark: 10 },
                      { subject: 'Draft Impact', A: m.draftImpact || 0, fullMark: 10 },
                      { subject: 'Utility', A: m.utility || 0, fullMark: 10 },
                      { subject: 'Damage', A: m.damage || 0, fullMark: 10 },
                    ];

                    return (
                      <div key={cat.id} className="bg-background border border-border-ink p-3 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {cat.isOverall && <span className="w-2 h-2 rounded-full bg-accent-gold" title="Overall Category" />}
                            <span className="font-mono text-sm font-bold text-blue-400">{cat.name}</span>
                          </div>
                          <select 
                            value={evalData.score} 
                            onChange={e => handleEvalChange(cat.id, 'score', e.target.value)}
                            className="bg-surface border border-border-ink p-1 font-mono text-sm w-24 outline-none focus:border-blue-500"
                          >
                            <option value="">None</option>
                            <option value="SS">SS</option>
                            <option value="S">S</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                          </select>
                        </div>

                        {/* Radar Chart & Sliders Section */}
                        {evalData.score && (
                          <div className="border-t border-border-ink/50 pt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Sliders */}
                            <div className="space-y-4">
                              {['flexibility', 'counterResist', 'draftImpact', 'utility', 'damage'].map((metric) => (
                                <div key={metric} className="space-y-1">
                                  <div className="flex justify-between text-xs font-mono text-text-secondary">
                                    <span className="capitalize">{metric.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    <span className="text-foreground">{m[metric] || 0}/10</span>
                                  </div>
                                  <input 
                                    type="range" 
                                    min="0" 
                                    max="10" 
                                    value={m[metric] || 0}
                                    onChange={(e) => handleMetricChange(cat.id, metric, parseInt(e.target.value))}
                                    className="w-full accent-blue-500"
                                  />
                                </div>
                              ))}
                            </div>
                            
                            {/* Radar Chart */}
                            <div className="h-48 w-full bg-surface/50 border border-border-ink rounded-sm flex items-center justify-center p-2">
                              <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                                  <PolarGrid stroke="#333" />
                                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
                                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                                  <Radar name="Metrics" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                                </RadarChart>
                              </ResponsiveContainer>
                            </div>

                            {/* Notes */}
                            <div className="col-span-1 lg:col-span-2 space-y-2 mt-2">
                              <label className="text-xs font-mono text-text-secondary">Strategy Notes / Matchups</label>
                              <div className="border border-border-ink">
                                <RichTextEditor 
                                  content={evalData.notes || ''} 
                                  onChange={(html) => handleEvalChange(cat.id, 'notes', html)} 
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-6 animate-in fade-in">
              {skills.map((skill, idx) => (
                <div key={idx} className="bg-background border border-border-ink p-4 space-y-4 relative">
                  <button 
                    onClick={() => handleRemoveSkill(idx)}
                    className="absolute top-4 right-4 text-text-secondary hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="grid grid-cols-2 gap-4 mr-8">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-text-secondary">Skill Name</label>
                        <input value={skill.name} onChange={e => handleUpdateSkill(idx, 'name', e.target.value)} className="w-full bg-surface border border-border-ink p-2 font-display focus:border-accent-vermillion outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-text-secondary">Skill Icon</label>
                        <ImageUpload 
                          initialImage={skill.icon}
                          onImageSelected={(file) => {
                            if (file) {
                              setSkillFiles(prev => ({ ...prev, [idx]: file }));
                            } else {
                              const newFiles = { ...skillFiles };
                              delete newFiles[idx];
                              setSkillFiles(newFiles);
                              handleUpdateSkill(idx, 'icon', '');
                            }
                          }}
                        />
                        <div className="mt-2">
                          <label className="block text-[10px] font-mono text-text-secondary mb-1">Or image URL</label>
                          <input 
                            value={skill.icon} 
                            onChange={e => handleUpdateSkill(idx, 'icon', e.target.value)} 
                            className="w-full bg-surface border border-border-ink p-2 font-mono text-xs focus:border-accent-vermillion outline-none" 
                            placeholder="https://..." 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 h-fit">
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-text-secondary">Type</label>
                        <select value={skill.type || 'Normal'} onChange={e => handleUpdateSkill(idx, 'type', e.target.value)} className="w-full bg-surface border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none">
                          <option value="Normal">Normal</option>
                          <option value="Passive">Passive</option>
                          <option value="Active">Active</option>
                          <option value="Special 1">Special 1</option>
                          <option value="Special 2">Special 2</option>
                          <option value="Linked Skill">Linked Skill</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <label className="text-xs font-mono text-text-secondary">Orb Cost</label>
                          <input type="number" value={skill.cost ?? 0} onChange={e => handleUpdateSkill(idx, 'cost', e.target.value)} className="w-full bg-surface border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-mono text-text-secondary">Cooldown</label>
                          <input type="number" value={skill.cooldown ?? 0} onChange={e => handleUpdateSkill(idx, 'cooldown', e.target.value)} className="w-full bg-surface border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" />
                        </div>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-xs font-mono text-text-secondary">Description</label>
                        <RichTextEditor content={skill.description || ''} onChange={html => handleUpdateSkill(idx, 'description', html)} />
                      </div>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-xs font-mono text-text-secondary">Level Upgrades (One per line)</label>
                      <textarea 
                        value={skill.levelUpgrades?.join('\n') || ''} 
                        onChange={e => {
                          const arr = e.target.value.split('\n');
                          handleUpdateSkill(idx, 'levelUpgrades', arr);
                        }}
                        className="w-full h-24 bg-surface border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" 
                        placeholder="Lv.2 Damage increases to 105%&#10;Lv.3 Damage increases to 110%"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button 
                onClick={handleAddSkill}
                className="flex items-center justify-center w-full gap-2 p-4 border border-dashed border-border-ink text-text-secondary hover:text-foreground hover:border-accent-vermillion transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="font-mono text-sm">Add New Skill</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
