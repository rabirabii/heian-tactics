"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/features/dashboard/dashboard-shell";
import { useProgressionStore } from "@/store/progression-store";
import { Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";

export function RosterPage() {
  const unitsMap = useProgressionStore((state) => state.units);
  const units = useMemo(() => Object.values(unitsMap), [unitsMap]);
  const registerUnit = useProgressionStore((state) => state.registerUnit);
  const updateGradeProgress = useProgressionStore((state) => state.updateGradeProgress);
  const updateSkillProgress = useProgressionStore((state) => state.updateSkillProgress);
  const removeUnit = useProgressionStore((state) => state.removeUnit);

  const [newUnitName, setNewUnitName] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;
    const unitId = `unit-${Date.now()}`;
    registerUnit(unitId, newUnitName.trim());
    setNewUnitName("");
  };

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        title="Roster"
        description="Track your current unit collection, their grades, and skill levels."
        action={
          <form onSubmit={handleRegister} className="flex items-center gap-2">
            <Input
              value={newUnitName}
              onChange={(e) => setNewUnitName(e.target.value)}
              placeholder="Shikigami Name"
              className="w-48 text-sm"
            />
            <Button type="submit" size="sm" variant="default" className="gap-1.5 shrink-0">
              <Plus size={16} />
              Register Unit
            </Button>
          </form>
        }
      />

      <div className="border border-[var(--border-ink)] bg-[var(--surface)] rounded-[var(--radius-medium)] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-ink)] bg-[var(--surface)] text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              <th className="py-3 px-4">Unit Name</th>
              <th className="py-3 px-4 w-32">Current Grade</th>
              <th className="py-3 px-4 w-48">Skills (e.g. 5,1,5)</th>
              <th className="py-3 px-4 w-16 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {units.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-[var(--text-secondary)] font-mono text-xs border-b border-[var(--border-ink)]">
                  Your roster is empty. Register a new unit to begin tracking.
                </td>
              </tr>
            ) : (
              units.map((unit) => (
                <tr key={unit.unitId} className="border-b border-[var(--border-ink)] hover:bg-[var(--surface-hover)] transition-colors group">
                  <td className="py-3 px-4 font-bold text-[var(--foreground)]">
                    {unit.name}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      className="h-8 text-xs font-medium bg-[var(--surface)] border border-[var(--border-ink)] rounded px-2 text-[var(--foreground)]"
                      value={unit.gradeProgress.currentGrade}
                      onChange={(e) => updateGradeProgress(unit.unitId, { currentGrade: Number(e.target.value) as any })}
                    >
                      {[2, 3, 4, 5, 6].map((g) => (
                        <option key={g} value={g}>Grade {g}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <Input
                      className="h-8 text-xs font-mono w-24 tracking-widest text-center"
                      value={unit.skillProgress.currentSkills.join(',')}
                      onChange={(e) => {
                        const parts = e.target.value.split(',').map(n => parseInt(n.trim(), 10));
                        if (parts.length > 0 && parts.every(n => !isNaN(n) && n >= 1 && n <= 5)) {
                          updateSkillProgress(unit.unitId, { currentSkills: parts });
                        }
                      }}
                      placeholder="1,1,1"
                    />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[var(--destructive)] opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeUnit(unit.unitId)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}