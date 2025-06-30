#!/usr/bin/env node

/**
 * ===== SEO BUILD SCRIPT FOR JAMCAMPING =====
 * 
 * This Node.js script generates SEO-optimized static pages and metadata
 * for the JamCamping website. It runs after the main Vite build process
 * to create individual pages for each project and shop item.
 * 
 * WHY THIS IS NECESSARY:
 * - Single Page Applications (SPAs) have poor SEO by default
 * - Search engines need individual URLs for each piece of content
 * - Social media sharing requires specific meta tags per page
 * - Structured data helps search engines understand content
 * 
 * WHAT THIS SCRIPT DOES:
 * 1. Generates individual HTML pages for each project and shop item
 * 2. Creates optimized meta tags for each page (title, description, etc.)
 * 3. Adds structured data (JSON-LD) for rich search results
 * 4. Generates XML sitemap for search engine crawling
 * 5. Creates canonical URLs for proper indexing
 * 
 * SEO BENEFITS:
 * - Individual pages can rank for specific project searches
 * - Rich snippets in search results (ratings, prices, etc.)
 * - Better social media sharing with custom meta tags
 * - Improved crawlability with XML sitemap
 * - Faster indexing with structured data
 * 
 * BUSINESS IMPACT:
 * - Increased organic search traffic
 * - Better conversion rates from targeted landing pages
 * - Improved social media engagement
 * - Higher search engine rankings for project-specific queries
 * 
 * @version 1.0.0
 * @requires node >=18.0.0
 */

const fs = require('fs');
const path = require('path');

/**
 * SEO BUILDER CLASS
 * 
 * Main class that orchestrates the SEO page generation process.
 * Follows object-oriented principles for maintainability and testability.
 */
class SEOBuilder {
    /**
     * CONSTRUCTOR
     * 
     * Initializes the SEO builder with directory paths and empty data arrays.
     * Sets up the foundation for the build process.
     */
    constructor() {
        // Directory paths for build process
        this.distDir = './dist';           // Output directory (Vite build output)
        this.srcDir = './src';             // Source directory (original files)
        
        // Data arrays to be populated from JSON files
        this.projects = [];                // Project data from projects.json
        this.shopItems = [];               // Shop data from shop.json
        this.baseTemplate = '';            // Base HTML template for page generation
    }

    /**
     * MAIN BUILD METHOD
     * 
     * Orchestrates the entire SEO build process.
     * Handles errors gracefully and provides clear logging.
     * 
     * BUILD PROCESS:
     * 1. Load data from JSON files
     * 2. Load base HTML template
     * 3. Generate individual pages for projects and shop items
     * 4. Create XML sitemap for search engines
     * 5. Generate structured data for rich snippets
     */
    async build() {
        console.log('🎪 Building SEO-optimized pages...');
        
        try {
            // Load all necessary data and templates
            await this.loadData();
            await this.loadTemplate();
            
            // Generate individual pages for each content item
            await this.generatePages();
            
            // Create search engine optimization files
            await this.generateSitemap();
            await this.generateStructuredData();
            
            console.log('✅ SEO build complete!');
        } catch (error) {
            console.error('❌ SEO build failed:', error);
            process.exit(1);  // Exit with error code for CI/CD pipelines
        }
    }

    /**
     * DATA LOADING METHOD
     * 
     * Loads project and shop data from JSON files.
     * Provides error handling and validation for data integrity.
     * 
     * DATA SOURCES:
     * - projects.json: DIY project information
     * - shop.json: Digital and physical product information
     */
    async loadData() {
        try {
            const projectsPath = path.join(this.srcDir, 'data', 'projects.json');
            const shopPath = path.join(this.srcDir, 'data', 'shop.json');
            
            // Read and parse JSON files
            this.projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
            this.shopItems = JSON.parse(fs.readFileSync(shopPath, 'utf8'));
            
            console.log(`📊 Loaded ${this.projects.length} projects and ${this.shopItems.length} shop items`);
            
            // Validate data integrity
            if (this.projects.length === 0) {
                console.warn('⚠️ No projects found - this may impact SEO');
            }
            if (this.shopItems.length === 0) {
                console.warn('⚠️ No shop items found - this may impact SEO');
            }
            
        } catch (error) {
            console.error('Failed to load data:', error);
            throw error;
        }
    }

