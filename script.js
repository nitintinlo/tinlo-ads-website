document.addEventListener('DOMContentLoaded', () => {
    /* ----------------------------------------------------
       1. Custom Cursor
       ---------------------------------------------------- */
    const cursor = document.getElementById('cursor');
    const cursorFollower = document.getElementById('cursor-follower');

    // Only run if not on touch device
    if (window.matchMedia("(pointer: fine)").matches) {
        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Move cursor directly
            if (cursor) {
                cursor.style.left = mouseX + 'px';
                cursor.style.top = mouseY + 'px';
            }
        });

        // Smooth follow for the outer circle
        function animateFollower() {
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;

            if (cursorFollower) {
                cursorFollower.style.left = followerX + 'px';
                cursorFollower.style.top = followerY + 'px';
            }
            requestAnimationFrame(animateFollower);
        }
        animateFollower();

        // Hover effect for links and buttons
        const interactables = document.querySelectorAll('a, button, input, textarea');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (cursorFollower) {
                    cursorFollower.style.transform = 'translate(-50%, -50%) scale(1.5)';
                    cursorFollower.style.borderColor = '#6d28d9';
                    cursorFollower.style.backgroundColor = 'rgba(109, 40, 217, 0.1)';
                }
            });
            el.addEventListener('mouseleave', () => {
                if (cursorFollower) {
                    cursorFollower.style.transform = 'translate(-50%, -50%) scale(1)';
                    cursorFollower.style.borderColor = 'white';
                    cursorFollower.style.backgroundColor = 'transparent';
                }
            });
        });
    }

    /* ----------------------------------------------------
       2. Mobile Menu Toggle
       ---------------------------------------------------- */
    const burger = document.querySelectorAll('.navbar-burger');
    const menu = document.querySelectorAll('.navbar-menu');
    const close = document.querySelectorAll('.navbar-close, .navbar-backdrop, .navbar-menu a');

    if (burger.length && menu.length) {
        for (let i = 0; i < burger.length; i++) {
            burger[i].addEventListener('click', function () {
                for (let j = 0; j < menu.length; j++) {
                    menu[j].classList.toggle('hidden');
                }
            });
        }
    }

    if (close.length) {
        for (let i = 0; i < close.length; i++) {
            close[i].addEventListener('click', function () {
                for (let j = 0; j < menu.length; j++) {
                    menu[j].classList.toggle('hidden');
                }
            });
        }
    }

    /* ----------------------------------------------------
       3. Scroll Animations (Intersection Observer)
       ---------------------------------------------------- */
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const fadeInObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');

                // If it's a skill progress bar, animate it
                const progressBar = entry.target.querySelector('.skill-progress');
                if (progressBar) {
                    progressBar.style.width = progressBar.getAttribute('data-width');
                }

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-up, .fade-left, .fade-right, .skill-item');
    animatedElements.forEach(el => fadeInObserver.observe(el));


    /* ----------------------------------------------------
       4. Canvas Interactive Background (Liquid / Cinematic network)
       ---------------------------------------------------- */
    const canvas = document.getElementById('heroCanvas');
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];

    const initCanvas = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };

    initCanvas();
    window.addEventListener('resize', () => {
        initCanvas();
        initParticles();
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2;
            this.baseX = this.x;
            this.baseY = this.y;
        }

        update(mouse) {
            // Keep particles inside canvas
            if (this.x > width || this.x < 0) this.vx *= -1;
            if (this.y > height || this.y < 0) this.vy *= -1;

            this.x += this.vx;
            this.y += this.vy;

            // Mouse interaction (repulsion)
            if (mouse.x && mouse.y) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDist = 150;

                if (distance < maxDist) {
                    const force = (maxDist - distance) / maxDist;
                    this.x -= (dx / distance) * force * 5;
                    this.y -= (dy / distance) * force * 5;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fill();
        }
    }

    const initParticles = () => {
        particles = [];
        const numParticles = Math.min((width * height) / 10000, 150); // density
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
        }
    };

    initParticles();

    // Mouse tracking for canvas
    const mouse = { x: null, y: null };

    // Use the same mousemove event but restricted to canvas bounds ideally, or just global window
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Animation Loop for Canvas
    const animateCanvas = () => {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update(mouse);
            particles[i].draw();

            for (let j = i; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Draw connecting lines if close
                if (distance < 100) {
                    ctx.beginPath();
                    // Color transitions based on position and distance
                    const alpha = 1 - (distance / 100);
                    // Add a hint of primary color (#6d28d9) to lines
                    ctx.strokeStyle = `rgba(109, 40, 217, ${alpha * 0.3})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animateCanvas);
    };

    animateCanvas();
    
    /* ----------------------------------------------------
       5. Expertise Popups Logic
       ---------------------------------------------------- */
    const popupContainer = document.getElementById('expertise-popups');
    const popups = document.querySelectorAll('.expertise-popup');
    const docBody = document.body;

    window.openExpertisePopup = function(popupId) {
        if (!popupContainer) return;
        
        // Hide all popups first
        popups.forEach(p => {
            p.classList.add('hidden');
            p.classList.remove('scale-100', 'opacity-100');
            p.classList.add('scale-95', 'opacity-0');
        });
        
        const targetPopup = document.getElementById(popupId);
        if (targetPopup) {
            // Show container
            popupContainer.classList.remove('hidden');
            popupContainer.classList.add('flex');
            
            // Show backdrop
            const backdrop = popupContainer.querySelector('.popup-backdrop');
            if (backdrop) {
                setTimeout(() => {
                    backdrop.classList.remove('opacity-0');
                    backdrop.classList.add('opacity-100');
                }, 10);
            }
            
            // Prevent scrolling on body
            docBody.style.overflow = 'hidden';
            
            // Show specific popup
            targetPopup.classList.remove('hidden');
            
            // Trigger animation
            setTimeout(() => {
                targetPopup.classList.remove('scale-95', 'opacity-0');
                targetPopup.classList.add('scale-100', 'opacity-100');
            }, 10);
        }
    };

    window.closeExpertisePopup = function() {
        if (!popupContainer) return;
        
        const backdrop = popupContainer.querySelector('.popup-backdrop');
        if (backdrop) {
            backdrop.classList.remove('opacity-100');
            backdrop.classList.add('opacity-0');
        }
        
        popups.forEach(p => {
            if (!p.classList.contains('hidden')) {
                p.classList.remove('scale-100', 'opacity-100');
                p.classList.add('scale-95', 'opacity-0');
                
                setTimeout(() => {
                    p.classList.add('hidden');
                    
                    // Hide container if all are closing
                    popupContainer.classList.add('hidden');
                    popupContainer.classList.remove('flex');
                    
                    // Restore scrolling
                    docBody.style.overflow = '';
                }, 500); // Wait for transition to finish
            }
        });
    };

    /* ----------------------------------------------------
       6. Process Workflow Zigzag SVG Drawing
       ---------------------------------------------------- */
    const drawProcessLines = () => {
        const container = document.getElementById('process-steps-container');
        const nodes = document.querySelectorAll('.process-node');
        const bgPath = document.getElementById('bg-path');
        const glowPath = document.getElementById('glow-path');
        
        if (!container || !bgPath || !glowPath || nodes.length === 0) return;

        // Skip drawing on mobile where nodes are hidden
        if (window.innerWidth < 768) {
            bgPath.setAttribute('d', '');
            glowPath.setAttribute('d', '');
            return;
        }

        const containerRect = container.getBoundingClientRect();
        
        // Get coordinates for all nodes relative to container
        const points = Array.from(nodes).map(node => {
            const rect = node.getBoundingClientRect();
            // Center of the node
            const x = (rect.left + rect.right) / 2 - containerRect.left;
            const y = (rect.top + rect.bottom) / 2 - containerRect.top;
            return { x, y };
        });

        // Construct SVG Path (S-Curves between points)
        let d = `M ${points[0].x},${points[0].y} `;
        
        for (let i = 1; i < points.length; i++) {
            const prev = points[i-1];
            const curr = points[i];
            
            // Calculate bezier control points for a smooth S-curve
            // Control points are halfway down vertically, keeping their respective X values
            const cp1Y = prev.y + (curr.y - prev.y) / 2;
            const cp2Y = prev.y + (curr.y - prev.y) / 2;
            
            d += `C ${prev.x},${cp1Y} ${curr.x},${cp2Y} ${curr.x},${curr.y} `;
        }
        
        bgPath.setAttribute('d', d);
        glowPath.setAttribute('d', d);
    };

    // Draw on load and resize
    window.addEventListener('load', drawProcessLines);
    window.addEventListener('resize', drawProcessLines);
    
    // Initial call with a slight delay to ensure layout passes are done
    setTimeout(drawProcessLines, 100);

    /* ----------------------------------------------------
       7. Navbar Scroll Effect (Mobile & Desktop)
       ---------------------------------------------------- */
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                // When scrolled down: Remove transparent blend, add dark solid background
                navbar.classList.remove('py-6', 'mix-blend-difference');
                navbar.classList.add('py-4', 'bg-black/90', 'backdrop-blur-md', 'border-b', 'border-white/10', 'shadow-lg');
            } else {
                // When at top: transparent with cool blend mode
                navbar.classList.add('py-6', 'mix-blend-difference');
                navbar.classList.remove('py-4', 'bg-black/90', 'backdrop-blur-md', 'border-b', 'border-white/10', 'shadow-lg');
            }
        });
    }
});
