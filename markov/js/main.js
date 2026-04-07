const preloader = document.querySelector(".preloader")
const header = document.querySelector(".header")
const iconMenu = document.querySelector('.icon-menu');
const mobMenu = document.querySelector('.header__desk');
const modals = document.querySelectorAll(".modal")
const successModal = document.querySelector("#success-modal")
const errorModal = document.querySelector("#error-modal")
const cookiePopup = document.querySelector("#cookie-popup")
const dropdowns = document.querySelectorAll(".dropdown")
const pageUp = document.querySelector(".page-up")
let animSpd = 400

let bp = {
    largeDesktop: 1450.98,
    desktop: 1250.98,
    laptop: 1030.98,
    tablet: 767.98,
    phone: 575.98,
    phoneSm: 479.98
}
// === Utils ===
const Utils = {
    init() {
        // Сookie
        this.CookieUtils.init();
        // Скролл и header
        this.ScrollUtils.init();
        // Модалки
        this.ModalUtils.init();
        //Dropdown-меню
        this.DropdownUtils.init()
        // Формы
        this.FormUtils.init();
        // Инициализация свайперов
        this.SwiperUtils.init()
    },
    ScrollUtils: {
        init() {
            this.initCustomScroll()
            this.initPageUp()
            this.initHeaderScroll()
        },
        isIOS: (() => {
            const platform = navigator.platform;
            const userAgent = navigator.userAgent;
            return (
                /(iPhone|iPod|iPad)/i.test(platform) ||
                (platform === 'MacIntel' && navigator.maxTouchPoints > 1 && !window.MSStream) ||
                (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream)
            );
        })(),
        initCustomScroll() {
            const customScroll = document.querySelectorAll(".custom-scroll");
            const isFirefox = typeof InstallTrigger !== 'undefined';
            if (!isFirefox || !customScroll.length) return;
            document.documentElement.style.scrollbarWidth = "thin";
            document.documentElement.style.scrollbarColor = "#591A0B #EAE6E1";
            customScroll.forEach(item => { item.style.scrollbarWidth = "thin"; item.style.scrollbarColor = "#591A0B transparent" });
        },
        initPageUp() {
            if (!pageUp) return;
            pageUp.addEventListener("click", () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        },
        initHeaderScroll() {
            if (!header) return;
            let lastScroll = this.scrollPos();
            window.addEventListener("scroll", () => {
                const currentScroll = this.scrollPos();
                if (currentScroll > 1) {
                    header.classList.add("scroll");

                    if (currentScroll > lastScroll && currentScroll > 150 && !header.classList.contains("unshow")) {
                        header.classList.add("unshow");
                    } else if (currentScroll < lastScroll && header.classList.contains("unshow")) {
                        header.classList.remove("unshow");
                    }
                } else {
                    header.classList.remove("scroll");
                    header.classList.remove("unshow");
                }
                lastScroll = currentScroll;
            });
        },
        scrollPos() {
            return window.scrollY || window.pageYOffset || document.documentElement.scrollTop
        },
        disable() {
            if (!document.querySelector(".modal.open")) {
                const paddingValue = window.innerWidth > 350 ? window.innerWidth - document.documentElement.clientWidth + 'px' : '0px';
                document.querySelectorAll(".fixed-block").forEach(block => block.style.paddingRight = paddingValue);
                document.body.style.paddingRight = paddingValue;
                document.body.classList.add("no-scroll");

                if (this.isIOS) {
                    const scrollY = window.scrollY;
                    document.body.style.position = 'fixed';
                    document.body.style.width = '100%';
                    document.body.style.top = `-${scrollY}px`;
                    document.body.dataset.scrollY = scrollY;
                }
            }
        },
        enable() {
            if (!document.querySelector(".modal.open")) {
                document.querySelectorAll(".fixed-block").forEach(block => block.style.paddingRight = '0px');
                document.body.style.paddingRight = '0px';
                document.body.classList.remove("no-scroll");

                if (this.isIOS) {
                    document.body.style.position = '';
                    document.body.style.top = '';
                    document.body.style.width = '';
                    const scrollY = parseInt(document.body.dataset.scrollY || '0');
                    window.scrollTo(0, scrollY);
                }
            }
        },
        smoothScrollTo(dest) {
            let destPos = dest.getBoundingClientRect().top < 0 ? dest.getBoundingClientRect().top - header.clientHeight - 10 : dest.getBoundingClientRect().top - 10
            if (iconMenu.classList.contains("active")) {
                iconMenu.click()
                setTimeout(() => {
                    window.scrollTo({ top: Utils.ScrollUtils.scrollPos() + destPos, behavior: 'smooth' })
                }, 300);
            } else {
                window.scrollTo({ top: Utils.ScrollUtils.scrollPos() + destPos, behavior: 'smooth' })
            }
        }
    },
    CookieUtils: {
        COOKIE_NAME: 'site_cookie_consent',
        COOKIE_VALUE: 'accepted',
        COOKIE_DAYS: 365,
        init() {
            if (!cookiePopup) return;
            if (!this.hasCookieAccepted()) {
                this.show();
                const cookieAccept = cookiePopup.querySelector(".cookie__accept");
                if (cookieAccept) {
                    cookieAccept.addEventListener('click', () => {
                        this.setCookie();
                        this.hide();
                    });
                }
            } else {
                this.hide();
            }
        },
        setCookie() {
            const date = new Date();
            date.setTime(date.getTime() + this.COOKIE_DAYS * 24 * 60 * 60 * 1000);
            const expires = "expires=" + date.toUTCString();
            let cookieStr = `${this.COOKIE_NAME}=${encodeURIComponent(this.COOKIE_VALUE)}; ${expires}; path=/; SameSite=Lax`;
            if (location.protocol === 'https:') cookieStr += '; Secure';
            document.cookie = cookieStr;
        },
        hasCookieAccepted() {
            const cookies = document.cookie.split('; ');
            const pref = this.COOKIE_NAME + '=';
            const cookieItem = cookies.find(item => item.startsWith(pref));
            return cookieItem ? decodeURIComponent(cookieItem.substring(pref.length)) === this.COOKIE_VALUE : false;
        },
        show() {
            cookiePopup.classList.add("show");
            cookiePopup.setAttribute('aria-hidden', 'false');
        },
        hide() {
            cookiePopup.classList.remove("show");
            setTimeout(() => {
                cookiePopup.remove();
            }, 300);
        }
    },
    ModalUtils: {
        lastFocusedEl: null,
        _focusHandler: null,
        _escInited: false,
        init() {
            this.initModalClicks()
            this.initEscClose()
            this.modalShowBtns()
            this.modalUnshowBtns()
        },
        initModalClicks() {
            modals.forEach(mod => {
                mod.addEventListener("click", (e) => {
                    if (!mod.querySelector(".modal__content").contains(e.target)) {
                        this.closeModal(mod)
                    }
                })
                // кнопки закрытия внутри модалки
                mod.querySelectorAll(".modal__close").forEach(btn => {
                    btn.addEventListener("click", () => {
                        this.closeModal(mod)
                    })
                })
            })
        },
        initEscClose() {
            if (this._escInited) return
            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape") {
                    const modals = document.querySelectorAll(".modal.open")
                    const topModal = modals[modals.length - 1]
                    if (topModal) {
                        this.closeModal(topModal)
                    }
                }
            })
            this._escInited = true
        },
        modalShowBtns() {
            const modOpenBtn = document.querySelectorAll(".mod-open-btn")
            if (modOpenBtn.length) {
                modOpenBtn.forEach(btn => {
                    btn.addEventListener("click", e => {
                        e.preventDefault()
                        let href = btn.getAttribute("data-modal")
                        this.openModal(document.getElementById(href))
                    })
                })
            }
        },
        modalUnshowBtns() {
            const modCloseBtn = document.querySelectorAll(".mod-close-btn")
            if (modCloseBtn.length) {
                modCloseBtn.forEach(btn => {
                    btn.addEventListener("click", e => {
                        e.preventDefault()
                        let href = btn.getAttribute("data-modal")
                        this.closeModal(document.getElementById(href))
                    })
                })
            }
        },
        openModal(modal, closeActive = true) {
            const activeModal = document.querySelector(".modal.open")
            if (!activeModal) {
                this.lastFocusedEl = document.activeElement
                Utils.ScrollUtils.disable()
            } else {
                if (closeActive) {
                    activeModal.classList.remove("open")
                }
                this.removeFocusTrap()
            }
            modal.classList.add("open")
            this.trapFocus(modal)
        },
        closeModal(modal) {
            if (modal.querySelector("video")) {
                modal.querySelectorAll("video").forEach(v => v.pause())
            }
            modal.classList.remove("open")
            this.removeFocusTrap()
            const activeModal = document.querySelector(".modal.open")

            if (activeModal) {
                this.trapFocus(activeModal)
            } else {
                if (this.lastFocusedEl) {
                    this.lastFocusedEl.focus()
                }
                setTimeout(() => {
                    Utils.ScrollUtils.enable()
                }, animSpd)
            }
        },
        trapFocus(modal) {
            const focusable = modal.querySelectorAll(
                'button:not(.btn-cross):not([disabled]), input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            if (!focusable.length) return
            const first = focusable[0]
            const last = focusable[focusable.length - 1]
            setTimeout(() => {
                first.focus()
            }, animSpd);
            this._focusHandler = (e) => {
                if (e.key !== "Tab") return
                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault()
                        last.focus()
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault()
                        first.focus()
                    }
                }
            }
            document.addEventListener("keydown", this._focusHandler)
        },
        removeFocusTrap() {
            if (this._focusHandler) {
                document.removeEventListener("keydown", this._focusHandler)
                this._focusHandler = null
            }
        },
        setSuccessTxt(title = false, txt = false, btnTxt = false) {
            successModal.querySelector("h2").innerHTML = title ? title : "Спасибо! Ваша заявка отправлена"
            successModal.querySelector("p").innerHTML = txt ? txt : ""
            successModal.querySelector(".btn").textContent = btnTxt ? btnTxt : "Закрыть"
        },
        setErrorTxt(title = false, txt = false, btnTxt = false) {
            errorModal.querySelector("h2").innerHTML = title ? title : "Что-то пошло не так"
            errorModal.querySelector("p").innerHTML = txt ? txt : ""
            errorModal.querySelector(".btn").textContent = btnTxt ? btnTxt : "Закрыть"
        },
        openSuccessMod(title = false, txt = false, btnTxt = false) {
            this.setSuccessTxt(title, txt, btnTxt)
            this.openModal(successModal)
        },
        openErrorMod(title = false, txt = false, btnTxt = false) {
            this.setErrorTxt(title, txt, btnTxt)
            this.openModal(errorModal)
        }
    },
    DropdownUtils: {
        init() {
            this.initDropdownsClick()

        },
        initDropdownsClick() {
            dropdowns.forEach(item => {
                item.querySelector(".dropdown__header").addEventListener("click", () => {
                    item.classList.contains("open") ? this.hide(item) : this.show(item)
                })
            })
        },
        show(item) {
            item.classList.add("open");
            item.setAttribute("aria-expanded", true);
            item.querySelectorAll(".dropdown__options input").forEach(inp => {
                inp.addEventListener("change", (e) => {
                    this.setActiveOption(item)
                });
            });
            const clickOutside = (e) => {
                if (!item.contains(e.target)) {
                    this.hide(item);
                    document.removeEventListener('click', clickOutside);
                }
            };
            document.addEventListener("click", clickOutside);
        },
        setActiveOption(item) {
            item.querySelector(".dropdown__header").classList.add("checked")
            if (item.classList.contains("radio-select")) {
                let activeInpTxt = item.querySelector("input:checked").nextElementSibling.innerHTML
                item.querySelector(".dropdown__header span").innerHTML = activeInpTxt
                this.hide(item)
            }
        },
        hide(item) {
            item.classList.remove("open");
            item.setAttribute("aria-expanded", false);
        }
    },
    FormUtils: {
        init() {
            this.initTelMask();
            this.initPasswordToggle()
            this.initDisabledForms()
            this.initInputReset()
        },
        initPasswordToggle(selector = ".ui-input--password") {
            const items = document.querySelectorAll(selector);
            items.forEach(item => {
                const eye = item.querySelector(".ui-input__eye");
                const input = item.querySelector("input");
                if (!eye || !input) return;
                eye.addEventListener("click", () => {
                    item.classList.toggle("show-password");
                    input.type = item.classList.contains("show-password") ? "text" : "password";
                });
            });
        },
        initDisabledForms(selector = ".disabled-form") {
            const forms = document.querySelectorAll(selector);
            forms.forEach(form => {
                const requiredInputs = form.querySelectorAll("input[required]");
                if (!requiredInputs.length) return;

                let timeOut;
                this.toggleSubmitBtn(form);
                requiredInputs.forEach(inp => {
                    const eventType = ['text', 'email', 'number'].includes(inp.type) ? 'input' : 'change';
                    inp.addEventListener(eventType, () => {
                        if (this.isInputValid(inp)) {
                            this.removeError(inp)
                        }
                        if (['text', 'email', 'number'].includes(inp.type)) {
                            clearTimeout(timeOut);
                            timeOut = setTimeout(() => this.toggleSubmitBtn(form), 300);
                        } else {
                            this.toggleSubmitBtn(form);
                        }
                    });
                });
            });
        },
        initTelMask(selector = 'input[type=tel]') {
            const self = this;
            document.querySelectorAll(selector).forEach(item => {
                Inputmask(
                    {
                        mask: "+7 999 999-99-99",
                        oncomplete: () => {
                            this.removeError(item)
                            const parentForm = item.closest(".form")
                            if (parentForm && parentForm.classList.contains("disabled-form")) {
                                this.toggleSubmitBtn(parentForm)
                            }
                        },
                    }
                ).mask(item);
            });
        },
        initInputReset() {
            const itemForm = document.querySelectorAll(".ui-input")
            itemForm.forEach(item => {
                const resetBtn = item.querySelector(".ui-input__reset")
                if (resetBtn) {
                    this.showResetBtn(item, resetBtn)
                    item.querySelector("input").addEventListener("input", e => {
                        this.showResetBtn(item, resetBtn)
                    })
                    resetBtn.addEventListener("click", e => {
                        e.preventDefault()
                        item.querySelector("input").value = ""
                        resetBtn.classList.remove("show")
                    })
                }
            })
        },
        showResetBtn(item, resetBtn) {
            if (item.querySelector("input").value.length > 0) {
                resetBtn.classList.add("show")
            } else {
                resetBtn.classList.remove("show")
            }
        },
        isPhone(value) {
            return /^\+7 \d{3} \d{3}-\d{2}-\d{2}$/.test(value);
        },
        isEmail(value) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]{2,8}$/.test(value);
        },
        maskEmail(email) {
            const [username, domain] = email.split('@');
            let maskedUsername = username.length <= 3
                ? username[0] + '***'
                : username.substring(0, 2) + '***' + username.slice(-1);
            return maskedUsername + '@' + domain;
        },
        formReset(form, cleanError = false) {
            form.querySelectorAll(".ui-input").forEach(item => item.classList.remove("error"));
            if (cleanError) form.querySelectorAll("[data-error]").forEach(el => el.textContent = '');
            form.querySelectorAll("input").forEach(inp => {
                if (!["hidden", "checkbox", "radio"].includes(inp.type)) inp.value = "";
                if (["checkbox", "radio"].includes(inp.type) && !inp.required) inp.checked = false;
            });
            if (form.querySelector("textarea")) form.querySelector("textarea").value = "";
            if (form.querySelector(".file-form__items")) form.querySelector(".file-form__items").innerHTML = "";
        },
        toggleSubmitBtn(form) {
            const findItem = Array.from(form.querySelectorAll("input[required]")).find(inp => {
                return !inp.value || (inp.type === 'email' && !this.isEmail(inp.value)) || (inp.type === 'tel' && !this.isPhone(inp.value)) || (['checkbox', 'radio'].includes(inp.type) && !inp.checked);
            });
            const btn = form.querySelector("button[type=submit]");
            if (findItem) btn.setAttribute("disabled", true);
            else btn.removeAttribute("disabled");
        },
        isInputValid(inp) {
            if (inp.type === 'checkbox' || inp.type === 'radio') {
                return inp.checked;
            }
            if (!inp.value) return false;
            if (inp.type === 'email') {
                return this.isEmail(inp.value);
            }
            if (inp.type === 'tel') {
                return inp.inputmask?.isComplete();
            }
            return true;
        },
        addError(inp) {
            inp.closest('.ui-control')?.classList.add('error');
        },
        removeError(inp) {
            inp.closest('.ui-control')?.classList.remove('error');
        },
        formValidate(e, form) {
            e.preventDefault();
            let errors = 0;
            const inpRequired = Array.from(form.querySelectorAll('input[required]'))
            if (inpRequired.length) {
                inpRequired.forEach(inp => {
                    if (!this.isInputValid(inp)) {
                        errors++;
                        this.addError(inp);
                    }
                    const eventType = ['text', 'email', 'number'].includes(inp.type) ? 'input' : 'change';
                    inp.addEventListener(eventType, () => {
                        if (this.isInputValid(inp)) {
                            this.removeError(inp)
                        }
                    });
                });
            }
            if (errors === 0) {
                form.requestSubmit();
            } else {
                let firstErrorEl = form.querySelector('.ui-control.error')
                // Utils.ScrollUtils.smoothScrollTo(firstErrorEl)
            }
        }
    },
    SwiperUtils: {
        defaults(slider) {
            return {
                observer: true,
                observeParents: true,
                watchSlidesProgress: true,
                navigation: {
                    prevEl: slider.querySelector(".nav-btn--prev"),
                    nextEl: slider.querySelector(".nav-btn--next"),
                },
                pagination: {
                    el: slider.querySelector(".swiper-pagination"),
                    type: "bullets",
                    clickable: true,
                },
                speed: 800,
            };
        },
        init() {
            this.initSwiper4();
            this.initSwiper1();
        },
        initSwiper4() {
            const swiper4 = document.querySelectorAll('.swiper-4');
            swiper4.forEach(item => {
                const options = {
                    ...this.defaults(item),
                    slidesPerView: item.classList.contains("offer-swiper") ? 1 : 1.41,
                    spaceBetween: parseFloat(getComputedStyle(document.documentElement).fontSize),
                    autoplay: this.autoplay(item),
                    breakpoints: {
                        1030.98: {
                            slidesPerView: 4
                        },
                        767.98: {
                            slidesPerView: 3
                        },
                        479.98: {
                            slidesPerView: 2
                        }
                    },
                };
                new Swiper(item.querySelector(".swiper"), options);
            });
        },
        initSwiper1() {
            const swiper1 = document.querySelectorAll('.swiper-1');
            swiper1.forEach(item => {
                const options = {
                    ...this.defaults(item),
                    slidesPerView: 1,
                    effect: "fade",
                    fadeEffect: { crossFade: true },
                    autoplay: this.autoplay(item),
                };
                new Swiper(item.querySelector(".swiper"), options);
            });
        },
        autoplay(slider) {
            let autoplayAttr = slider.dataset.autoplay;
            let autoplayOption = autoplayAttr === "true" ? { delay: 3500, pauseOnMouseEnter: true, disableOnInteraction: false } : false;
            return autoplayOption

        }
    }
}
window.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".wrap").classList.add('loaded')
    Utils.init()
    readMoreFunc()
    roomsOnHover()
    setTimeout(() => {
        animate()
    }, 1000);

});

