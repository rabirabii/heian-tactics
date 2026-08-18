import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import ShikigamiDetailClient from './ShikigamiDetailClient';

export default async function ShikigamiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Await the params before using them in Next 15+
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const shikigami = await prisma.shikigami.findUnique({
    where: { id },
    include: {
      rarityRef: true,
      evaluations: {
        include: { category: true }
      },
      roleAssignments: {
        include: { role: true }
      },
      builds: {
        where: {
          OR: [
            { isPublic: true },
            { authorId: user?.id || 'NO_USER' }
          ]
        },
        include: {
          roleRef: true,
          userAuthor: { select: { username: true } }
        }
      },
      skills: true
    }
  });

  if (!shikigami) {
    notFound();
  }

  return <ShikigamiDetailClient shikigami={shikigami} currentUserId={user?.id} />;
}