    /**
     * TEMPLATE LOADING METHOD
     * 
     * Loads the base HTML template that will be used to generate individual pages.
     * The template comes from the Vite build output (dist/index.html).
     */
    async loadTemplate() {
        try {
            const templatePath = path.join(this.distDir, 'index.html');
            this.baseTemplate = fs.readFileSync(templatePath, 'utf8');
            console.log('📄 Base template loaded successfully');
        } catch (error) {
            console.error('Failed to load template:', error);
            throw error;
        }
    }

    /**
     * PAGE GENERATION METHOD
     * 
     * Creates individual HTML pages for each project and shop item.
     * Each page gets its own URL, meta tags, and structured data.
     * 
     * URL STRUCTURE:
     * - Projects: /projects/{id}/index.html
     * - Shop items: /shop/{id}/index.html
     * 
     * This structure enables clean URLs without file extensions.
     */
    async generatePages() {
        // Generate individual project pages
        const projectsDir = path.join(this.distDir, 'projects');
        if (!fs.existsSync(projectsDir)) {
            fs.mkdirSync(projectsDir, { recursive: true });
        }

        for (const project of this.projects) {
            await this.generateProjectPage(project);
        }

        // Generate shop item pages
        const shopDir = path.join(this.distDir, 'shop');
        if (!fs.existsSync(shopDir)) {
            fs.mkdirSync(shopDir, { recursive: true });
        }

        for (const item of this.shopItems) {
            await this.generateShopPage(item);
        }

        console.log(`📄 Generated ${this.projects.length + this.shopItems.length} SEO pages`);
    }