// === Preloader ===
let preloaderHiddenTimeOut = 0
if (preloader) {
    preloaderHiddenTimeOut = 1800
    Utils.ScrollUtils.enable()
    Utils.ScrollUtils.disable()
    setTimeout(() => {
        preloader.classList.add('loaded');
        setTimeout(() => {
            Utils.ScrollUtils.enable()
            ScrollTrigger.refresh()
        }, 400);
    }, 1400);
}

// === Path to svg sprite icon ===
function sprite(id) {
    return '<svg><use xlink:href="img/svg/sprite.svg#' + id + '"></use></svg>'
}

// === SmoothDrop ===
function smoothDrop(header, body, dur = false) {
    let animDur = dur ? dur : 500
    body.style.transition = `height ${animDur}ms ease`;
    body.style['-webkit-transition'] = `height ${animDur}ms ease`;
    if (!header.classList.contains("active")) {
        header.parentNode.classList.add("active")
        body.style.display = 'block';
        let height = body.clientHeight + 'px';
        body.style.height = '0px';
        setTimeout(function () {
            body.style.height = height;
            setTimeout(() => {
                body.style.height = null
                header.classList.add("active")
            }, animDur);
        }, 0);
    } else {
        header.parentNode.classList.remove("active")
        let height = body.clientHeight + 'px';
        body.style.height = height
        setTimeout(function () {
            body.style.height = "0"
            setTimeout(() => {
                body.style.display = 'none';
                body.style.height = null
                header.classList.remove("active")
            }, animDur);
        }, 0);
    }
}

