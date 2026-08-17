import { createClient } from '@/utils/supabase/server';
import ShikigamiClient from './ShikigamiClient';

export default async function RosterPage() {
  const supabase = await createClient();

  // Fetch rarities ordered by sortOrder
  const { data: rarities } = await supabase
    .from('Rarity')
    .select('*')
    .order('sortOrder', { ascending: true });

  // Fetch roles
  const { data: roles } = await supabase
    .from('ShikigamiRole')
    .select('*')
    .order('name', { ascending: true });

  // Fetch categories
  const { data: categories } = await supabase
    .from('EvaluationCategory')
    .select('*')
    .order('sortOrder', { ascending: true });

  // Fetch shikigami with their rarity relation
  const { data: shikigamis, error } = await supabase
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
      ),
      skills:ShikigamiSkill(*)
    `);

  if (error) {
    console.error('Error fetching Roster Shikigami:', error);
  }

  return (
    <ShikigamiClient 
      shikigamiData={shikigamis || []} 
      roles={roles || []} 
      categories={categories || []} 
      rarities={rarities || []}
    />
  );
}
