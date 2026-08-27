(function () {
    baunfire.Animation = {
        init() {
            this.handleNav();
            this.handleTransitions();
        },

        handleNav() {
            const nav = document.querySelector("header");
            if (!nav) return;

            const HOME_NAMESPACE = "home";

            const ANMT_OPEN_DUR = 0.4;
            const ANMT_CLOSE_DUR = 0.3;
            const ANMT_CLIP_CLOSED = "inset(0% 0% 100% 100% round 0.5rem)";
            const ANMT_CLIP_OPEN = "inset(0% 0% 0% 0% round 0.5rem)";

            let lastScrollY = window.scrollY;
            let isScrolled = false;
            let isOpaque = false;
            let scrollDirection = null;

            const burgerEvent = () => {
                const burger = nav.querySelector(".nav-burger");
                let mm = gsap.matchMedia();

                mm.add(
                    {
                        isDesktop: `(min-width: 992px)`,
                        isMobile: `(max-width: 991.98px)`,
                    },
                    (context) => {
                        let { isDesktop, isMobile } = context.conditions;

                        if (isDesktop) {
                            nav.classList.remove("mob-active");
                            baunfire.Global.siteScrolling();

                            burger.removeEventListener("click", burgerClickHandler);
                        }

                        if (isMobile) {
                            burger.addEventListener("click", burgerClickHandler);
                        }

                        return () => { };
                    }
                );
            };

            const burgerClickHandler = () => {
                if (!nav.classList.contains("mob-active")) {
                    showMobileNav();
                } else {
                    hideMobileNav();
                }
            };

            const showMobileNav = () => {
                nav.classList.add("mob-active");
                baunfire.Global.siteScrolling(false);
            };

            const hideMobileNav = () => {
                nav.classList.remove("mob-active");
                baunfire.Global.siteScrolling();
            };

            const navLinks = () => {
                const links = nav.querySelectorAll(".nav-item, .nav-anmt");

                links.forEach(link => {
                    link.addEventListener("click", () => {
                        if (nav.classList.contains("mob-active")) hideMobileNav();
                    });
                });
            };

            const navLogo = () => {
                const logo = nav.querySelector(".nav-logo-c");
                if (!logo) return;

                const isHomepage = () => {
                    const container = document.querySelector("[data-barba-namespace]");
                    return container && container.dataset.barbaNamespace === HOME_NAMESPACE;
                };

                logo.addEventListener("click", (e) => {
                    if (!isHomepage()) return;

                    e.preventDefault();

                    if (nav.classList.contains("mob-active")) hideMobileNav();

                    baunfire.lenis?.scrollTo(0, { immediate: true, force: true });
                });
            };

            const updateNavScroll = () => {
                const currentScrollY = window.scrollY;
                const direction = currentScrollY > lastScrollY ? "down" : currentScrollY < lastScrollY ? "up" : null;
                const scrolled = currentScrollY > 20;
                const opaqued = currentScrollY > 300;

                if (scrolled !== isScrolled) {
                    nav.classList.toggle("nav-scrolled", scrolled);
                    isScrolled = scrolled;
                }

                if (opaqued !== isOpaque) {
                    nav.classList.toggle("nav-opaqued", opaqued);
                    isOpaque = opaqued;
                }

                if (direction && direction !== scrollDirection) {
                    nav.classList.toggle("nav-scrolling-down", direction === "down");
                    nav.classList.toggle("nav-scrolling-up", direction === "up");
                    scrollDirection = direction;
                }

                lastScrollY = currentScrollY;
            };

            const navExtras = () => {
                const panel = nav.querySelector(".nav-panel-inner");
                if (!panel) return;

                panel.querySelector(".nav-extras")?.remove();

                const sources = [
                    document.querySelector(".footer-socials"),
                    document.querySelector(".footer-address"),
                    document.querySelector(".footer-credits-c"),
                ].filter(Boolean);

                if (!sources.length) return;

                const extras = document.createElement("div");
                extras.className = "nav-extras";

                sources.forEach(el => extras.appendChild(el.cloneNode(true)));

                const year = extras.querySelector(".footer-credits.year");
                if (year) year.textContent = new Date().getFullYear();

                panel.appendChild(extras);
            };

            const anmtHover = () => {
                const anmt = nav.querySelector(".nav-anmt");
                if (!anmt) return;

                const cta = anmt.querySelector(".nav-anmt-cta");
                const content = anmt.querySelector(".nav-anmt-content");
                const txt = anmt.querySelector(".nav-anmt-content-txt");

                if (!cta || !content) return;

                const mm = gsap.matchMedia();

                mm.add("(min-width: 992px)", () => {
                    const hoverTL = gsap.timeline({ paused: true });

                    hoverTL
                        .fromTo(cta,
                            {
                                autoAlpha: 1,
                            },
                            {
                                autoAlpha: 0,
                                duration: ANMT_OPEN_DUR,
                                ease: "power2.out"
                            }
                        )
                        .fromTo(content,
                            {
                                clipPath: ANMT_CLIP_CLOSED,
                            },
                            {
                                clipPath: ANMT_CLIP_OPEN,
                                duration: ANMT_OPEN_DUR,
                                ease: "power2.out"
                            },
                            "<0.2"
                        );

                    if (txt) {
                        hoverTL.fromTo(txt,
                            {
                                y: 10,
                                autoAlpha: 0,
                            },
                            {
                                y: 0,
                                autoAlpha: 1,
                                duration: ANMT_OPEN_DUR,
                                ease: "power2.out"
                            },
                            "<0.2"
                        );
                    }

                    let isOpen = false;
                    let closeTL = null;

                    const open = () => {
                        if (isOpen) return;
                        isOpen = true;

                        closeTL?.kill();
                        closeTL = null;

                        gsap.set(content, { autoAlpha: 1 });
                        hoverTL.play(0);
                    };

                    const close = () => {
                        if (!isOpen) return;
                        isOpen = false;

                        hoverTL.pause();

                        closeTL = gsap.timeline({
                            onComplete: () => {
                                hoverTL.pause(0);
                                gsap.set(content, { autoAlpha: 1 });
                                closeTL = null;
                            }
                        });

                        closeTL
                            .to(content, {
                                autoAlpha: 0,
                                duration: ANMT_CLOSE_DUR,
                                ease: "power2.out"
                            }, 0)
                            .to(cta, {
                                autoAlpha: 1,
                                duration: ANMT_CLOSE_DUR,
                                ease: "power2.out"
                            }, 0);
                    };

                    anmt.addEventListener("mouseenter", open);
                    anmt.addEventListener("mouseleave", close);

                    return () => {
                        closeTL?.kill();
                        anmt.removeEventListener("mouseenter", open);
                        anmt.removeEventListener("mouseleave", close);
                    };
                });
            };

            this.destroy();

            nav.classList.remove("nav-scrolled", "nav-opaqued", "nav-scrolling-down", "nav-scrolling-up");

            this.navScrollHandler = updateNavScroll;
            document.addEventListener("scroll", updateNavScroll, { passive: true });
            window.addEventListener("load", updateNavScroll);
            updateNavScroll();

            if (this.navSetupDone) return;
            this.navSetupDone = true;

            burgerEvent();
            navExtras();
            navLinks();
            navLogo();
            anmtHover();
        },

        destroy() {
            if (!this.navScrollHandler) return;
            document.removeEventListener("scroll", this.navScrollHandler);
            window.removeEventListener("load", this.navScrollHandler);
            this.navScrollHandler = null;
        },

        handleTransitions() {
            const textReveal = () => {
                const els = document.querySelectorAll("[split]");

                els.forEach(el => {
                    const hasTrigger = el.hasAttribute("split-trigger");
                    const triggerSelector = el.dataset.splitTrigger;
                    const triggerEl = hasTrigger
                        ? (triggerSelector ? el.closest(triggerSelector) || el : el)
                        : null;

                    el.style.opacity = "0";

                    SplitText.create(el, {
                        type: "words",
                        mask: "words",
                        onSplit(self) {
                            el.style.opacity = "1";
                            gsap.set(self.words, { y: "100%" });

                            const props = {
                                y: "-5%",
                                duration: 0.8,
                                ease: "power2.out",
                                stagger: 0.06,
                            };

                            if (hasTrigger && triggerEl) {
                                props.scrollTrigger = {
                                    trigger: triggerEl,
                                    start: baunfire.anim.start
                                };
                            }

                            return gsap.fromTo(self.words, { y: "100%" }, props);
                        }
                    });
                });
            }

            textReveal();
        }
    };

    baunfire.addModule(baunfire.Animation);
})();
