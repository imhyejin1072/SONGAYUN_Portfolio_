/* ============================================================
   SONG AYUN PORTFOLIO — Complete Interactions
   Three.js glass bubbles · Tabs · Slider · Countup · GSAP
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    /* ══════════════════════════════════════
       1. CUSTOM CURSOR
    ══════════════════════════════════════ */
    const dot  = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    (function cursorLoop() {
        if (dot) { dot.style.left = mx + 'px'; dot.style.top = my + 'px'; }
        if (ring) {
            rx += (mx - rx) * 0.10;
            ry += (my - ry) * 0.10;
            ring.style.left = rx + 'px';
            ring.style.top  = ry + 'px';
        }
        requestAnimationFrame(cursorLoop);
    })();

    document.querySelectorAll('a, button, .project-slide, .award-item, .contact-card').forEach(el => {
        el.addEventListener('mouseenter', () => ring && ring.classList.add('hover'));
        el.addEventListener('mouseleave', () => ring && ring.classList.remove('hover'));
    });


    /* ══════════════════════════════════════
       2. THREE.JS — 3D GLASS BUBBLES
    ══════════════════════════════════════ */
    const canvas = document.getElementById('bg-canvas');
    if (canvas && typeof THREE !== 'undefined') {

        const W = window.innerWidth, H = window.innerHeight;
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setClearColor(0x000000, 0);

        const scene  = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
        camera.position.z = 7;

        // Orbiting coloured point lights
        const lightsData = [
            { c: 0xff5020, i: 6, x: -3, y:  2, z: 4 },
            { c: 0x6030ff, i: 6, x:  3, y: -2, z: 4 },
            { c: 0xff2090, i: 5, x:  0, y:  3, z: 2 },
            { c: 0x20dfff, i: 4, x:  0, y: -3, z: 3 },
        ];
        const lights = lightsData.map(d => {
            const l = new THREE.PointLight(d.c, d.i, 25);
            l.position.set(d.x, d.y, d.z);
            l._ox = d.x; l._oy = d.y;
            scene.add(l);
            return l;
        });
        scene.add(new THREE.AmbientLight(0xffffff, 0.15));

        // Bubble configurations
        const cfgs = [
            { x: -2.2, y:  0.6, z:  0.0, r: 1.60, h: 0.04, s: 0.40 },
            { x:  2.4, y: -0.7, z: -0.6, r: 1.25, h: 0.72, s: 0.52 },
            { x:  0.3, y:  2.0, z: -1.2, r: 0.85, h: 0.88, s: 0.36 },
            { x: -3.2, y: -1.8, z: -1.8, r: 0.70, h: 0.55, s: 0.62 },
            { x:  3.8, y:  1.8, z: -0.6, r: 0.58, h: 0.10, s: 0.47 },
        ];

        const bubbles = cfgs.map(d => {
            const grp = new THREE.Group();
            const inner = new THREE.Mesh(
                new THREE.SphereGeometry(d.r, 64, 64),
                new THREE.MeshPhysicalMaterial({ color: new THREE.Color().setHSL(d.h, 0.8, 0.5), metalness: 0.15, roughness: 0.05, transparent: true, opacity: 0.28, side: THREE.DoubleSide })
            );
            const outer = new THREE.Mesh(
                new THREE.SphereGeometry(d.r * 1.15, 32, 32),
                new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(d.h, 1, 0.55), transparent: true, opacity: 0.09, side: THREE.BackSide })
            );
            grp.add(inner, outer);
            grp.position.set(d.x, d.y, d.z);
            grp._o = { x: d.x, y: d.y }; grp._s = d.s; grp._h = d.h;
            grp._im = inner.material; grp._gm = outer.material;
            scene.add(grp);
            return grp;
        });

        let mouseNX = 0, mouseNY = 0;
        document.addEventListener('mousemove', e => {
            mouseNX = (e.clientX / window.innerWidth)  * 2 - 1;
            mouseNY = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        let t = 0;
        (function loop() {
            requestAnimationFrame(loop);
            t += 0.007;

            bubbles.forEach((g, i) => {
                const h = (g._h + t * 0.018) % 1.0;
                g._im.color.setHSL(h, 0.8, 0.5);
                g._gm.color.setHSL(h, 1.0, 0.55);
                g.position.y = g._o.y + Math.sin(t * g._s + i * 1.5) * 0.27;
                g.position.x = g._o.x + Math.cos(t * g._s * 0.65 + i) * 0.11
                             + mouseNX * 0.28;
                g.position.y += mouseNY * 0.20;
                g.rotation.x = t * 0.28 * g._s;
                g.rotation.y = t * 0.38 * g._s;
            });

            lights.forEach((l, i) => {
                const p = t * (0.4 + i * 0.1);
                l.position.x = l._ox * Math.cos(p) - l._oy * Math.sin(p);
                l.position.y = l._ox * Math.sin(p) + l._oy * Math.cos(p);
            });

            renderer.render(scene, camera);
        })();

        window.addEventListener('resize', () => {
            const w = window.innerWidth, h = window.innerHeight;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        });
    }


    /* ══════════════════════════════════════
       3. HERO ENTRANCE ANIMATIONS
    ══════════════════════════════════════ */
    gsap.to('.h-line', {
        opacity: 1, y: 0,
        stagger: 0.14,
        duration: 1.5,
        ease: 'power4.out',
        delay: 0.35,
    });
    gsap.to('.hero-desc', {
        opacity: 1, y: 0,
        duration: 1.2, ease: 'power3.out', delay: 0.9
    });
    gsap.to('.hero-bottom', {
        opacity: 1, duration: 1, ease: 'power2.out', delay: 1.2
    });
    gsap.fromTo('.hero-tag', { opacity: 0, y: -20 }, {
        opacity: 1, y: 0, stagger: 0.15, duration: 1, ease: 'power3.out', delay: 1.0
    });
    gsap.fromTo('.header', { opacity: 0, y: -30 }, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.2
    });


    /* ══════════════════════════════════════
       4. SCROLL REVEALS
    ══════════════════════════════════════ */
    gsap.utils.toArray('.reveal').forEach(el => {
        gsap.fromTo(el,
            { opacity: 0, y: 50 },
            {
                opacity: 1, y: 0,
                duration: 1.1,
                ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
            }
        );
    });


    /* ══════════════════════════════════════
       5. PROCESS TABS
    ══════════════════════════════════════ */
    const tabBtns    = document.querySelectorAll('.tab-btn');
    const tabPanels  = document.querySelectorAll('.tab-panel');
    const tabIndicator = document.querySelector('.tab-indicator');

    function setIndicator(btn) {
        if (!tabIndicator || !btn) return;
        tabIndicator.style.left  = btn.offsetLeft + 'px';
        tabIndicator.style.width = btn.offsetWidth + 'px';
    }

    // Init indicator on first tab
    const firstBtn = document.querySelector('.tab-btn.active');
    if (firstBtn) setTimeout(() => setIndicator(firstBtn), 50);

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.tab);

            // Update buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Move indicator
            setIndicator(btn);

            // Update panels — fade out active, then swap
            tabPanels.forEach(p => {
                if (p.classList.contains('active')) {
                    p.style.opacity = 0;
                    p.style.transform = 'translateY(10px)';
                    setTimeout(() => { p.classList.remove('active'); p.style.display = 'none'; }, 300);
                }
            });
            setTimeout(() => {
                const target = document.querySelector(`.tab-panel[data-panel="${idx}"]`);
                if (target) {
                    target.style.display = 'block';
                    target.style.opacity = 0;
                    target.style.transform = 'translateY(20px)';
                    target.classList.add('active');
                    requestAnimationFrame(() => {
                        target.style.transition = 'opacity .45s ease, transform .45s ease';
                        target.style.opacity = 1;
                        target.style.transform = 'translateY(0)';

                        // Trigger skill bar animations if this is the skills panel
                        if (idx === 4) {
                            const bars = target.querySelectorAll('.skill-progress');
                            bars.forEach(bar => {
                                const finalWidth = bar.parentElement.previousElementSibling.lastElementChild.textContent;
                                bar.style.width = finalWidth;
                            });
                        }
                    });

                }
            }, 320);
        });
    });


    /* ══════════════════════════════════════
       6. HORIZONTAL DRAG SLIDER
    ══════════════════════════════════════ */
    const viewport   = document.getElementById('slider-viewport');
    const track      = document.getElementById('slider-track');
    const prevBtn    = document.getElementById('slider-prev');
    const nextBtn    = document.getElementById('slider-next');
    const progressFill = document.getElementById('slider-progress-fill');

    if (track && viewport) {
        const slides = track.querySelectorAll('.project-slide');
        const slideW = slides[0] ? slides[0].offsetWidth + 32 : 452; // card + gap
        let currentX = 0;
        const maxX   = () => -(track.scrollWidth - viewport.offsetWidth - parseFloat(getComputedStyle(viewport).paddingLeft));

        function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }

        function applyTranslate(x, animate = true) {
            currentX = clamp(x, maxX(), 0);
            track.style.transition = animate ? 'transform .6s cubic-bezier(.25,1,.5,1)' : 'none';
            track.style.transform = `translateX(${currentX}px)`;
            // progress
            if (progressFill) {
                const pct = Math.abs(currentX) / Math.abs(maxX()) * (100 - 33.33) + 33.33;
                progressFill.style.width = Math.min(pct, 100) + '%';
            }
        }

        prevBtn && prevBtn.addEventListener('click', () => applyTranslate(currentX + slideW));
        nextBtn && nextBtn.addEventListener('click', () => applyTranslate(currentX - slideW));

        // Drag
        let startX = 0, startTranslate = 0, dragging = false;

        viewport.addEventListener('mousedown', e => {
            dragging = true;
            startX = e.clientX;
            startTranslate = currentX;
            viewport.classList.add('dragging');
        });
        window.addEventListener('mousemove', e => {
            if (!dragging) return;
            const dx = e.clientX - startX;
            applyTranslate(startTranslate + dx, false);
        });
        window.addEventListener('mouseup', () => {
            dragging = false;
            viewport.classList.remove('dragging');
        });

        // Touch
        viewport.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX;
            startTranslate = currentX;
        }, { passive: true });
        viewport.addEventListener('touchmove', e => {
            const dx = e.touches[0].clientX - startX;
            applyTranslate(startTranslate + dx, false);
        }, { passive: true });
    }


    /* ══════════════════════════════════════
       7. COUNT-UP STATS
    ══════════════════════════════════════ */
    const statItems = document.querySelectorAll('.stat-item[data-count]');

    const countObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el     = entry.target;
            const target = parseInt(el.dataset.count);
            const numEl  = el.querySelector('.count-num');
            if (!numEl || el._counted) return;
            el._counted = true;

            const duration = 1800; // ms
            const start    = performance.now();

            function update(now) {
                const progress = Math.min((now - start) / duration, 1);
                // easeOutExpo
                const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                numEl.textContent = Math.round(ease * target).toLocaleString();
                if (progress < 1) requestAnimationFrame(update);
            }
            requestAnimationFrame(update);
            countObserver.unobserve(el);
        });
    }, { threshold: 0.4 });

    statItems.forEach(el => countObserver.observe(el));

});
