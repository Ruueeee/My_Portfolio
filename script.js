// script.js

let scene, camera, renderer, mobiusStrip, particleSystem;
let mouseX = 0, mouseY = 0;
let time = 0;

function initThreeJS() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('threejs-canvas'), 
        alpha: true, 
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    createMobiusStrip();
    createParticleSystem();

    // Enhanced lighting setup
    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.3);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0x6366f1, 0.8);
    directionalLight1.position.set(50, 50, 50);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0x06b6d4, 0.6);
    directionalLight2.position.set(-50, -30, 30);
    scene.add(directionalLight2);

    const pointLight = new THREE.PointLight(0xf59e0b, 0.4, 100);
    pointLight.position.set(0, 0, 40);
    scene.add(pointLight);

    // Position camera
    camera.position.set(0, 0, 65);

    // Mouse interaction
    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize);

    // Start animation
    animate();
}

function createMobiusStrip() {
    function mobiusFunction(u, v, target) {
        u = u * Math.PI * 2;
        v = (v - 0.5) * 0.8;
        
        const radius = 25;
        const x = (radius + v * Math.cos(u / 2)) * Math.cos(u);
        const y = (radius + v * Math.cos(u / 2)) * Math.sin(u);
        const z = v * Math.sin(u / 2);
        
        target.set(x, y, z);
    }
    const geometry = new THREE.ParametricGeometry(mobiusFunction, 120, 30);
    
    const material = new THREE.MeshPhysicalMaterial({
        color: 0x6366f1,
        metalness: 0.1,
        roughness: 0.1,
        transparent: true,
        opacity: 0.6,
        transmission: 0.3,
        thickness: 0.5,
        side: THREE.DoubleSide,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.0
    });

    mobiusStrip = new THREE.Mesh(geometry, material);
    scene.add(mobiusStrip);

    const wireframeGeometry = geometry.clone();
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        wireframe: true,
        transparent: true,
        opacity: 0.2
    });
    const wireframeMesh = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    mobiusStrip.add(wireframeMesh);

    const glowGeometry = geometry.clone();
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.scale.multiplyScalar(1.02);
    mobiusStrip.add(glowMesh);
}

function createParticleSystem() {
    const particleCount = 800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const color1 = new THREE.Color(0x6366f1);
    const color2 = new THREE.Color(0x06b6d4);
    const color3 = new THREE.Color(0xf59e0b);

    for (let i = 0; i < particleCount; i++) {
        const radius = Math.random() * 100 + 30;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);

        // Random colors
        const colorChoice = Math.random();
        let color;
        if (colorChoice < 0.4) color = color1;
        else if (colorChoice < 0.8) color = color2;
        else color = color3;

        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        sizes[i] = Math.random() * 2 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 1,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
}

