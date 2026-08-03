import os
import datetime
from git import Repo

# --- CONFIGURATION ---
BASE_URL = "https://esthetics03-ops.github.io"
REPO_PATH = "./"
WIKI_DIR = "wiki"
REMOTE_NAME = "origin"
BRANCH_NAME = "main"

# --- THE UI ENGINE ---
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{title} | The Esthetics Hub</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;600;800&display=swap" rel="stylesheet">
    <style>
        :root {{ --accent: #0dcaf0; --bg: #0f172a; }}
        body {{ font-family: 'Outfit', sans-serif; background: var(--bg); color: white; line-height: 1.8; }}
        .glass-container {{ 
            background: rgba(255, 255, 255, 0.03); 
            backdrop-filter: blur(15px); 
            border: 1px solid rgba(255,255,255,0.1); 
            border-radius: 30px; 
            padding: 50px; margin: 60px auto; max-width: 900px; 
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }}
        h1 {{ color: var(--accent); font-weight: 800; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px; }}
        h2 {{ color: var(--accent); font-size: 1.5rem; margin-top: 30px; }}
        .meta-tag {{ background: rgba(13, 202, 240, 0.1); color: var(--accent); padding: 5px 15px; border-radius: 50px; font-size: 0.8rem; font-weight: 600; }}
        footer {{ margin-top: 50px; font-size: 0.8rem; opacity: 0.5; text-align: center; }}
        a {{ color: var(--accent); text-decoration: none; }}
    </style>
</head>
<body>
    <div class="container"><div class="glass-container">
        <nav class="mb-4"><a href="../index.html">← Return to Hub</a></nav>
        <span class="meta-tag">{category}</span>
        <h1 class="mt-2">{title}</h1>
        <div class="content mt-4">{content}</div>
        <footer>
            <p>&copy; 2026 The Esthetics Hub | <a href="../disclaimer.html">Medical Disclaimer</a></p>
        </footer>
    </div></div>
</body>
</html>
"""

# --- FULL CONTENT DATABASE ---
articles_db = [
    {"title": "The Digital Vagus Reset Protocol", "category": "Vagus Nerve", "content": "<h2>Autonomic Shifting</h2><p>The Vagus nerve is the body's 'brake pedal' for stress. By utilizing cold thermogenesis and the Oculocardiac reflex, we can force a shift from Sympathetic to Parasympathetic dominance in under 120 seconds.</p>"},
    {"title": "Bio-Sync: The Insulin Sensitivity Protocol", "category": "Metabolic", "content": "<h2>Hormonal Alignment</h2><p>Aligning nutrient intake with the solar cycle prevents the mid-day insulin crash. By sequencing fiber before carbohydrates, we maintain steady blood glucose for high-focus deep work.</p>"},
    {"title": "Sleep Lab: Circadian Optimization", "category": "Sleep Science", "content": "<h2>The 18-Degree Rule</h2><p>Core temperature must drop by 1°C to initiate sleep. Maintaining an 18°C environment ensures your Suprachiasmatic Nucleus (SCN) remains synced with the circadian rhythm.</p>"},
    {"title": "Autophagy: Cellular Cleanup", "category": "Longevity", "content": "<h2>System Maintenance</h2><p>Autophagy is the body's method of recycling dysfunctional cellular components. Triggering this state once a week via a 20-hour fast clears 'zombie cells' and reduces systemic inflammation.</p>"},
    {"title": "About the Creator: George Ondimu", "category": "Authority", "content": "<h2>Systems Engineering meets Biology</h2><p>George Kutosi Ondimu is a Web Developer based in Nairobi. He treats the human body like a complex software system, requiring firmware updates through biohacking and metabolic syncing.</p>"},
    {"title": "Contact The Hub", "category": "Authority", "content": "<h2>Get in Touch</h2><p>For technical inquiries regarding MindSync AI or bio-metric data integration, reach out to our Nairobi-based development team.</p>"}
    # (The script can hold all 15 here)
]

def run_deployment():
    if not os.path.exists(WIKI_DIR): os.makedirs(WIKI_DIR)
    file_list = []
    today = datetime.date.today().isoformat()

    # 1. Generate Articles
    for art in articles_db:
        slug = art['title'].lower().replace(":", "").replace(" ", "-") + ".html"
        path = os.path.join(WIKI_DIR, slug)
        with open(path, "w", encoding="utf-8") as f:
            f.write(HTML_TEMPLATE.format(title=art['title'], category=art['category'], content=art['content'], date=today))
        file_list.append(path)

    # 2. Generate Sitemap
    sitemap_content = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    sitemap_content.append(f"<url><loc>{BASE_URL}/index.html</loc><priority>1.0</priority></url>")
    for f in file_list:
        sitemap_content.append(f"<url><loc>{BASE_URL}/{f}</loc><priority>0.8</priority></url>")
    sitemap_content.append("</urlset>")
    with open("sitemap.xml", "w") as f: f.write("\n".join(sitemap_content))
    file_list.append("sitemap.xml")

    # 3. Git Push
    try:
        repo = Repo(REPO_PATH)
        repo.index.add(file_list)
        repo.index.commit("Deploying Authority Stack v1.0")
        repo.remote(name=REMOTE_NAME).push(BRANCH_NAME)
        print("🚀 DEPLOYMENT COMPLETE. All articles, sitemaps, and authority pages are LIVE.")
    except Exception as e: print(f"❌ Error: {e}")

if __name__ == "__main__":
    run_deployment()
