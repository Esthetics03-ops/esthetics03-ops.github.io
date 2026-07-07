(function() {
    // 1. Determine the root path dynamically to handle sub-directories
    const isGitHubPages = window.location.hostname.includes('github.io');
    const repoName = isGitHubPages ? '/' + window.location.pathname.split('/')[1] + '/' : '/';
    
    // If your site is a user page (esthetics03-ops.github.io), repoName should just be '/'
    // If it's a project page (user.github.io/repo), it needs the subfolder path.
    const rootPath = window.location.hostname === 'esthetics03-ops.github.io' ? '/' : repoName;

    const faviconPath = `${window.location.origin}${rootPath}g1.png`;

    // 2. Remove any existing favicons to avoid conflicts
    const existingFavicons = document.querySelectorAll("link[rel*='icon']");
    existingFavicons.forEach(el => el.parentNode.removeChild(el));

    // 3. Create and append the new shortcut icon link
    const link = document.createElement('link');
    link.type = 'image/png';
    link.rel = 'shortcut icon';
    link.href = faviconPath;

    // 4. Create and append a standard icon link for broader compatibility
    const standardLink = document.createElement('link');
    standardLink.type = 'image/png';
    standardLink.rel = 'icon';
    standardLink.href = faviconPath;

    // Append both to the document head
    document.head.appendChild(link);
    document.head.appendChild(standardLink);
})();
