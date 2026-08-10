'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import EditOnmyojiModal from '@/components/EditOnmyojiModal';
import { deleteOnmyoji } from '@/app/actions/onmyoji';
import { Plus, Trash2, Edit, X } from 'lucide-react';

export default function OnmyojiClient({
  onmyojiData,
  user
}: {
  onmyojiData: any[];
  user: User | null;
}) {
  const [selectedChamp, setSelectedChamp] = useState<any | null>(null);
  const [editingChamp, setEditingChamp] = useState<any | null>(null);
  const [isAddingChamp, setIsAddingChamp] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2);
  };

  // For testing purposes, we enable admin features for everyone (or you can restrict to user !== null)
  const isAdmin = true; // user?.user_metadata?.role === 'ADMIN' || user?.email === 'admin@gmail.com';

  const handleDeleteOnmyoji = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this Onmyoji?")) return;
    try {
      await deleteOnmyoji(id);
      if (selectedChamp?.id === id) setSelectedChamp(null);
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    }
  };

  return (
    <div className="space-y-6 relative flex h-full">
      <div className={`flex-1 transition-all ${selectedChamp ? 'pr-80' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-display text-foreground tracking-wide">Onmyoji & Champions</h1>
            <p className="text-text-secondary mt-1 font-mono text-sm">
              View and manage your Onmyoji and special Champions.
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setIsAddingChamp(true)}
              className="bg-accent-vermillion text-background px-4 py-2 font-mono text-sm hover:bg-accent-vermillion/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Onmyoji
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mt-8">
          {onmyojiData.map((champ) => {
            return (
              <div
                key={champ.id}
                className="relative group flex flex-col items-center gap-3 p-4 border border-border-ink bg-surface hover:border-accent-vermillion cursor-pointer transition-all"
                onClick={() => setSelectedChamp(champ)}
              >
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingChamp(champ); }}
                      className="bg-background p-1 border border-border-ink text-text-secondary hover:text-accent-gold"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteOnmyoji(champ.id, e)}
                      className="bg-background p-1 border border-border-ink text-text-secondary hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
                
                <div className="relative w-24 h-24 bg-background border border-border-ink rounded-full overflow-hidden flex items-center justify-center">
                  {champ.icon ? (
                    <img src={champ.icon} alt={champ.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => e.currentTarget.style.display = 'none'} />
                  ) : (
                    <span className="text-2xl font-display text-text-secondary">{getInitials(champ.name)}</span>
                  )}
                </div>
                
                <div className="text-center w-full">
                  <div className="text-sm font-bold text-foreground font-display">
                    {champ.name}
                  </div>
                  <div className="text-xs font-mono text-text-secondary mt-1">
                    {champ.skills?.length || 0} Skills
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide-out Sheet for Details */}
      {selectedChamp && (
        <div className="fixed top-0 right-0 h-screen w-80 bg-surface border-l border-border-ink shadow-2xl z-40 p-6 overflow-y-auto flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-4 items-center">
              {selectedChamp.icon ? (
                <img src={selectedChamp.icon} alt={selectedChamp.name} className="w-12 h-12 border border-border-ink bg-background object-cover" referrerPolicy="no-referrer" onError={(e) => e.currentTarget.style.display = 'none'} />
              ) : (
                <div className="w-12 h-12 border border-border-ink bg-background flex items-center justify-center">
                  <span className="text-lg font-display text-text-secondary">{getInitials(selectedChamp.name)}</span>
                </div>
              )}
              <div>
                <h3 className="text-xl font-display text-foreground flex items-center gap-2">
                  {selectedChamp.name}
                </h3>
                <div className="flex gap-2 items-center mt-1">
                  <span className="text-xs font-mono text-accent-gold border border-accent-gold px-1 py-0.5 uppercase">{selectedChamp.role || 'ONMYOJI'}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <button onClick={() => setSelectedChamp(null)} className="text-text-secondary hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 space-y-6">
            <div>
              <div className="flex justify-between items-center border-b border-border-ink pb-1 mb-3">
                <h3 className="text-sm font-mono text-text-secondary">Available Skills</h3>
              </div>
              <div className="space-y-3">
                {selectedChamp.skills?.map((skill: any) => (
                  <div key={skill.id} className="bg-background p-3 border border-border-ink group relative">
                    <div className="flex items-center gap-3 mb-2">
                      {skill.icon && (
                        <div className="w-8 h-8 bg-surface border border-border-ink overflow-hidden flex-shrink-0">
                          <img src={skill.icon} alt={skill.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => e.currentTarget.style.display = 'none'} />
                        </div>
                      )}
                      <span className="font-bold text-sm text-foreground mr-2">{skill.name}</span>
                      {skill.cooldown !== null && skill.cooldown > 0 && (
                        <span className="text-[10px] font-mono border border-border-ink text-text-secondary px-1 py-0.5">
                          CD: {skill.cooldown}
                        </span>
                      )}
                    </div>
                    <div 
                      className="prose prose-invert prose-sm max-w-none text-xs font-mono text-text-secondary mb-3 [&_img]:inline-block [&_img]:h-4 [&_img]:w-4 [&_img]:align-middle [&_img]:mx-1 [&_p]:inline" 
                      dangerouslySetInnerHTML={{ __html: skill.description }} 
                    />
                    {skill.levelUpgrades?.length > 0 && (
                      <div className="pt-2 border-t border-border-ink/50 mt-2">
                        <ul className="space-y-1">
                          {skill.levelUpgrades.map((lvl: string, i: number) => (
                            <li key={i} className="text-[10px] font-mono text-text-secondary flex gap-2">
                              <span className="text-accent-gold/70 shrink-0">Lv.{i+2}</span>
                              <span>{lvl}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
                {(!selectedChamp.skills || selectedChamp.skills.length === 0) && (
                  <p className="text-xs font-mono text-text-secondary italic">No skills added yet.</p>
                )}
              </div>
            </div>
          </div>
          
          {isAdmin && (
            <div className="mt-4 pt-4 border-t border-border-ink shrink-0 flex gap-2 justify-center">
              <button 
                onClick={() => { setEditingChamp(selectedChamp); setSelectedChamp(null); }}
                title={`Edit ${selectedChamp.name}`}
                className="flex items-center justify-center p-3 bg-surface border border-border-ink hover:border-accent-gold transition-colors text-text-secondary hover:text-accent-gold"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button 
                onClick={(e) => { handleDeleteOnmyoji(selectedChamp.id, e); setSelectedChamp(null); }}
                title="Delete"
                className="flex items-center justify-center p-3 bg-surface border border-border-ink hover:border-red-500 transition-colors text-text-secondary hover:text-red-500"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="mt-4 shrink-0">
            <Link 
              href={`/shikigami/champions/${selectedChamp.id}`}
              className="flex items-center justify-center w-full bg-accent-vermillion hover:bg-accent-vermillion/90 text-white font-display py-3 px-4 transition-colors"
            >
              View Full Profile ➔
            </Link>
          </div>
        </div>
      )}
      
      {(isAddingChamp || editingChamp) && (
        <EditOnmyojiModal
          onmyoji={editingChamp}
          onClose={() => {
            setIsAddingChamp(false);
            setEditingChamp(null);
          }}
        />
      )}
    </div>
  );
}
