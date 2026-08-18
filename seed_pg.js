const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.vezsuiccksmhrukdqmvf:k99dw8e3PU9K7Gwy@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
  });
  await client.connect();
  await client.query(`
    INSERT INTO "Soul" (id, name, "twoPiece", "fourPieceEffect", icon)
    VALUES ('broken_set', 'Broken Set', 'Any Stat', 'No 4-piece effect. Used purely for maximizing raw substats.', 'https://yys.res.netease.com/pc/gw/20180913151832/img/icon/icon_1_182f07d.png')
    ON CONFLICT (id) DO NOTHING;
  `);
  console.log('Inserted Broken Set.');
  await client.end();
}

main().catch(console.error);
