// main.js - Complete with white sparkle particles
// ==========================================================================
// GLOBAL VARIABLES
// ==========================================================================
let cart = JSON.parse(localStorage.getItem('dimdesk_cart')) || [];
let websiteData = JSON.parse(localStorage.getItem('dimdesk_data')) || getDefaultData();
let carouselInstances = {};
let wishlist = JSON.parse(localStorage.getItem('dimdesk_wishlist')) || [];
let carouselEnabled = localStorage.getItem('dimdesk_carousel_enabled') !== 'false';
let videoElement = null;
let videoRetryCount = 0;
const MAX_VIDEO_RETRIES = 3;

// ==========================================================================
// BACKGROUND VIDEO - YouTube Video
// ==========================================================================
const YOUTUBE_BG_VIDEO_ID = 'P8DQjFX8OB8';

// ==========================================================================
// WHITE SPARKLE PARTICLE SYSTEM
// ==========================================================================
const SparkleSystem = {
    enabled: true,
    lastSparkleTime: 0,
    sparkleInterval: 100,
    maxSparklesPerSecond: 10,
    
    init() {
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: true });
        document.addEventListener('visibilitychange', () => {
            this.enabled = !document.hidden;
        });
    },
    
    onMouseMove(e) {
        if (!this.enabled || document.hidden) return;
        
        const now = performance.now();
        if (now - this.lastSparkleTime < this.sparkleInterval) return;
        this.lastSparkleTime = now;
        
        this.createSparkle(e.clientX, e.clientY);
    },
    
    onTouchMove(e) {
        if (!this.enabled) return;
        
        const now = performance.now();
        if (now - this.lastSparkleTime < this.sparkleInterval * 2) return;
        this.lastSparkleTime = now;
        
        const touch = e.touches[0];
        this.createSparkle(touch.clientX, touch.clientY);
    },
    
    createSparkle(x, y) {
        const type = Math.random();
        
        if (type < 0.4) {
            this.createParticle(x, y);
        } else if (type < 0.7) {
            this.createStar(x, y);
        } else {
            this.createDiamond(x, y);
        }
    },
    
    createParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'sparkle-particle';
        
        const size = 3 + Math.random() * 5;
        const offsetX = (Math.random() - 0.5) * 30;
        const offsetY = (Math.random() - 0.5) * 30;
        
        particle.style.left = (x + offsetX) + 'px';
        particle.style.top = (y + offsetY) + 'px';
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) particle.remove();
        }, 800);
    },
    
    createStar(x, y) {
        const star = document.createElement('div');
        star.className = 'sparkle-star';
        
        const size = 4 + Math.random() * 6;
        const offsetX = (Math.random() - 0.5) * 25;
        const offsetY = (Math.random() - 0.5) * 25;
        
        star.style.left = (x + offsetX) + 'px';
        star.style.top = (y + offsetY) + 'px';
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        
        document.body.appendChild(star);
        
        setTimeout(() => {
            if (star.parentNode) star.remove();
        }, 900);
    },
    
    createDiamond(x, y) {
        const diamond = document.createElement('div');
        diamond.className = 'sparkle-diamond';
        
        const size = 4 + Math.random() * 4;
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;
        
        diamond.style.left = (x + offsetX) + 'px';
        diamond.style.top = (y + offsetY) + 'px';
        diamond.style.width = size + 'px';
        diamond.style.height = size + 'px';
        
        document.body.appendChild(diamond);
        
        setTimeout(() => {
            if (diamond.parentNode) diamond.remove();
        }, 700);
    }
};

// Initialize sparkle system
SparkleSystem.init();

