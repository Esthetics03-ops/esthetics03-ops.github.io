import requests
from bs4 import BeautifulSoup
import os

# Configuration
BASE_URL = "https://esthetics03-ops.github.io/"
REPO = os.environ.get('GITHUB_REPOSITORY')
TOKEN = os.environ.get('GITHUB_TOKEN')

def create_issue(link, page):
    url = f"https://api.github.com/repos/{REPO}/issues"
    headers = {"Authorization": f"token {TOKEN}"}
    data = {
        "title": f"🔗 Broken Link Detected: {link}",
        "body": f"The following link is returning a 404 or error:\n\n**Link:** {link}\n**Found on Page:** {page}\n\nPlease update your affiliate URL to prevent revenue loss.",
        "labels": ["bug", "affiliate-fix"]
    }
    requests.post(url, headers=headers, json=data)

def check_site_links():
    pages = ["index.html", "holistic-nutrition.html", "sleep-tech.html", "natural-remedies.html", "resources.html", "links.html"]
    
    for page in pages:
        print(f"Scanning {page} for broken links...")
        response = requests.get(BASE_URL + page)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        for a in soup.find_all('a', href=True):
            link = a['href']
            if link.startswith('http'):
                try:
                    res = requests.head(link, allow_redirects=True, timeout=5)
                    if res.status_code >= 400:
                        print(f"❌ Broken: {link}")
                        create_issue(link, page)
                except:
                    print(f"❌ Connection Failed: {link}")
                    create_issue(link, page)

if __name__ == "__main__":
    check_site_links()
