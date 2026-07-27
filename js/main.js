class wattercraftWebsite {
    constructor() {
        this.serverIP = 'play.wattercraft.fun:19132';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkServerStatus();
        this.setupCopyFunctionality();
        this.setupNavigation();
        this.setupTabs();
        this.setupAnimations();
        
        // Check server status every 30 seconds
        setInterval(() => {
            this.checkServerStatus();
        }, 30000);
    }

    setupEventListeners() {
        // Mobile navigation toggle
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }

        // Close mobile menu when clicking on links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                navMenu.classList.remove('active');
            }
        });
    }

    async checkServerStatus() {
        const statusIndicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        const statusDot = statusIndicator?.querySelector('.status-dot');
        const playerCountText = document.getElementById('player-count-text');

        try {
            // Set loading state
            if (statusText) statusText.textContent = 'Checking...';
            if (statusDot) {
                statusDot.classList.remove('online', 'offline');
            }

            // Try multiple API endpoints for better reliability
            const apis = [
                `https://api.mcsrvstat.us/bedrock/3/${this.serverIP}`,
            ];

            let serverData = null;
            
            for (const apiUrl of apis) {
                try {
                    const response = await fetch(apiUrl);
                    if (response.ok) {
                        const data = await response.json();
                        
                        // Handle different API response formats
                        if (apiUrl.includes('mcsrvstat')) {
                            if (data.online) {
                                serverData = {
                                    online: data.online,
                                    players: {
                                        online: data.players?.online || 0,
                                        max: data.players?.max || 0
                                    }
                                };
                                break;
                            }
                        } else if (apiUrl.includes('mcstatus')) {
                            if (data.online) {
                                serverData = {
                                    online: data.online,
                                    players: {
                                        online: data.players?.online || 0,
                                        max: data.players?.max || 0
                                    }
                                };
                                break;
                            }
                        }
                    }
                } catch (apiError) {
                    console.warn(`API ${apiUrl} failed:`, apiError);
                    continue;
                }
            }

            if (serverData && serverData.online) {
                // Server is online
                if (statusText) statusText.textContent = 'Online';
                if (statusDot) {
                    statusDot.classList.add('online');
                    statusDot.classList.remove('offline');
                }
                if (playerCountText) {
                    playerCountText.textContent = `${serverData.players.online} / ${serverData.players.max}`;
                }
            } else {
                // Server is offline or unreachable
                if (statusText) statusText.textContent = 'Offline';
                if (statusDot) {
                    statusDot.classList.add('offline');
                    statusDot.classList.remove('online');
                }
                if (playerCountText) {
                    playerCountText.textContent = '-- / --';
                }
            }

        } catch (error) {
            console.error('Error checking server status:', error);
            
            // Show error state
            if (statusText) statusText.textContent = 'Error checking status';
            if (statusDot) {
                statusDot.classList.add('offline');
                statusDot.classList.remove('online');
            }
            if (playerCountText) {
                playerCountText.textContent = '-- / --';
            }
        }
    }

    setupCopyFunctionality() {
        // Copy IP button in hero section
        const copyIPBtn = document.getElementById('copy-ip-btn');
        if (copyIPBtn) {
            copyIPBtn.addEventListener('click', () => {
                this.copyToClipboard(this.serverIP);
            });
        }

        // Copy buttons in info cards
        document.querySelectorAll('.copy-btn-small').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const textToCopy = e.target.getAttribute('data-copy') || this.serverIP;
                this.copyToClipboard(textToCopy);
            });
        });

        // Copyable elements in join instructions
        document.querySelectorAll('.copyable').forEach(element => {
            element.addEventListener('click', () => {
                const textToCopy = element.getAttribute('data-copy') || element.textContent.trim();
                this.copyToClipboard(textToCopy);
            });
        });
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy:', error);
            
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                document.execCommand('copy');
                this.showToast('Copied to clipboard!');
            } catch (fallbackError) {
                this.showToast('Failed to copy', 'error');
            }
            
            document.body.removeChild(textarea);
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        
        if (toast && toastMessage) {
            toastMessage.textContent = message;
            
            // Update toast styling based on type
            if (type === 'error') {
                toast.style.background = 'var(--error-color)';
            } else {
                toast.style.background = 'var(--primary-color)';
            }
            
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }

    setupNavigation() {
        // Update active navigation link based on scroll position
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        const updateActiveNavLink = () => {
            const scrollY = window.pageYOffset;
            
            sections.forEach(section => {
                const sectionHeight = section.offsetHeight;
                const sectionTop = section.offsetTop - 100;
                const sectionId = section.getAttribute('id');
                
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        };
        
        window.addEventListener('scroll', updateActiveNavLink);
        updateActiveNavLink(); // Initial call
    }

    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');
                
                // Remove active class from all tabs and contents
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                btn.classList.add('active');
                const targetContent = document.getElementById(`${targetTab}-tab`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    setupAnimations() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.info-card, .rule-card, .step, .discord-content').forEach(el => {
            observer.observe(el);
        });

        // Parallax effect for hero background
        const heroBackground = document.querySelector('.hero-bg');
        if (heroBackground) {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;
                heroBackground.style.transform = `translateY(${rate}px)`;
            });
        }
    }

    // Utility method to format numbers
    formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    }

    // Method to handle external links
    handleExternalLinks() {
        document.querySelectorAll('a[target="_blank"]').forEach(link => {
            link.addEventListener('click', (e) => {
                // Add analytics or tracking here if needed
                console.log(`External link clicked: ${link.href}`);
            });
        });
    }
}

// Initialize the website when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new wattercraftWebsite();
});

// Handle page visibility changes to pause/resume server status checking
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Page hidden - pausing updates');
    } else {
        console.log('Page visible - resuming updates');
    }
});

// Service Worker registration (if available)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker would go here for PWA functionality
        console.log('Service Worker support detected');
    });
}

// Error handling for unhandled promises
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});
