require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DIRECT_URL
});

async function main() {
  const cats = await pool.query('SELECT * FROM "LineupCategory" WHERE name = \'Duel\'');
  console.log("Categories:", cats.rows);
  
  if (cats.rows.length > 0) {
    const subcats = await pool.query('SELECT * FROM "LineupSubcategory" WHERE "categoryId" = $1', [cats.rows[0].id]);
    console.log("Subcategories under Duel:", subcats.rows);
  }
  process.exit(0);
}
main();
