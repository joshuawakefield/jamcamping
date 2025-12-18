#!/usr/bin/env node
/**
 * ===== ENHANCED SEO BUILD SCRIPT FOR JAMCAMPING =====
 *
 * Fully rewritten and improved version of build-seo.js
 * 
 * KEY IMPROVEMENTS:
 * - Generates fully static, rich content for /projects/{id} and /products/{id} pages
 * - No longer relies solely on the SPA template (avoids empty pages if JS fails)
 * - Loads Vite manifest.json to inject correctly hashed CSS/JS assets
 * - Calculates GA/VIP totals and displays professional parts tables
 * - Splits instructions into ordered steps for better readability and HowTo schema
 * - Displays lyric easter eggs, problem solved, category, difficulty, etc.
 * - Rich product pages with cover images, pricing tables, and direct buy links
 * - Enhanced structured data (multi-step HowTo, better product offers)
 * - Fallback inline styles for basic readability even if CSS fails
 * - Consistent loading of data from public/data (post-copy:data step)
 * - Extensive comments preserved and expanded
 *
 * @version 2.0.0
 * @requires node >=18.0.0
 * @requires vite build with "manifest: true" in vite.config.js
 */

const fs = require('fs');
const path = require('path');

class SEOBuilder {
    constructor() {
        // Resolved absolute paths for reliability
        this.distDir = path.resolve(__dirname, '../dist');
        this.publicDir = path.resolve(__dirname, '../public');

        // Data containers
        this.projects = [];
        this.products = [];
        this.manifest = {};
    }

    async build() {
        console.log('🎪 Starting enhanced SEO build...');

        try {
            await this.loadManifest();
            await this.loadData();

            await this.generatePages();
            await this.generateSitemap();
            await this.generateStructuredData();

            console.log('✅ Enhanced SEO build complete!');
        } catch (error) {
            console.error('❌ SEO build failed:', error);
            process.exit(1);
        }
    }

    /**
     * Load Vite manifest for hashed asset paths
     * Requires "build: { manifest: true }" in vite.config.js
     */
    async loadManifest() {
        const manifestPath = path.join(this.distDir, 'manifest.json');
        if (fs.existsSync(manifestPath)) {
            this.manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            console.log('📦 Manifest loaded for hashed assets');
        } else {
            console.warn('⚠️ No manifest.json found – ensure "manifest: true" in vite.config.js');
            this.manifest = {};
        }
    }

    /**
     * Load project and product data from public/data (available after copy:data script)
     */
    async loadData() {
        try {
            const projectsPath = path.join(this.publicDir, 'data', 'projects.json');
            const productsPath = path.join(this.publicDir, 'data', 'products.json');

            this.projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
            this.products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

            console.log(`📊 Loaded ${this.projects.length} projects and ${this.products.length} products`);
        } catch (error) {
            console.error('Failed to load data:', error);
            throw error;
        }
    }

    /**
     * Generate all individual SEO pages (projects + products)
     */
    async generatePages() {
        // Projects
        const projectsDir = path.join(this.distDir, 'projects');
        fs.mkdirSync(projectsDir, { recursive: true });

        for (const project of this.projects) {
            await this.generateProjectPage(project);
        }

        // Products
        const productsDir = path.join(this.distDir, 'products');
        fs.mkdirSync(productsDir, { recursive: true });

        for (const item of this.products) {
            await this.generateProductPage(item);
        }

        console.log(`📄 Generated ${this.projects.length + this.products.length} rich SEO pages`);
    }

    /**
     * Helper: Get <link> tags for all CSS files from manifest
     */
    getCssLinks() {
        let cssLinks = '';
        for (const key in this.manifest) {
            if (this.manifest[key].css) {
                this.manifest[key].css.forEach(cssFile => {
                    cssLinks += `  <link rel="stylesheet" href="/${cssFile}">\n`;
                });
            }
        }
        return cssLinks;
    }

    /**
     * Helper: Get <script type="module"> tags for entry JS
     */
    getJsScripts() {
        let jsScripts = '';
        for (const key in this.manifest) {
            const asset = this.manifest[key];
            if (asset.isEntry || (asset.file && key.includes('main.js'))) {
                jsScripts += `  <script type="module" src="/${asset.file}"></script>\n`;
            }
        }
        return jsScripts;
    }

