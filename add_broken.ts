require('dotenv').config({ path: '.env.local' });
import { prisma } from './src/lib/prisma';

async function main() {
  await prisma.soul.upsert({
    where: { id: 'broken_set' },
    update: {
      name: 'Broken Set',
      twoPiece: 'Any Stat',
      fourPieceEffect: 'No 4-piece effect. Used purely for maximizing raw substats.',
      icon: 'https://yys.res.netease.com/pc/gw/20180913151832/img/icon/icon_1_182f07d.png' // Generic onmyoji icon or can just be an empty icon
    },
    create: {
      id: 'broken_set',
      name: 'Broken Set',
      twoPiece: 'Any Stat',
      fourPieceEffect: 'No 4-piece effect. Used purely for maximizing raw substats.',
      icon: 'https://yys.res.netease.com/pc/gw/20180913151832/img/icon/icon_1_182f07d.png'
    }
  });
  console.log('Broken Set added successfully.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
