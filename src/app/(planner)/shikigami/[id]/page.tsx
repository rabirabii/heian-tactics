import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import ShikigamiDetailClient from './ShikigamiDetailClient';

export default async function ShikigamiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  
  // Await the params before using them in Next 15+
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const { data: shikigami, error } = await supabase
    .from('Shikigami')
    .select(`
      *,
      rarityRef:Rarity(*),
      evaluations:ShikigamiEvaluation(
        *,
        category:EvaluationCategory(*)
      ),
      roleAssignments:ShikigamiRoleAssignment(
        roleId,
        mode,
        role:ShikigamiRole(*)
      ),
      builds:ShikigamiBuild(
        *,
        roleRef:ShikigamiRole(*)
      ),
      skills:ShikigamiSkill(*)
    `)
    .eq('id', id)
    .single();

  if (error || !shikigami) {
    notFound();
  }

  return <ShikigamiDetailClient shikigami={shikigami} />;
}