// === TabSwicth ===
function tabSwitch(nav, block) {
    nav.forEach((item, idx) => {
        item.addEventListener("click", () => {
            nav.forEach(el => {
                el.classList.remove("active")
                el.setAttribute("aria-selected", false)
            })
            item.classList.add("active")
            item.setAttribute("aria-selected", true)
            block.forEach(el => {
                if (el.dataset.block === item.dataset.tab) {
                    if (!el.classList.contains("active")) {
                        el.classList.add("active")
                        el.style.opacity = "0"
                        setTimeout(() => {
                            el.style.opacity = "1"
                        }, 0);
                    }
                } else {
                    el.classList.remove("active")
                }
            })
        })
    });
}
const switchBlock = document.querySelectorAll(".switch-block")
if (switchBlock) {
    switchBlock.forEach(item => {
        tabSwitch(item.querySelectorAll("[data-tab]"), item.querySelectorAll("[data-block]"))
    })
}

// === Anchor Links ===
const anchorLinks = document.querySelectorAll(".js-anchor")
if (anchorLinks.length) {
    anchorLinks.forEach(item => {
        item.addEventListener("click", e => {
            let idx = item.getAttribute("href").indexOf("#")
            const href = item.getAttribute("href").substring(idx)
            let dest = document.querySelector(href)
            if (dest) {
                e.preventDefault()
                Utils.ScrollUtils.smoothScrollTo(dest)
            }
        })
    })
}

