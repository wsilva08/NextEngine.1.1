import './index.css';
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { states } from './brazil-states-cities';

document.addEventListener('DOMContentLoaded', () => {

    // --- Hamburger Menu ---
    const hamburger = document.querySelector<HTMLButtonElement>('.hamburger');
    const navMenu = document.querySelector<HTMLElement>('.nav-menu');

    if (hamburger && navMenu) {
        const toggleNav = () => {
            hamburger.classList.toggle('is-active');
            navMenu.classList.toggle('is-active');
            document.body.classList.toggle('no-scroll');
            
            // Accessibility: Update ARIA attributes
            const isActive = navMenu.classList.contains('is-active');
            hamburger.setAttribute('aria-expanded', String(isActive));
            hamburger.setAttribute('aria-label', isActive ? 'Fechar menu' : 'Abrir menu');
        };

        hamburger.addEventListener('click', toggleNav);

        // Use event delegation for closing the menu.
        // This is more efficient and reliable than adding listeners to each link.
        navMenu.addEventListener('click', (e) => {
            // Check if the clicked element is an anchor tag or has an anchor tag as a parent.
            const target = e.target as HTMLElement;
            const link = target.closest('a');

            // If a link was clicked inside an active nav menu, close the menu.
            // Exclude dropdown toggle from closing the menu immediately.
            if (link && !link.parentElement?.classList.contains('nav-item-dropdown') && navMenu.classList.contains('is-active')) {
                toggleNav();
            } else if (link && link.parentElement?.classList.contains('nav-item-dropdown') && link.closest('.dropdown-menu')) {
                // If a link inside the dropdown is clicked, close the main menu.
                toggleNav();
            }
        });
    } else {
        console.error('Hamburger or Nav Menu not found.');
    }

    // --- Dynamic Favicon ---
    const faviconLink = document.getElementById('favicon');

    if (faviconLink) {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            let angle = 0;
            const primaryGreen = '#00bfa6';
            const primaryBlue = '#2563eb';

            const drawFavicon = () => {
                // Clear canvas
                ctx.clearRect(0, 0, 32, 32);

                // Set font styles
                ctx.font = 'bold 24px Poppins';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Create rotating gradient
                const x0 = 16 + Math.cos(angle) * 16;
                const y0 = 16 + Math.sin(angle) * 16;
                const x1 = 16 - Math.cos(angle) * 16;
                const y1 = 16 - Math.sin(angle) * 16;
                const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
                gradient.addColorStop(0, primaryGreen);
                gradient.addColorStop(1, primaryBlue);

                // Apply gradient and draw text
                ctx.fillStyle = gradient;
                ctx.fillText('NE', 16, 17); // Y-axis adjusted for better visual centering

                // Update angle for the next frame
                angle += 0.03;

                // Update favicon href with the new canvas data
                faviconLink.setAttribute('href', canvas.toDataURL('image/png'));
                
                // Loop the animation
                requestAnimationFrame(drawFavicon);
            };

            // Start the animation
            drawFavicon();
        }
    }


    // --- Mobile Dropdown Menu ---
    document.querySelectorAll('.nav-item-dropdown > a').forEach(dropdownToggle => {
        dropdownToggle.addEventListener('click', (e) => {
            if (window.innerWidth <= 992) {
                e.preventDefault();
                e.stopPropagation(); // Prevent event from bubbling up to navMenu's listener
                const parentLi = (e.currentTarget as HTMLElement).parentElement;
                parentLi?.classList.toggle('open');
            }
        });
    });

    // Handle "Back to Top" button visibility and functionality
    const backToTopButton = document.querySelector('.back-to-top');

    window.addEventListener('scroll', () => {
        if (backToTopButton) {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        }
    });

    backToTopButton?.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // --- Modal Handling ---

    const modalTriggers = document.querySelectorAll<HTMLAnchorElement>('[data-modal-trigger]');
    let lastActiveElement: HTMLElement | null = null;


    // --- Legal Modal Logic ---

    const legalModalOverlay = document.getElementById('legal-modal-overlay');
    const legalModalTitle = document.getElementById('modal-title');
    const legalModalContent = document.getElementById('modal-content');
    const legalModalCloseBtn = document.querySelector('#legal-modal .modal-close-btn') as HTMLButtonElement;

    const legalContent = {
        privacy: {
            title: 'Política de Privacidade',
            content: `
                <p>A sua privacidade é importante para nós. É política da Next Engine respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site Next Engine, e outros sites que possuímos e operamos.</p>
                <h4>1. Coleta de Informações</h4>
                <p>Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.</p>
                <h4>2. Uso de Informações</h4>
                <p>Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modifição não autorizados.</p>
                <h4>3. Divulgação a Terceiros</h4>
                <p>Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.</p>`
        },
        terms: {
            title: 'Termos de Uso',
            content: `
                <h4>1. Aceitação dos Termos</h4>
                <p>Ao acessar o site Next Engine, concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis.</p>
                <h4>2. Uso de Licença</h4>
                <p>É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site Next Engine, apenas para visualização transitória pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título.</p>
                <h4>3. Limitações</h4>
                <p>Em nenhum caso a Next Engine ou seus fornecedores serão responsáveis por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais em Next Engine.</p>`
        },
        cookies: {
            title: 'Política de Cookies',
            content: `
                <h4>O que são cookies?</h4>
                <p>Como é prática comum em quase todos os sites profissionais, este site usa cookies, que são pequenos arquivos baixados no seu computador, para melhorar sua experiência. Esta página descreve quais informações eles coletam, como as usamos e por que às vezes precisamos armazenar esses cookies.</p>
                <h4>Como usamos cookies?</h4>
                <p>Utilizamos cookies por vários motivos, detalhados abaixo. Infelizmente, na maioria dos casos, não existem opções padrão do setor para desativar os cookies sem desativar completamente a funcionalidade e os recursos que eles adicionam a este site. É recomendável que você deixe todos os cookies se não tiver certeza se precisa ou não deles, caso sejam usados para fornecer um serviço que você usa.</p>`
        },
        lgpd: {
            title: 'Conformidade com a LGPD',
            content: `
                <p>A Next Engine está em conformidade com a Lei Geral de Proteção de Dados (LGPD), Lei nº 13.709/2018, que visa proteger os dados pessoais de todos os cidadãos.</p>
                <h4>Seus Direitos</h4>
                <p>Você tem o direito de solicitar acesso, correção, exclusão ou portabilidade dos seus dados. Também pode retirar o consentimento ou opor-se ao processamento a qualquer momento.</p>
                <h4>Contato do DPO</h4>
                <p>Para exercer seus direitos ou para quaisquer dúvidas relacionadas à proteção de seus dados, entre em contato com nosso Encarregado de Proteção de Dados (DPO) através do e-mail: dpo@nextengine.com.br</p>`
        }
    };

    const openLegalModal = (page: string) => {
        const content = legalContent[page as keyof typeof legalContent];
        if (content && legalModalTitle && legalModalContent && legalModalOverlay) {
            lastActiveElement = document.activeElement as HTMLElement;
            legalModalTitle.textContent = content.title;
            legalModalContent.innerHTML = content.content;
            legalModalOverlay.classList.add('show');
            document.body.style.overflow = 'hidden';
            legalModalCloseBtn?.focus();
        }
    };

    const closeLegalModal = () => {
        if (legalModalOverlay) {
            legalModalOverlay.classList.remove('show');
            document.body.style.overflow = '';
            lastActiveElement?.focus();
        }
    };

    legalModalCloseBtn?.addEventListener('click', closeLegalModal);

    legalModalOverlay?.addEventListener('click', (e) => {
        if (e.target === legalModalOverlay) {
            closeLegalModal();
        }
    });


    // --- Contact Modal Logic ---

    const contactModalOverlay = document.getElementById('contact-modal-overlay');
    const contactModalCloseBtn = document.querySelector('#contact-modal .modal-close-btn') as HTMLButtonElement;
    const contactForm = document.getElementById('contact-form') as HTMLFormElement;
    const formStatus = document.getElementById('form-status');
    const submitButton = contactForm?.querySelector('button[type="submit"]') as HTMLButtonElement;
    const stateSelect = document.getElementById('contact-state') as HTMLSelectElement;
    const citySelect = document.getElementById('contact-city') as HTMLSelectElement;
    const phoneInput = document.getElementById('contact-phone') as HTMLInputElement;

    const openContactModal = () => {
        if (contactModalOverlay) {
            lastActiveElement = document.activeElement as HTMLElement;
            contactModalOverlay.classList.add('show');
            document.body.style.overflow = 'hidden';
            // Focus the first input field
            const firstInput = contactForm?.querySelector<HTMLInputElement>('input[name="name"]');
            firstInput?.focus();
        }
    };

    const closeContactModal = () => {
        if (contactModalOverlay) {
            contactModalOverlay.classList.remove('show');
            document.body.style.overflow = '';
            contactForm?.reset();
            if (citySelect) {
                citySelect.innerHTML = '<option value="">Selecione a cidade</option>';
                citySelect.disabled = true;
            }
            // Clear validation errors on close
            contactForm?.querySelectorAll('.invalid').forEach(el => clearError(el as HTMLInputElement | HTMLSelectElement));
            lastActiveElement?.focus();
            if (formStatus) {
                formStatus.textContent = '';
                formStatus.className = 'form-status';
            }
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Enviar';
            }
        }
    };

    contactModalCloseBtn?.addEventListener('click', closeContactModal);

    contactModalOverlay?.addEventListener('click', (e) => {
        if (e.target === contactModalOverlay) {
            closeContactModal();
        }
    });

    // Populate states dropdown
    if (stateSelect) {
        states.forEach(state => {
            const option = document.createElement('option');
            option.value = state.sigla;
            option.textContent = state.nome;
            stateSelect.appendChild(option);
        });
    }

    // Handle state change to populate cities
    stateSelect?.addEventListener('change', () => {
        const selectedStateAbbr = stateSelect.value;
        if (citySelect) {
            citySelect.innerHTML = '<option value="">Carregando...</option>';

            const selectedState = states.find(s => s.sigla === selectedStateAbbr);

            if (selectedState) {
                citySelect.innerHTML = '<option value="">Selecione a cidade</option>';
                selectedState.cidades.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city;
                    option.textContent = city;
                    citySelect.appendChild(option);
                });
                citySelect.disabled = false;
            } else {
                citySelect.innerHTML = '<option value="">Selecione a cidade</option>';
                citySelect.disabled = true;
            }
        }
    });

    // Phone mask
    const formatPhoneNumber = (value: string) => {
        if (!value) return "";
        value = value.replace(/\D/g, '');
        value = value.replace(/(\d{2})(\d)/, "($1) $2");
        value = value.replace(/(\d)(\d{4})$/, "$1-$2");
        return value;
    }

    phoneInput?.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        target.value = formatPhoneNumber(target.value);
    });


    // --- Contact Form Validation ---

    const showError = (input: HTMLInputElement | HTMLSelectElement, message: string) => {
        input.classList.add('invalid');
        const errorElement = input.nextElementSibling as HTMLElement;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    };

    const clearError = (input: HTMLInputElement | HTMLSelectElement) => {
        input.classList.remove('invalid');
        const errorElement = input.nextElementSibling as HTMLElement;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    };

    const validateContactForm = (): boolean => {
        let isValid = true;
        const inputsToValidate = contactForm?.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input[required], select[required]');

        inputsToValidate?.forEach(input => {
            clearError(input); // Clear previous errors
            if (!input.value.trim()) {
                showError(input, 'Este campo é obrigatório.');
                isValid = false;
            }
        });

        if (!isValid) return false; // Early exit if any required field is empty

        // Specific validations
        const emailInput = contactForm?.elements.namedItem('email') as HTMLInputElement;
        const phoneInput = contactForm?.elements.namedItem('phone') as HTMLInputElement;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailInput && !emailRegex.test(emailInput.value)) {
            showError(emailInput, 'Por favor, insira um e-mail válido.');
            isValid = false;
        }

        const phoneDigits = phoneInput?.value.replace(/\D/g, '');
        if (phoneInput && (phoneDigits.length < 10 || phoneDigits.length > 11)) {
            showError(phoneInput, 'Por favor, insira um telefone válido com DDD.');
            isValid = false;
        }

        return isValid;
    };


    contactForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        if (validateContactForm()) {
            const name = (contactForm.elements.namedItem('name') as HTMLInputElement)?.value;
            const email = (contactForm.elements.namedItem('email') as HTMLInputElement)?.value;
            const phone = (contactForm.elements.namedItem('phone') as HTMLInputElement)?.value;
            const state = (contactForm.elements.namedItem('state') as HTMLSelectElement)?.value;
            const city = (contactForm.elements.namedItem('city') as HTMLSelectElement)?.value;

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Enviando...';
            }
            if (formStatus) {
                formStatus.textContent = 'Sucesso! Redirecionando para o WhatsApp...';
                formStatus.className = 'form-status success';
            }

            setTimeout(() => {
                const phoneNumber = '551931992624';
                const message = `Olá! Gostaria de solicitar uma consultoria.\n\n*Nome:* ${name}\n*E-mail:* ${email}\n*Telefone:* ${phone}\n*Cidade:* ${city} - ${state}`;
                const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

                window.open(whatsappUrl, '_blank');
                closeContactModal();
            }, 1500);
        }
    });
    
    // Clear validation on input
    contactForm?.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', () => {
            clearError(input as HTMLInputElement | HTMLSelectElement);
        });
    });


    // --- Global Modal Triggers ---

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const page = trigger.dataset.modalTrigger;
            if (page) {
                if (page in legalContent) {
                    openLegalModal(page);
                } else if (page === 'contact') {
                    openContactModal();
                }
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (legalModalOverlay?.classList.contains('show')) {
                closeLegalModal();
            }
            if (contactModalOverlay?.classList.contains('show')) {
                closeContactModal();
            }
        }
    });

    // --- Smooth Scrolling for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (this: HTMLAnchorElement, e: MouseEvent) {
            // Exclude modal triggers from this custom scrolling logic
            if (this.dataset.modalTrigger) {
                return;
            }
            
            // Exclude dropdown toggle on mobile from scrolling
            if (window.innerWidth <= 992 && this.parentElement?.classList.contains('nav-item-dropdown')) {
                return;
            }

            e.preventDefault(); // Prevent default anchor behavior

            const href = this.getAttribute('href');

            // Special case for scrolling to the very top
            if (!href || href === '#' || href === '#hero') {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return;
            }

            // For all other sections
            const targetElement = document.querySelector<HTMLElement>(href);
            if (targetElement) {
                // The CSS 'scroll-padding-top' is respected by scrollIntoView,
                // ensuring the section is not hidden behind the fixed header.
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // --- Cookie Consent Banner ---
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesBtn = document.getElementById('cookie-accept');
    const rejectCookiesBtn = document.getElementById('cookie-reject');

    const checkCookieConsent = () => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent && cookieBanner) {
            // Use a timeout to ensure the banner animation is smooth on page load
            setTimeout(() => {
                cookieBanner.style.display = 'block'; // Make it visible before transition
                // A tiny delay for the browser to register the display change
                requestAnimationFrame(() => {
                    cookieBanner.classList.add('show');
                });
            }, 500);
        }
    };

    const handleCookieConsent = (consentValue: 'accepted' | 'rejected') => {
        localStorage.setItem('cookie_consent', consentValue);
        if (cookieBanner) {
            cookieBanner.classList.remove('show');
            // Hide the banner from the layout after the transition ends
            cookieBanner.addEventListener('transitionend', () => {
                cookieBanner.style.display = 'none';
            }, { once: true });
        }
    };

    acceptCookiesBtn?.addEventListener('click', () => handleCookieConsent('accepted'));
    rejectCookiesBtn?.addEventListener('click', () => handleCookieConsent('rejected'));

    // Check for consent now that the DOM is ready
    checkCookieConsent();

});