    /**
     * PROJECT PAGE GENERATION
     * 
     * Creates an individual HTML page for a specific project.
     * Includes optimized meta tags, structured data, and canonical URLs.
     * 
     * @param {Object} project - Project data object from projects.json
     * 
     * SEO OPTIMIZATIONS:
     * - Custom title with project name and site branding
     * - Meta description with project details and keywords
     * - Open Graph tags for social media sharing
     * - Structured data (HowTo schema) for rich snippets
     * - Canonical URL to prevent duplicate content issues
     */
    async generateProjectPage(project) {
        // Create directory for this project
        const projectDir = path.join(this.distDir, 'projects', project.id.toString());
        if (!fs.existsSync(projectDir)) {
            fs.mkdirSync(projectDir, { recursive: true });
        }

        // Generate SEO-optimized meta content
        const title = `${project.title} - DIY Festival Project | JamCamping`;
        const description = `${project.description} Learn how to build this ${project.category} project for your festival campsite. Difficulty: ${project.difficulty}.`;
        const keywords = `${project.title}, ${project.category}, festival ${project.category}, DIY ${project.category}, ${project.difficulty} build`;

        // Start with base template
        let html = this.baseTemplate;

        /**
         * META TAG UPDATES
         * 
         * Replace generic meta tags with project-specific content.
         * This ensures each page has unique, relevant metadata.
         */
        
        // Update page title
        html = html.replace(
            /<title>.*?<\/title>/,
            `<title>${title}</title>`
        );

        // Update meta description
        html = html.replace(
            /(<meta name="description" content=")[^"]*(")/,
            `$1${description}$2`
        );

        // Update meta keywords
        html = html.replace(
            /(<meta name="keywords" content=")[^"]*(")/,
            `$1${keywords}$2`
        );

        /**
         * OPEN GRAPH UPDATES
         * 
         * Update Open Graph meta tags for better social media sharing.
         * These tags control how the page appears when shared on Facebook, Twitter, etc.
         */
        
        // Update Open Graph title
        html = html.replace(
            /(<meta property="og:title" content=")[^"]*(")/,
            `$1${title}$2`
        );

        // Update Open Graph description
        html = html.replace(
            /(<meta property="og:description" content=")[^"]*(")/,
            `$1${description}$2`
        );

        // Update Open Graph URL
        html = html.replace(
            /(<meta property="og:url" content=")[^"]*(")/,
            `$1https://jamcamping.com/projects/${project.id}$2`
        );

        /**
         * CANONICAL URL
         * 
         * Add canonical URL to prevent duplicate content issues.
         * This tells search engines which URL is the authoritative version.
         */
        html = html.replace(
            '</head>',
            `    <link rel="canonical" href="https://jamcamping.com/projects/${project.id}">\n</head>`
        );

        /**
         * STRUCTURED DATA
         * 
         * Add JSON-LD structured data for rich search results.
         * Uses HowTo schema which is perfect for DIY projects.
         */
        const structuredData = this.generateProjectStructuredData(project);
        html = html.replace(
            '</head>',
            `    <script type="application/ld+json">${JSON.stringify(structuredData, null, 2)}</script>\n</head>`
        );

        // Write the generated HTML to file
        fs.writeFileSync(path.join(projectDir, 'index.html'), html);
        console.log(`📄 Generated project page: /projects/${project.id}`);
    }

    /**
     * SHOP PAGE GENERATION
     * 
     * Creates an individual HTML page for a specific shop item.
     * Similar to project pages but optimized for product content.
     * 
     * @param {Object} item - Shop item data object from shop.json
     */
    async generateShopPage(item) {
        // Create directory for this shop item
        const itemDir = path.join(this.distDir, 'shop', item.id);
        if (!fs.existsSync(itemDir)) {
            fs.mkdirSync(itemDir, { recursive: true });
        }

        // Generate SEO-optimized meta content
        const title = `${item.title} - Festival Guide | JamCamping Shop`;
        const description = item.description;
        const keywords = `${item.title}, festival guide, camping book, DIY manual`;

        // Start with base template
        let html = this.baseTemplate;

        // Update meta tags (same process as project pages)
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

        /**
         * PRODUCT STRUCTURED DATA
         * 
         * Add Product schema for e-commerce rich snippets.
         * Enables price, availability, and review information in search results.
         */
        const structuredData = this.generateProductStructuredData(item);
        html = html.replace(
            '</head>',
            `    <script type="application/ld+json">${JSON.stringify(structuredData, null, 2)}</script>\n</head>`
        );

        // Write the generated HTML to file
        fs.writeFileSync(path.join(itemDir, 'index.html'), html);
        console.log(`📄 Generated shop page: /shop/${item.id}`);
    }

    /**
     * PROJECT STRUCTURED DATA GENERATOR
     * 
     * Creates HowTo structured data for DIY projects.
     * This enables rich snippets in search results with ratings, time, cost, etc.
     * 
     * @param {Object} project - Project data object
     * @returns {Object} JSON-LD structured data object
     * 
     * SCHEMA BENEFITS:
     * - Rich snippets in search results
     * - Better click-through rates
     * - Enhanced search engine understanding
     * - Potential for featured snippets
     */
    generateProjectStructuredData(project) {
        // Calculate total cost for functional build
        const functionalTotal = project.functionalParts.reduce((sum, part) => sum + (part.price * part.quantity), 0);

        return {
            "@context": "https://schema.org",
            "@type": "HowTo",                          // Perfect schema type for DIY projects
            "name": project.title,
            "description": project.description,
            "image": `https://jamcamping.com/images/projects/${project.id}.jpg`,
            "totalTime": project.buildTime,           // Helps users plan their time
            "estimatedCost": {
                "@type": "MonetaryAmount",
                "currency": "USD",
                "value": functionalTotal                // Shows cost in search results
            },
            "supply": project.functionalParts.map(part => ({
                "@type": "HowToSupply",
                "name": part.item,
                "requiredQuantity": part.quantity
            })),
            "tool": [{
                "@type": "HowToTool",
                "name": "Basic tools"                  // Generic tool requirement
            }],
            "step": [{
                "@type": "HowToStep",
                "text": project.instructions,
                "name": "Build Instructions"
            }],
            // Additional metadata for better categorization
            "category": project.category,
            "difficulty": project.difficulty,
            "keywords": `${project.category}, festival camping, DIY, ${project.difficulty}`
        };
    }

    /**
     * PRODUCT STRUCTURED DATA GENERATOR
     * 
     * Creates Product structured data for shop items.
     * Enables e-commerce rich snippets with pricing and availability.
     * 
     * @param {Object} item - Shop item data object
     * @returns {Object} JSON-LD structured data object
     */
    generateProductStructuredData(item) {
        return {
            "@context": "https://schema.org",
            "@type": "Product",                        // E-commerce product schema
            "name": item.title,
            "description": item.description,
            "image": item.cover,
            "brand": {
                "@type": "Brand",
                "name": "JamCamping"                   // Brand recognition in search
            },
            "offers": {
                "@type": "AggregateOffer",             // Multiple pricing options
                "lowPrice": Math.min(...item.digital.map(d => parseFloat(d.price))),
                "highPrice": Math.max(...item.print.map(p => parseFloat(p.price))),
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock",
                "offers": [
                    // Individual digital format offers
                    ...item.digital.map(format => ({
                        "@type": "Offer",
                        "name": `Digital ${format.format}`,
                        "price": format.price,
                        "priceCurrency": "USD",
                        "availability": "https://schema.org/InStock"
                    })),
                    // Individual print format offers
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

    /**
     * SITEMAP GENERATION
     * 
     * Creates an XML sitemap for search engine crawling.
     * Lists all pages with priority and update frequency hints.
     * 
     * SITEMAP BENEFITS:
     * - Helps search engines discover all pages
     * - Provides crawling priority hints
     * - Indicates update frequency for efficient crawling
     * - Required for Google Search Console submission
     */
    async generateSitemap() {
        const baseUrl = 'https://jamcamping.com';
        
        // Start with main site pages
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
                priority: '0.8',                       // High priority for main content
                changefreq: 'monthly',                 // Projects don't change often
                lastmod: new Date().toISOString().split('T')[0]  // Current date
            });
        });

        // Add shop URLs
        this.shopItems.forEach(item => {
            urls.push({
                loc: `${baseUrl}/shop/${item.id}`,
                priority: '0.7',                       // Medium-high priority for products
                changefreq: 'monthly',                 // Products don't change often
                lastmod: new Date().toISOString().split('T')[0]
            });
        });

        /**
         * XML SITEMAP FORMAT
         * 
         * Standard XML sitemap format as defined by sitemaps.org.
         * Includes all required and optional elements for maximum compatibility.
         */
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `    <url>
        <loc>${url.loc}</loc>
        <priority>${url.priority}</priority>
        <changefreq>${url.changefreq}</changefreq>
        ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    </url>`).join('\n')}
</urlset>`;

        // Write sitemap to dist directory
        fs.writeFileSync(path.join(this.distDir, 'sitemap.xml'), sitemap);
        console.log('🗺️  Generated sitemap.xml');
    }

    /**
     * STRUCTURED DATA GENERATION
     * 
     * Creates a main structured data file for the entire website.
     * Provides site-level information and content organization.
     */
    async generateStructuredData() {
        /**
         * WEBSITE STRUCTURED DATA
         * 
         * Main website schema with search functionality and content listing.
         * Helps search engines understand the site structure and purpose.
         */
        const mainStructuredData = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "JamCamping",
            "description": "Digital Shakedown Street for festival DIY projects",
            "url": "https://jamcamping.com",
            "potentialAction": {
                "@type": "SearchAction",              // Enables search box in Google results
                "target": "https://jamcamping.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
            },
            "mainEntity": {
                "@type": "ItemList",                  // List of main content items
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

        // Write structured data to dist directory
        fs.writeFileSync(
            path.join(this.distDir, 'structured-data.json'),
            JSON.stringify(mainStructuredData, null, 2)
        );

        console.log('📋 Generated structured data');
    }
}

/**
 * SCRIPT EXECUTION
 * 
 * Main execution block that runs when the script is called directly.
 * Handles errors and provides appropriate exit codes for CI/CD systems.
 */
if (require.main === module) {
    const builder = new SEOBuilder();
    builder.build().catch((error) => {
        console.error('💥 SEO build script failed:', error);
        process.exit(1);  // Exit with error code for automated systems
    });
}

// Export the class for potential testing or reuse
module.exports = SEOBuilder;