// === Custom FancyModal ===
function initfancyModal(fancyItem) {
    let mediaSrc = []
    let objectFit = fancyItem.getAttribute("data-fit") ? fancyItem.getAttribute("data-fit") : "media-contain"
    let val = fancyItem.getAttribute("data-fancy")
    document.querySelectorAll("[data-fancy]").forEach(el => {
        if (!el.closest(".swiper-slide-duplicate") && el.getAttribute("data-fancy") === val) {
            let obj = {
                src: el.getAttribute("data-src"),
                type: el.getAttribute("data-type") || 'image',
                caption: el.getAttribute("data-caption") || ''
            }
            if (el.getAttribute("data-type") === 'video' && el.getAttribute("data-poster")) {
                obj.poster = el.getAttribute("data-poster")
            }
            mediaSrc.push(obj)
        }
    })
    let initialSl = mediaSrc.findIndex(el => el.src === fancyItem.getAttribute("data-src"))
    document.querySelector(".footer").insertAdjacentHTML('afterend', `
                <div class="custom-scroll modal fancy-modal ${val + '-modal'}">
                    <div class="container fancy-modal__content">
                        <button type="button" class="btn-cross modal__close"></button>
                        <div class="ml-50 mb-24 modal__top">
                            <h2>${mediaSrc[initialSl].caption}</h2>
                        </div>
                        <div class="fancy-modal__mainswiper">
                            <div class="swiper">
                                <div class="swiper-wrapper">
                                    ${mediaSrc.map((el, i) => `<div class="swiper-slide">
                                        <div class="${objectFit}">
                                            ${el.type === 'video' ? `<video ${i === initialSl ? `src='${el.src}'` : `data-src='${el.src}'`} ${el.poster ? `poster='${el.poster}'` : ''} loop autoplay playsinline mute controls></video>` : `<img src=${el.src} alt="">`}
                                        </div>
                                    </div>`).join("")}
                                </div>
                            </div>
                            ${mediaSrc.length > 1 ? `<div class="swiper-nav">
                                <button type="button" class="nav-btn nav-btn--prev">${sprite('btn-prev')}</button>
                                <button type="button" class="nav-btn nav-btn--next">${sprite('btn-next')}</button>
                            </div>` : ""}
                        </div>
                        ${mediaSrc.length > 1 ? `<div class="swiper-pagination"></div>` : ""}
                    </div>
                </div>
            `);
    const fancyModal = document.querySelector(".fancy-modal")
    let fancyMainSwiper = new Swiper(fancyModal.querySelector(".fancy-modal__mainswiper .swiper"), {
        ...Utils.SwiperUtils.defaults(fancyModal),
        slidesPerView: 1,
        initialSlide: initialSl,
        effect: "fade",
        fadeEffect: {
            crossFade: true
        },
        speed: 300,
    })
    fancyMainSwiper.on("slideChange", e => {
        fancyModal.querySelector(".modal__top h2").textContent = mediaSrc[fancyMainSwiper.activeIndex].caption
        if (fancyModal.querySelector("video")) {
            fancyModal.querySelectorAll("video").forEach(item => item.pause())
        }
        let lazyEl = fancyMainSwiper.slides[fancyMainSwiper.activeIndex].querySelector('[data-src]');
        let videoEl = fancyMainSwiper.slides[fancyMainSwiper.activeIndex].querySelector('video');
        if (lazyEl) {
            lazyEl.setAttribute("src", lazyEl.getAttribute("data-src"))
            lazyEl.removeAttribute("data-src")
        } else if (!lazyEl && videoEl) {
            videoEl.play()
        }
    })
    Utils.ModalUtils.openModal(fancyModal)
    fancyModal.querySelectorAll(".modal__close").forEach(btn => {
        btn.addEventListener("click", e => {
            Utils.ModalUtils.closeModal(fancyModal)
            setTimeout(() => {
                fancyModal.remove()
            }, animSpd);
        })
    })
}
const fancyBlock = document.querySelectorAll(".fancy-block")
if (fancyBlock.length) {
    fancyBlock.forEach(block => {
        block.addEventListener("click", e => {
            const fancyItems = block.querySelectorAll("[data-fancy]")
            if (fancyItems.length) {
                fancyItems.forEach(fancyItem => {
                    if (fancyItem.contains(e.target)) {
                        initfancyModal(fancyItem)
                    }
                })
            }
        })
    });
}

