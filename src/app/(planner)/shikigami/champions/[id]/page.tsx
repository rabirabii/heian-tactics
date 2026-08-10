import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import OnmyojiDetailClient from './OnmyojiDetailClient';

export default async function OnmyojiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const { data: onmyoji, error } = await supabase
    .from('Onmyoji')
    .select(`
      *,
      skills:OnmyojiSkill(*)
    `)
    .eq('id', id)
    .single();

  if (error || !onmyoji) {
    notFound();
  }

  return <OnmyojiDetailClient onmyoji={onmyoji} />;
}
