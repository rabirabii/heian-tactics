import { useState } from 'react';
import { X, Sword, Leaf, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ShikigamiPresetData {
  id: string;
  name: string;
  icon: string | null;
  skills: any[];
}

export interface PresetResult {
  grade: number;
  level: number;
  skills: { skillId: string; level: number }[];
  projectId?: string;
}

export default function QuickPresetModal({
  shikigami,
  userProjects,
  onClose,
  onConfirm
}: {
  shikigami: ShikigamiPresetData;
  userProjects: { id: string; title: string }[];
  onClose: () => void;
  onConfirm: (preset: PresetResult) => void;
}) {
  const [mode, setMode] = useState<'SELECT' | 'CUSTOM'>('SELECT');
  const [customGrade, setCustomGrade] = useState(6);
  const [customLevel, setCustomLevel] = useState(40);
  const [customSkills, setCustomSkills] = useState<{ skillId: string; level: number }[]>(
    shikigami.skills.map(s => ({ skillId: s.id, level: 1 }))
  );

  const [selectedProject, setSelectedProject] = useState<string>('');
  
  const handleCombatReady = () => {
    const maxSkills = shikigami.skills.map(s => ({
      skillId: s.id,
      level: s.levelUpgrades ? s.levelUpgrades.length + 1 : 1
    }));
    onConfirm({ grade: 6, level: 40, skills: maxSkills, projectId: selectedProject || undefined });
  };

  const handleFodder = () => {
    const baseSkills = shikigami.skills.map(s => ({ skillId: s.id, level: 1 }));
    onConfirm({ grade: 2, level: 1, skills: baseSkills, projectId: selectedProject || undefined });
  };

  const handleCustomConfirm = () => {
    onConfirm({ grade: customGrade, level: customLevel, skills: customSkills, projectId: selectedProject || undefined });
  };

  const updateCustomSkill = (skillId: string, level: number) => {
    setCustomSkills(prev => prev.map(s => s.skillId === skillId ? { ...s, level } : s));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border-ink max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border-ink bg-background/50">
          <div className="flex items-center gap-3">
            {shikigami.icon ? (
              <img src={shikigami.icon} alt={shikigami.name} className="w-10 h-10 object-cover border border-border-ink" />
            ) : (
              <div className="w-10 h-10 bg-border-ink/20 flex items-center justify-center border border-border-ink">?</div>
            )}
            <div>
              <h2 className="text-lg font-display text-foreground leading-none">Add to Roster</h2>
              <div className="text-sm font-mono text-text-secondary mt-1">{shikigami.name}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-text-secondary hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {userProjects && userProjects.length > 0 && (
          <div className="px-6 pt-4 border-b border-border-ink pb-4 bg-surface">
            <label className="block text-xs font-mono text-text-secondary mb-1">Assign to Project (Optional)</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full bg-background border border-border-ink p-2 font-mono text-sm text-foreground focus:border-accent-vermillion outline-none"
            >
              <option value="">-- None --</option>
              {userProjects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        )}

        <div className="p-6">
          {mode === 'SELECT' ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-mono text-text-secondary mb-2 text-center">Select initial status for {shikigami.name}:</p>
              
              <button 
                onClick={handleCombatReady}
                className="group relative overflow-hidden p-4 border border-border-ink bg-background hover:border-accent-gold hover:bg-accent-gold/5 transition-all flex items-center gap-4 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-border-ink/20 group-hover:bg-accent-gold/20 transition-colors flex items-center justify-center flex-shrink-0">
                  <Sword className="w-5 h-5 text-text-secondary group-hover:text-accent-gold transition-colors" />
                </div>
                <div>
                  <div className="font-display text-lg text-foreground group-hover:text-accent-gold transition-colors">Combat Ready</div>
                  <div className="text-sm font-mono text-text-secondary mt-1">G6 • Lv. 40 • Max Skills</div>
                </div>
              </button>

              <button 
                onClick={handleFodder}
                className="group p-4 border border-border-ink bg-background hover:border-green-500/50 hover:bg-green-500/5 transition-all flex items-center gap-4 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-border-ink/20 group-hover:bg-green-500/20 transition-colors flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-5 h-5 text-text-secondary group-hover:text-green-500 transition-colors" />
                </div>
                <div>
                  <div className="font-display text-lg text-foreground group-hover:text-green-400 transition-colors">Work in Progress / Fodder</div>
                  <div className="text-sm font-mono text-text-secondary mt-1">G2 • Lv. 1 • Base Skills</div>
                </div>
              </button>

              <button 
                onClick={() => setMode('CUSTOM')}
                className="group mt-2 p-3 border border-dashed border-border-ink text-text-secondary hover:text-accent-vermillion hover:border-accent-vermillion hover:bg-accent-vermillion/5 transition-all flex items-center justify-center gap-2 font-mono text-sm"
              >
                <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" /> Custom Configuration
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-mono text-text-secondary mb-1">Grade (Stars)</label>
                  <select 
                    value={customGrade}
                    onChange={(e) => setCustomGrade(Number(e.target.value))}
                    className="w-full bg-background border border-border-ink p-2 font-mono text-sm text-foreground focus:border-accent-vermillion outline-none"
                  >
                    {[2,3,4,5,6].map(g => (
                      <option key={g} value={g}>Grade {g}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-mono text-text-secondary mb-1">Level</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={40} 
                    value={customLevel}
                    onChange={(e) => setCustomLevel(Number(e.target.value))}
                    className="w-full bg-background border border-border-ink p-2 font-mono text-sm text-foreground focus:border-accent-vermillion outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-text-secondary mb-3 border-b border-border-ink pb-2">Skill Levels</label>
                <div className="flex flex-col gap-4">
                  {shikigami.skills.sort((a,b) => (a.sortOrder||0) - (b.sortOrder||0)).map((skill) => {
                    const maxLvl = skill.levelUpgrades ? skill.levelUpgrades.length + 1 : 1;
                    const currentLvl = customSkills.find(s => s.skillId === skill.id)?.level || 1;
                    
                    return (
                      <div key={skill.id} className="flex items-center gap-3">
                        {skill.icon ? (
                          <img src={skill.icon} alt={skill.name} className="w-8 h-8 object-cover border border-border-ink bg-background" />
                        ) : (
                          <div className="w-8 h-8 border border-border-ink bg-background flex items-center justify-center text-xs text-text-secondary font-mono">S</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-foreground truncate">{skill.name}</div>
                          <div className="flex gap-1 mt-1">
                            {Array.from({ length: maxLvl }).map((_, idx) => {
                              const lvl = idx + 1;
                              const isActive = lvl <= currentLvl;
                              return (
                                <button
                                  key={lvl}
                                  onClick={() => updateCustomSkill(skill.id, lvl)}
                                  className={`w-6 h-6 text-xs font-mono border flex items-center justify-center transition-colors ${
                                    isActive 
                                      ? 'bg-accent-vermillion border-accent-vermillion text-surface' 
                                      : 'bg-background border-border-ink text-text-secondary hover:border-text-secondary'
                                  }`}
                                >
                                  {lvl}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {shikigami.skills.length === 0 && (
                    <div className="text-sm font-mono text-text-secondary italic">No skills found in database.</div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border-ink">
                <Button variant="outline" onClick={() => setMode('SELECT')} className="flex-1">Back</Button>
                <Button onClick={handleCustomConfirm} className="flex-1">Add to Roster</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
