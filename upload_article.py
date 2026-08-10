import os
import sys
import json
import datetime
import html
from pathlib import Path
from typing import List, Dict, Optional
from git import Repo, GitCommandError

# --- CONFIGURATION ---
REPO_PATH = os.getenv("WIKI_REPO_PATH", "./")
WIKI_DIR = os.getenv("WIKI_DIR", "wiki")
REMOTE_NAME = os.getenv("GIT_REMOTE", "origin")
BRANCH_NAME = os.getenv("GIT_BRANCH", "main")
DRY_RUN = os.getenv("DRY_RUN", "false").lower() == "true"

# --- HTML TEMPLATE (Fixed CSS) ---
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
        :root {{
            --accent: #0dcaf0;
            --bg: #0f172a;
            --text: #ffffff;
            --border: rgba(255, 255, 255, 0.1);
        }}
        * {{
            box-sizing: border-box;
        }}
        html, body {{
            margin: 0;
            padding: 0;
        }}
        body {{
            font-family: 'Outfit', sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.8;
            min-height: 100vh;
            padding: 20px;
        }}
        .glass-container {{
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(15px);
            border: 1px solid var(--border);
            border-radius: 30px;
            padding: 2rem 1.5rem;
            margin: 60px auto;
            max-width: 900px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        }}
        @media (min-width: 768px) {{
            .glass-container {{
                padding: 50px;
            }}
        }}
        h1 {{
            color: var(--accent);
            font-weight: 800;
            border-bottom: 1px solid var(--border);
            padding-bottom: 15px;
            margin-top: 0;
            font-size: 2rem;
        }}
        h2 {{
            color: var(--accent);
            font-size: 1.5rem;
            margin-top: 30px;
            margin-bottom: 15px;
        }}
        .meta-tag {{
            display: inline-block;
            background: rgba(13, 202, 240, 0.1);
            color: var(--accent);
            padding: 5px 15px;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }}
        .content {{
            margin-top: 30px;
            opacity: 0.9;
        }}
        .content p {{
            margin-bottom: 1rem;
        }}
        footer {{
            margin-top: 50px;
            font-size: 0.8rem;
            opacity: 0.5;
            text-align: center;
            border-top: 1px solid var(--border);
            padding-top: 20px;
        }}
        a {{
            color: var(--accent);
            text-decoration: none;
            transition: opacity 0.3s ease;
        }}
        a:hover {{
            opacity: 0.7;
            text-decoration: underline;
        }}
        .meta-info {{
            font-size: 0.9rem;
            opacity: 0.6;
            margin: 1rem 0;
        }}
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
            <p class="meta-info">Last Verified: {date} | Source: The Esthetics Hub Research</p>

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

