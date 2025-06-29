#!/usr/bin/env node

// ===== SEO BUILD SCRIPT FOR JAMCAMPING =====
// Generates SEO-optimized static pages and metadata

const fs = require('fs');
const path = require('path');

class SEOBuilder {
    constructor() {
        this.distDir = './dist';
        this.srcDir = './src';
        this.projects = [];
        this.shopItems = [];
        this.baseTemplate = '';
    }

    async build() {
        console.log('🎪 Building SEO-optimized pages...');
        
        try {
            await this.loadData();
            await this.loadTemplate();
            await this.generatePages();
            await this.generateSitemap();
            await this.generateStructuredData();
            
            console.log('✅ SEO build complete!');
        } catch (error) {
            console.error('❌ SEO build failed:', error);
            process.exit(1);
        }
    }

    async loadData() {
        try {
            const projectsPath = path.join(this.srcDir, 'data', 'projects.json');
            const shopPath = path.join(this.srcDir, 'data', 'shop.json');
            
            this.projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
            this.shopItems = JSON.parse(fs.readFileSync(shopPath, 'utf8'));
            
            console.log(`📊 Loaded ${this.projects.length} projects and ${this.shopItems.length} shop items`);
        } catch (error) {
            console.error('Failed to load data:', error);
            throw error;
        }
    }

    async loadTemplate() {
        try {
            const templatePath = path.join(this.distDir, 'index.html');
            this.baseTemplate = fs.readFileSync(templatePath, 'utf8');
        } catch (error) {
            console.error('Failed to load template:', error);
            throw error;
        }
    }

    async generatePages() {
        // Generate individual project pages
        const projectsDir = path.join(this.distDir, 'projects');
        if (!fs.existsSync(projectsDir)) {
            fs.mkdirSync(projectsDir, { recursive: true });
        }

        for (const project of this.projects) {
            await this.generateProjectPage(project);
        }

        // Generate shop pages
        const shopDir = path.join(this.distDir, 'shop');
        if (!fs.existsSync(shopDir)) {
            fs.mkdirSync(shopDir, { recursive: true });
        }

        for (const item of this.shopItems) {
            await this.generateShopPage(item);
        }

        console.log(`📄 Generated ${this.projects.length + this.shopItems.length} SEO pages`);
    }