// === Accordion ===
const accordion = document.querySelectorAll(".accordion")
if (accordion.length) {
    accordion.forEach(item => {
        item.querySelector(".accordion__header").addEventListener("click", () => {
            if (!item.classList.contains("no-close")) {
                item.parentNode.parentNode.querySelectorAll(".accordion").forEach(el => {
                    if (el.querySelector(".accordion__header").classList.contains("active")) {
                        smoothDrop(el.querySelector(".accordion__header"), el.querySelector(".accordion__body"))
                        if (el.getBoundingClientRect().top < 0) {
                            let pos = Utils.ScrollUtils.scrollPos() + item.getBoundingClientRect().top - el.querySelector(".accordion__body").clientHeight - header.clientHeight - 10
                            window.scrollTo(0, pos)
                        }
                    }
                })
            }
            smoothDrop(item.querySelector(".accordion__header"), item.querySelector(".accordion__body"))
        })
    })
}

// === Page Animation ===
function animate() {
    const elements = document.querySelectorAll('[data-animation]');
    elements.forEach(async item => {
        const itemTop = item.getBoundingClientRect().top;
        const itemPoint = Math.abs(window.innerHeight - item.offsetHeight * 0.1);
        const itemScrolled = itemPoint > 100 ? itemPoint : 100;
        if (itemTop - itemScrolled < 0) {
            const animName = item.getAttribute("data-animation");
            if (preloader && !preloader.classList.contains("loaded")) {
                await new Promise(resolve => setTimeout(resolve, preloaderHiddenTimeOut));
            }
            item.classList.add(animName);
            item.removeAttribute("data-animation");
        }
    });
}
window.addEventListener("scroll", animate)

