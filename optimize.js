const fs = require('fs');
const path = require('path');
const { PurgeCSS } = require('purgecss');

// --- CONFIGURATION ---
const SETTINGS = {
    cssSrc: 'style.css',
    cssDest: 'style.min.css',
    runtimeJsDest: 'performance-core.min.js',
    htmlPattern: ['*.html', 'js/**/*.js', '*.js'],
    jsFilesToMinify: ['favicon-injector.js'] 
};

// --- RUNTIME CLIENT SCRIPT ---
// This raw string is your browser-side optimization code (Lazy loading + Core enhancements)
const runtimeBrowserCode = `
document.addEventListener('DOMContentLoaded', () => {
    // 1. Lazy load images with safe fallback exclusions (e.g., LCP or Hero images)
    const images = document.querySelectorAll('img:not([fetchpriority="high"])');
    images.forEach(img => {
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
    });

    // 2. Add resource hints dynamically for performance
    const dnsPrefetch = ['https://fonts.googleapis.com', 'https://images.unsplash.com'];
    dnsPrefetch.forEach(url => {
        if (!document.querySelector(\`link[href="\${url}"]\`)) {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = url;
            document.head.appendChild(link);
        }
    });

    console.log('⚡ Esthetics Hub Runtime Optimizations Active.');
});
`;

// --- HELPER: LIGHTWEIGHT MINIFIER ---
function minifyJsCode(code) {
    return code
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
        .replace(/\/\/.*?\n/g, '')        // Remove single-line comments
        .replace(/\s+/g, ' ')             // Collapse whitespace/breaks
        .replace(/\s*([\{\}\(\)\=\+\-\*\/\,\;\:])\s*/g, '$1') // Trim spaces around operators
        .trim();
}

// --- MAIN BUILD AUTOMATION ---
async function runSophisticatedBuild() {
    console.log('🚀 Initiating Deep Build-Time Performance Pipeline...');
    console.time('⏱️ Build Completed In');

    try {
        // Step 1: Compile & Minify the Runtime UI Performance Script
        console.log('📦 Processing browser runtime tools...');
        const minifiedRuntime = minifyJsCode(runtimeBrowserCode);
        fs.writeFileSync(SETTINGS.runtimeJsDest, minifiedRuntime);
        console.log(`   └─ ✅ Generated compiled script: ${SETTINGS.runtimeJsDest}`);

        // Step 2: Minify existing standalone JavaScript assets
        SETTINGS.jsFilesToMinify.forEach(file => {
            if (fs.existsSync(file)) {
                const rawJs = fs.readFileSync(file, 'utf8');
                const minJs = minifyJsCode(rawJs);
                fs.writeFileSync(file.replace('.js', '.min.js'), minJs);
                console.log(`   └─ ✅ Minified standalone file: ${file.replace('.js', '.min.js')}`);
            }
        });

        // Step 3: Deep Purge and Minify Style Sheets
        if (fs.existsSync(SETTINGS.cssSrc)) {
            console.log('🎨 Analyzing style layers & purging dead CSS roots...');
            const purgeResults = await new PurgeCSS().purge({
                content: SETTINGS.htmlPattern,
                css: [SETTINGS.cssSrc],
            });

            if (purgeResults.length > 0) {
                let pristineCSS = purgeResults[0].css;
                // Compact CSS minification
                pristineCSS = pristineCSS
                    .replace(/\/\*[\s\S]*?\*\//g, '') 
                    .replace(/\s+/g, ' ')
                    .replace(/\s*([\{\}\:\;\,\>])\s*/g, '$1')
                    .trim();

                fs.writeFileSync(SETTINGS.cssDest, pristineCSS);
                
                const oldSize = (fs.statSync(SETTINGS.cssSrc).size / 1024).toFixed(2);
                const newSize = (fs.statSync(SETTINGS.cssDest).size / 1024).toFixed(2);
                console.log(`   └─ ✅ CSS compressed from ${oldSize}KB down to ${newSize}KB -> ${SETTINGS.cssDest}`);
            }
        } else {
            console.warn(`⚠️ Warning: Base CSS source file "${SETTINGS.cssSrc}" not found. Skipping purge phase.`);
        }

        console.log('\n🎉 Production pipeline validation complete. Changes prepared for GitHub main branches.');
    } catch (error) {
        console.error('❌ Build Engine Critical Failure:', error.message);
    }

    console.timeEnd('⏱️ Build Completed In');
}

runSophisticatedBuild();
