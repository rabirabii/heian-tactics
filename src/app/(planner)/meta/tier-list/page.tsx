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
      roleAssignments:ShikigamiRoleAssignment(
        roleId,
        mode,
        role:ShikigamiRole(*)
      ),
      evaluations:ShikigamiEvaluation(
        *,
        category:EvaluationCategory(*)
      )
    `);

  // Fetch rarities
  const { data: rarities } = await supabase
    .from('Rarity')
    .select('*')
    .order('sortOrder');

  return (
    <TierListClient 
      shikigamis={shikigamis || []} 
      roles={roles || []} 
      categories={categories || []} 
      rarities={rarities || []}
    />
  );
}
