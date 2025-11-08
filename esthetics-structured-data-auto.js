/**
 * esthetics-structured-data-auto.js
 * Auto-detect page type and inject structured JSON-LD for The Esthetics Hub
 * Author: George Kutosi
 * Last Updated: 2025-11-08
 */

(function() {
    // Helper to inject JSON-LD into <head>
    function injectJSONLD(jsonLDObject) {
        var script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(jsonLDObject, null, 2);
        document.head.appendChild(script);
    }

    // 1. Organization schema (always included)
    injectJSONLD({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "The Esthetics Hub",
        "url": "https://esthetics03-ops.github.io",
        "logo": "https://esthetics03-ops.github.io/images/logo.png",
        "sameAs": [
            "https://www.facebook.com/TheEstheticsHubNairobi",
            "https://www.instagram.com/TheEstheticsHubNairobi"
        ]
    });

    // 2. Detect page type based on URL path
    const path = window.location.pathname;
    
    // Homepage
    if (path === "/" || path.endsWith("index.html")) {
        injectJSONLD({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "The Esthetics Hub",
            "url": "https://esthetics03-ops.github.io",
            "potentialAction": {
                "@type": "SearchAction",
                "target": "https://esthetics03-ops.github.io/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
            }
        });

        // Optional: Add a featured BlogPosting on homepage
        injectJSONLD({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": "Welcome to The Esthetics Hub",
            "image": "https://esthetics03-ops.github.io/images/hero-image.jpg",
            "author": { "@type": "Person", "name": "George Kutosi" },
            "publisher": { 
                "@type": "Organization",
                "name": "The Esthetics Hub",
                "logo": { "@type": "ImageObject", "url": "https://esthetics03-ops.github.io/images/logo.png" }
            },
            "datePublished": "2025-11-08",
            "dateModified": "2025-11-08",
            "mainEntityOfPage": { "@type": "WebPage", "@id": "https://esthetics03-ops.github.io" }
        });

        // Optional FAQ example
        injectJSONLD({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                { "@type": "Question", "name": "How can I improve my nutrition?", "acceptedAnswer": { "@type": "Answer", "text": "Focus on whole foods, avoid processed items, and balance macronutrients for better energy and mental clarity." }},
                { "@type": "Question", "name": "How often should I practice mindfulness?", "acceptedAnswer": { "@type": "Answer", "text": "Daily mindfulness for at least 10-20 minutes can significantly improve mental health and focus." }}
            ]
        });
    }

    // Blog post pages (assumes blog pages in /blog/ folder)
    else if (path.startsWith("/blog/")) {
        // Extract post title from <h1> or use meta title
        const headline = document.querySelector('h1') ? document.querySelector('h1').innerText : document.title;
        const mainImage = document.querySelector('img') ? document.querySelector('img').src : "https://esthetics03-ops.github.io/images/hero-image.jpg";

        injectJSONLD({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": headline,
            "image": mainImage,
            "author": { "@type": "Person", "name": "George Kutosi" },
            "publisher": { 
                "@type": "Organization",
                "name": "The Esthetics Hub",
                "logo": { "@type": "ImageObject", "url": "https://esthetics03-ops.github.io/images/logo.png" }
            },
            "datePublished": document.querySelector('time[datetime]') ? document.querySelector('time[datetime]').getAttribute('datetime') : "2025-11-08",
            "dateModified": document.querySelector('time[datetime]') ? document.querySelector('time[datetime]').getAttribute('datetime') : "2025-11-08",
            "mainEntityOfPage": { "@type": "WebPage", "@id": window.location.href }
        });
    }

    // Product pages (assumes /products/ folder)
    else if (path.startsWith("/products/")) {
        const productName = document.querySelector('h1') ? document.querySelector('h1').innerText : "Featured Product";
        const productImage = document.querySelector('img') ? document.querySelector('img').src : "https://esthetics03-ops.github.io/images/product.webp";
        const productPrice = document.querySelector('.price') ? document.querySelector('.price').innerText.replace(/[^0-9.]/g,'') : "39.99";

        injectJSONLD({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": productName,
            "image": productImage,
            "description": document.querySelector('p') ? document.querySelector('p').innerText : "High-quality wellness product",
            "brand": { "@type": "Brand", "name": "The Esthetics Hub" },
            "offers": {
                "@type": "Offer",
                "url": window.location.href,
                "priceCurrency": "USD",
                "price": productPrice,
                "availability": "https://schema.org/InStock"
            }
        });
    }

})();
