'use client';

import { useState, useEffect } from 'react';
import { upsertOnmyoji, upsertOnmyojiSkills } from '@/app/actions/onmyoji';
import { X, Save, Trash2, Plus } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { uploadImageToSupabase } from '@/utils/supabase/storage';
import { useSubmit } from '@/hooks/useSubmit';
import RichTextEditor from './RichTextEditor';

export default function EditOnmyojiModal({
  onmyoji,
  onClose
}: {
  onmyoji: any | null,
  onClose: () => void
}) {
  const isNew = !onmyoji;
  const [activeTab, setActiveTab] = useState<'basic' | 'skills'>('basic');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    id: onmyoji?.id || '',
    name: onmyoji?.name || '',
    icon: onmyoji?.icon || '',
    role: onmyoji?.role || 'Onmyoji'
  });

  const [skills, setSkills] = useState<any[]>([]);
  const [skillFiles, setSkillFiles] = useState<Record<number, File>>({});

  useEffect(() => {
    setFormData({
      id: onmyoji?.id || '',
      name: onmyoji?.name || '',
      icon: onmyoji?.icon || '',
      role: onmyoji?.role || 'Onmyoji'
    });
    setSkills(onmyoji?.skills || []);
    setActiveTab('basic');
    setSelectedFile(null);
    setSkillFiles({});
  }, [onmyoji]);

  const { handleSubmit: handleSave, isSubmitting: isSaving } = useSubmit({
    action: async () => {
      if (!formData.name) {
        throw new Error("Name is required");
      }
      
      let finalIconUrl = formData.icon;
      if (selectedFile) {
        finalIconUrl = await uploadImageToSupabase(selectedFile, 'onmyoji');
      }

      const { id: newId } = await upsertOnmyoji(
        isNew ? 'new' : formData.id,
        {
          name: formData.name,
          icon: finalIconUrl,
          role: formData.role
        }
      );

      // Save Skills
      const finalSkills = skills.map(s => ({
        ...s,
        levelUpgrades: Array.isArray(s.levelUpgrades) ? s.levelUpgrades.filter((x: string) => x.trim() !== '') : []
      }));
      for (let i = 0; i < finalSkills.length; i++) {
        if (skillFiles[i]) {
          finalSkills[i].icon = await uploadImageToSupabase(skillFiles[i], 'onmyojisub');
        }
      }
      await upsertOnmyojiSkills(newId, finalSkills);
    },
    onSuccess: () => {
      onClose();
    },
    successMessage: isNew ? 'Onmyoji created!' : 'Onmyoji updated!',
    errorMessage: 'Failed to save Onmyoji',
    debounceMs: 500
  });

  const handleAddSkill = () => {
    setSkills([...skills, { name: '', description: '', icon: '', type: 'Normal' }]);
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
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border-2 border-border-ink shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b-2 border-border-ink bg-background shrink-0">
          <h2 className="text-xl font-display text-accent-gold tracking-widest uppercase">
            {isNew ? 'Add New Onmyoji' : `Edit: ${onmyoji.name}`}
          </h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleSave()}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-1.5 bg-accent-gold text-background font-bold font-mono text-sm hover:bg-accent-gold/90 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={onClose} className="p-1.5 text-text-secondary hover:text-foreground hover:bg-border-ink/50 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-border-ink bg-background shrink-0">
          <button 
            onClick={() => setActiveTab('basic')}
            className={`px-6 py-3 font-mono text-sm transition-all ${
              activeTab === 'basic' 
                ? 'text-accent-gold border-b-2 border-accent-gold bg-surface' 
                : 'text-text-secondary hover:text-foreground hover:bg-surface/50'
            }`}
          >
            Basic Info
          </button>
          <button 
            onClick={() => setActiveTab('skills')}
            className={`px-6 py-3 font-mono text-sm transition-all ${
              activeTab === 'skills' 
                ? 'text-accent-vermillion border-b-2 border-accent-vermillion bg-surface' 
                : 'text-text-secondary hover:text-foreground hover:bg-surface/50'
            }`}
          >
            Skills
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="max-w-2xl animate-in fade-in space-y-6">
              {!isNew && (
                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1">ID (Read Only)</label>
                  <input 
                    type="text" 
                    value={formData.id} 
                    disabled 
                    className="w-full bg-background border border-border-ink px-3 py-2 text-foreground font-mono opacity-50 cursor-not-allowed"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1">Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-surface border border-border-ink px-3 py-2 font-display text-lg focus:border-accent-gold outline-none transition-colors"
                  placeholder="e.g. Seimei"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1">Role</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-surface border border-border-ink px-3 py-2 text-foreground font-mono text-sm focus:border-accent-gold outline-none transition-colors"
                >
                  <option value="Onmyoji">Onmyoji</option>
                  <option value="Champion">Champion</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-text-secondary mb-2">Icon / Image</label>
                <ImageUpload 
                  initialImage={formData.icon} 
                  onImageSelected={setSelectedFile} 
                />
                
                <div className="mt-3">
                  <label className="block text-[10px] font-mono text-text-secondary mb-1">Or image URL</label>
                  <input 
                    type="text" 
                    value={formData.icon}
                    onChange={e => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full bg-surface border border-border-ink px-3 py-2 text-foreground focus:border-accent-gold outline-none text-xs font-mono"
                    placeholder="https://..."
                  />
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
                        <label className="text-xs font-mono text-text-secondary">Skill Type</label>
                        <select 
                          value={skill.type || 'Normal'}
                          onChange={e => handleUpdateSkill(idx, 'type', e.target.value)}
                          className="w-full bg-surface border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none"
                        >
                          <option value="Normal">Normal</option>
                          <option value="Passive">Passive</option>
                          <option value="Active">Active</option>
                          <option value="Special 1">Special 1</option>
                          <option value="Special 2">Special 2</option>
                          <option value="Linked Skill">Linked Skill</option>
                        </select>
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
                    
                    <div className="space-y-2 h-fit">
                      <div className="flex gap-4">
                        <div className="space-y-2 flex-1">
                          <label className="text-xs font-mono text-text-secondary">Cooldown</label>
                          <input type="number" value={skill.cooldown ?? 0} onChange={e => handleUpdateSkill(idx, 'cooldown', e.target.value)} className="w-full bg-surface border border-border-ink p-2 font-mono text-sm focus:border-accent-vermillion outline-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-text-secondary">Description</label>
                        <RichTextEditor content={skill.description || ''} onChange={html => handleUpdateSkill(idx, 'description', html)} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
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
              ))}
              
              <button 
                onClick={handleAddSkill}
                className="w-full py-4 border border-dashed border-border-ink text-text-secondary font-mono text-sm hover:border-accent-vermillion hover:text-accent-vermillion transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add New Skill
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
