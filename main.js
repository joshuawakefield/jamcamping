// JamCamping Main JavaScript
class JamCampingApp {
    constructor() {
        this.projects = [];
        this.shopItems = [];
        this.currentSection = 'about';
        this.theme = localStorage.getItem('jamcamping-theme') || 'light';
        
        this.init();
    }

    async init() {
        await this.loadProjects();
        await this.loadShopItems();
        this.setupEventListeners();
        this.applyTheme();
        this.showSection('about');
        this.renderProjects();
        this.renderShopItems();
    }

    async loadProjects() {
        try {
            const response = await fetch('projects.json');
            this.projects = await response.json();
        } catch (error) {
            console.error('Failed to load projects:', error);
            this.projects = [];
        }
    }

    async loadShopItems() {
        try {
            const response = await fetch('shop.json');
            this.shopItems = await response.json();
        } catch (error) {
            console.error('Failed to load shop items:', error);
            this.shopItems = [];
        }
    }

    setupEventListeners() {
        // Menu toggles
        document.getElementById('menuToggle').addEventListener('click', () => {
            this.toggleMenu('left');
        });

        document.getElementById('shopToggle').addEventListener('click', () => {
            this.toggleMenu('right');
        });

        // Close menu buttons
        document.getElementById('closeLeftMenu').addEventListener('click', () => {
            this.closeMenu('left');
        });

        document.getElementById('closeRightMenu').addEventListener('click', () => {
            this.closeMenu('right');
        });

        // Menu overlay
        document.getElementById('menuOverlay').addEventListener('click', () => {
            this.closeAllMenus();
        });

        // Navigation links
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('data-section');
                this.showSection(section);
                this.closeAllMenus();
            });
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Help toggle
        document.getElementById('helpToggle').addEventListener('click', () => {
            window.open('mailto:jamcampinghq@gmail.com?subject=JamCamping Help Request', '_blank');
        });

        // Bottom action bar
        document.getElementById('scrollToTop').addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        document.getElementById('randomProject').addEventListener('click', () => {
            this.showRandomProject();
        });

        document.getElementById('getInspired').addEventListener('click', () => {
            this.showInspiration();
        });

        // Filter controls
        document.getElementById('categoryFilter')?.addEventListener('change', () => {
            this.filterProjects();
        });

        document.getElementById('difficultyFilter')?.addEventListener('change', () => {
            this.filterProjects();
        });

        // Form submissions
        document.querySelector('.submit-form')?.addEventListener('submit', (e) => {
            this.handleProjectSubmission(e);
        });

        // Modal close
        document.querySelector('.modal-close')?.addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('projectModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'projectModal') {
                this.closeModal();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeAllMenus();
            }
        });
    }

    toggleMenu(side) {
        const menu = document.getElementById(side === 'left' ? 'leftMenu' : 'rightMenu');
        const overlay = document.getElementById('menuOverlay');
        
        menu.classList.toggle('active');
        overlay.classList.toggle('active');
        
        // Close other menu if open
        const otherMenu = document.getElementById(side === 'left' ? 'rightMenu' : 'leftMenu');
        otherMenu.classList.remove('active');
    }

    closeMenu(side) {
        const menu = document.getElementById(side === 'left' ? 'leftMenu' : 'rightMenu');
        const overlay = document.getElementById('menuOverlay');
        
        menu.classList.remove('active');
        
        // Check if any menu is still open
        const leftMenu = document.getElementById('leftMenu');
        const rightMenu = document.getElementById('rightMenu');
        
        if (!leftMenu.classList.contains('active') && !rightMenu.classList.contains('active')) {
            overlay.classList.remove('active');
        }
    }

    closeAllMenus() {
        document.getElementById('leftMenu').classList.remove('active');
        document.getElementById('rightMenu').classList.remove('active');
        document.getElementById('menuOverlay').classList.remove('active');
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;
        }

        // Update URL hash
        window.location.hash = sectionName;
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('jamcamping-theme', this.theme);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const themeIcon = document.querySelector('.theme-icon');
        themeIcon.textContent = this.theme === 'light' ? '🌙' : '☀️';
    }

    renderProjects() {
        const container = document.getElementById('projectsContainer');
        if (!container || this.projects.length === 0) return;

        container.innerHTML = this.projects.map(project => this.createProjectCard(project)).join('');

        // Add click listeners to project cards
        container.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', () => {
                const projectId = parseInt(card.dataset.projectId);
                this.showProjectModal(projectId);
            });
        });
    }

    renderShopItems() {
        const container = document.getElementById('shopContainer');
        if (!container || this.shopItems.length === 0) return;

        container.innerHTML = this.shopItems.map(item => this.createProductCard(item)).join('');
    }

    createProductCard(product) {
        const digitalFormats = product.digital.map(format => `
            <div class="format-item">
                <span class="format-name">${format.format}</span>
                <span class="format-price">$${format.price}</span>
                <a href="${format.buy_url}" target="_blank" class="buy-btn">Buy</a>
            </div>
        `).join('');

        const printFormats = product.print.map(format => `
            <div class="format-item">
                <span class="format-name">${format.format}</span>
                <span class="format-price">
                    $${format.price}
                    ${format.shipping ? '<span class="format-shipping">+ shipping</span>' : ''}
                </span>
                <a href="${format.buy_url}" target="_blank" class="buy-btn lulu-btn">Order on Lulu</a>
            </div>
        `).join('');

        // Calculate bundle price for cover overlay
        const bundlePrice = product.bundle.price;

        return `
            <div class="product-card">
                <div class="product-cover-container">
                    <img src="${product.cover}" alt="${product.title}" class="product-cover">
                    <div class="product-cover-overlay">
                        <div class="product-cover-title">${product.title}</div>
                        <div class="product-cover-price">From $${bundlePrice}</div>
                    </div>
                </div>
                
                <div class="product-content">
                    <h2 class="product-title">${product.title}</h2>
                    <p class="product-description">${product.description}</p>

                    <div class="bundle-highlight">
                        <div class="format-item">
                            <span class="format-name">Digital Bundle (${product.bundle.formats.join(', ')})</span>
                            <span class="format-price">$${product.bundle.price}</span>
                            <a href="${product.bundle.buy_url}" target="_blank" class="buy-btn bundle-btn">Get Bundle</a>
                        </div>
                        <div class="bundle-savings">Save $${product.bundle.savings}! Best value for all formats.</div>
                    </div>

                    <div class="format-section">
                        <h3>📱 Individual Digital Formats</h3>
                        <div class="format-list">
                            ${digitalFormats}
                        </div>
                    </div>

                    <div class="format-section">
                        <h3>📚 Print Editions</h3>
                        <div class="format-list">
                            ${printFormats}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createProjectCard(project) {
        const functionalTotal = project.functionalParts.reduce((sum, part) => sum + (part.price * part.quantity), 0);
        const extravagantTotal = project.extravagantParts.reduce((sum, part) => sum + (part.price * part.quantity), 0);

        return `
            <div class="project-card" data-project-id="${project.id}" data-category="${project.category}" data-difficulty="${project.difficulty}">
                <div class="project-image">${project.image}</div>
                <div class="project-content">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                    <div class="project-meta">
                        <span class="project-category">${this.formatCategory(project.category)}</span>
                        <span class="project-difficulty">${this.formatDifficulty(project.difficulty)}</span>
                    </div>
                    <div class="project-actions">
                        <button class="btn-primary" onclick="event.stopPropagation(); app.addToCart(${project.id}, 'functional')">
                            GA Build $${functionalTotal.toFixed(0)}
                        </button>
                        <button class="btn-secondary" onclick="event.stopPropagation(); app.addToCart(${project.id}, 'extravagant')">
                            VIP Build $${extravagantTotal.toFixed(0)}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    formatCategory(category) {
        const categories = {
            'shade': 'Shade & Shelter',
            'lighting': 'Lighting',
            'comfort': 'Comfort',
            'power': 'Power & Tech',
            'cooling': 'Cooling',
            'storage': 'Storage'
        };
        return categories[category] || category;
    }

    formatDifficulty(difficulty) {
        return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    }

    filterProjects() {
        const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
        const difficultyFilter = document.getElementById('difficultyFilter')?.value || 'all';

        document.querySelectorAll('.project-card').forEach(card => {
            const category = card.dataset.category;
            const difficulty = card.dataset.difficulty;

            const categoryMatch = categoryFilter === 'all' || category === categoryFilter;
            const difficultyMatch = difficultyFilter === 'all' || difficulty === difficultyFilter;

            card.style.display = categoryMatch && difficultyMatch ? 'block' : 'none';
        });
    }

    showProjectModal(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        const modal = document.getElementById('projectModal');
        const modalBody = document.getElementById('modalBody');

        modalBody.innerHTML = this.createProjectModalContent(project);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    createProjectModalContent(project) {
        const functionalTotal = project.functionalParts.reduce((sum, part) => sum + (part.price * part.quantity), 0);
        const extravagantTotal = project.extravagantParts.reduce((sum, part) => sum + (part.price * part.quantity), 0);

        return `
            <div class="project-modal-header">
                <div class="project-modal-image">${project.image}</div>
                <h2>${project.title}</h2>
                <p class="project-modal-description">${project.description}</p>
                <div class="project-modal-meta">
                    <span><strong>Problem Solved:</strong> ${project.problemSolved}</span>
                    <span><strong>Build Time:</strong> ${project.buildTime}</span>
                    <span><strong>Difficulty:</strong> ${this.formatDifficulty(project.difficulty)}</span>
                </div>
            </div>

            <div class="project-modal-instructions">
                <h3>Build Instructions</h3>
                <p>${project.instructions}</p>
                ${project.lyricEasterEgg ? `<blockquote class="lyric-quote">${project.lyricEasterEgg}</blockquote>` : ''}
            </div>

            <div class="project-modal-parts">
                <div class="parts-section">
                    <h3>🎸 Functional Build (GA) - $${functionalTotal.toFixed(2)}</h3>
                    <div class="parts-list">
                        ${project.functionalParts.map(part => `
                            <div class="part-item">
                                <span class="part-name">${part.item} (${part.quantity}x)</span>
                                <span class="part-price">$${(part.price * part.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn-primary full-width" onclick="app.addToCart(${project.id}, 'functional')">
                        Add All GA Parts to Cart - $${functionalTotal.toFixed(2)}
                    </button>
                </div>

                <div class="parts-section">
                    <h3>✨ Extravagant Build (VIP) - $${extravagantTotal.toFixed(2)}</h3>
                    <div class="parts-list">
                        ${project.extravagantParts.map(part => `
                            <div class="part-item">
                                <span class="part-name">${part.item} (${part.quantity}x)</span>
                                <span class="part-price">$${(part.price * part.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn-secondary full-width" onclick="app.addToCart(${project.id}, 'extravagant')">
                        Add All VIP Parts to Cart - $${extravagantTotal.toFixed(2)}
                    </button>
                </div>
            </div>
        `;
    }

    closeModal() {
        const modal = document.getElementById('projectModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    showRandomProject() {
        if (this.projects.length === 0) return;

        const randomProject = this.projects[Math.floor(Math.random() * this.projects.length)];
        this.showSection('projects');
        
        // Scroll to the project card
        setTimeout(() => {
            const projectCard = document.querySelector(`[data-project-id="${randomProject.id}"]`);
            if (projectCard) {
                projectCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                projectCard.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    projectCard.style.transform = '';
                }, 1000);
            }
        }, 300);
    }

    showInspiration() {
        const inspirations = [
            "\"The magic happens when preparation meets opportunity - and a really cool campsite!\"",
            "\"Your campsite is your canvas - paint it with creativity and festival spirit!\"",
            "\"Every great festival memory starts with an epic basecamp.\"",
            "\"Build it, and the good vibes will come.\"",
            "\"In the desert of ordinary camping, be an oasis of awesome.\"",
            "\"Once in a while you get shown the light, in the strangest of places if you look at it right.\"",
            "\"What a long, strange trip it's been... and it's about to get even better!\"",
            "\"Keep on truckin' with the coolest camp on the playa!\"",
            "\"Sometimes the light's all shinin' on me, other times I can barely see...\"",
            "\"We're just walking each other home - might as well make the journey legendary!\""
        ];

        const randomInspiration = inspirations[Math.floor(Math.random() * inspirations.length)];
        
        // Create a temporary modal for inspiration
        const inspirationModal = document.createElement('div');
        inspirationModal.className = 'inspiration-modal';
        inspirationModal.innerHTML = `
            <div class="inspiration-content">
                <h2>🔥 Festival Inspiration 🔥</h2>
                <blockquote>${randomInspiration}</blockquote>
                <button onclick="this.parentElement.parentElement.remove()">Thanks for the Inspiration!</button>
            </div>
        `;
        
        document.body.appendChild(inspirationModal);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (inspirationModal.parentElement) {
                inspirationModal.remove();
            }
        }, 5000);
    }

    addToCart(projectId, buildType) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        const parts = buildType === 'functional' ? project.functionalParts : project.extravagantParts;
        const total = parts.reduce((sum, part) => sum + (part.price * part.quantity), 0);

        // For now, just show a confirmation
        // In a real implementation, this would integrate with affiliate links
        alert(`Added ${project.title} (${buildType.toUpperCase()}) to cart!\nTotal: $${total.toFixed(2)}\n\nThis would normally redirect to affiliate purchase links.`);
        
        console.log('Cart addition:', {
            project: project.title,
            buildType,
            parts,
            total
        });
    }

    handleProjectSubmission(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const projectData = Object.fromEntries(formData);
        
        // Simulate submission
        alert(`Thanks for submitting "${projectData.projectName}"! We'll review it and get back to you.`);
        e.target.reset();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new JamCampingApp();
});

// Handle browser back/forward navigation
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (hash && window.app) {
        window.app.showSection(hash);
    }
});