    async generateProjectPage(project) {
        const projectDir = path.join(this.distDir, 'projects', project.id.toString());
        if (!fs.existsSync(projectDir)) {
            fs.mkdirSync(projectDir, { recursive: true });
        }

        const title = `${project.title} - DIY Festival Project | JamCamping`;
        const description = `${project.description} Learn how to build this ${project.category} project for your festival campsite. Difficulty: ${project.difficulty}.`;
        const keywords = `${project.title}, ${project.category}, festival ${project.category}, DIY ${project.category}, ${project.difficulty} build`;

        let html = this.baseTemplate;

        // Update meta tags
        html = html.replace(
            /<title>.*?<\/title>/,
            `<title>${title}</title>`
        );

        html = html.replace(
            /(<meta name="description" content=")[^"]*(")/,
            `$1${description}$2`
        );

        html = html.replace(
            /(<meta name="keywords" content=")[^"]*(")/,
            `$1${keywords}$2`
        );

        // Update Open Graph
        html = html.replace(
            /(<meta property="og:title" content=")[^"]*(")/,
            `$1${title}$2`
        );

        html = html.replace(
            /(<meta property="og:description" content=")[^"]*(")/,
            `$1${description}$2`
        );

        html = html.replace(
            /(<meta property="og:url" content=")[^"]*(")/,
            `$1https://jamcamping.com/projects/${project.id}$2`
        );

        // Add canonical URL
        html = html.replace(
            '</head>',
            `    <link rel="canonical" href="https://jamcamping.com/projects/${project.id}">\n</head>`
        );

        // Add project structured data
        const structuredData = this.generateProjectStructuredData(project);
        html = html.replace(
            '</head>',
            `    <script type="application/ld+json">${JSON.stringify(structuredData, null, 2)}</script>\n</head>`
        );

        fs.writeFileSync(path.join(projectDir, 'index.html'), html);
    }

    async generateShopPage(item) {
        const itemDir = path.join(this.distDir, 'shop', item.id);
        if (!fs.existsSync(itemDir)) {
            fs.mkdirSync(itemDir, { recursive: true });
        }

        const title = `${item.title} - Festival Guide | JamCamping Shop`;
        const description = item.description;
        const keywords = `${item.title}, festival guide, camping book, DIY manual`;

        let html = this.baseTemplate;

        // Update meta tags
        html = html.replace(
            /<title>.*?<\/title>/,
            `<title>${title}</title>`
        );

        html = html.replace(
            /(<meta name="description" content=")[^"]*(")/,
            `$1${description}$2`
        );

        html = html.replace(
            /(<meta name="keywords" content=")[^"]*(")/,
            `$1${keywords}$2`
        );

        // Add product structured data
        const structuredData = this.generateProductStructuredData(item);
        html = html.replace(
            '</head>',
            `    <script type="application/ld+json">${JSON.stringify(structuredData, null, 2)}</script>\n</head>`
        );

        fs.writeFileSync(path.join(itemDir, 'index.html'), html);
    }

    generateProjectStructuredData(project) {
        const functionalTotal = project.functionalParts.reduce((sum, part) => sum + (part.price * part.quantity), 0);

        return {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": project.title,
            "description": project.description,
            "image": `https://jamcamping.com/images/projects/${project.id}.jpg`,
            "totalTime": project.buildTime,
            "estimatedCost": {
                "@type": "MonetaryAmount",
                "currency": "USD",
                "value": functionalTotal
            },
            "supply": project.functionalParts.map(part => ({
                "@type": "HowToSupply",
                "name": part.item,
                "requiredQuantity": part.quantity
            })),
            "tool": [{
                "@type": "HowToTool",
                "name": "Basic tools"
            }],
            "step": [{
                "@type": "HowToStep",
                "text": project.instructions,
                "name": "Build Instructions"
            }],
            "category": project.category,
            "difficulty": project.difficulty,
            "keywords": `${project.category}, festival camping, DIY, ${project.difficulty}`
        };
    }

    generateProductStructuredData(item) {
        return {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": item.title,
            "description": item.description,
            "image": item.cover,
            "brand": {
                "@type": "Brand",
                "name": "JamCamping"
            },
            "offers": {
                "@type": "AggregateOffer",
                "lowPrice": Math.min(...item.digital.map(d => parseFloat(d.price))),
                "highPrice": Math.max(...item.print.map(p => parseFloat(p.price))),
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock",
                "offers": [
                    ...item.digital.map(format => ({
                        "@type": "Offer",
                        "name": `Digital ${format.format}`,
                        "price": format.price,
                        "priceCurrency": "USD",
                        "availability": "https://schema.org/InStock"
                    })),
                    ...item.print.map(format => ({
                        "@type": "Offer",
                        "name": format.format,
                        "price": format.price,
                        "priceCurrency": "USD",
                        "availability": "https://schema.org/InStock"
                    }))
                ]
            }
        };
    }

    async generateSitemap() {
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

        // Add shop URLs
        this.shopItems.forEach(item => {
            urls.push({
                loc: `${baseUrl}/shop/${item.id}`,
                priority: '0.7',
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

        fs.writeFileSync(path.join(this.distDir, 'sitemap.xml'), sitemap);
        console.log('🗺️  Generated sitemap.xml');
    }

    async generateStructuredData() {
        // Generate main site structured data
        const mainStructuredData = {
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

        fs.writeFileSync(
            path.join(this.distDir, 'structured-data.json'),
            JSON.stringify(mainStructuredData, null, 2)
        );

        console.log('📋 Generated structured data');
    }
}

// Run the SEO builder
if (require.main === module) {
    const builder = new SEOBuilder();
    builder.build().catch(console.error);
}

module.exports = SEOBuilder;