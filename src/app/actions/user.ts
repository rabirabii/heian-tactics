'use server';

import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function setUsername(username: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  if (!username || username.trim().length < 3) {
    throw new Error("Username must be at least 3 characters long");
  }

  const existing = await prisma.user.findUnique({ where: { username: username.trim() } });
  if (existing && existing.id !== user.id) {
    throw new Error("Username already taken. Please choose another one.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { username: username.trim() }
  });

  revalidatePath('/', 'layout');
  return true;
}
