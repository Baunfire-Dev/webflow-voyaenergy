(function () {
    baunfire.Animation = {
        init() {
            this.handleNav();
            this.handleTransitions();
        },

        handleNav() {
            const nav = document.querySelector("header");
            if (!nav) return;
            
            if (this._navBound) return;
            this._navBound = true;

            let lastScrollY = window.scrollY;
            let isScrolled = false;
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

            const navPrefetch = () => {
                if (this._prefetched) return;
                this._prefetched = true;

                const idle = window.requestIdleCallback || (cb => setTimeout(cb, 1200));

                idle(() => {
                    const seen = new Set([location.pathname.replace(/\/$/, "") || "/"]);

                    nav.querySelectorAll("a[href]").forEach(a => {
                        const url = new URL(a.href, location.href);
                        if (url.origin !== location.origin) return;

                        const path = url.pathname.replace(/\/$/, "") || "/";
                        if (seen.has(path)) return;
                        seen.add(path);

                        const link = document.createElement("link");
                        link.rel = "prefetch";
                        link.as = "document";
                        link.href = url.href;
                        document.head.appendChild(link);
                    });
                });
            };

            const navLinks = () => {
                const links = nav.querySelectorAll(".nav-item, .nav-anmt");

                links.forEach(link => {
                    link.addEventListener("click", () => {
                        if (nav.classList.contains("mob-active")) hideMobileNav();
                    });
                });
            };

            const updateNavScroll = () => {
                const currentScrollY = window.scrollY;
                const direction = currentScrollY > lastScrollY ? "down" : currentScrollY < lastScrollY ? "up" : null;
                const scrolled = currentScrollY > 20;

                if (scrolled !== isScrolled) {
                    nav.classList.toggle("nav-scrolled", scrolled);
                    isScrolled = scrolled;
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

            burgerEvent();
            navExtras();
            navLinks();
            navPrefetch();

            document.addEventListener("scroll", updateNavScroll);
            window.addEventListener("load", updateNavScroll);
            updateNavScroll();
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
                        autoSplit: true,
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