// Handle initial hash on page load
window.addEventListener('load', () => {
    const hash = window.location.hash.slice(1);
    if (hash && window.app) {
        window.app.showSection(hash);
    }
});

// Add some CSS for the inspiration modal
const inspirationStyles = `
.inspiration-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 400;
    animation: fadeIn 0.3s ease;
}

.inspiration-content {
    background: var(--surface-color);
    padding: var(--space-2xl);
    border-radius: var(--border-radius-lg);
    text-align: center;
    max-width: 500px;
    margin: var(--space-lg);
    box-shadow: var(--shadow-heavy);
}

.inspiration-content h2 {
    color: var(--primary-color);
    margin-bottom: var(--space-lg);
}

.inspiration-content blockquote {
    font-style: italic;
    font-size: var(--font-size-lg);
    color: var(--accent-color);
    margin: var(--space-xl) 0;
    padding: var(--space-lg);
    border-left: 4px solid var(--accent-color);
    background: var(--background-color);
    border-radius: var(--border-radius);
}

.inspiration-content button {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: var(--space-md) var(--space-lg);
    border-radius: var(--border-radius);
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.inspiration-content button:hover {
    background: var(--secondary-color);
}

.project-modal-header {
    text-align: center;
    margin-bottom: var(--space-2xl);
}

.project-modal-image {
    font-size: 4rem;
    margin-bottom: var(--space-lg);
}

.project-modal-description {
    font-size: var(--font-size-lg);
    color: var(--text-secondary);
    margin-bottom: var(--space-lg);
}

.project-modal-meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    font-size: var(--font-size-sm);
    color: var(--text-muted);
}

.project-modal-instructions {
    margin-bottom: var(--space-2xl);
}

.project-modal-instructions h3 {
    color: var(--primary-color);
    margin-bottom: var(--space-md);
}

.project-modal-parts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--space-xl);
}

.parts-section {
    background: var(--background-color);
    padding: var(--space-lg);
    border-radius: var(--border-radius);
    border: 1px solid var(--border-color);
}

.parts-section h3 {
    margin-bottom: var(--space-lg);
    color: var(--text-primary);
}

.parts-list {
    margin-bottom: var(--space-lg);
}

.part-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-sm) 0;
    border-bottom: 1px solid var(--border-color);
}

.part-item:last-child {
    border-bottom: none;
}

.part-name {
    font-weight: 500;
}

.part-price {
    color: var(--primary-color);
    font-weight: 600;
}

.full-width {
    width: 100%;
}

@media (max-width: 768px) {
    .project-modal-meta {
        text-align: left;
    }
    
    .project-modal-parts {
        grid-template-columns: 1fr;
    }
}
`;

// Inject the styles
const styleSheet = document.createElement('style');
styleSheet.textContent = inspirationStyles;
document.head.appendChild(styleSheet);