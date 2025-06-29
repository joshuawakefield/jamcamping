// ===== PRERENDERING SETUP FOR SEO =====
// This would run at build time to generate static HTML

const fs = require('fs');
const path = require('path');

class PrerenderGenerator {
    constructor() {
        this.projects = require('./projects.json');
        this.shopItems = require('./shop.json');
        this.baseTemplate = fs.readFileSync('./index.html', 'utf8');
    }
    
    generateStaticPages() {
        // Generate main pages
        this.generateMainPage();
        this.generateProjectPages();
        this.generateSitemap();
        this.generateRobotsTxt();
    }
    
    generateMainPage() {
        // Inject initial project data into HTML for SEO
        const projectsHTML = this.projects.slice(0, 6).map(project => 
            this.generateProjectCardHTML(project)
        ).join('');
        
        const enhancedHTML = this.baseTemplate.replace(
            '<div id="projectsGrid" class="projects-grid" role="grid" aria-label="Project cards">',
            `<div id="projectsGrid" class="projects-grid" role="grid" aria-label="Project cards">
                ${projectsHTML}`
        );
        
        // Add structured data for the main page
        const structuredData = this.generateMainPageStructuredData();
        const finalHTML = this.injectStructuredData(enhancedHTML, structuredData);
        
        fs.writeFileSync('./dist/index.html', finalHTML);
    }
    
    generateProjectPages() {
        // Create individual pages for each project
        this.projects.forEach(project => {
            const projectHTML = this.generateProjectPageHTML(project);
            const projectDir = `./dist/projects/${project.id}`;
            
            if (!fs.existsSync(projectDir)) {
                fs.mkdirSync(projectDir, { recursive: true });
            }
            
            fs.writeFileSync(`${projectDir}/index.html`, projectHTML);
        });
    }
    
    generateProjectCardHTML(project) {
        const functionalTotal = project.functionalParts.reduce((sum, part) => sum + (part.price * part.quantity), 0);
        const extravagantTotal = project.extravagantParts.reduce((sum, part) => sum + (part.price * part.quantity), 0);
        
        return `
            <article class="project-card" data-project-id="${project.id}" data-category="${project.category}" data-difficulty="${project.difficulty}">
                <div class="project-image" aria-hidden="true">${project.image}</div>
                <div class="project-content">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                    <div class="project-meta">
                        <span class="project-category">${this.formatCategory(project.category)}</span>
                        <span class="project-difficulty">${this.formatDifficulty(project.difficulty)}</span>
                    </div>
                    <div class="project-actions">
                        <button class="btn-festival btn-primary" data-project="${project.id}" data-build="functional">
                            🎸 GA $${functionalTotal.toFixed(0)}
                        </button>
                        <button class="btn-festival btn-secondary" data-project="${project.id}" data-build="extravagant">
                            ✨ VIP $${extravagantTotal.toFixed(0)}
                        </button>
                    </div>
                </div>
            </article>
        `;
    }
    
    generateProjectPageHTML(project) {
        const title = `${project.title} - DIY Festival Project | JamCamping`;
        const description = `${project.description} Learn how to build this ${project.category} project for your festival campsite.`;
        
        const projectStructuredData = {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": project.title,
            "description": project.description,
            "totalTime": project.buildTime,
            "estimatedCost": {
                "@type": "MonetaryAmount",
                "currency": "USD",
                "value": project.functionalParts.reduce((sum, part) => sum + (part.price * part.quantity), 0)
            },
            "supply": project.functionalParts.map(part => ({
                "@type": "HowToSupply",
                "name": part.item
            })),
            "step": [{
                "@type": "HowToStep",
                "text": project.instructions
            }]
        };
        
        let html = this.baseTemplate;
        
        // Update meta tags
        html = html.replace(
            '<title>JamCamping - Digital Shakedown Street for Festival DIY</title>',
            `<title>${title}</title>`
        );
        
        html = html.replace(
            /(<meta name="description" content=")[^"]*(")/,
            `$1${description}$2`
        );
        
        // Add canonical URL
        html = html.replace(
            '</head>',
            `    <link rel="canonical" href="https://jamcamping.com/projects/${project.id}">
    <script type="application/ld+json">${JSON.stringify(projectStructuredData, null, 2)}</script>
</head>`
        );
        
        return html;
    }
    
    generateMainPageStructuredData() {
        return {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "JamCamping",
            "description": "Digital Shakedown Street for festival DIY projects",
            "url": "https://jamcamping.com",
            "potentialAction": {
                "@type": "SearchAction",
                "target": "https://jamcamping.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
            },
            "mainEntity": {
                "@type": "ItemList",
                "name": "Festival DIY Projects",
                "numberOfItems": this.projects.length,
                "itemListElement": this.projects.map((project, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "item": {
                        "@type": "HowTo",
                        "name": project.title,
                        "url": `https://jamcamping.com/projects/${project.id}`
                    }
                }))
            }
        };
    }
    
    injectStructuredData(html, data) {
        return html.replace(
            '</head>',
            `    <script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>
</head>`
        );
    }
    
    generateSitemap() {
        const baseUrl = 'https://jamcamping.com';
        const urls = [
            { loc: baseUrl, priority: '1.0', changefreq: 'weekly' },
            { loc: `${baseUrl}/#vendor`, priority: '0.8', changefreq: 'monthly' },
            { loc: `${baseUrl}/#chill`, priority: '0.6', changefreq: 'monthly' },
            { loc: `${baseUrl}/#submit`, priority: '0.7', changefreq: 'monthly' },
            { loc: `${baseUrl}/#contact`, priority: '0.5', changefreq: 'monthly' }
        ];
        
        // Add project URLs
        this.projects.forEach(project => {
            urls.push({
                loc: `${baseUrl}/projects/${project.id}`,
                priority: '0.8',
                changefreq: 'monthly',
                lastmod: new Date().toISOString().split('T')[0]
            });
        });
        
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `    <url>
        <loc>${url.loc}</loc>
        <priority>${url.priority}</priority>
        <changefreq>${url.changefreq}</changefreq>
        ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    </url>`).join('\n')}
</urlset>`;
        
        fs.writeFileSync('./dist/sitemap.xml', sitemap);
    }
    
    generateRobotsTxt() {
        const robots = `User-agent: *
Allow: /

Sitemap: https://jamcamping.com/sitemap.xml`;
        
        fs.writeFileSync('./dist/robots.txt', robots);
    }
    
    formatCategory(category) {
        const categories = {
            'shade': '🏠 Shade & Shelter',
            'lighting': '💡 Lighting',
            'comfort': '🛋️ Comfort',
            'power': '⚡ Power & Tech',
            'cooling': '❄️ Cooling',
            'storage': '📦 Storage'
        };
        return categories[category] || category;
    }
    
    formatDifficulty(difficulty) {
        const difficulties = {
            'beginner': '🌱 Beginner',
            'intermediate': '🌿 Intermediate',
            'advanced': '🌳 Advanced'
        };
        return difficulties[difficulty] || difficulty;
    }
}

// Run prerendering
if (require.main === module) {
    const generator = new PrerenderGenerator();
    generator.generateStaticPages();
    console.log('✅ Static pages generated for SEO');
}

module.exports = PrerenderGenerator;