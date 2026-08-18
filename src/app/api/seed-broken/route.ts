import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await prisma.soul.upsert({
      where: { id: 'broken_set' },
      update: {
        name: 'Broken Set',
        twoPiece: 'Any Stat',
        fourPieceEffect: 'No 4-piece effect. Used purely for maximizing raw substats.',
        icon: 'https://yys.res.netease.com/pc/gw/20180913151832/img/icon/icon_1_182f07d.png'
      },
      create: {
        id: 'broken_set',
        name: 'Broken Set',
        twoPiece: 'Any Stat',
        fourPieceEffect: 'No 4-piece effect. Used purely for maximizing raw substats.',
        icon: 'https://yys.res.netease.com/pc/gw/20180913151832/img/icon/icon_1_182f07d.png'
      }
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