// === BurgerMenu ===
if (iconMenu && mobMenu) {
    iconMenu.addEventListener("click", () => {
        if (!iconMenu.classList.contains("active")) {
            iconMenu.setAttribute("aria-label", "Закрыть меню")
            iconMenu.classList.add("active")
            mobMenu.classList.add("open")
            Utils.ScrollUtils.disable()
        } else {
            iconMenu.setAttribute("aria-expanded", false)
            iconMenu.setAttribute("aria-label", "Открыть меню")
            iconMenu.classList.remove("active")
            mobMenu.classList.remove("open")
            Utils.ScrollUtils.enable()
        }
    })
    window.addEventListener("resize", () => {
        if (window.innerWidth > bp.laptop && iconMenu.classList.contains("active")) {
            iconMenu.click()
        }
    })
}

// === ReadMore ===
let readMoreTimeout
function readMoreFunc() {
    clearTimeout(readMoreTimeout)
    const readMore = document.querySelectorAll(".read-more")
    readMoreTimeout = setTimeout(() => {
        if (readMore.length) {
            readMore.forEach(item => {
                let openTxt = item.querySelector(".read-more__btn").getAttribute("data-open")
                let closeTxt = item.querySelector(".read-more__btn").getAttribute("data-close")
                function showMoreBtn() {
                    item.classList.remove("active")
                    item.classList.add("more-hidden")
                    let height = item.querySelector(".read-more__content").clientHeight
                    item.classList.remove("more-hidden")
                    let fullHeight = item.querySelector(".read-more__content").clientHeight
                    item.classList.add("more-hidden")
                    if (fullHeight > height) {
                        item.classList.add("btn-show")
                        if (item.querySelector(".read-more__btn span") && openTxt) {
                            item.querySelector(".read-more__btn span").textContent = openTxt
                        }
                    } else {
                        item.classList.remove("btn-show")
                    }
                }
                showMoreBtn()
                let currWinW = window.innerWidth
                window.addEventListener("resize", () => {
                    if (currWinW != window.innerWidth) {
                        showMoreBtn()
                        currWinW = window.innerWidth
                    }
                })
                item.querySelector(".read-more__btn").addEventListener("click", () => {
                    if (!item.classList.contains("active")) {
                        item.classList.add("active")
                        let height = item.querySelector(".read-more__content").clientHeight + "px"
                        item.classList.remove("more-hidden")
                        let fullHeight = item.querySelector(".read-more__content").clientHeight + "px"
                        item.querySelector(".read-more__content").style.height = height;
                        setTimeout(function () {
                            item.querySelector(".read-more__content").style.height = fullHeight
                            if (item.querySelector(".read-more__btn span") && closeTxt) {
                                item.querySelector(".read-more__btn span").textContent = closeTxt
                            }
                            setTimeout(() => {
                                item.querySelector(".read-more__content").style.height = null
                            }, 500);
                        }, 0);
                    } else {
                        item.classList.remove("active")
                        let fullHeight = item.querySelector(".read-more__content").clientHeight + 'px';
                        item.classList.add("more-hidden")
                        let height = item.querySelector(".read-more__content").clientHeight + 'px';
                        item.classList.remove("more-hidden")
                        item.querySelector(".read-more__content").style.height = fullHeight
                        setTimeout(function () {
                            item.querySelector(".read-more__content").style.height = height
                            if (item.querySelector(".read-more__btn span") && openTxt) {
                                item.querySelector(".read-more__btn span").textContent = openTxt
                            }
                            setTimeout(() => {
                                item.classList.add("more-hidden")
                                item.querySelector(".read-more__content").style.height = null
                            }, 500);
                        }, 0);
                    }
                })
            })
        }
    }, 0);
}