# --- ARTICLE DATABASE (15/15 Articles - Fixed Syntax) ---
articles_db: List[Dict[str, str]] = [
    {
        "title": "The Digital Vagus Reset Protocol",
        "category": "Vagus Nerve",
        "content": "<h2>The Biological Cost of Focus</h2><p>In high-velocity digital environments, the nervous system defaults to Sympathetic Dominance. The Vagus Nerve (Cranial Nerve X) is the primary control center for parasympathetic activation. This article explores proven protocols to reset vagal tone and restore nervous system balance.</p><h2>Key Techniques</h2><p>Breathing practices, cold exposure, and vocal humming activate the vagus nerve. Regular practice increases heart rate variability (HRV), a marker of stress resilience.</p>"
    },
    {
        "title": "Bio-Sync: The Insulin Sensitivity Protocol",
        "category": "Metabolic",
        "content": "<h2>Circadian Biology</h2><p>Nutrition is a timing problem. Bio-Syncing aligns nutrient intake with hormonal peaks (Insulin and Cortisol) to maximize metabolic flexibility. Eating protein-first at breakfast suppresses post-meal glucose spikes by 30%.</p><h2>Implementation</h2><p>Time your carbohydrates to post-workout windows when GLUT4 transporters are upregulated. This prevents energy crashes and reduces dependency on stimulants.</p>"
    },
    {
        "title": "The Sleep Lab: Circadian Optimization",
        "category": "Sleep Science",
        "content": "<h2>The Glymphatic System</h2><p>Sleep is a neurological cleanup process. During deep sleep, the brain's glymphatic system clears neurotoxic waste (including amyloid-beta). Disrupted sleep accelerates cognitive decline.</p><h2>The 18-Degree Rule</h2><p>Core body temperature needs to drop 2-3°C to initiate sleep. A bedroom temperature of 65-68°F (18-20°C) is optimal. Thermal regulation is the most underrated sleep lever.</p>"
    },
    {
        "title": "Digital Hypoxia: Solving Screen Apnea",
        "category": "Developer Health",
        "content": "<h2>The Focused Breath Glitch</h2><p>Developers often hold their breath during complex coding, leading to CO2 buildup and stress. This 'Screen Apnea' triggers mid-day burnout and reduced cognitive performance.</p><h2>The Fix</h2><p>Set calendar reminders for box breathing (4-4-4-4 pattern) every 90 minutes. This resets the nervous system and maintains focus without caffeine dependency.</p>"
    },
    {
        "title": "Autophagy: The Cellular Cleanup Protocol",
        "category": "Longevity",
        "content": "<h2>Cellular Quality Control</h2><p>Autophagy identifies and recycles dysfunctional mitochondria. It is governed by the AMPK/mTOR switch, activated during periods of energy stress (fasting or intense exercise).</p><h2>The 20:4 Protocol</h2><p>Engaging in a 20-hour fasting window (eating within a 4-hour window) triggers robust autophagy. This is more practical than longer fasts for sustainable longevity.</p>"
    },
    {
        "title": "GLUT4 Activation: The Post-Meal Reset",
        "category": "Metabolic",
        "content": "<h2>The Insulin Bypass</h2><p>Post-meal lethargy is a sign of insulin dominance. We use GLUT4 activation to redirect glucose into skeletal muscle rather than adipose tissue. This prevents the afternoon energy crash.</p><h2>Practical Application</h2><p>A 3-minute walk after meals lowers blood glucose by 20-30%. Combined with protein intake, this creates metabolic flexibility without pharmaceutical intervention.</p>"
    },
    {
        "title": "NSDR: Non-Sleep Deep Rest for Creators",
        "category": "Recovery",
        "content": "<h2>The Theta Wave Bridge</h2><p>NSDR (Non-Sleep Deep Rest) allows the nervous system to enter a deep restorative state without the grogginess of a nap. This is a 10-20 minute practice that restores mental clarity.</p><h2>Neural Cache Clearing</h2><p>NSDR flushes the Default Mode Network (DMN), clearing mental clutter and improving creative insight. It's the biohacker's secret weapon for sustained creative output.</p>"
    },
    {
        "title": "DNA Methylation: Measuring the Bio-Clock",
        "category": "Longevity",
        "content": "<h2>Epigenetic Signaling</h2><p>Our DNA is a fixed script, but methylation is the 'software' that decides which genes are read. High stress and poor sleep increase 'epigenetic noise', accelerating aging at the molecular level.</p><h2>Measurement</h2><p>DNA methylation clocks (like Horvath's clock) can measure biological age independent of chronological age. This is your real aging metric—not your birthday.</p>"
    },
    {
        "title": "Sirtuin Activation: The Survival Circuit",
        "category": "Longevity",
        "content": "<h2>The Longevity Genes</h2><p>Sirtuins are a family of proteins responsible for cellular health and DNA repair. They are activated by energy stress (fasting) and specific molecules like resveratrol and NMN.</p><h2>Practical Strategy</h2><p>Combine intermittent fasting with high-intensity exercise to maximize sirtuin activation. This combination produces the strongest longevity signal in human studies.</p>"
    },
    {
        "title": "The 14-Day Bio-Sync Grocery Stack",
        "category": "Metabolic",
        "content": "<h2>Strategic Nutrition</h2><p>To support a flat glucose curve, your shopping list must prioritize high-leucine proteins and soluble fibers. In any region, focus on local protein sources and non-starchy vegetables.</p><h2>The Shopping List</h2><p>Eggs, fish, legumes, cruciferous vegetables, and berries form the metabolic foundation. Avoid processed carbohydrates—they are glucose spikes in disguise.</p>"
    },
    {
        "title": "CO2 Tolerance: The Metric of Resilience",
        "category": "Recovery",
        "content": "<h2>The Respiratory Sink</h2><p>Your ability to tolerate Carbon Dioxide is a direct proxy for your nervous system's stress threshold. We use the CO2 exhale test to baseline your Vagal response capacity.</p><h2>Why It Matters</h2><p>Low CO2 tolerance predicts anxiety and stress sensitivity. Breathing exercises build CO2 tolerance, which directly improves your biological stress resilience.</p>"
    },
    {
        "title": "Circadian Lighting: Blue Light vs. The Master Clock",
        "category": "Sleep Science",
        "content": "<h2>Photobiology</h2><p>The Suprachiasmatic Nucleus (SCN) is sensitive to the 480nm wavelength of blue light. Exposure after sunset inhibits melatonin synthesis for up to 4 hours.</p><h2>Implementation</h2><p>Use blue-light blocking glasses after 8 PM. This simple intervention improves sleep quality by 20-30% and resets circadian phase within weeks.</p>"
    },
    {
        "title": "MindSync AI: The Future of Wellness Tech",
        "category": "Insights",
        "content": "<h2>Algorithmic Personalization</h2><p>The future of biohacking is not a general protocol, but a personalized algorithm. Real-time HRV and metabolic data feed into adaptive systems that optimize recovery and performance.</p><h2>The Next Frontier</h2><p>AI-driven wellness will move from one-size-fits-all protocols to truly individualized medicine. This is the convergence of biohacking and machine learning.</p>"
    },
    {
        "title": "Mitochondrial Health: ATP Optimization",
        "category": "Recovery",
        "content": "<h2>The Bio-Energetic Engine</h2><p>Mitochondria convert oxygen into ATP. Red light therapy (810-850nm) stimulates Cytochrome C Oxidase to increase this energy production by 30-40%.</p><h2>Multi-Modal Approach</h2><p>Combine red light therapy with CoQ10 supplementation, creatine, and high-intensity interval training. This stacking approach maximizes cellular energy output.</p>"
    },
    {
        "title": "Longevity 2026: The Biological Tech Stack",
        "category": "Longevity",
        "content": "<h2>Epigenetic Maintenance</h2><p>In 2026, longevity is about genomic stability. We utilize NAD+ precursors and Sirtuin-activating compounds to slow the biological clock at the molecular level.</p><h2>DNA Repair & Resilience</h2><p>The ultimate longevity stack combines fasting, exercise, polyphenol-rich foods, and targeted supplementation. This addresses aging at every biological level.</p>"
    }
]


