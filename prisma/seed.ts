import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { loadEnvConfig } from '@next/env';
import shikigamiData from '../src/data/shikigami.json' with { type: 'json' };
import soulsData from '../src/data/souls.json' with { type: 'json' };
import lineupsData from '../src/data/meta-lineups.json' with { type: 'json' };
import metaBuildsData from '../src/data/meta-builds.json' with { type: 'json' };

loadEnvConfig(process.cwd());

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...');

  // 1. Seed Rarity
  console.log('Seeding Rarity...');
  const rarities = [
    { id: 'UR', name: 'UR', sortOrder: 1 },
    { id: 'SP', name: 'SP', sortOrder: 2 },
    { id: 'SSR', name: 'SSR', sortOrder: 3 },
    { id: 'SR', name: 'SR', sortOrder: 4 },
    { id: 'R', name: 'R', sortOrder: 5 },
    { id: 'N', name: 'N', sortOrder: 6 },
  ];
  for (const r of rarities) {
    await prisma.rarity.upsert({
      where: { id: r.id },
      update: { name: r.name, sortOrder: r.sortOrder },
      create: { id: r.id, name: r.name, sortOrder: r.sortOrder },
    });
  }

  // 2. Seed Lineup Types & Categories
  console.log('Seeding Lineup Types & Categories...');
  const types = ['PvE', 'PvP'];
  for (const t of types) {
    await prisma.lineupType.upsert({
      where: { id: t },
      update: { name: t },
      create: { id: t, name: t },
    });
  }

  // Hardcode some categories for the seed
  const catMap: Record<string, string> = {
    'PvE - Soul Zone': 'Soul Zone',
    'PvE - Demon Encounter': 'Demon Encounter',
    'PvP - Duel': 'Duel',
  };

  const subCatMap: Record<string, string[]> = {
    'Soul Zone': ['S11 / Moan', 'S12 / Judgement'],
    'Demon Encounter': ['Ghostly Songstress', 'Odokuro', 'Namazu', 'Tsuchigumo'],
    'Duel': ['Low Tier (Tier 1-4)', 'Mid Tier (Tier 5-7)', 'High Tier (Tier 8-9)', 'Celebrity'],
  };

  for (const [fullCat, catName] of Object.entries(catMap)) {
    const typeId = fullCat.startsWith('PvP') ? 'PvP' : 'PvE';
    
    // Check if category exists
    let cat = await prisma.lineupCategory.findFirst({ where: { name: catName, typeId } });
    if (!cat) {
      cat = await prisma.lineupCategory.create({
        data: { name: catName, typeId },
      });
    }

    // Seed subcategories
    if (subCatMap[catName]) {
      for (const subName of subCatMap[catName]) {
        const sub = await prisma.lineupSubcategory.findFirst({ where: { name: subName, categoryId: cat.id } });
        if (!sub) {
          await prisma.lineupSubcategory.create({
            data: { name: subName, categoryId: cat.id },
          });
        }
      }
    }
  }

  // 3. Seed Souls
  console.log('Seeding Souls...');
  for (const soul of soulsData) {
    await prisma.soul.upsert({
      where: { id: soul.id },
      update: {
        name: soul.name,
        twoPiece: soul.twoPiece,
        fourPieceEffect: (soul as any).effect || '',
        icon: soul.icon,
      },
      create: {
        id: soul.id,
        name: soul.name,
        twoPiece: soul.twoPiece,
        fourPieceEffect: (soul as any).effect || '',
        icon: soul.icon,
      },
    });
  }

  // 3.5 Seed Roles & Evaluation Categories
  console.log('Seeding Roles & Evaluation Categories...');
  const roles = [
    { id: 'aoe_dps', name: 'AoE DPS' },
    { id: 'st_dps', name: 'ST DPS' },
    { id: 'orb_provider', name: 'Orb Provider' },
    { id: 'puller', name: 'Movebar (Puller/Pusher)' },
    { id: 'cc', name: 'Control (CC)' },
    { id: 'healer', name: 'Healer / Shielder' },
    { id: 'support', name: 'Support / Buffer' },
  ];
  for (const role of roles) {
    await prisma.shikigamiRole.upsert({
      where: { id: role.id },
      update: { name: role.name },
      create: role,
    });
  }

  const evalCats = [
    { id: 'pve_overall', name: 'Overall PvE', group: 'pve', isOverall: true, sortOrder: 1 },
    { id: 'pve_farming', name: 'Farming (Exploration/Evo)', group: 'pve', isOverall: false, sortOrder: 2 },
    { id: 'pve_boss', name: 'Demon Encounter / Bosses', group: 'pve', isOverall: false, sortOrder: 3 },
    { id: 'pve_secret', name: 'Secret Zones', group: 'pve', isOverall: false, sortOrder: 4 },
    { id: 'pve_soul', name: 'Soul Zones', group: 'pve', isOverall: false, sortOrder: 5 },
    { id: 'pvp_overall', name: 'Overall PvP', group: 'pvp', isOverall: true, sortOrder: 1 },
    { id: 'pvp_duel', name: 'Duel', group: 'pvp', isOverall: false, sortOrder: 2 },
    { id: 'pvp_realm', name: 'Realm Raid', group: 'pvp', isOverall: false, sortOrder: 3 },
  ];
  for (const cat of evalCats) {
    await prisma.evaluationCategory.upsert({
      where: { id: cat.id },
      update: { name: cat.name, group: cat.group, isOverall: cat.isOverall, sortOrder: cat.sortOrder },
      create: cat,
    });
  }

  // 4. Seed Shikigami (Master Data)
  console.log('Seeding Shikigami...');
  for (const shiki of shikigamiData) {
    // Upsert the base shikigami record
    const createdShiki = await prisma.shikigami.upsert({
      where: { id: shiki.id },
      update: {
        name: shiki.name,
        rarity: shiki.rarity,
        rarityId: shiki.rarity,
        icon: shiki.icon,
        beginnerFriendly: (shiki as any).beginnerFriendly || false,
        strengths: (shiki as any).strengths || [],
        weaknesses: (shiki as any).weaknesses || [],
      },
      create: {
        id: shiki.id,
        name: shiki.name,
        rarity: shiki.rarity,
        rarityId: shiki.rarity,
        icon: shiki.icon,
        beginnerFriendly: (shiki as any).beginnerFriendly || false,
        strengths: (shiki as any).strengths || [],
        weaknesses: (shiki as any).weaknesses || [],
      },
    });

    // Link Roles via RoleAssignments
    if ((shiki as any).roles && Array.isArray((shiki as any).roles)) {
      const roleAssignments = (shiki as any).roles.flatMap((r: string) => [
        { roleId: r, mode: 'PvE' },
        { roleId: r, mode: 'PvP' }
      ]);
      await prisma.shikigami.update({
        where: { id: shiki.id },
        data: {
          roleAssignments: {
            create: roleAssignments
          }
        }
      });
    }

    // Upsert Evaluations
    const scores = ['SS', 'S', 'A', 'B'];
    const getRandomScore = () => scores[Math.floor(Math.random() * scores.length)];
    
    // Automatically seed some dummy evaluations for Tier List visualization
    const dummyEvals = [
      { categoryId: 'pve_overall', score: getRandomScore() },
      { categoryId: 'pve_farming', score: getRandomScore() },
      { categoryId: 'pve_boss', score: getRandomScore() },
      { categoryId: 'pve_secret', score: getRandomScore() },
      { categoryId: 'pvp_overall', score: getRandomScore() },
      { categoryId: 'pvp_duel', score: getRandomScore() },
    ];
    
    for (const ev of dummyEvals) {
      const existing = await prisma.shikigamiEvaluation.findUnique({
        where: {
          shikigamiId_categoryId: {
            shikigamiId: shiki.id,
            categoryId: ev.categoryId
          }
        }
      });
      if (!existing) {
        await prisma.shikigamiEvaluation.create({
          data: {
            shikigamiId: shiki.id,
            categoryId: ev.categoryId,
            score: ev.score,
            notes: "Dummy evaluation"
          }
        });
      }
    }
  }

  // 5. Seed Lineups
  console.log('Seeding Lineups...');
  for (const lineup of lineupsData) {
    // Determine category mapping
    const typeId = lineup.category.startsWith('PvP') ? 'PvP' : 'PvE';
    const catName = catMap[lineup.category] || 'General';
    
    // Find category
    let cat = await prisma.lineupCategory.findFirst({ where: { name: catName, typeId } });
    if (!cat) {
      cat = await prisma.lineupCategory.create({ data: { name: catName, typeId } });
    }
    
    // Default subcategory
    let subName = catName === 'Soul Zone' ? 'S11 / Moan' : 'General';
    let sub = await prisma.lineupSubcategory.findFirst({ where: { name: subName, categoryId: cat.id } });
    if (!sub) {
      sub = await prisma.lineupSubcategory.create({ data: { name: subName, categoryId: cat.id } });
    }

    await prisma.metaLineup.upsert({
      where: { id: lineup.id },
      update: {
        name: lineup.name,
        subcategoryId: sub.id,
        description: lineup.description,
        notes: lineup.notes || '',
        beginnerFriendly: (lineup as any).beginnerFriendly || false,
        strengths: (lineup as any).strengths || [],
        weaknesses: lineup.weaknesses || [],
        author: 'System',
      },
      create: {
        id: lineup.id,
        name: lineup.name,
        subcategoryId: sub.id,
        description: lineup.description,
        notes: lineup.notes || '',
        beginnerFriendly: (lineup as any).beginnerFriendly || false,
        strengths: (lineup as any).strengths || [],
        weaknesses: lineup.weaknesses || [],
        author: 'System',
      },
    });
  }

  // 6. Seed Community Builds
  console.log('Seeding Community Builds...');
  await prisma.shikigamiBuild.deleteMany({});
  
  const roleMapping: Record<string, string> = {
    'Orbs / Support (PVP)': 'orb_provider',
    'Support (PvE)': 'support',
    'Pusher, CC': 'puller',
    'AoE DPS': 'aoe_dps',
    'Single Target DPS': 'st_dps'
  };

  for (const build of metaBuildsData) {
    const matchedRoleId = roleMapping[build.role] || 'support';

    await prisma.shikigamiBuild.create({
      data: {
        shikigamiId: build.shikigamiId,
        roleId: matchedRoleId,
        soulChoices: build.soulChoices,
        slot2: build.slotStats ? build.slotStats.split('/')[0]?.trim() || null : null,
        slot4: build.slotStats ? build.slotStats.split('/')[1]?.trim() || null : null,
        slot6: build.slotStats ? build.slotStats.split('/')[2]?.trim() || null : null,
        substats: build.substats,
        breakpoint: build.breakpoint,
        notes: build.notes || null,
      },
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