// === Rooms Hover ===
function roomsOnHover() {
    document.querySelectorAll(".item-room").forEach(item => {
        function leave() {
            setActive(0)
        }
        function setActive(activeEl) {
            item.querySelectorAll(".item-room__img").forEach(img => img.classList.remove("active"))
            item.querySelectorAll(".item-room__controls span").forEach(span => span.classList.remove("active"))
            item.querySelectorAll(".item-room__img")[activeEl].classList.add("active")
            item.querySelectorAll(".item-room__controls span")[activeEl].classList.add("active")
        }
        item.querySelectorAll(".item-room__hovers span").forEach((el, idx) => {
            el.addEventListener("click", () => {
                item.querySelectorAll(".item-room__img")[idx].click()
            })
            el.addEventListener("touchmove", (e) => {
                setActive(idx)
            })
            el.addEventListener("touchend", () => leave())
            el.addEventListener("mousemove", (e) => {
                setActive(idx)
            })
            el.addEventListener("mouseleave", () => leave())
        })
    })
}

// === Image Zoom Button ===
const imageZoom = document.querySelectorAll(".image-zoom")
imageZoom.forEach(item => {
    item.addEventListener("click", () => {
        const parent = item.closest(".fancy-block")
        if (parent) {
            parent.querySelector(".swiper-slide-active [data-fancy]")?.click()
        }
    })
});

