// Slideshow instance manager - supports multiple slideshows on the page
class Slideshow {
    constructor(container, auto = true, interval = 5000) {
        this.container = container;
        this.slides = Array.from(container.querySelectorAll('.slide'));
        this.dots = Array.from(container.querySelectorAll('.dot'));
        this.current = 0;
        this.interval = interval;
        this.timer = null;
        this.init();
        if (auto) this.start();
    }

    init() {
        this.show(0);
        this.dots.forEach((dot, i) => {
            dot.addEventListener('click', () => { this.show(i); this.restart(); });
        });
    }

    show(n) {
        if (!this.slides || this.slides.length === 0) return;
        if (n >= this.slides.length) this.current = 0;
        else if (n < 0) this.current = this.slides.length - 1;
        else this.current = n;

        this.slides.forEach(s => s.style.display = 'none');
        this.dots.forEach(d => d.classList.remove('active'));

        if (this.slides[this.current]) this.slides[this.current].style.display = 'block';
        if (this.dots[this.current]) this.dots[this.current].classList.add('active');
    }

    next() { this.show(this.current + 1); }

    start() { if (this.timer) clearInterval(this.timer); this.timer = setInterval(() => this.next(), this.interval); }

    stop() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }

    restart() { this.stop(); this.start(); }
}

// Map of slideshows by container id
const slideshows = {};

// Global functions expected by inline HTML handlers
function currentSlide(n) {
    const inst = slideshows['main-slideshow'];
    if (inst) { inst.show(n); inst.restart(); }
}

function switchOngoing(projectId, slideIndex) {
    const inst = slideshows[projectId + '-slideshow'];
    if (inst) { inst.show(slideIndex); inst.restart(); }
}

// Scroll to top function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Initialize slideshow
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all slideshow instances on the page
    document.querySelectorAll('.slideshow-container').forEach((container, idx) => {
        let id = container.id;
        if (!id) {
            id = 'slideshow-' + idx;
            container.id = id;
        }
        slideshows[id] = new Slideshow(container, true, 5000);
    });
    
    // Scroll to top button visibility
    const scrollToTopBtn = document.querySelector('.scroll-to-top');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('show');
            } else {
                scrollToTopBtn.classList.remove('show');
            }
        });

        scrollToTopBtn.addEventListener('click', scrollToTop);
    }
    
    // Navigation active link logic
    const links = document.querySelectorAll('.navrightbottom a');
    
    function updateActiveLink() {
        const sections = ['home', 'about-us', 'completed-projects', 'ongoing-projects', 'contact-us'];
        
        links.forEach(link => link.classList.remove('active'));
        
        for (let section of sections) {
            const element = document.getElementById(section);
            if (element) {
                const rect = element.getBoundingClientRect();
                if (rect.top <= 250) {
                    const link = document.querySelector(`a[href="#${section}"]`);
                    if (link) {
                        link.classList.add('active');
                    }
                }
            }
        }
    }
    
    window.addEventListener('scroll', updateActiveLink);
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            links.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    updateActiveLink();

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.navrightbottom');
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileMenu.classList.toggle('open');
        });

        // Close menu when a link is clicked
        links.forEach(l => l.addEventListener('click', function() { mobileMenu.classList.remove('open'); }));

        // Close when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                mobileMenu.classList.remove('open');
            }
        });
    }
});