def sanitize_filename(title: str) -> str:
    """Convert article title to safe filename."""
    slug = title.lower().replace(":", "").replace(" ", "-")
    # Remove any characters that aren't alphanumeric, hyphens, or dots
    slug = "".join(c for c in slug if c.isalnum() or c in "-.")
    return slug + ".html"


def validate_articles() -> bool:
    """Validate article database integrity."""
    if not articles_db:
        print("❌ ERROR: No articles found in database")
        return False

    required_fields = {"title", "category", "content"}
    slugs_seen = set()

    for idx, article in enumerate(articles_db, 1):
        # Check all required fields exist
        if not all(field in article for field in required_fields):
            missing = required_fields - set(article.keys())
            print(f"❌ Article {idx}: Missing fields {missing}")
            return False

        # Check for empty/truncated content
        if not article.get("content") or "[...]" in article["content"]:
            print(f"⚠️  Article {idx} ({article['title']}): Content appears incomplete")

        # Check for duplicate slugs
        slug = sanitize_filename(article["title"])
        if slug in slugs_seen:
            print(f"❌ Article {idx}: Slug collision detected: {slug}")
            return False
        slugs_seen.add(slug)

    print(f"✓ Validated {len(articles_db)} articles")
    return True


def generate_wiki() -> Optional[List[str]]:
    """Generate HTML files from article database."""
    if not validate_articles():
        return None

    if not os.path.exists(WIKI_DIR):
        os.makedirs(WIKI_DIR)
        print(f"📁 Created folder: {WIKI_DIR}")

    file_list = []
    today = datetime.date.today().strftime("%B %d, %Y")

    for article in articles_db:
        slug = sanitize_filename(article["title"])
        file_path = os.path.join(WIKI_DIR, slug)

        # Escape HTML in title for security
        safe_title = html.escape(article["title"])
        safe_category = html.escape(article["category"])

        final_html = HTML_TEMPLATE.format(
            title=safe_title,
            category=safe_category,
            date=today,
            content=article["content"]  # Content should be pre-formatted HTML
        )

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(final_html)

        file_list.append(file_path)
        print(f"✓ Generated: {slug}")

    return file_list


def commit_and_push(file_list: List[str]) -> bool:
    """Commit files to git and push to remote."""
    if DRY_RUN:
        print(f"🔄 [DRY RUN] Would commit {len(file_list)} files")
        return True

    try:
        repo = Repo(REPO_PATH)
    except Exception as e:
        print(f"❌ GIT ERROR: Could not open repository at {REPO_PATH}: {e}")
        return False

    try:
        # Stage files
        repo.index.add(file_list)

        # Check if there are actually changes to commit
        if not repo.index.diff("HEAD"):
            print("ℹ️  No changes to commit (files unchanged)")
            return True

        # Commit
        commit_msg = f"Auto-Update: Added {len(file_list)} Wiki Articles ({datetime.date.today()})"
        repo.index.commit(commit_msg)
        print(f"✓ Committed: {commit_msg}")

        # Push
        try:
            origin = repo.remote(name=REMOTE_NAME)
            origin.push(BRANCH_NAME)
            print(f"🚀 SUCCESS: Pushed to {REMOTE_NAME}/{BRANCH_NAME}")
            return True
        except GitCommandError as push_error:
            print(f"❌ PUSH ERROR: {push_error}")
            print("   (Commit succeeded, but push failed. Check authentication & branch permissions)")
            return False

    except GitCommandError as e:
        print(f"❌ GIT ERROR: {e}")
        return False
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {e}")
        return False


def main():
    """Main entry point."""
    print("🚀 Starting Wiki Generation...")
    print(f"   Repo: {REPO_PATH} | Branch: {BRANCH_NAME} | Dry Run: {DRY_RUN}")
    print()

    # Generate HTML files
    files = generate_wiki()
    if files is None:
        print("❌ Wiki generation failed")
        sys.exit(1)

    print()

    # Commit and push
    if commit_and_push(files):
        print("\n✅ All operations completed successfully")
        sys.exit(0)
    else:
        print("\n⚠️  Generation succeeded, but git operations had issues")
        sys.exit(1)


if __name__ == "__main__":
    main()
