const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

async function scrapeSouls() {
  console.log("Reading Onmyoji Fandom Wiki Souls local dump...");
  const htmlPath = "C:\\Users\\USER\\.gemini\\antigravity\\brain\\56a28fe2-666e-4b41-b450-d2a79e35cc99\\.system_generated\\steps\\2332\\content.md";
  const html = fs.readFileSync(htmlPath, 'utf8');
  const $ = cheerio.load(html);

  const souls = [];

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
    
    if (!name || name.startsWith("Category:")) return;

    let twoPiece = "";
    if (tds.length >= 4) {
      twoPiece = $(tds).eq(3).text().trim();
    }

    // Extract image URL
    let icon = "";
    const imgTag = $(el).find('img.mw-file-element').first();
    if (imgTag.length > 0) {
      icon = imgTag.attr('data-src') || imgTag.attr('src');
      if (icon) {
        icon = icon.split('/revision/')[0];
      }
    }

    if (name) {
      name = name.trim();
      if (!souls.find(s => s.name === name)) {
        souls.push({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name: name,
          twoPiece: twoPiece,
          icon: icon
        });
      }
    }
  });

  console.log(`Found ${souls.length} Souls!`);

  const outputPath = path.join(__dirname, '..', 'src', 'data', 'souls.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(souls, null, 2));
  console.log("Data saved to", outputPath);
}

scrapeSouls().catch(console.error);
