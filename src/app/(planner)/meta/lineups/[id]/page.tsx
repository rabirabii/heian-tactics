import { createClient } from '@/utils/supabase/server';
import LineupDetailClient from './LineupDetailClient';

export default async function LineupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  // Fetch the specific lineup and its relations
  const { data: lineup, error } = await supabase
    .from('MetaLineup')
    .select(`
      id,
      name,
      description,
      weaknesses,
      notes,
      subcategory:LineupSubcategory(
        id, name,
        category:LineupCategory(
          id, name,
          type:LineupType(id, name)
        )
      ),
      scenarios:LineupScenario(
        id,
        type,
        scenarioName,
        condition,
        solution,
        picks,
        conditions,
        solutionSlots,
        enemySlots,
        baseLineupId,
        baseEnemyLineupId
      ),
      slots:LineupSlot(*)
    `)
    .eq('id', id)
    .single();

  if (error || !lineup) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h1 className="text-3xl font-display text-accent-vermillion">Lineup Not Found</h1>
        <a href="/meta/lineups" className="mt-4 px-4 py-2 bg-surface border border-border-ink hover:text-foreground">
          Return to Lineups
        </a>
      </div>
    );
  }

  // Fetch shikigami and souls data for rendering
  const [
    { data: shikigamiData },
    { data: soulsData },
    { data: onmyojiData },
    { data: onmyojiSkillData }
  ] = await Promise.all([
    supabase.from('Shikigami').select('id, name, icon'),
    supabase.from('Soul').select('id, name, icon'),
    supabase.from('Onmyoji').select('id, name, icon'),
    supabase.from('OnmyojiSkill').select('id, name, icon')
  ]);

  // Find any imported base lineups in scenarios
  const baseLineupIds = Array.from(new Set(
    lineup.scenarios?.flatMap((sc: any) => [sc.baseLineupId, sc.baseEnemyLineupId]).filter(Boolean) || []
  ));

  let relatedLineups: any[] = [];
  if (baseLineupIds.length > 0) {
    const { data: relatedData } = await supabase
      .from('MetaLineup')
      .select('id, slots:LineupSlot(*)')
      .in('id', baseLineupIds as string[]);
    if (relatedData) relatedLineups = relatedData;
  }

  return (
    <LineupDetailClient 
      lineup={lineup} 
      shikigamiData={shikigamiData || []} 
      soulsData={soulsData || []} 
      onmyojiData={onmyojiData || []}
      onmyojiSkillData={onmyojiSkillData || []}
      relatedLineups={relatedLineups}
    />
  );
}