    /**
     * Generate rich static project page
     */
    async generateProjectPage(project) {
        const projectDir = path.join(this.distDir, 'projects', project.id.toString());
        fs.mkdirSync(projectDir, { recursive: true });

        // Calculate totals
        const gaTotal = project.functionalParts.reduce((sum, part) => sum + part.price * part.quantity, 0).toFixed(2);
        const vipTotal = project.extravagantParts.reduce((sum, part) => sum + part.price * part.quantity, 0).toFixed(2);

        // Parts tables
        const gaTable = this.generatePartsTable(project.functionalParts, 'GA Build 🎫', gaTotal);
        const vipTable = this.generatePartsTable(project.extravagantParts, 'VIP Build 🎟️', vipTotal);

        // Split instructions into steps
        const rawSteps = project.instructions.split(/\.\s*/).map(s => s.trim()).filter(s => s);
        const stepsHtml = rawSteps.map(step => `<li>${step.endsWith('.') ? step : step + '.'}</li>`).join('\n    ');

        // Enhanced HowTo schema with multiple steps
        const structuredData = this.generateProjectStructuredData(project, rawSteps, gaTotal);

        // Page metadata
        const title = `${project.title} - DIY Festival Project | JamCamping`;
        const description = `${project.description} Difficulty: ${project.difficulty}. Build time: ${project.buildTime}. Problem solved: ${project.problemSolved}.`;

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="https://jamcamping.com/projects/${project.id}/">

  <!-- Open Graph -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="https://jamcamping.com/projects/${project.id}/">
  <meta property="og:type" content="article">
  <!-- Placeholder OG image until real project images exist -->
  <meta property="og:image" content="https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1200">

  <!-- Hashed assets from Vite manifest -->
${this.getCssLinks()}
${this.getJsScripts()}

  <!-- Structured Data -->
  <script type="application/ld+json">
${JSON.stringify(structuredData, null, 2)}
  </script>

  <!-- Fallback styles if CSS fails -->
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 1rem; line-height: 1.6; background: #000; color: #fff; }
    h1, h2 { text-align: center; }
    table { width: 100%; border-collapse: collapse; margin: 2rem 0; background: rgba(255,255,255,0.1); }
    th, td { border: 1px solid #444; padding: 0.75rem; text-align: left; }
    blockquote { font-style: italic; border-left: 4px solid #ff6b35; padding-left: 1rem; margin: 2rem 0; font-size: 1.2em; }
    a { color: #ff6b35; }
  </style>
</head>
<body>
  <main class="project-detail">
    <h1>${project.image} ${project.title}</h1>
    <p><strong>Category:</strong> ${project.category} • <strong>Difficulty:</strong> ${project.difficulty} • <strong>Build Time:</strong> ${project.buildTime}</p>
    <p><em>Problem Solved: ${project.problemSolved}</em></p>
    <p>${project.description}</p>

    ${gaTable}
    ${vipTable}

    <h2>🛠️ Step-by-Step Instructions</h2>
    <ol>
    ${stepsHtml}
    </ol>

    <blockquote class="lyric-easter-egg">
      ${project.lyricEasterEgg}
    </blockquote>

    <p style="text-align: center;">
      <a href="/">← Back to JamCamping Main Stage</a> • Keep on truckin'! 🎪✨
    </p>
  </main>
</body>
</html>`;

        fs.writeFileSync(path.join(projectDir, 'index.html'), html);
        console.log(`📄 Generated rich project page: /projects/${project.id}`);
    }

    /**
     * Helper: Generate parts table HTML
     */
    generatePartsTable(parts, buildLabel, total) {
        const rows = parts.map(part => `
      <tr>
        <td>${part.item}</td>
        <td>${part.quantity}</td>
        <td>$${part.price}</td>
        <td>$${(part.price * part.quantity).toFixed(2)}</td>
      </tr>`).join('\n');

        return `
    <section class="build-section">
      <h2>${buildLabel} (Total: $${total})</h2>
      <table class="parts-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Price Each</th>
            <th>Line Total</th>
          </tr>
        </thead>
        <tbody>
${rows}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3"><strong>Total</strong></td>
            <td><strong>$${total}</strong></td>
          </tr>
        </tfoot>
      </table>
    </section>`;
    }

    /**
     * Enhanced Project Structured Data with multi-step HowTo
     */
    generateProjectStructuredData(project, steps, gaTotal) {
        return {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": `${project.title} - DIY Festival Build`,
            "description": project.description,
            "image": "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1200",
            "totalTime": `PT${project.buildTime.split('-')[0]}H`, // Approximate
            "estimatedCost": {
                "@type": "MonetaryAmount",
                "currency": "USD",
                "value": gaTotal
            },
            "supply": project.functionalParts.map(part => ({
                "@type": "HowToSupply",
                "name": `${part.quantity} × ${part.item}`
            })),
            "step": steps.map((text, i) => ({
                "@type": "HowToStep",
                "name": `Step ${i + 1}`,
                "text": text.endsWith('.') ? text : text + '.'
            }))
        };
    }

    /**
     * Generate rich static product page
     */
    async generateProductPage(item) {
        const itemDir = path.join(this.distDir, 'products', item.id);
        fs.mkdirSync(itemDir, { recursive: true });

        const title = `${item.title} | JamCamping`;
        const description = item.description;

        // Pricing sections
        const digitalRows = item.digital.map(d => `
      <tr>
        <td>Digital ${d.format}</td>
        <td>$${d.price}</td>
        <td><a href="${d.buy_url}" target="_blank" rel="noopener">Buy Now →</a></td>
      </tr>`).join('\n');

        let bundleHtml = '';
        if (item.bundle) {
            bundleHtml = `
      <h3>Bundle Deal (Save $${item.bundle.savings})</h3>
      <p><strong>All formats – $${item.bundle.price}</strong></p>
      <p><a href="${item.bundle.buy_url}" target="_blank" rel="noopener">Get the Bundle →</a></p>`;
        }

        const printRows = item.print.map(p => `
      <tr>
        <td>${p.format} ${p.shipping ? '(+ shipping)' : ''}</td>
        <td>$${p.price}</td>
        <td><a href="${p.buy_url}" target="_blank" rel="noopener">Order Print →</a></td>
      </tr>`).join('\n');

        const structuredData = this.generateProductStructuredData(item);

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="https://jamcamping.com/products/${item.id}/">

  <!-- Open Graph -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="https://jamcamping.com/products/${item.id}/">
  <meta property="og:type" content="product">
  <meta property="og:image" content="${item.cover}">

  <!-- Hashed assets -->
${this.getCssLinks()}
${this.getJsScripts()}

  <!-- Structured Data -->
  <script type="application/ld+json">
${JSON.stringify(structuredData, null, 2)}
  </script>

  <!-- Fallback styles -->
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 1rem; line-height: 1.6; background: #000; color: #fff; }
    img { max-width: 100%; height: auto; border-radius: 12px; }
    table { width: 100%; border-collapse: collapse; margin: 2rem 0; }
    th, td { border: 1px solid #444; padding: 0.75rem; }
    a { color: #ff6b35; }
  </style>
</head>
<body>
  <main class="product-detail">
    <h1>${item.title}</h1>
    <img src="${item.cover}" alt="${item.title} cover">
    <p>${item.description}</p>

    <section>
      <h2>💿 Digital Downloads</h2>
      <table>
        <thead><tr><th>Format</th><th>Price</th><th></th></tr></thead>
        <tbody>${digitalRows}</tbody>
      </table>
      ${bundleHtml}
    </section>

    <section>
      <h2>📚 Print Editions</h2>
      <table>
        <thead><tr><th>Format</th><th>Price</th><th></th></tr></thead>
        <tbody>${printRows}</tbody>
      </table>
    </section>

    <p style="text-align: center;">
      <a href="/">← Back to Vendor Row</a> • Keep the vibes flowing! 🎵
    </p>
  </main>
</body>
</html>`;

        fs.writeFileSync(path.join(itemDir, 'index.html'), html);
        console.log(`📄 Generated rich product page: /products/${item.id}`);
    }

    generateProductStructuredData(item) {
        // Existing good implementation – kept with minor cleanup
        const digitalPrices = item.digital.map(d => parseFloat(d.price));
        const printPrices = item.print.map(p => parseFloat(p.price));
        const allPrices = [...digitalPrices, ...printPrices, item.bundle ? parseFloat(item.bundle.price) : []];

        return {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": item.title,
            "description": item.description,
            "image": item.cover,
            "brand": { "@type": "Brand", "name": "JamCamping" },
            "offers": {
                "@type": "AggregateOffer",
                "lowPrice": Math.min(...allPrices),
                "highPrice": Math.max(...allPrices),
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
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

        this.projects.forEach(project => {
            urls.push({
                loc: `${baseUrl}/projects/${project.id}`,
                priority: '0.9',
                changefreq: 'monthly',
                lastmod: new Date().toISOString().split('T')[0]
            });
        });

        this.products.forEach(item => {
            urls.push({
                loc: `${baseUrl}/products/${item.id}`,
                priority: '0.8',
                changefreq: 'monthly',
                lastmod: new Date().toISOString().split('T')[0]
            });
        });

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <priority>${url.priority}</priority>
    <changefreq>${url.changefreq}</changefreq>
    ${url.lastmod ? `    <lastmod>${url.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

        fs.writeFileSync(path.join(this.distDir, 'sitemap.xml'), sitemap);
        console.log('🗺️ Generated sitemap.xml');
    }

    async generateStructuredData() {
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
            }
        };

        fs.writeFileSync(path.join(this.distDir, 'structured-data.json'), JSON.stringify(mainStructuredData, null, 2));
        console.log('📋 Generated main structured data');
    }
}

if (require.main === module) {
    const builder = new SEOBuilder();
    builder.build().catch(error => {
        console.error('💥 SEO build script failed:', error);
        process.exit(1);
    });
}

module.exports = SEOBuilder;
