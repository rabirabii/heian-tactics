require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DIRECT_URL
});

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Get Duel Category
    const catRes = await client.query('SELECT id FROM "LineupCategory" WHERE name = \'Duel\' LIMIT 1');
    if (catRes.rows.length === 0) throw new Error("Duel category not found");
    const duelId = catRes.rows[0].id;

    // Get subcategories
    const subcats = await client.query('SELECT id, name FROM "LineupSubcategory" WHERE "categoryId" = $1', [duelId]);
    
    const general = subcats.rows.find(s => s.name === 'General');
    const low = subcats.rows.find(s => s.name.includes('Low Tier'));
    const mid = subcats.rows.find(s => s.name.includes('Mid Tier'));
    const high = subcats.rows.find(s => s.name.includes('High Tier'));

    if (!general) throw new Error("General subcategory not found");

    console.log("Renaming General to 'Under Celeb (Tier 1-9)'");
    await client.query('UPDATE "LineupSubcategory" SET name = \'Under Celeb (Tier 1-9)\' WHERE id = $1', [general.id]);

    const oldIds = [low?.id, mid?.id, high?.id].filter(Boolean);
    
    if (oldIds.length > 0) {
      console.log(`Moving lineups from Low/Mid/High to new Under Celeb ID: ${general.id}`);
      const res = await client.query('UPDATE "MetaLineup" SET "subcategoryId" = $1 WHERE "subcategoryId" = ANY($2::text[])', [general.id, oldIds]);
      console.log(`Updated ${res.rowCount} lineups.`);
      
      console.log("Deleting old subcategories");
      await client.query('DELETE FROM "LineupSubcategory" WHERE id = ANY($1::text[])', [oldIds]);
    }
    
    await client.query('COMMIT');
    console.log("Migration complete.");
  } catch (e) {
    await client.query('ROLLBACK');
    console.error("Error during migration:", e);
  } finally {
    client.release();
    pool.end();
  }
}
main();
