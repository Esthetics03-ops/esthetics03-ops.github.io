import os
import datetime
from git import Repo

# --- CONFIGURATION ---
REPO_PATH = "./"  # Local path to your GitHub repo
WIKI_DIR = "wiki" # Target directory for articles
REMOTE_NAME = "origin"
BRANCH_NAME = "main"

# --- THE HTML ENGINE (AdSense Compliant + Glassmorphism) ---
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

# --- ARTICLE REPOSITORY (Add your 15 articles here) ---
articles_db = [
    {
        "title": "Longevity 2026: The Biological Tech Stack",
        "category": "Longevity",
        "content": """
            <p>Longevity is no longer a passive process; it is a technical optimization of cellular health. By 2026, the 'Longevity Stack' has evolved beyond basic supplementation into <b>epigenetic maintenance</b>.</p>
            <h2>The Protocol: NAD+ and Sirtuin Activation</h2>
            <p>The primary driver of cellular aging is mitochondrial decay. We utilize NAD+ precursors combined with Sirtuin-activating compounds (STACs) to maintain genomic stability.</p>
            <h2>Biological Monitoring</h2>
            <p>To confirm efficacy, we track 'Biological Age' via DNA methylation clocks rather than chronological years.</p>
        """
    },
    # Add the remaining 14 objects here...
]

def generate_wiki():
    if not os.path.exists(WIKI_DIR):
        os.makedirs(WIKI_DIR)
        print(f"📁 Created folder: {WIKI_DIR}")

    file_list = []
    
    for art in articles_db:
        # Create a URL-friendly slug
        slug = art['title'].lower().replace(":", "").replace(" ", "-") + ".html"
        file_path = os.path.join(WIKI_DIR, slug)
        
        # Fill the template
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

    # --- GIT AUTO-PUSH ---
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
