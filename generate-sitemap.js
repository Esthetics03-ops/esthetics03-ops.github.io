import fs from "fs";
const pages = ["", "blog", "about", "contact"];
const base = "https://esthetics03-ops.github.io";
const urls = pages.map(p=> `<url><loc>${base}/${p}</loc></url>`).join("");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

fs.writeFileSync("sitemap.xml", xml);
console.log("✅ Sitemap generated");
