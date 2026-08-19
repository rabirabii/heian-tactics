"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { randomBytes, createHash } from "crypto";

export async function generateApiToken(name: string = "Default Token") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Generate a random 32-byte token
  const rawToken = randomBytes(32).toString('hex');
  const tokenString = `ht_pat_${rawToken}`;
  
  // Hash the token for secure storage
  const tokenHash = createHash('sha256').update(tokenString).digest('hex');

  // Ensure user exists in Prisma DB
  await prisma.user.upsert({
    where: { id: user.id },
    create: { id: user.id, email: user.email || '' },
    update: {}
  });

  // Store only the hash in the database
  const apiToken = await prisma.apiToken.create({
    data: {
      userId: user.id,
      name,
      tokenHash,
    }
  });

  // Return the raw string to the user (THIS IS THE ONLY TIME THEY WILL SEE IT)
  return {
    id: apiToken.id,
    name: apiToken.name,
    createdAt: apiToken.createdAt,
    token: tokenString // Unhashed token for the user to copy
  };
}

export async function getApiTokens() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  // Return tokens without revealing the hash
  return await prisma.apiToken.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, lastUsedAt: true, createdAt: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function revokeApiToken(tokenId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  await prisma.apiToken.deleteMany({
    where: {
      id: tokenId,
      userId: user.id
    }
  });

  return { success: true };
}
