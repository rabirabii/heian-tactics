import { createClient } from '@/utils/supabase/server';
import LineupsClient from './LineupsClient';

export default async function MetaLineupsPage() {
  const supabase = await createClient();

  const [
    { data: shikigamiData },
    { data: onmyojiData },
    { data: soulsData },
    { data: lineupsData },
    { data: lineupTypesData },
    { data: raritiesData },
    { data: rolesData }
  ] = await Promise.all([
    supabase.from('Shikigami').select('id, name, rarityId, rarityRef:Rarity(*), icon, strengths, weaknesses, builds:ShikigamiBuild(*)'),
    supabase.from('Onmyoji').select('*'),
    supabase.from('Soul').select('*'),
    supabase.from('MetaLineup').select(`
      id,
      name,
      subcategoryId,
      subcategory:LineupSubcategory(
        id, name,
        category:LineupCategory(
          id, name,
          type:LineupType(id, name)
        )
      ),
      description,
      strengths,
      weaknesses,
      author,
      createdAt,
      updatedAt,
      slots:LineupSlot(*)
    `),
    supabase.from('LineupType').select(`
      id, name,
      categories:LineupCategory(
        id, name,
        subcategories:LineupSubcategory(id, name)
      )
    `),
    supabase.from('Rarity').select('*').order('sortOrder', { ascending: true }),
    supabase.from('ShikigamiRole').select('*')
  ]);

  return (
    <LineupsClient 
      shikigamiData={shikigamiData || []}
      onmyojiData={onmyojiData || []}
      soulsData={soulsData || []}
      lineupsData={lineupsData || []}
      lineupTypesData={lineupTypesData || []}
      raritiesData={raritiesData || []}
      rolesData={rolesData || []}
    />
  );
}