// === Map ===
function setmapDefaults(map) {
    map.controls.remove('geolocationControl');
    map.controls.remove('searchControl');
    map.controls.remove('trafficControl');
    map.controls.remove('typeSelector');
    map.controls.remove('fullscreenControl');
    map.controls.remove('rulerControl');
    map.controls.remove('zoomControl');
    map.margin.setDefaultMargin(100);
}

// === Intro Video ===
const intro = document.querySelector(".intro")
if (intro) {
    const playBtn = intro.querySelectorAll(".play-btn")
    const video = intro.querySelector(".intro__video")
    if (video && playBtn.length > 0) {
        const sources = video.querySelectorAll("source[data-src]")
        playBtn.forEach(btn => {
            btn.addEventListener("click", () => {
                if (!video.dataset.loaded) {
                    sources.forEach(s => s.src = s.dataset.src)
                    video.load()
                    video.dataset.loaded = "true"
                }
                video.play()
                intro.classList.add("show-video")
            })
            video.addEventListener("click", () => {
                video.pause()
                intro.classList.remove("show-video")
            })
        })
    }
}

// === BeerSlider ===
const beerSlider = document.querySelectorAll(".beer-slider")
if (beerSlider) {
    beerSlider.forEach(item => {
        new BeerSlider(item)
    })
}

// === Datepicker ===
const months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]
const datepickerNodes = document.querySelectorAll(".datepicker");
datepickerNodes.forEach(node => {
    const form = node.closest('.form');
    const field = form ? form.querySelector('input[data-datepicker-value]') : null;
    const picker = new AirDatepicker(node, {
        range: true,
        multipleDatesSeparator: ' - ',
        onSelect({ date, formattedDate }) {
            if (!field) return;
            field.value = formattedDate || '';
            field.dispatchEvent(new Event('change', { bubbles: true }));
            const parent = node.closest('.dropdown--date')
            if (parent && date && formattedDate) {
                parent.querySelector(".dropdown__header span").textContent = formattedDate.length > 1 ? formattedDate.join(" - ") : date[0].getDate() + " " + months[date[0].getMonth()] + " " + date[0].getFullYear();
            }
        }
    });

    if (field) {
        field._picker = picker;
    }
});
function clearDateField(field) {
    if (!field) return;
    const picker = field._picker
    if (picker && typeof picker.clear === 'function') {
        try { picker.clear(); } catch (err) { }
    }
    field.value = '';
    field.dispatchEvent(new Event('change', { bubbles: true }));
}