// ==========================================================================
// ENHANCED VIDEO SYSTEM - YouTube Background
// ==========================================================================
function initVideoSystem() {
    const bgContainer = document.querySelector('.background-video');
    if (!bgContainer) return;
    
    // Clear existing content
    bgContainer.innerHTML = '';
    
    // Create YouTube iframe for background video
    const iframe = document.createElement('iframe');
    iframe.id = 'bg-youtube-video';
    iframe.src = `https://www.youtube.com/embed/${YOUTUBE_BG_VIDEO_ID}?autoplay=1&mute=1&controls=0&loop=1&playlist=${YOUTUBE_BG_VIDEO_ID}&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&playsinline=1`;
    iframe.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 130vw;
        height: 130vh;
        transform: translate(-50%, -50%);
        pointer-events: none;
        border: none;
        object-fit: cover;
    `;
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'autoplay; encrypted-media');
    iframe.setAttribute('allowfullscreen', '');
    
    bgContainer.appendChild(iframe);
    
    // Set videoElement reference for compatibility
    videoElement = iframe;
}

function handleVideoTimeUpdate() {
    // YouTube iframe doesn't use these events
}

function handleVideoEnded() {
    // YouTube iframe loops automatically
}

function handleVideoStalled() {
    // YouTube iframe handles this
}

function handleVideoWaiting() {
    // YouTube iframe handles this
}

function handleVideoError(e) {
    console.error('Video error:', e);
}

function playVideo() {
    // YouTube iframe autoplays automatically
}

// ==========================================================================
// SMOOTH CAROUSEL CLASS
// ==========================================================================
class Carousel {
    constructor(containerId, type) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.type = type;
        this.track = this.container.querySelector('.carousel-track');
        this.prevBtn = this.container.querySelector('.carousel-prev');
        this.nextBtn = this.container.querySelector('.carousel-next');
        this.dotsContainer = this.container.querySelector('.carousel-dots');
        
        this.currentIndex = 0;
        this.slidesPerView = this.getSlidesPerView();
        this.totalSlides = 0;
        this.autoSlideInterval = null;
        this.autoSlideDelay = 5000;
        this.isTransitioning = false;
        
        this.init();
        
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.slidesPerView = this.getSlidesPerView();
                this.updateCarousel();
                this.initDots();
            }, 250);
        });
    }
    
    getSlidesPerView() {
        const width = window.innerWidth;
        if (width >= 1200) return 3;
        if (width >= 768) return 2;
        return 1;
    }
    
    init() {
        this.loadSlides();
        
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
        
        this.initDots();
        this.updateCarousel();
        this.startAutoSlide();
        this.addTouchSupport();
    }
    
    loadSlides() {
        const data = this.type === 'released' ? websiteData.carousels.released : websiteData.carousels.upcoming;
        if (!data || !this.track) return;
        
        const fragment = document.createDocumentFragment();
        this.totalSlides = data.length;
        
        data.forEach((item) => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.innerHTML = `
                <img src="${item.image}" alt="${item.title}" loading="lazy">
                <div class="carousel-info">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    <div class="shop-price">$${item.price.toFixed(2)}</div>
                    <span class="shop-status status-${item.status}">
                        ${item.status === 'released' ? 'Available' : 'Coming Soon'}
                    </span>
                </div>
            `;
            
            slide.addEventListener('click', () => {
                this.showItemModal(item);
            });
            
            fragment.appendChild(slide);
        });
        
        this.track.innerHTML = '';
        this.track.appendChild(fragment);
        this.updateSlideWidths();
    }
    
    updateSlideWidths() {
        const slides = this.track.querySelectorAll('.carousel-slide');
        const slideWidthPercentage = 100 / this.slidesPerView;
        const gap = 20;
        
        slides.forEach(slide => {
            slide.style.flex = `0 0 calc(${slideWidthPercentage}% - ${gap}px)`;
            slide.style.minWidth = `calc(${slideWidthPercentage}% - ${gap}px)`;
            slide.style.maxWidth = `calc(${slideWidthPercentage}% - ${gap}px)`;
        });
    }
    
    initDots() {
        if (!this.dotsContainer || this.totalSlides === 0) return;
        
        const totalGroups = Math.ceil(this.totalSlides / this.slidesPerView);
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < totalGroups; i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel-indicator';
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToGroup(i));
            fragment.appendChild(dot);
        }
        
        this.dotsContainer.innerHTML = '';
        this.dotsContainer.appendChild(fragment);
        this.dots = this.dotsContainer.querySelectorAll('.carousel-indicator');
    }
    
    updateCarousel() {
        if (!this.track || this.totalSlides === 0 || this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        const slideWidth = 100 / this.slidesPerView;
        const translateX = -(this.currentIndex * slideWidth);
        
        this.track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        this.track.style.transform = `translateX(${translateX}%)`;
        
        this.updateDots();
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, 500);
    }
    
    updateDots() {
        if (!this.dots) return;
        
        const currentGroup = Math.floor(this.currentIndex / this.slidesPerView);
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentGroup);
        });
    }
    
    nextSlide() {
        if (this.isTransitioning) return;
        this.stopAutoSlide();
        
        if (this.currentIndex >= this.totalSlides - this.slidesPerView) {
            this.currentIndex = 0;
        } else {
            this.currentIndex += this.slidesPerView;
        }
        
        this.updateCarousel();
        this.startAutoSlide();
    }
    
    prevSlide() {
        if (this.isTransitioning) return;
        this.stopAutoSlide();
        
        if (this.currentIndex <= 0) {
            this.currentIndex = this.totalSlides - this.slidesPerView;
        } else {
            this.currentIndex -= this.slidesPerView;
        }
        
        this.updateCarousel();
        this.startAutoSlide();
    }
    
    goToGroup(groupIndex) {
        if (this.isTransitioning) return;
        this.stopAutoSlide();
        this.currentIndex = groupIndex * this.slidesPerView;
        this.updateCarousel();
        this.startAutoSlide();
    }
    
    startAutoSlide() {
        if (this.autoSlideInterval) return;
        
        this.autoSlideInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoSlideDelay);
    }
    
    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }
    
    addTouchSupport() {
        let startX = 0;
        
        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            this.stopAutoSlide();
        }, { passive: true });
        
        this.track.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
            this.startAutoSlide();
        }, { passive: true });
    }
    
    showItemModal(item) {
        const modalHTML = `
            <h2 style="color: lightcoral; margin-bottom: 1rem;">${item.title}</h2>
            <img src="${item.image}" alt="${item.title}" style="width: 100%; border-radius: 10px; margin-bottom: 1rem;" loading="lazy">
            <p style="color: wheat; margin-bottom: 1rem;">${item.description}</p>
            <div style="text-align: center; color: lightcoral; font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">
                $${item.price.toFixed(2)}
            </div>
            <button onclick="closeModal()" style="background: transparent; color: lightcoral; border: 1px solid lightcoral; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; width: 100%;">
                Close
            </button>
        `;
        
        const modalBody = document.getElementById('modal-body');
        if (modalBody) {
            modalBody.innerHTML = modalHTML;
            showModal();
        }
    }
}

// ==========================================================================
// NAVIGATION
// ==========================================================================
function initNavigation() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (!mobileToggle || !navLinks) return;
    
    mobileToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        navLinks.classList.toggle('active');
        this.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
                mobileToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    });
    
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768) {
            const isClickInsideNav = navLinks.contains(event.target);
            const isClickOnToggle = mobileToggle.contains(event.target);
            
            if (!isClickInsideNav && !isClickOnToggle && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileToggle.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
}

// ==========================================================================
// MODAL SYSTEM
// ==========================================================================
function initModalSystem() {
    const modalClose = document.getElementById('modal-close');
    const modalOverlay = document.getElementById('modal-overlay');
    
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function showModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'flex';
        modalOverlay.style.opacity = '0';
        modalOverlay.classList.add('active');
        
        requestAnimationFrame(() => {
            modalOverlay.style.transition = 'opacity 0.3s ease';
            modalOverlay.style.opacity = '1';
        });
        
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.style.transition = 'opacity 0.3s ease';
        modalOverlay.style.opacity = '0';
        
        setTimeout(() => {
            modalOverlay.style.display = 'none';
            modalOverlay.classList.remove('active');
        }, 300);
        
        document.body.style.overflow = '';
    }
}

// ==========================================================================
// NOTIFICATION SYSTEM
// ==========================================================================
function showNotification(message, type = 'success') {
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => existing.remove(), 300);
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? 'rgba(220, 53, 69, 0.95)' : 
                    type === 'warning' ? 'rgba(255, 193, 7, 0.95)' : 
                    'rgba(40, 167, 69, 0.95)'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 10000;
        animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        font-weight: 600;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        max-width: 300px;
        word-wrap: break-word;
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log("Website loaded");
    initializeWebsite();
});

function initializeWebsite() {
    try {
        initVideoSystem();
        initNavigation();
        initDynamicContent();
        checkCarouselStatus();
        initModalSystem();
        initCartSystem();
        updateWishlistButtons();
        updateCartCount();
        console.log("Website initialization complete");
    } catch (error) {
        console.error("Error during initialization:", error);
    }
}

// ==========================================================================
// EXPORT FUNCTIONS
// ==========================================================================
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.checkout = checkout;
window.completeCheckout = completeCheckout;
window.closeModal = closeModal;
window.toggleCart = toggleCart;
window.closeCartSidebar = closeCartSidebar;
window.showProductModal = showProductModal;
window.toggleWishlist = toggleWishlist;
window.removeFromWishlist = removeFromWishlist;
window.addToCartFromWishlist = addToCartFromWishlist;
window.clearWishlist = clearWishlist;
window.toggleCarousels = toggleCarousels;
window.initCarousels = initCarousels;
window.playVideo = playVideo;
window.SparkleSystem = SparkleSystem;
window.YOUTUBE_BG_VIDEO_ID = YOUTUBE_BG_VIDEO_ID;
