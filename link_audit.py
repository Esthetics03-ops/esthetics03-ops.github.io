import os
import re

# --- CONFIGURATION ---
BASE_DIR = "./"
WIKI_DIR = "wiki"
ROOT_FILES = ["index.html", "about.html", "disclaimer.html", "privacy-policy.html"]

def audit_links():
    print("🔍 Starting Link Audit for The Esthetics Hub...")
    errors = 0
    checked = 0

    # 1. Collect all local files to check against
    existing_files = set(ROOT_FILES)
    if os.path.exists(WIKI_DIR):
        for f in os.listdir(WIKI_DIR):
            if f.endswith(".html"):
                existing_files.add(f"{WIKI_DIR}/{f}")

    # 2. Files to scan for outbound links
    files_to_scan = [f for f in ROOT_FILES if os.path.exists(f)]
    if os.path.exists(WIKI_DIR):
        for f in os.listdir(WIKI_DIR):
            files_to_scan.append(os.path.join(WIKI_DIR, f))

    # 3. Regex to find href="links"
    link_pattern = re.compile(r'href=["\'](?!http|https|#)([^"\']+)["\']')

    for file_path in files_to_scan:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            links = link_pattern.findall(content)
            
            for link in links:
                # Clean up relative paths like ../index.html
                clean_link = link.replace("../", "")
                
                # Check if the link exists in our file set
                if clean_link not in existing_files and link not in existing_files:
                    print(f"❌ BROKEN LINK: '{link}' found in {file_path}")
                    errors += 1
                checked += 1

    if errors == 0:
        print(f"✅ AUDIT PASSED: {checked} links verified. No dead ends found.")
    else:
        print(f"⚠️ AUDIT FAILED: {errors} broken links detected. Fix them before deploying.")

if __name__ == "__main__":
    audit_links()
