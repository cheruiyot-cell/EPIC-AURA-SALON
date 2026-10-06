/**
 * Epic Aura - Premium Salon Website
 * Main JavaScript File - Version 4.0
 * Mobile-first, accessible, performance-optimized
 *
 * Changes in v4.0:
 * - Lazy-loads Calendly only when booking modal opens
 * - Mobile-first modal: defaults to manual form on small screens
 * - Focus trap for mobile navigation
 * - ARIA attributes for FAQ accordion
 * - Accessible form error announcements
 * - prefers-reduced-motion support
 * - Removed GA placeholder handling (fix in HTML instead)
 */

(function () {
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
    const faqItems = document.querySelectorAll('.faq-item');
    const ctaButtons = document.querySelectorAll('[data-modal="booking"]');
    const currentYearEl = document.getElementById('current-year');
    const manualToggle = document.getElementById('show-manual-form');
    const manualForm = document.getElementById('manual-form');
    const calendlyContainer = document.querySelector('.calendly-container');

    // Detect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    // MOBILE NAVIGATION — with focus trap
    // =============================================
    function getFocusableElements(container) {
        return container.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
    }

    let navFocusTrapHandler = null;

    function trapNavFocus(e) {
        if (!nav || !nav.classList.contains('active')) return;
        if (e.key !== 'Tab') return;

        const focusable = getFocusableElements(nav);
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }

    function toggleMobileNav() {
        if (!mobileToggle || !nav) return;
        const isActive = nav.classList.contains('active');
        mobileToggle.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
        mobileToggle.setAttribute('aria-expanded', String(!isActive));

        if (!isActive) {
            // Opening nav: set focus to first nav link and add trap
            const firstLink = nav.querySelector('a');
            if (firstLink) setTimeout(() => firstLink.focus(), 100);
            navFocusTrapHandler = trapNavFocus;
            document.addEventListener('keydown', navFocusTrapHandler);
        } else {
            // Closing nav: remove trap
            if (navFocusTrapHandler) {
                document.removeEventListener('keydown', navFocusTrapHandler);
                navFocusTrapHandler = null;
            }
            if (mobileToggle) mobileToggle.focus();
        }
    }

    if (mobileToggle) {
        mobileToggle.addEventListener('click', toggleMobileNav);
    }

    if (navLinks.length) {
        navLinks.forEach((link) => {
            link.addEventListener('click', () => {
                if (nav && nav.classList.contains('active')) {
                    toggleMobileNav();
                }
            });
        });
    }

    // Escape closes mobile nav
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav && nav.classList.contains('active')) {
            toggleMobileNav();
        }
    });

    // =============================================
    // CALENDLY LAZY LOADING
    // =============================================
    let calendlyLoadState = 'idle'; // 'idle' | 'loading' | 'loaded' | 'error'

    function loadCalendlyScript() {
        return new Promise((resolve, reject) => {
            if (calendlyLoadState === 'loaded' || window.Calendly) {
                calendlyLoadState = 'loaded';
                resolve();
                return;
            }
            if (calendlyLoadState === 'loading') {
                // Already loading — poll until loaded
                const checkInterval = setInterval(() => {
                    if (calendlyLoadState === 'loaded' || window.Calendly) {
                        clearInterval(checkInterval);
                        resolve();
                    } else if (calendlyLoadState === 'error') {
                        clearInterval(checkInterval);
                        reject(new Error('Calendly failed to load'));
                    }
                }, 200);
                return;
            }

            calendlyLoadState = 'loading';
            const script = document.createElement('script');
            script.src = 'https://assets.calendly.com/assets/external/widget.js';
            script.async = true;
            script.onload = () => {
                calendlyLoadState = 'loaded';
                resolve();
            };
            script.onerror = () => {
                calendlyLoadState = 'error';
                reject(new Error('Calendly failed to load'));
            };
            document.head.appendChild(script);
        });
    }

    function showCalendlyLoading() {
        const widget = document.querySelector('.calendly-inline-widget');
        if (!widget) return;
        widget.innerHTML = '<div class="calendly-loading"><span class="spinner"></span> Loading available times…</div>';
    }

    function showCalendlyError() {
        const widget = document.querySelector('.calendly-inline-widget');
        if (!widget) return;
        widget.innerHTML =
            '<div class="calendly-error">' +
            '<p><strong>Unable to load online booking.</strong></p>' +
            '<p>Please use the manual form below, or call us directly at ' +
            '<a href="tel:+254702555093">+254 702 555 093</a>.</p>' +
            '</div>';
    }

    function initCalendlyIfVisible() {
        if (!calendlyContainer || calendlyContainer.style.display === 'none') return;
        if (window.innerWidth < 768) return; // Don't init on mobile

        showCalendlyLoading();
        loadCalendlyScript()
            .then(() => {
                // Restore the widget markup if we replaced it
                const widget = document.querySelector('.calendly-inline-widget');
                if (widget && !widget.querySelector('.calendly-inline-widget')) {
                    // Calendly will auto-init from data-url attribute
                }
                // Give Calendly a moment to render
                setTimeout(() => {
                    if (widget && !widget.querySelector('iframe') && !widget.querySelector('.calendly-loading')) {
                        // If still not rendered, show error
                    }
                }, 3000);
            })
            .catch(() => {
                showCalendlyError();
            });
    }

    // =============================================
    // MODAL FUNCTIONALITY
    // =============================================
    let lastFocusedElement = null;

    function setModalForMobile() {
        if (!modalOverlay) return;
        const isMobile = window.innerWidth < 768;

        if (isMobile) {
            // Mobile: hide Calendly, show manual form
            if (calendlyContainer) calendlyContainer.style.display = 'none';
            if (manualForm) manualForm.style.display = 'block';
            if (manualToggle) manualToggle.parentElement.style.display = 'none';
        } else {
            // Desktop: show Calendly, hide manual form by default
            if (calendlyContainer) calendlyContainer.style.display = 'block';
            if (manualForm) manualForm.style.display = 'none';
            if (manualToggle) manualToggle.parentElement.style.display = 'block';
        }
    }

    function openModal() {
        if (!modalOverlay) return;
        lastFocusedElement = document.activeElement;
        setModalForMobile();
        modalOverlay.classList.add('active');
        document.body.classList.add('no-scroll');

        // Focus close button (always visible)
        setTimeout(() => {
            const closeBtn = modalOverlay.querySelector('.modal-close');
            if (closeBtn) closeBtn.focus();
        }, 100);

        // On desktop, lazy-load Calendly
        if (window.innerWidth >= 768) {
            initCalendlyIfVisible();
        }
    }

    function closeModal() {
        if (!modalOverlay) return;
        modalOverlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
        if (lastFocusedElement) lastFocusedElement.focus();
        resetForm();
    }

    function resetForm() {
        if (successMessage) successMessage.classList.remove('active');
        if (bookingForm) bookingForm.reset();
        if (enquiryForm) enquiryForm.reset();
        // Restore manual form toggle state
        if (manualForm) manualForm.style.display = 'none';
        if (manualToggle) manualToggle.textContent = 'Click here';
        if (manualToggle && manualToggle.parentElement) {
            manualToggle.parentElement.style.display = '';
        }
        // Clear any lingering error
        const existingError = document.querySelector('.form-error');
        if (existingError) existingError.remove();
    }

    // Toggle manual form (desktop only)
    if (manualToggle && manualForm) {
        manualToggle.addEventListener('click', function (e) {
            e.preventDefault();
            const isHidden = manualForm.style.display === 'none';
            manualForm.style.display = isHidden ? 'block' : 'none';
            manualToggle.textContent = isHidden ? 'Hide manual form' : 'Click here';
            if (isHidden) {
                const firstInput = manualForm.querySelector('input, select, textarea');
                if (firstInput) firstInput.focus();
            }
        });
    }

    if (ctaButtons.length) {
        ctaButtons.forEach((button) => {
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

    // ESC closes modal; TAB traps focus
    document.addEventListener('keydown', (e) => {
        if (!modalOverlay || !modalOverlay.classList.contains('active')) return;

        if (e.key === 'Escape') {
            closeModal();
            return;
        }

        if (e.key === 'Tab') {
            const focusableElements = getFocusableElements(modalOverlay);
            if (!focusableElements.length) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    });

    // =============================================
    // FORM SUBMISSION HANDLERS
    // =============================================
    function showFormError(message, formElement) {
        const existing = formElement ? formElement.querySelector('.form-error') : document.querySelector('.form-error');
        if (existing) existing.remove();

        const errorEl = document.createElement('p');
        errorEl.className = 'form-error';
        errorEl.setAttribute('role', 'alert');
        errorEl.setAttribute('aria-live', 'assertive');
        errorEl.textContent = message;

        const form = formElement || document.querySelector('.manual-form form');
        if (form) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                form.insertBefore(errorEl, submitBtn);
            } else {
                form.appendChild(errorEl);
            }
            errorEl.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'nearest' });

            setTimeout(() => {
                if (errorEl.parentNode) errorEl.remove();
            }, 8000);
        }
    }

    async function submitFormData(url, data, formElement) {
        const submitBtn = formElement.querySelector('button[type="submit"]');
        if (!submitBtn) return;
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Processing…';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                let errMsg = 'Server error';
                try {
                    const errorData = await response.json();
                    errMsg = errorData.error || errMsg;
                } catch (_) {
                    /* ignore */
                }
                throw new Error(errMsg);
            }

            // Success
            if (manualForm) manualForm.style.display = 'none';
            if (manualToggle && manualToggle.parentElement) {
                manualToggle.parentElement.style.display = 'none';
            }
            if (successMessage) {
                successMessage.classList.add('active');
                successMessage.setAttribute('role', 'status');
                successMessage.setAttribute('aria-live', 'polite');
            }
            addWhatsAppConfirmation(data);
        } catch (error) {
            console.error('Submission error:', error);
            showFormError(
                error.message || 'Unable to process your request. Please try again or call us directly.',
                formElement
            );
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    function addWhatsAppConfirmation(data) {
        const successMsg = document.querySelector('.success-message');
        if (!successMsg) return;

        // Remove existing WhatsApp button if present
        const existingWaBtn = successMsg.querySelector('.whatsapp-confirm');
        if (existingWaBtn) existingWaBtn.remove();

        const waNumber = '254702555093';
        const waMessage = encodeURIComponent(
            'Hello Epic Aura, I just submitted a request.\n\n' +
            'Name: ' + (data.name || 'Not specified') + '\n' +
            'Service: ' + (data.service || 'Not specified') + '\n' +
            'Preferred Date/Time: ' + (data.datetime || 'Not specified') + '\n' +
            'Phone: ' + (data.phone || 'Not specified') + '\n\n' +
            'Please confirm my appointment. Thank you.'
        );
        const waLink = 'https://wa.me/' + waNumber + '?text=' + waMessage;

        const waButton = document.createElement('a');
        waButton.href = waLink;
        waButton.target = '_blank';
        waButton.rel = 'noopener noreferrer';
        waButton.className = 'btn btn-secondary whatsapp-confirm';
        waButton.textContent = 'Confirm via WhatsApp';

        // Wrap action buttons for consistent mobile layout
        let actionsWrap = successMsg.querySelector('.success-actions');
        if (!actionsWrap) {
            actionsWrap = document.createElement('div');
            actionsWrap.className = 'success-actions';
            // Move any existing .btn siblings into the wrapper
            const existingBtns = successMsg.querySelectorAll('a.btn');
            existingBtns.forEach((btn) => actionsWrap.appendChild(btn));
            successMsg.appendChild(actionsWrap);
        }
        actionsWrap.appendChild(waButton);
    }

    function handleBookingSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.name || !data.phone || !data.service) {
            showFormError('Please fill in all required fields.', form);
            return;
        }

        const phoneRegex = /^(\+?254|0)?7\d{8}$/;
        if (!phoneRegex.test(data.phone.replace(/\s/g, ''))) {
            showFormError(
                'Please enter a valid Kenyan phone number (e.g., 0712345678 or +254712345678).',
                form
            );
            return;
        }

        const formspreeUrl = 'https://formspree.io/f/mjybylyr';
        submitFormData(formspreeUrl, data, form);
    }

    function handleEnquirySubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.name || !data.phone) {
            showFormError('Please fill in your name and phone number.', form);
            return;
        }

        const formspreeUrl = 'https://formspree.io/f/mjybylyr';
        submitFormData(formspreeUrl, data, form);
    }

    if (bookingForm) bookingForm.addEventListener('submit', handleBookingSubmit);
    if (enquiryForm) enquiryForm.addEventListener('submit', handleEnquirySubmit);

    // =============================================
    // FAQ ACCORDION — with ARIA
    // =============================================
    if (faqItems.length) {
        faqItems.forEach((item, index) => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            if (!question || !answer) return;

            // Ensure ARIA attributes
            const answerId = answer.id || 'faq-answer-' + index;
            const questionId = question.id || 'faq-question-' + index;
            answer.id = answerId;
            question.id = questionId;
            question.setAttribute('aria-expanded', 'false');
            question.setAttribute('aria-controls', answerId);
            answer.setAttribute('role', 'region');
            answer.setAttribute('aria-labelledby', questionId);

            question.addEventListener('click', () => {
                const isOpen = item.classList.contains('active');
                // Close others
                faqItems.forEach((other) => {
                    if (other !== item && other.classList.contains('active')) {
                        other.classList.remove('active');
                        const otherQ = other.querySelector('.faq-question');
                        if (otherQ) otherQ.setAttribute('aria-expanded', 'false');
                    }
                });
                item.classList.toggle('active');
                question.setAttribute('aria-expanded', String(!isOpen));
            });
        });
    }

    // =============================================
    // SCROLL ANIMATIONS
    // =============================================
    const animateElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');

    if (animateElements.length) {
        if (prefersReducedMotion) {
            animateElements.forEach((el) => el.classList.add('visible'));
        } else if ('IntersectionObserver' in window) {
            const observerOptions = {
                root: null,
                rootMargin: '0px 0px -50px 0px',
                threshold: 0.1,
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            animateElements.forEach((el) => observer.observe(el));
        } else {
            animateElements.forEach((el) => el.classList.add('visible'));
        }
    }

    // =============================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // =============================================
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#0') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerHeight = header ? header.offsetHeight : 80;
                const targetPosition =
                    target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: prefersReducedMotion ? 'auto' : 'smooth',
                });
            }
        });
    });

    // =============================================
    // CURRENT YEAR
    // =============================================
    if (currentYearEl) {
        currentYearEl.textContent = String(new Date().getFullYear());
    }

    // =============================================
    // ACTIVE NAV LINK
    // =============================================
    function setActiveNavLink() {
        if (!navLinks.length) return;
        const currentPath = window.location.pathname;
        navLinks.forEach((link) => {
            const linkPath = link.getAttribute('href');
            if (!linkPath) return;
            link.classList.remove('active');
            link.removeAttribute('aria-current');

            const pathMatch =
                currentPath === linkPath ||
                (currentPath === '/' && linkPath === 'index.html') ||
                (currentPath.endsWith('/' + linkPath) && linkPath !== '/' && linkPath !== 'index.html') ||
                (currentPath === '' && linkPath === 'index.html');

            if (pathMatch) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });
    }
    setActiveNavLink();

    // =============================================
    // WINDOW RESIZE — re-evaluate modal state
    // =============================================
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (modalOverlay && modalOverlay.classList.contains('active')) {
                setModalForMobile();
                if (window.innerWidth >= 768) initCalendlyIfVisible();
            }
        }, 200);
    });

    // =============================================
    // CONSOLE BRANDING
    // =============================================
    if (window.console && window.console.log) {
        console.log(
            '%cEpic Aura%c — Executive Grooming & Recovery',
            'font-family: "Cormorant Garamond", serif; font-size: 1.5rem; color: #B8945A;',
            'font-family: Inter, sans-serif; color: #C4BBAF;'
        );
        console.log(
            '%cNairobi CBD • +254 702 555 093',
            'font-family: Inter, sans-serif; font-size: 0.75rem; color: #C4BBAF;'
        );
    }
})();