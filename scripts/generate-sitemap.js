#!/usr/bin/env node
import fs from 'fs';
import globby from 'globby';
import { SitemapStream, streamToPromise } from 'sitemap';

const SITE = 'https://esthetics03-ops.github.io';
(async () => {
  const files = await globby(['**/*.html', '!node_modules/**', '!.github/**']);
  const urls = files
    .filter(p => !p.includes('.git') && !p.includes('node_modules'))
    .map(p => p.replace(/index\.html$/, '').replace(/\\\\/g, '/'))
    .map(p => (p === 'index.html' || p === './index.html') ? '/' : `/${p}`);
  const sm = new SitemapStream({ hostname: SITE });
  urls.forEach(u => sm.write({ url: u, changefreq: 'weekly', priority: 0.7 }));
  sm.end();
  const xml = await streamToPromise(sm);
  fs.writeFileSync('sitemap.xml', xml);
  console.log('sitemap.xml written with', urls.length, 'urls');
})();
