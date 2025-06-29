// ===== BUILD SCRIPT FOR SEO OPTIMIZATION =====
// Run this to generate SEO-optimized static files

const PrerenderGenerator = require('./prerender-setup.js');
const fs = require('fs');
const path = require('path');

class BuildOptimizer {
    constructor() {
        this.distDir = './dist';
        this.projects = require('./projects.json');
    }
    
    async build() {
        console.log('🎪 Building JamCamping for production...');
        
        // Create dist directory
        this.ensureDistDirectory();
        
        // Copy static assets
        this.copyStaticAssets();
        
        // Generate SEO-optimized pages
        const generator = new PrerenderGenerator();
        generator.generateStaticPages();
        
        // Generate additional SEO files
        this.generateAdditionalSEOFiles();
        
        console.log('✅ Build complete! SEO-optimized site ready for deployment.');
    }
    
    ensureDistDirectory() {
        if (!fs.existsSync(this.distDir)) {
            fs.mkdirSync(this.distDir, { recursive: true });
        }
        
        // Create projects directory
        const projectsDir = path.join(this.distDir, 'projects');
        if (!fs.existsSync(projectsDir)) {
            fs.mkdirSync(projectsDir, { recursive: true });
        }
    }
    
    copyStaticAssets() {
        const staticFiles = ['style.css', 'main.js', 'projects.json', 'shop.json'];
        
        staticFiles.forEach(file => {
            if (fs.existsSync(file)) {
                fs.copyFileSync(file, path.join(this.distDir, file));
            }
        });
    }
    
    generateAdditionalSEOFiles() {
        // Generate JSON-LD for rich snippets
        this.generateRichSnippets();
        
        // Generate meta tag templates
        this.generateMetaTemplates();
        
        // Generate OpenGraph images metadata
        this.generateOGImageMeta();
    }
    
    generateRichSnippets() {
        const richSnippets = {
            organization: {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "JamCamping",
                "url": "https://jamcamping.com",
                "logo": "https://jamcamping.com/images/logo.png",
                "description": "Digital Shakedown Street for festival DIY projects",
                "sameAs": [
                    "https://twitter.com/JamCampingHQ"
                ]
            },
            website: {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "JamCamping",
                "url": "https://jamcamping.com",
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://jamcamping.com/search?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                }
            },
            breadcrumbs: {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Home",
                        "item": "https://jamcamping.com"
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "Projects",
                        "item": "https://jamcamping.com/#main"
                    }
                ]
            }
        };
        
        fs.writeFileSync(
            path.join(this.distDir, 'rich-snippets.json'),
            JSON.stringify(richSnippets, null, 2)
        );
    }
    
    generateMetaTemplates() {
        const metaTemplates = {
            project: {
                title: "{PROJECT_TITLE} - DIY Festival Project | JamCamping",
                description: "{PROJECT_DESCRIPTION} Learn how to build this {PROJECT_CATEGORY} project for your festival campsite.",
                keywords: "{PROJECT_TITLE}, {PROJECT_CATEGORY}, festival {PROJECT_CATEGORY}, DIY {PROJECT_CATEGORY}, {PROJECT_DIFFICULTY} build",
                ogTitle: "{PROJECT_TITLE} - Festival DIY Project",
                ogDescription: "{PROJECT_DESCRIPTION}",
                ogImage: "https://jamcamping.com/images/projects/{PROJECT_ID}.jpg"
            },
            stage: {
                main: {
                    title: "DIY Festival Projects - JamCamping",
                    description: "Browse legendary DIY festival projects. From shade structures to LED totems, find your next epic build.",
                    keywords: "DIY festival projects, campsite builds, festival hacks, shade structures"
                },
                vendor: {
                    title: "Cosmic Knowledge Shop - Festival Guides | JamCamping",
                    description: "Digital guides and books for creating legendary festival campsites. Written by heads for heads.",
                    keywords: "festival guides, camping books, DIY manuals, cosmic knowledge"
                }
            }
        };
        
        fs.writeFileSync(
            path.join(this.distDir, 'meta-templates.json'),
            JSON.stringify(metaTemplates, null, 2)
        );
    }
    
    generateOGImageMeta() {
        const ogImages = {
            default: "https://jamcamping.com/images/og-festival.jpg",
            projects: this.projects.reduce((acc, project) => {
                acc[project.id] = `https://jamcamping.com/images/projects/${project.id}-og.jpg`;
                return acc;
            }, {}),
            stages: {
                main: "https://jamcamping.com/images/og-main-stage.jpg",
                vendor: "https://jamcamping.com/images/og-vendor-row.jpg",
                chill: "https://jamcamping.com/images/og-chill-zone.jpg"
            }
        };
        
        fs.writeFileSync(
            path.join(this.distDir, 'og-images.json'),
            JSON.stringify(ogImages, null, 2)
        );
    }
}

// Run build if called directly
if (require.main === module) {
    const builder = new BuildOptimizer();
    builder.build().catch(console.error);
}

module.exports = BuildOptimizer;