/**
 * Epic Aura - Premium Salon Website
 * Main JavaScript File
 * Production-ready, vanilla JS, no dependencies
 */

(function() {
    'use strict';

    // =============================================
    // DOM SELECTORS
    // =============================================
    const header = document.querySelector('.header');
    const mobileToggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalClose = document.querySelector('.modal-close');
    const bookingForm = document.getElementById('booking-form');
    const enquiryForm = document.getElementById('enquiry-form');
    const successMessage = document.querySelector('.success-message');
    const formContainer = document.querySelector('.form-container');
    const faqItems = document.querySelectorAll('.faq-item');
    const ctaButtons = document.querySelectorAll('[data-modal="booking"]');
    const currentYearEl = document.getElementById('current-year');

    // =============================================
    // HEADER SCROLL EFFECT
    // =============================================
    function handleScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    // =============================================
    // MOBILE NAVIGATION
    // =============================================
    function toggleMobileNav() {
        mobileToggle.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    }

    if (mobileToggle) {
        mobileToggle.addEventListener('click', toggleMobileNav);
    }

    // Close mobile nav when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('active')) {
                toggleMobileNav();
            }
        });
    });

    // =============================================
    // MODAL FUNCTIONALITY
    // =============================================
    function openModal() {
        if (modalOverlay) {
            modalOverlay.classList.add('active');
            document.body.classList.add('no-scroll');
            // Focus first input for accessibility
            setTimeout(() => {
                const firstInput = modalOverlay.querySelector('input, select, textarea');
                if (firstInput) firstInput.focus();
            }, 100);
        }
    }

    function closeModal() {
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
            document.body.classList.remove('no-scroll');
            resetForm();
        }
    }

    function resetForm() {
        if (successMessage) successMessage.classList.remove('active');
        if (formContainer) formContainer.style.display = 'block';
        if (bookingForm) bookingForm.reset();
        if (enquiryForm) enquiryForm.reset();
    }

    // Open modal from CTA buttons
    ctaButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    });

    // Close modal
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    // Close on overlay click
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });

    // =============================================
    // BOOKING FORM HANDLING
    // =============================================
    function handleBookingSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Basic validation
        if (!data.name || !data.phone || !data.service) {
            showFormError('Please fill in all required fields.');
            return;
        }
        
        // Phone validation (Kenyan format)
        const phoneRegex = /^(0|\+254)?7\d{8}$/;
        if (!phoneRegex.test(data.phone.replace(/\s/g, ''))) {
            showFormError('Please enter a valid Kenyan phone number.');
            return;
        }
        
        // Simulate submission
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Processing...';
        
        setTimeout(() => {
            // Success
            if (formContainer) formContainer.style.display = 'none';
            if (successMessage) successMessage.classList.add('active');
            
            // Log booking data (in production, send to server)
            console.log('Booking Request:', data);
            
            // Send WhatsApp confirmation (simulated)
            sendWhatsAppConfirmation(data);
            
        }, 1500);
    }

    function handleEnquirySubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Basic validation
        if (!data.name || !data.phone) {
            showFormError('Please fill in your name and phone number.');
            return;
        }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Processing...';
        
        setTimeout(() => {
            if (formContainer) formContainer.style.display = 'none';
            if (successMessage) successMessage.classList.add('active');
            
            console.log('Membership Enquiry:', data);
            
            // In production: send to harrisoncheruiyot04@gmail.com
        }, 1500);
    }

    function showFormError(message) {
        // Remove existing errors
        const existingError = document.querySelector('.form-error');
        if (existingError) existingError.remove();
        
        const errorEl = document.createElement('p');
        errorEl.className = 'form-error';
        errorEl.style.cssText = 'color: #8B3A3A; font-size: 0.875rem; margin-bottom: 1rem;';
        errorEl.textContent = message;
        
        const form = document.querySelector('.form-container form');
        if (form) {
            form.insertBefore(errorEl, form.querySelector('button[type="submit"]'));
            
            // Auto-remove after 5 seconds
            setTimeout(() => errorEl.remove(), 5000);
        }
    }

    function sendWhatsAppConfirmation(data) {
        // In production, this would use WhatsApp Business API
        // For now, we'll open WhatsApp with a pre-filled message
        const message = encodeURIComponent(
            `Epic Aura - Booking Confirmation\n\n` +
            `Name: ${data.name}\n` +
            `Service: ${data.service}\n` +
            `Date/Time: ${data.datetime || 'To be confirmed'}\n\n` +
            `We will confirm your appointment shortly.`
        );
        
        // Optional: Open WhatsApp (commented out to avoid disrupting UX)
        // window.open(`https://wa.me/254702555093?text=${message}`, '_blank');
    }

    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }

    if (enquiryForm) {
        enquiryForm.addEventListener('submit', handleEnquirySubmit);
    }

    // =============================================
    // FAQ ACCORDION
    // =============================================
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                // Close other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
                // Toggle current item
                item.classList.toggle('active');
            });
        }
    });

    // =============================================
    // SCROLL ANIMATIONS (Intersection Observer)
    // =============================================
    const animateElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');

    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animateElements.forEach(el => observer.observe(el));
    } else {
        // Fallback for older browsers
        animateElements.forEach(el => el.classList.add('visible'));
    }

    // =============================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // =============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerHeight = header ? header.offsetHeight : 80;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // =============================================
    // CURRENT YEAR (Footer)
    // =============================================
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }

    // =============================================
    // ACTIVE NAV LINK HIGHLIGHT
    // =============================================
    function setActiveNavLink() {
        const currentPath = window.location.pathname;
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkPath = link.getAttribute('href');
            
            if (currentPath.includes(linkPath) && linkPath !== '/' && linkPath !== 'index.html') {
                link.classList.add('active');
            } else if ((currentPath === '/' || currentPath.includes('index.html')) && linkPath === 'index.html') {
                link.classList.add('active');
            }
        });
    }

    setActiveNavLink();

    // =============================================
    // PERFORMANCE: LAZY LOAD IMAGES
    // =============================================
    if ('loading' in HTMLImageElement.prototype) {
        // Browser supports native lazy loading
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            img.src = img.dataset.src || img.src;
        });
    } else {
        // Fallback for older browsers
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window && lazyImages.length > 0) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }

    // =============================================
    // ERROR HANDLING & GRACEFUL DEGRADATION
    // =============================================
    window.addEventListener('error', (e) => {
        // Log errors silently in production
        if (window.console && window.console.error) {
            console.error('Epic Aura - Error:', e.message);
        }
    });

    // =============================================
    // INITIALIZATION LOG
    // =============================================
    if (window.console && window.console.log) {
        console.log('%cEpic Aura%c — Premium Salon Experience',
            'font-family: Cormorant Garamond, serif; font-size: 1.5rem; color: #B8945A;',
            'font-family: Inter, sans-serif; color: #C4BBAF;');
        console.log('%cNairobi CBD • +254 702 555 093',
            'font-family: Inter, sans-serif; font-size: 0.75rem; color: #C4BBAF;');
    }

})();