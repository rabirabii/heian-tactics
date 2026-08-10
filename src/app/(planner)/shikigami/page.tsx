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
  const { data: shikigamiData, error } = await supabase
    .from('Shikigami')
    .select(`
      id,
      name,
      rarityId,
      rarityRef:Rarity(*),
      icon,
      beginnerFriendly,
      availableGlobal,
      evaluations:ShikigamiEvaluation(
        *,
        category:EvaluationCategory(*)
      ),
      skills:ShikigamiSkill(*)
    `);

  // Fetch role mappings
  const { data: roleLinks } = await supabase
    .from('_ShikigamiToShikigamiRole')
    .select('A, B');

  if (error) {
    console.error('Error fetching Roster Shikigami:', error);
  }

  // Map roles to shikigami
  const mappedShikigami = (shikigamiData || []).map((shiki: any) => {
    const shikiRoleIds = (roleLinks || [])
      .filter((link: any) => link.A === shiki.id)
      .map((link: any) => link.B);
      
    const shikiRoles = (roles || []).filter((r: any) => shikiRoleIds.includes(r.id));
    
    return {
      ...shiki,
      roles: shikiRoles
    };
  });

  return (
    <ShikigamiClient 
      shikigamiData={mappedShikigami} 
      roles={roles || []}
      categories={categories || []}
      rarities={rarities || []}
    />
  );
}
