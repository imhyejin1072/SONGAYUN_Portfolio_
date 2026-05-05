document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lenis (Smooth Scroll)
    const lenis = new Lenis({
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // 2. Custom Cursor
    const cursor = document.querySelector('.cursor');
    const interactiveElements = document.querySelectorAll('a, button, .project-card');

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
        el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });

    // 3. Three.js Liquid Glass Interaction (Advanced Shader)
    const initThree = () => {
        try {
            const container = document.getElementById('canvas-container');
            if (!container || typeof THREE === 'undefined') return;

            const scene = new THREE.Scene();
            const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            container.appendChild(renderer.domElement);

            // Hide HTML Text
            const heroTitle = document.querySelector('.hero-title');
            if (heroTitle) heroTitle.style.opacity = '0';

            // Create Text Texture
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 2048;
            canvas.height = 1024;
            const drawText = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#111111';
                ctx.font = '900 180px "Noto Sans JP"';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('도전하고, 넘어지고,', canvas.width / 2, canvas.height / 2 - 120);
                ctx.fillText('다시 달리자!', canvas.width / 2, canvas.height / 2 + 120);
            };
            drawText();
            const textTexture = new THREE.CanvasTexture(canvas);

            // Shader Material for Liquid Glass
            const uniforms = {
                uTime: { value: 0 },
                uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
                uMouse: { value: new THREE.Vector2(0.5, 0.5) },
                uTextTexture: { value: textTexture }
            };

            const vertexShader = `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `;

            const fragmentShader = `
                uniform float uTime;
                uniform vec2 uResolution;
                uniform vec2 uMouse;
                uniform sampler2D uTextTexture;
                varying vec2 vUv;

                float noise(vec2 p) {
                    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
                }

                void main() {
                    vec2 uv = vUv;
                    float aspect = uResolution.x / uResolution.y;
                    vec2 p = (uv - 0.5) * 2.0;
                    p.x *= aspect;

                    vec2 m = (uMouse - 0.5) * 2.0;
                    m.x *= aspect;

                    // Metaballs SDF
                    float d = 0.0;
                    for(float i=0.0; i<6.0; i++) {
                        vec2 pos = vec2(sin(uTime*0.5 + i*1.2), cos(uTime*0.3 + i*0.8)) * 0.5;
                        if(i == 0.0) pos = m; // One ball follows mouse
                        d += 0.1 / distance(p, pos);
                    }

                    // Glass Threshold
                    float glass = smoothstep(0.4, 0.5, d);
                    float edge = smoothstep(0.48, 0.5, d) - smoothstep(0.5, 0.52, d);
                    
                    // Refraction Vector
                    vec2 refraction = d * 0.05 * vec2(dFdx(d), dFdy(d));
                    
                    // Chromatic Aberration (RGB Shift)
                    float r = texture2D(uTextTexture, uv + refraction * 1.2).r;
                    float g = texture2D(uTextTexture, uv + refraction * 1.0).g;
                    float b = texture2D(uTextTexture, uv + refraction * 0.8).b;
                    
                    vec4 textColor = vec4(r, g, b, 1.0);
                    
                    // Background is white, text is dark
                    vec3 finalColor = mix(vec3(1.0), textColor.rgb, 1.0);
                    
                    // Add Glass highlight & Iridescence
                    finalColor += edge * vec3(0.8, 0.9, 1.0) * 0.5;
                    finalColor += glass * 0.05; // Subtle boost

                    // Grain
                    float g_noise = noise(uv * uTime) * 0.05;
                    finalColor -= g_noise;

                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `;

            const geometry = new THREE.PlaneGeometry(2, 2);
            const material = new THREE.ShaderMaterial({
                uniforms,
                vertexShader,
                fragmentShader,
                transparent: true
            });

            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);

            window.addEventListener('mousemove', (e) => {
                const rect = container.getBoundingClientRect();
                uniforms.uMouse.value.x = (e.clientX - rect.left) / container.clientWidth;
                uniforms.uMouse.value.y = 1.0 - (e.clientY - rect.top) / container.clientHeight;
            });

            function animate() {
                requestAnimationFrame(animate);
                uniforms.uTime.value += 0.02;
                renderer.render(scene, camera);
                if (heroTitle) heroTitle.style.opacity = '0';
            }
            animate();

            window.addEventListener('resize', () => {
                const w = container.clientWidth;
                const h = container.clientHeight;
                renderer.setSize(w, h);
                uniforms.uResolution.value.set(w, h);
            });
        } catch (e) {
            console.warn("Liquid Glass Shader failed", e);
        }
    };

    document.fonts.ready.then(() => {
        initThree();
    });

    // Wait for fonts to load before drawing text texture
    document.fonts.ready.then(() => {
        initThree();
    });

    // 4. GSAP Animations
    gsap.registerPlugin(ScrollTrigger);

    // Hero Text Reveal
    gsap.from(".reveal-line", {
        y: "100%",
        duration: 1.5,
        ease: "power4.out",
        stagger: 0.2,
        delay: 0.5
    });

    // General Reveal Up
    const revealElements = document.querySelectorAll('.reveal-up');
    revealElements.forEach((el) => {
        gsap.fromTo(el, 
            { y: 60, opacity: 0 },
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

    // Header Reveal on Load
    gsap.from(".header", {
        y: -50,
        opacity: 0,
        duration: 1,
        ease: "power2.out",
        delay: 1.2
    });
});
