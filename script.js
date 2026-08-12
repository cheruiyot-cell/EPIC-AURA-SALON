/**
 * Epic Aura - Premium Salon Website
 * Main JavaScript File
 * Production-ready, vanilla JS, no dependencies
 * Version 3.0 - Updated with fixes: relative paths, form fetch, accessibility, lazy loading, active nav, etc.
 */

(function() {
    'use strict';

    // =============================================
    // DOM SELECTORS WITH SAFETY CHECKS
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
        if (!header) return;
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // =============================================
    // MOBILE NAVIGATION
    // =============================================
    function toggleMobileNav() {
        if (!mobileToggle || !nav) return;
        const isActive = nav.classList.contains('active');
        mobileToggle.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
        // Update accessibility attribute
        mobileToggle.setAttribute('aria-expanded', !isActive);
    }

    if (mobileToggle) {
        mobileToggle.addEventListener('click', toggleMobileNav);
    }

    if (navLinks.length) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (nav && nav.classList.contains('active')) {
                    toggleMobileNav();
                }
            });
        });
    }

    // =============================================
    // MODAL FUNCTIONALITY
    // =============================================
    function openModal() {
        if (!modalOverlay) return;
        modalOverlay.classList.add('active');
        document.body.classList.add('no-scroll');
        setTimeout(() => {
            const firstInput = modalOverlay.querySelector('input, select, textarea');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    function closeModal() {
        if (!modalOverlay) return;
        modalOverlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
        resetForm();
    }

    function resetForm() {
        if (successMessage) successMessage.classList.remove('active');
        if (formContainer) formContainer.style.display = 'block';
        if (bookingForm) bookingForm.reset();
        if (enquiryForm) enquiryForm.reset();
    }

    if (ctaButtons.length) {
        ctaButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        });
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });

    // =============================================
    // FORM SUBMISSION HANDLERS (with fetch to backend placeholder)
    // =============================================
    function showFormError(message) {
        const existingError = document.querySelector('.form-error');
        if (existingError) existingError.remove();

        const errorEl = document.createElement('p');
        errorEl.className = 'form-error';
        errorEl.style.cssText = 'color: #8B3A3A; font-size: 0.875rem; margin-bottom: 1rem; padding: 0.5rem; background: rgba(139, 58, 58, 0.1); border-left: 3px solid #8B3A3A;';
        errorEl.textContent = message;

        const form = document.querySelector('.form-container form');
        if (form) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                form.insertBefore(errorEl, submitBtn);
            } else {
                form.appendChild(errorEl);
            }
            setTimeout(() => {
                if (errorEl.parentNode) errorEl.remove();
            }, 5000);
        }
    }

    async function submitFormData(url, data, formElement) {
        const submitBtn = formElement.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Processing...';

        try {
            // Placeholder endpoint – replace with your actual backend URL
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Server error');

            // Success: hide form, show success message
            if (formContainer) formContainer.style.display = 'none';
            if (successMessage) successMessage.classList.add('active');
            console.log('Submission successful:', data);
        } catch (error) {
            console.error('Submission error:', error);
            showFormError('Unable to process your request. Please try again or call us directly.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    function handleBookingSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.name || !data.phone || !data.service) {
            showFormError('Please fill in all required fields.');
            return;
        }

        const phoneRegex = /^(\+?254|0)?7\d{8}$/;
        if (!phoneRegex.test(data.phone.replace(/\s/g, ''))) {
            showFormError('Please enter a valid Kenyan phone number (e.g., 0712345678 or +254712345678).');
            return;
        }

        // Replace '/api/booking' with your actual booking endpoint
        submitFormData('/api/booking', data, form);
    }

    function handleEnquirySubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.name || !data.phone) {
            showFormError('Please fill in your name and phone number.');
            return;
        }

        // Replace '/api/enquiry' with your actual membership enquiry endpoint
        submitFormData('/api/enquiry', data, form);
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
    if (faqItems.length) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (question) {
                question.addEventListener('click', () => {
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item && otherItem.classList.contains('active')) {
                            otherItem.classList.remove('active');
                        }
                    });
                    item.classList.toggle('active');
                });
            }
        });
    }

    // =============================================
    // SCROLL ANIMATIONS (Intersection Observer)
    // =============================================
    const animateElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');

    if (animateElements.length) {
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
            animateElements.forEach(el => el.classList.add('visible'));
        }
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
    // ACTIVE NAV LINK HIGHLIGHT (simplified)
    // =============================================
    function setActiveNavLink() {
        if (!navLinks.length) return;
        const currentPath = window.location.pathname;
        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkPath = link.getAttribute('href');
            if (!linkPath) return;
            // Exact match or root handling
            if (currentPath === linkPath || 
                (currentPath === '/' && linkPath === 'index.html') ||
                (currentPath.includes(linkPath) && linkPath !== '/' && linkPath !== 'index.html')) {
                link.classList.add('active');
            }
        });
    }
    setActiveNavLink();

    // =============================================
    // PERFORMANCE: LAZY LOADING (native support only)
    // =============================================
    // Native lazy loading already works with loading="lazy" in HTML.
    // No additional script needed. Fallback for older browsers is provided
    // by IntersectionObserver if needed – but we keep it minimal.

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