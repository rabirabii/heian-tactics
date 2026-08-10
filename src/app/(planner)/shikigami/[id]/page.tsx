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

  // Fetch roles manually to construct full object if needed
  // Note: Prisma many-to-many doesn't cleanly map to PostgREST single select for nested arrays easily without join tables, 
  // so we fetch the join table _ShikigamiToShikigamiRole for this specific shikigami
  const { data: roleLinks } = await supabase
    .from('_ShikigamiToShikigamiRole')
    .select('B')
    .eq('A', id);

  const roleIds = roleLinks?.map(link => link.B) || [];
  
  let roles = [];
  if (roleIds.length > 0) {
    const { data: rolesData } = await supabase
      .from('ShikigamiRole')
      .select('*')
      .in('id', roleIds);
    roles = rolesData || [];
  }
  
  const fullShikigami = {
    ...shikigami,
    roles
  };

  return <ShikigamiDetailClient shikigami={fullShikigami} />;
}
