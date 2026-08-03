import os
from datetime import date

# --- CONFIGURATION ---
BASE_URL = "https://esthetics03-ops.github.io"
WIKI_DIR = "wiki"
OUTPUT_FILE = "sitemap.xml"

def generate_sitemap():
    today = date.today().isoformat()
    
    # Start the XML structure
    sitemap_content = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]

    # 1. Add the Homepage
    sitemap_content.append(f"""  <url>
    <loc>{BASE_URL}/index.html</loc>
    <lastmod>{today}</lastmod>
    <priority>1.0</priority>
  </url>""")

    # 2. Add all Wiki Articles
    if os.path.exists(WIKI_DIR):
        files = [f for f in os.listdir(WIKI_DIR) if f.endswith('.html')]
        for file in files:
            priority = "0.8"
            sitemap_content.append(f"""  <url>
    <loc>{BASE_URL}/{WIKI_DIR}/{file}</loc>
    <lastmod>{today}</lastmod>
    <priority>{priority}</priority>
  </url>""")

    # 3. Add Legal Pages
    legal_pages = ['privacy-policy.html', 'disclaimer.html', 'terms.html']
    for page in legal_pages:
        if os.path.exists(page):
            sitemap_content.append(f"""  <url>
    <loc>{BASE_URL}/{page}</loc>
    <lastmod>{today}</lastmod>
    <priority>0.5</priority>
  </url>""")

    sitemap_content.append('</urlset>')

    # Write to file
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(sitemap_content))
    
    print(f"✅ Created {OUTPUT_FILE} with {len(sitemap_content) - 3} entries.")

if __name__ == "__main__":
    generate_sitemap()
