import os
import datetime
from git import Repo

# --- CONFIGURATION ---
REPO_PATH = "./"  
WIKI_DIR = "wiki" 
REMOTE_NAME = "origin"
BRANCH_NAME = "main"

# --- THE HTML ENGINE ---
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{title} | The Esthetics Hub Wiki</title>
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
            padding: 50px; 
            margin: 60px auto; 
            max-width: 900px; 
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }}
        h1 {{ color: var(--accent); font-weight: 800; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px; }}
        h2 {{ color: var(--accent); font-size: 1.5rem; margin-top: 30px; }}
        .meta-tag {{ background: rgba(13, 202, 240, 0.1); color: var(--accent); padding: 5px 15px; border-radius: 50px; font-size: 0.8rem; font-weight: 600; }}
        .content {{ margin-top: 30px; opacity: 0.9; }}
        footer {{ margin-top: 50px; font-size: 0.8rem; opacity: 0.5; text-align: center; }}
        a {{ color: var(--accent); text-decoration: none; transition: 0.3s; }}
        a:hover {{ opacity: 0.7; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="glass-container">
            <nav class="mb-4">
                <a href="../index.html">← Return to Hub</a>
            </nav>
            <span class="meta-tag">{category}</span>
            <h1 class="mt-2">{title}</h1>
            <p class="small opacity-50">Last Verified: {date} | Source: The Esthetics Hub Research</p>
            
            <div class="content">
                {content}
            </div>

            <footer>
                <p>&copy; 2026 The Esthetics Hub | Bio-Metric Excellence</p>
                <p><a href="../disclaimer.html">Medical Disclaimer</a></p>
            </footer>
        </div>
    </div>
</body>
</html>
"""

# --- ARTICLE DATABASE (7/15 Articles) ---
articles_db = [
    {
        "title": "The Digital Vagus Reset Protocol",
        "category": "Vagus Nerve",
        "content": "<h2>The Biological Cost of Focus</h2><p>In high-velocity digital environments, the nervous system defaults to Sympathetic Dominance. The Vagus Nerve (Cranial Nerve X) is the primary mediator for shifting back to a Parasympathetic state.</p><h2>Somatic Triggers</h2><p>Using the Oculocardiac Reflex and thermal cycling (cold exposure), we can force a physiological reset that immediately lowers heart rate and stabilizes HRV metrics.</p>"
    },
    {
        "title": "Bio-Sync: The Insulin Sensitivity Protocol",
        "category": "Metabolic",
        "content": "<h2>Circadian Biology</h2><p>Nutrition is a timing problem. Bio-Syncing aligns nutrient intake with hormonal peaks (Insulin and Cortisol) to maximize metabolic flexibility.</p><h2>The Protocol</h2><p>By utilizing a 16:8 feeding window and sequencing fiber before carbohydrates, we create a flat glucose curve, preventing cognitive crashes during deep work.</p>"
    },
    {
        "title": "The Sleep Lab: Circadian Optimization",
        "category": "Sleep Science",
        "content": "<h2>The Glymphatic System</h2><p>Sleep is a neurological cleanup process. During deep sleep, the brain's glymphatic system clears neurotoxic waste.</p><h2>The 18-Degree Rule</h2><p>To initiate sleep, core temperature must drop. Maintaining an environment of 18°C (64°F) signals the brain to begin the sleep cycle and maximize REM quality.</p>"
    },
    {
        "title": "Digital Hypoxia: Solving Screen Apnea",
        "category": "Developer Health",
        "content": "<h2>The Focused Breath Glitch</h2><p>Developers often hold their breath during complex coding, leading to CO2 buildup and stress. This 'Screen Apnea' triggers mid-day burnout.</p><h2>The 20-20-20-20 Reset</h2><p>Every 20 minutes, take 20 'Cyclic Sigh' breaths—double inhales followed by long exhales—to reset the Vagus nerve mid-sprint.</p>"
    },
    {
        "title": "Autophagy: The Cellular Cleanup Protocol",
        "category": "Longevity",
        "content": "<h2>Cellular Quality Control</h2><p>Autophagy identifies and recycles dysfunctional mitochondria. It is governed by the AMPK/mTOR switch.</p><h2>The 20:4 Protocol</h2><p>Engaging in a 20-hour fast once per week allows the body to clear out senescent 'zombie' cells that drive systemic inflammation.</p>"
    },
    {
        "title": "Mitochondrial Health: ATP Optimization",
        "category": "Recovery",
        "content": "<h2>The Bio-Energetic Engine</h2><p>Mitochondria convert oxygen into ATP. Red light therapy (810-850nm) stimulates Cytochrome C Oxidase to increase this energy production.</p><h2>Mitochondrial Biogenesis</h2><p>Nutrients like PQQ and CoQ10 signal the body to create new mitochondria, raising your total energetic baseline for high-intensity work.</p>"
    },
    {
        "title": "Longevity 2026: The Biological Tech Stack",
        "category": "Longevity",
        "content": "<h2>Epigenetic Maintenance</h2><p>In 2026, longevity is about genomic stability. We utilize NAD+ precursors and Sirtuin-activating compounds to slow the biological clock.</p><h2>DNA Methylation</h2><p>We monitor progress using methylation clocks rather than chronological age to verify the efficacy of our biohacking stack.</p>"
    }
]

def generate_wiki():
    if not os.path.exists(WIKI_DIR):
        os.makedirs(WIKI_DIR)
        print(f"📁 Created folder: {WIKI_DIR}")

    file_list = []
    for art in articles_db:
        slug = art['title'].lower().replace(":", "").replace(" ", "-") + ".html"
        file_path = os.path.join(WIKI_DIR, slug)
        
        final_html = HTML_TEMPLATE.format(
            title=art['title'],
            category=art['category'],
            date=datetime.date.today().strftime("%B %d, %Y"),
            content=art['content']
        )
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(final_html)
        
        file_list.append(file_path)
        print(f"📄 Generated: {slug}")

    try:
        repo = Repo(REPO_PATH)
        repo.index.add(file_list)
        repo.index.commit(f"Auto-Update: Added {len(file_list)} Wiki Articles")
        origin = repo.remote(name=REMOTE_NAME)
        origin.push(BRANCH_NAME)
        print(f"🚀 SUCCESS: {len(file_list)} articles pushed to live site.")
    except Exception as e:
        print(f"❌ GIT ERROR: {e}")

if __name__ == "__main__":
    generate_wiki()
