const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

async function scrapeWiki() {
  console.log("Reading Onmyoji Fandom Wiki local dump...");
  const htmlPath = "C:\\Users\\USER\\.gemini\\antigravity\\brain\\56a28fe2-666e-4b41-b450-d2a79e35cc99\\.system_generated\\steps\\2271\\content.md";
  const html = fs.readFileSync(htmlPath, 'utf8');
  const $ = cheerio.load(html);

  const shikigami = [];

  $('table.article-table tr').each((i, el) => {
    const tds = $(el).find('td');
    if (tds.length < 3) return;
    
    // Look for name in a link
    let name = "";
    $(tds).find('a[title]').each((_, a) => {
       const t = $(a).attr('title');
       if (t && !t.startsWith('Category:') && !name) {
           name = t;
       }
    });
    
    // Fallback if structured differently (sometimes just text in the second TD)
    if (!name) {
       name = $(tds).eq(1).text().trim();
    }
    
    if (!name || name === "Category:SSR" || name.startsWith("Category:")) return;

    // Rarity in data-sort-value
    let rarity = "Unknown";
    $(tds).each((_, td) => {
      const sortVal = $(td).attr('data-sort-value');
      if (sortVal && ['SP', 'SSR', 'SR', 'R', 'N', 'C'].includes(sortVal)) {
        rarity = sortVal;
      }
    });
    
    // If rarity not found via data-sort-value, check text or image alt
    if (rarity === "Unknown") {
       const possibleRarityStr = $(el).text();
       if (possibleRarityStr.includes('SSR')) rarity = 'SSR';
       else if (possibleRarityStr.includes('SP')) rarity = 'SP';
       else if (possibleRarityStr.includes('SR')) rarity = 'SR';
       else if (possibleRarityStr.includes('R')) rarity = 'R';
       else if (possibleRarityStr.includes('N')) rarity = 'N';
    }

    // Extract image URL
    let icon = "";
    const imgTag = $(el).find('img.mw-file-element').first();
    if (imgTag.length > 0) {
      icon = imgTag.attr('data-src') || imgTag.attr('src');
      if (icon) {
        icon = icon.split('/revision/')[0]; // get full resolution or clean URL
      }
    }

    if (name && rarity !== "Unknown") {
      // Clean name
      name = name.replace(/ \(Shikigami\)/g, '').trim();
      if (!shikigami.find(s => s.name === name)) {
        shikigami.push({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name: name,
          rarity: rarity,
          icon: icon
        });
      }
    }
  });

  console.log(`Found ${shikigami.length} Shikigami!`);

  const outputPath = path.join(__dirname, 'src', 'data', 'shikigami.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(shikigami, null, 2));
  console.log("Data saved to", outputPath);
}

scrapeWiki().catch(console.error);
