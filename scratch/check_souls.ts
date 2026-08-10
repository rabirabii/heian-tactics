import { prisma } from '../src/lib/prisma';

async function main() {
  const souls = await prisma.soul.findMany()
  console.log("Total Souls:", souls.length)
  if (souls.length > 0) {
    console.log("Sample Soul:", souls[0])
    console.log("Souls with fourPieceEffect:", souls.filter(s => s.fourPieceEffect).length)
  }
}
main()
