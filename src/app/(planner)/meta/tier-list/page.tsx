import { createClient } from '@/utils/supabase/server';
import TierListClient from './TierListClient';

export default async function TierListPage() {
  const supabase = await createClient();

  // Fetch roles
  const { data: roles } = await supabase
    .from('ShikigamiRole')
    .select('*')
    .order('name');

  // Fetch evaluation categories
  const { data: categories } = await supabase
    .from('EvaluationCategory')
    .select('*')
    .order('sortOrder');

  // Fetch Shikigamis with their roles and evaluations
  const { data: shikigamis } = await supabase
    .from('Shikigami')
    .select(`
      id,
      name,
      icon,
      rarityId,
      beginnerFriendly,
      availableGlobal,
      rarityRef:Rarity(*),
      evaluations:ShikigamiEvaluation(
        *,
        category:EvaluationCategory(*)
      )
    `);

  // We need to fetch the Shikigami Roles via the join table manually, as Prisma implicit many-to-many 
  // isn't nested seamlessly in PostgREST without an explicit join entity.
  const { data: roleLinks } = await supabase
    .from('_ShikigamiToShikigamiRole')
    .select('A, B');

  // Map Shikigamis to their roles
  const mappedShikigamis = shikigamis?.map(shiki => {
    const shikiRoleIds = roleLinks?.filter(link => link.A === shiki.id).map(link => link.B) || [];
    const shikiRoles = roles?.filter(r => shikiRoleIds.includes(r.id)) || [];
    return {
      ...shiki,
      roles: shikiRoles
    };
  }) || [];

  // Fetch rarities
  const { data: rarities } = await supabase
    .from('Rarity')
    .select('*')
    .order('sortOrder');

  return (
    <TierListClient 
      shikigamis={mappedShikigamis} 
      roles={roles || []} 
      categories={categories || []} 
      rarities={rarities || []}
    />
  );
}