function onMouseMove(event) {
    mouseX = (event.clientX - window.innerWidth / 2) * 0.0002;
    mouseY = (event.clientY - window.innerHeight / 2) * 0.0002;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    time += 0.01;
    if (mobiusStrip) {
        mobiusStrip.rotation.x = time * 0.2 + mouseY * 2;
        mobiusStrip.rotation.y = time * 0.3 + mouseX * 2;
        mobiusStrip.rotation.z = time * 0.1;

      
        const scale = 1 + Math.sin(time * 0.5) * 0.05;
        mobiusStrip.scale.setScalar(scale);
    }

    // Animate particles
    if (particleSystem) {
        particleSystem.rotation.x = time * 0.05;
        particleSystem.rotation.y = time * 0.08;

        // Float particles
        const positions = particleSystem.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(time + i * 0.01) * 0.002;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    // Smooth mouse movement
    mouseX *= 0.95;
    mouseY *= 0.95;

    renderer.render(scene, camera);
}

// Contact Form Class
class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        // Obfuscated credentials for basic protection
        this._k = 'portfolio2025';
        this.init();
    }

    // Deobfuscation method
    _d(e) {
        const d = atob(e);
        let r = '';
        for (let i = 0; i < d.length; i++) {
            r += String.fromCharCode(d.charCodeAt(i) ^ this._k.charCodeAt(i % this._k.length));
        }
        return r;
    }

    // Get credentials
    _c() {
        // Encrypted with XOR + Base64
        const t = 'SFxFQ1JXVVhdAgpzdDhXJBYHI1xcHFhgCkc9BTAWDQwpIR11BURnIhsQAlc4XA==';
        const c = 'Rl5ERldbWlFeBA==';
        return { t: this._d(t), c: this._d(c) };
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            project: formData.get('project'),
            message: formData.get('message')
        };

        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        // Get decrypted credentials
        const creds = this._c();

        // Format message for Telegram (plain text - no escaping needed)
        const telegramMessage = 
            `📬 New Contact Form Submission\n\n` +
            `👤 Name: ${data.name}\n` +
            `📧 Email: ${data.email}\n` +
            `💼 Project Type: ${data.project || 'Not specified'}\n\n` +
            `💬 Message:\n${data.message}`;

        try {
            const response = await fetch(`https://api.telegram.org/bot${creds.t}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: creds.c,
                    text: telegramMessage
                })
            });

            const result = await response.json();

            if (result.ok) {
                submitBtn.textContent = '✓ Message Sent!';
                submitBtn.style.background = 'linear-gradient(135deg, #10b981, #06b6d4)';
                this.form.reset();
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3000);
            } else {
                throw new Error(result.description || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending to Telegram:', error);
            submitBtn.textContent = '✗ Failed to Send';
            submitBtn.style.background = 'linear-gradient(135deg, #ef4444, #f59e0b)';
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 3000);
        }
    }
}
// Navigation and interaction
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    new ContactForm();
    initThreeJS();
    initInteractiveFeatures();
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    document.querySelectorAll('.glass').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });
});

// Interactive Features
function initInteractiveFeatures() {
    // Scroll Progress Indicator
    createScrollProgress();
    
    // Back to Top Button
    createBackToTop();
    
    // Tilt Effect on Cards
    initTiltEffect();
    
    // Typing Effect for Hero
    initTypingEffect();
    
    // Parallax Effect on Scroll
    initParallaxScroll();
    
    // Click Effects on Skill Tags
    initSkillTagEffects();
    
    // Logo Click
    initLogoClick();
    
    // Counter Animation for Stats
    initCounterAnimation();
}

// Scroll Progress Bar
function createScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.prepend(progressBar);
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    });
}

// Back to Top Button
function createBackToTop() {
    const backToTop = document.createElement('div');
    backToTop.className = 'back-to-top';
    backToTop.title = 'Back to Top';
    document.body.appendChild(backToTop);
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Tilt Effect for Project Cards
function initTiltEffect() {
    const cards = document.querySelectorAll('.project-card, .skill-category, .timeline-content');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

// Typing Effect
function initTypingEffect() {
    const heroTitle = document.querySelector('.hero h1');
    if (!heroTitle) return;
    
    const originalText = heroTitle.textContent;
    heroTitle.innerHTML = '';
    
    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    heroTitle.appendChild(cursor);
    
    function type() {
        if (i < originalText.length) {
            heroTitle.insertBefore(document.createTextNode(originalText.charAt(i)), cursor);
            i++;
            setTimeout(type, 100);
        } else {
            // Remove cursor after typing is done
            setTimeout(() => {
                cursor.style.display = 'none';
            }, 2000);
        }
    }
    
    // Start typing after a short delay
    setTimeout(type, 500);
}

// Parallax Scroll Effect
function initParallaxScroll() {
    const sections = document.querySelectorAll('.content-section');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const speed = 0.1;
            
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const yPos = (rect.top - window.innerHeight) * speed;
                section.style.backgroundPositionY = yPos + 'px';
            }
        });
    });
}

// Skill Tag Click Effects
function initSkillTagEffects() {
    const skillTags = document.querySelectorAll('.skill-tag, .timeline-skill, .project-tag');
    
    skillTags.forEach(tag => {
        tag.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                background: rgba(255,255,255,0.5);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            
            this.style.position = 'relative';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
            
            // Bounce animation
            this.style.animation = 'none';
            this.offsetHeight; // Trigger reflow
            this.style.animation = 'pulse 0.3s ease';
        });
    });
    
    // Add ripple keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Logo Click - Scroll to Top
function initLogoClick() {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Counter Animation (can be used for future stats section)
function initCounterAnimation() {
    const counters = document.querySelectorAll('.counter');
    
    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    };
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => counterObserver.observe(counter));
}

// Mouse Trail Effect (optional - can be enabled)
function initMouseTrail() {
    const trail = [];
    const trailLength = 10;
    
    for (let i = 0; i < trailLength; i++) {
        const dot = document.createElement('div');
        dot.style.cssText = `
            position: fixed;
            width: ${10 - i}px;
            height: ${10 - i}px;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            opacity: ${1 - i / trailLength};
            transition: transform 0.1s ease;
        `;
        document.body.appendChild(dot);
        trail.push(dot);
    }
    
    let positions = [];
    
    document.addEventListener('mousemove', (e) => {
        positions.unshift({ x: e.clientX, y: e.clientY });
        positions = positions.slice(0, trailLength);
        
        trail.forEach((dot, index) => {
            if (positions[index]) {
                dot.style.left = positions[index].x - 5 + 'px';
                dot.style.top = positions[index].y - 5 + 'px';
            }
        });
    });
}