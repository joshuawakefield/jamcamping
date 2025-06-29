// ===== SEO MANAGER FOR JAMCAMPING =====
// Handles dynamic meta tags, structured data, and SEO optimization

class SEOManager {
    constructor() {
        this.baseTitle = "JamCamping - Digital Shakedown Street";
        this.baseMeta = {
            description: "The ultimate digital Shakedown Street for festival DIY projects. Swipe through legendary builds and cosmic knowledge.",
            keywords: "festival camping, DIY projects, grateful dead, phish, shakedown street, psychedelic camping"
        };
        
        this.setupDynamicSEO();
    }
    
    setupDynamicSEO() {
        // Update meta tags when sections change
        document.addEventListener('stageChanged', (e) => {
            this.updateStageMeta(e.detail.stage);
        });
        
        // Update meta tags when projects are viewed
        document.addEventListener('projectViewed', (e) => {
            this.updateProjectMeta(e.detail.project);
        });
        
        // Handle browser navigation
        window.addEventListener('popstate', () => {
            this.handleRouteChange();
        });
    }
    
    updateStageMeta(stage) {
        const stageMeta = {
            main: {
                title: "DIY Festival Projects - JamCamping",
                description: "Browse legendary DIY festival projects. From shade structures to LED totems, find your next epic build.",
                keywords: "DIY festival projects, campsite builds, festival hacks, shade structures",
                structuredData: this.createProjectListStructuredData()
            },
            vendor: {
                title: "Cosmic Knowledge Shop - Festival Guides | JamCamping",
                description: "Digital guides and books for creating legendary festival campsites. Written by heads for heads.",
                keywords: "festival guides, camping books, DIY manuals, cosmic knowledge",
                structuredData: this.createShopStructuredData()
            },
            chill: {
                title: "About JamCamping - Digital Shakedown Street",
                description: "Learn about JamCamping's mission to help festival goers create legendary campsites with DIY projects.",
                keywords: "about jamcamping, festival community, DIY camping, psychedelic culture"
            },
            submit: {
                title: "Submit Your Project - JamCamping Community",
                description: "Share your legendary campsite hack or DIY build with the JamCamping community.",
                keywords: "submit project, share build, festival community"
            },
            contact: {
                title: "Contact JamCamping - Festival DIY Community",
                description: "Contact JamCamping for collaborations, suggestions, or festival vibes.",
                keywords: "contact jamcamping, festival collaboration, DIY community"
            }
        };
        
        const meta = stageMeta[stage] || this.baseMeta;
        this.updatePageMeta(meta);
        
        // Update URL without page reload
        const newUrl = stage === 'main' ? '/' : `/#${stage}`;
        history.pushState({ stage }, meta.title, newUrl);
    }
    
    updateProjectMeta(project) {
        const title = `${project.title} - DIY Festival Project | JamCamping`;
        const description = `${project.description} Learn how to build this ${project.category} project for your festival campsite. Difficulty: ${project.difficulty}.`;
        const keywords = `${project.title}, ${project.category}, festival ${project.category}, DIY ${project.category}, ${project.difficulty} build`;
        
        this.updatePageMeta({
            title,
            description,
            keywords,
            structuredData: this.createProjectStructuredData(project)
        });
        
        // Update URL for project view
        const newUrl = `/projects/${project.id}`;
        history.pushState({ project: project.id }, title, newUrl);
    }
    
    updatePageMeta(meta) {
        // Update title
        document.title = meta.title;
        
        // Update meta description
        this.updateMetaTag('description', meta.description);
        this.updateMetaTag('keywords', meta.keywords);
        
        // Update Open Graph
        this.updateMetaProperty('og:title', meta.title);
        this.updateMetaProperty('og:description', meta.description);
        this.updateMetaProperty('og:url', window.location.href);
        
        // Update Twitter Card
        this.updateMetaProperty('twitter:title', meta.title);
        this.updateMetaProperty('twitter:description', meta.description);
        
        // Update structured data
        if (meta.structuredData) {
            this.updateStructuredData(meta.structuredData);
        }
    }
    
    updateMetaTag(name, content) {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = name;
            document.head.appendChild(meta);
        }
        meta.content = content;
    }
    
    updateMetaProperty(property, content) {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('property', property);
            document.head.appendChild(meta);
        }
        meta.content = content;
    }
    
    updateStructuredData(data) {
        // Remove existing dynamic structured data
        const existing = document.querySelector('#dynamic-structured-data');
        if (existing) {
            existing.remove();
        }
        
        // Add new structured data
        const script = document.createElement('script');
        script.id = 'dynamic-structured-data';
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
    }
    
    createProjectStructuredData(project) {
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
            "tool": [
                {
                    "@type": "HowToTool",
                    "name": "Basic tools"
                }
            ],
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
    
    createProjectListStructuredData() {
        return {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "JamCamping DIY Festival Projects",
            "description": "Curated collection of DIY campsite projects for music festival goers",
            "url": "https://jamcamping.com",
            "numberOfItems": window.app?.projects?.length || 8,
            "itemListElement": (window.app?.projects || []).slice(0, 5).map((project, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "HowTo",
                    "name": project.title,
                    "description": project.description,
                    "url": `https://jamcamping.com/projects/${project.id}`
                }
            }))
        };
    }
    
    createShopStructuredData() {
        return {
            "@context": "https://schema.org",
            "@type": "Store",
            "name": "JamCamping Cosmic Knowledge Shop",
            "description": "Digital guides and books for creating legendary festival campsites",
            "url": "https://jamcamping.com/shop",
            "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Festival Guides",
                "itemListElement": (window.app?.shopItems || []).map(item => ({
                    "@type": "Product",
                    "name": item.title,
                    "description": item.description,
                    "offers": {
                        "@type": "AggregateOffer",
                        "lowPrice": Math.min(...item.digital.map(d => parseFloat(d.price))),
                        "highPrice": Math.max(...item.print.map(p => parseFloat(p.price))),
                        "priceCurrency": "USD"
                    }
                }))
            }
        };
    }
    
    handleRouteChange() {
        const path = window.location.pathname;
        const hash = window.location.hash.slice(1);
        
        if (path.startsWith('/projects/')) {
            const projectId = parseInt(path.split('/')[2]);
            const project = window.app?.projects?.find(p => p.id === projectId);
            if (project) {
                this.updateProjectMeta(project);
            }
        } else if (hash) {
            this.updateStageMeta(hash);
        } else {
            this.updateStageMeta('main');
        }
    }
    
    // Generate sitemap data
    generateSitemap() {
        const baseUrl = 'https://jamcamping.com';
        const pages = [
            { url: baseUrl, priority: 1.0, changefreq: 'weekly' },
            { url: `${baseUrl}/#vendor`, priority: 0.8, changefreq: 'monthly' },
            { url: `${baseUrl}/#chill`, priority: 0.6, changefreq: 'monthly' },
            { url: `${baseUrl}/#submit`, priority: 0.7, changefreq: 'monthly' },
            { url: `${baseUrl}/#contact`, priority: 0.5, changefreq: 'monthly' }
        ];
        
        // Add project pages
        if (window.app?.projects) {
            window.app.projects.forEach(project => {
                pages.push({
                    url: `${baseUrl}/projects/${project.id}`,
                    priority: 0.8,
                    changefreq: 'monthly',
                    lastmod: new Date().toISOString()
                });
            });
        }
        
        return pages;
    }
}

// Initialize SEO manager
const seoManager = new SEOManager();
window.seoManager = seoManager;