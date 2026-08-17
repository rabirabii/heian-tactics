"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import LineupSlotCard from "./LineupSlotCard";

interface LineupHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  headLineup: any;
  shikigamiData: any[];
  onmyojiData: any[];
  soulsData: any[];
}

export default function LineupHistoryModal({
  isOpen,
  onClose,
  headLineup,
  shikigamiData,
  onmyojiData,
  soulsData,
}: LineupHistoryModalProps) {
  const [chain, setChain] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [vOldId, setVOldId] = useState<string>("");
  const [vNewId, setVNewId] = useState<string>("");

  useEffect(() => {
    if (isOpen && headLineup) {
      fetchChain();
    }
  }, [isOpen, headLineup]);

  const fetchChain = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .rpc("get_lineup_chain", { head_id: headLineup.id })
      .select("*, slots:LineupSlot(*)");

    if (error) {
      console.error("Error fetching lineup chain:", error);
    } else if (data && data.length > 0) {
      setChain(data);
      setVNewId(data[0].id); // Newest is index 0
      if (data.length > 1) {
        setVOldId(data[1].id); // Previous is index 1
      } else {
        setVOldId(data[0].id);
      }
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const vOld = chain.find((c) => c.id === vOldId);
  const vNew = chain.find((c) => c.id === vNewId);

  const getShiki = (id: string) => shikigamiData.find((s) => s.id === id);
  const getOnmyoji = (id: string) => onmyojiData.find((o) => o.id === id);
  const getSoul = (id: string) => soulsData.find((s) => s.id === id);

  const renderSlots = (lineup: any, title: string) => {
    if (!lineup) return null;
    
    // Sort slots correctly 1..6
    const sortedSlots = [...(lineup.slots || [])].sort((a, b) => a.slotNumber - b.slotNumber);
    
    const columns = Array.from({ length: 6 }).map((_, i) => {
      const slotNum = i + 1;
      const isSlot6 = slotNum === 6;
      const slot = sortedSlots.find((s: any) => s.slotNumber === slotNum) || { slotNumber: slotNum };
      
      const isFlex = slot.shikigamiId === 'flex' || (!slot.shikigamiId && slot.indicator?.toUpperCase().includes('FLEX'));
      const entity = isSlot6 && slot.onmyojiId ? getOnmyoji(slot.onmyojiId) : getShiki(slot.shikigamiId);

      return {
        type: isSlot6 ? "onmyoji" : "shikigami",
        data: slot,
        displayHero: entity,
        isFlex,
        isPrimaryOwned: true, // Mocked for history view
        isMissing: false,
      };
    });

    return (
      <div className="mb-6">
        <h4 className="text-sm font-mono font-bold text-accent-gold mb-3 tracking-widest">{title}</h4>
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
          {columns.map((col, idx) => (
            <LineupSlotCard
              key={idx}
              col={col as any}
              getSoul={getSoul}
              getOnmyoji={getOnmyoji}
              lineup={lineup}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderTextFieldDiff = (label: string, oldText?: string, newText?: string) => {
    if (oldText === newText) return null; // Unchanged
    return (
      <div className="mb-6">
        <h4 className="text-sm font-mono font-bold text-foreground mb-2 underline decoration-accent-vermillion underline-offset-4">
          {label} (Changed)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-red-900/10 border border-red-900/50 p-3">
            <h5 className="text-xs font-bold text-red-500 mb-2">Old</h5>
            <p className="text-sm font-mono text-text-secondary whitespace-pre-line">{oldText || "(Empty)"}</p>
          </div>
          <div className="bg-green-900/10 border border-green-900/50 p-3">
            <h5 className="text-xs font-bold text-green-500 mb-2">New</h5>
            <p className="text-sm font-mono text-text-secondary whitespace-pre-line">{newText || "(Empty)"}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto custom-scrollbar"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border-ink w-full max-w-5xl shadow-2xl relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border-ink flex justify-between items-center bg-background/50 sticky top-0 z-20">
          <div>
            <h3 className="font-display text-2xl text-accent-gold">
              Lineup History: {headLineup?.name}
            </h3>
            <p className="text-sm font-mono text-text-secondary mt-1">
              Compare different versions of this lineup side-by-side.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-foreground text-2xl px-2"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12 text-text-secondary font-mono animate-pulse">
              Loading history chain...
            </div>
          ) : chain.length > 1 ? (
            <div className="space-y-8">
              {/* Version Selectors */}
              <div className="flex gap-8 items-center bg-background p-4 border border-border-ink">
                <div className="flex-1">
                  <label className="block text-xs font-mono text-red-400 mb-2 uppercase tracking-widest">
                    Older Version
                  </label>
                  <select
                    value={vOldId}
                    onChange={(e) => setVOldId(e.target.value)}
                    className="w-full bg-surface border border-border-ink text-foreground p-2 font-mono text-sm focus:border-red-500 focus:outline-none"
                  >
                    {chain.map((c, i) => (
                      <option key={c.id} value={c.id}>
                        v{chain.length - i} - {new Date(c.updatedAt).toLocaleDateString()} {i === 0 ? "(Current)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="font-display text-2xl text-text-secondary">VS</div>
                <div className="flex-1">
                  <label className="block text-xs font-mono text-green-400 mb-2 uppercase tracking-widest">
                    Newer Version
                  </label>
                  <select
                    value={vNewId}
                    onChange={(e) => setVNewId(e.target.value)}
                    className="w-full bg-surface border border-border-ink text-foreground p-2 font-mono text-sm focus:border-green-500 focus:outline-none"
                  >
                    {chain.map((c, i) => (
                      <option key={c.id} value={c.id}>
                        v{chain.length - i} - {new Date(c.updatedAt).toLocaleDateString()} {i === 0 ? "(Current)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Diff View */}
              {vOldId === vNewId ? (
                <div className="text-center py-12 border border-border-ink border-dashed">
                  <p className="text-text-secondary font-mono">
                    You have selected the same version for both sides.
                  </p>
                </div>
              ) : (
                <div className="mt-8">
                  {/* Slots Side by Side */}
                  <div className="space-y-6 mb-8 border-b border-border-ink pb-8">
                    <div className="relative">
                      <div className="absolute -left-3 top-0 bottom-0 w-1 bg-red-500/50"></div>
                      {renderSlots(vOld, `v${chain.length - chain.findIndex(c => c.id === vOldId)} (Old)`)}
                    </div>
                    <div className="relative mt-8">
                      <div className="absolute -left-3 top-0 bottom-0 w-1 bg-green-500/50"></div>
                      {renderSlots(vNew, `v${chain.length - chain.findIndex(c => c.id === vNewId)} (New)`)}
                    </div>
                  </div>

                  {/* Text Diffs */}
                  <div className="space-y-6">
                    {renderTextFieldDiff("Description", vOld?.description, vNew?.description)}
                    {renderTextFieldDiff("Notes", vOld?.notes, vNew?.notes)}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-text-secondary font-mono">
              No historical versions found for this lineup.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
