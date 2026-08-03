import fs from 'fs';
import path from 'path';
import globby from 'globby';
import { JSDOM } from 'jsdom';

const OUT_DIR = 'public';
const OUT_FILE = path.join(OUT_DIR, 'search-index.json');

(async () => {
  const htmlFiles = await globby(['**/*.html', '!node_modules/**', '!.github/**']);
  const docs = [];

  for (const file of htmlFiles) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const dom = new JSDOM(content);
      const doc = dom.window.document;
      const titleTag = doc.querySelector('meta[property="og:title"]')?.content
        || doc.querySelector('title')?.textContent
        || doc.querySelector('h1')?.textContent
        || '';
      const selectorsToRemove = ['script', 'style', 'nav', 'header', 'footer', 'aside'];
      selectorsToRemove.forEach(sel => doc.querySelectorAll(sel).forEach(n=>n.remove()));
      const bodyText = doc.body.textContent || '';
      const excerpt = bodyText.trim().replace(/\s+/g, ' ').slice(0, 400);
      let urlPath = file.replace(/\\\\/g, '/');
      if (urlPath.endsWith('index.html')) urlPath = urlPath.replace(/index\.html$/, '');
      if (!urlPath.startsWith('/')) urlPath = '/' + urlPath;
      docs.push({ id: docs.length+1, title: titleTag.trim(), url: urlPath, excerpt, content: bodyText.trim().replace(/\s+/g, ' ') });
    } catch(e) { console.error('Error', file, e.message); }
  }
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(docs, null, 2), 'utf-8');
  console.log('Wrote', OUT_FILE);
})();
