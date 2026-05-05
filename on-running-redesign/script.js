document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lenis (Smooth Scroll)
    const lenis = new Lenis({
        duration: 1.5, // Slightly slower for Tcast premium feel
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time)=>{
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // 2. Custom Magnetic Cursor
    const cursor = document.querySelector('.cursor');
    const interactiveElements = document.querySelectorAll('a, button, img');

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    gsap.ticker.add(() => {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        gsap.set(cursor, { x: cursorX, y: cursorY });
    });

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hovering');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovering');
        });
    });

    // 3. GSAP Setup
    gsap.registerPlugin(ScrollTrigger);

    // 4. Masonry Gallery (Tcast Exact Match)
    const scatteredGallery = document.querySelector('.scattered-gallery-section');
    if(scatteredGallery) {
        gsap.to(".col-1", {
            yPercent: -20,
            ease: "none",
            scrollTrigger: {
                trigger: scatteredGallery,
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            }
        });
        gsap.to(".col-2", {
            yPercent: 30,
            ease: "none",
            scrollTrigger: {
                trigger: scatteredGallery,
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            }
        });
        gsap.to(".col-3", {
            yPercent: -35,
            ease: "none",
            scrollTrigger: {
                trigger: scatteredGallery,
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            }
        });
        gsap.to(".col-4", {
            yPercent: 20,
            ease: "none",
            scrollTrigger: {
                trigger: scatteredGallery,
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            }
        });
    }

    // 5. Reveal Up Elements (Tcast Fade In)
    const revealElements = document.querySelectorAll('.reveal-up');
    revealElements.forEach((el) => {
        gsap.fromTo(el, 
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%",
                    toggleActions: "play none none none"
                }
            }
        );
    });
    // 6. Mobile Hero Parallax
    const mobileHero = document.querySelector('.tcast-mobile-hero');
    if(mobileHero) {
        gsap.to(".mobile-hero-img", {
            y: -50,
            ease: "none",
            scrollTrigger: {
                trigger: mobileHero,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    }

    // 7. Sticky Phone Image Scroll (Long Screenshot)
    const stickySection = document.querySelector('.tcast-mobile-sticky');
    const stickyImg = document.querySelector('#sticky-screen-img');
    if(stickySection && stickyImg) {
        // Calculate how much to scroll based on image height
        ScrollTrigger.create({
            trigger: stickySection,
            start: "top center",
            end: "bottom center",
            scrub: true,
            onUpdate: (self) => {
                const scrollRange = stickyImg.offsetHeight - 660; // 660 is phone height
                if(scrollRange > 0) {
                    gsap.set(stickyImg, { y: -scrollRange * self.progress });
                }
            }
        });
    }
});
