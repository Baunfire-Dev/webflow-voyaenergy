(function () {
    baunfire.Animation = {
        init() {
            this.handleNav();
            this.handleTransitions();
        },

        handleNav() {
            const nav = document.querySelector("header");
            if (!nav) return;

            let lastScrollY = window.scrollY;
            let isScrolled = false;
            let scrollDirection = null;

            const parents = nav.querySelectorAll(".nav-item.is-parent");
            const allNavItems = nav.querySelectorAll(".nav-item");

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

            // const desktopDDPanel = () => {
            //     let activeDropdown = null;
            //     let hideTimeout = null;
            //     let timeoutDuration = 300;

            //     const isBigScreen = () => window.matchMedia("(min-width: 992px)").matches;

            //     parents.forEach(function (el) {
            //         const ddItems = el.querySelectorAll(".nav-dd-item");

            //         el.addEventListener('mouseenter', function () {
            //             if (!isBigScreen()) return;

            //             clearTimeout(hideTimeout);

            //             if (activeDropdown && activeDropdown !== el) {
            //                 activeDropdown.classList.remove('open');
            //             }

            //             el.classList.add('open');
            //             activeDropdown = el;

            //             animateDDItems(ddItems);
            //         });

            //         el.addEventListener('mouseleave', function () {
            //             if (!isBigScreen()) return;

            //             hideTimeout = setTimeout(() => {
            //                 el.classList.remove('open');
            //                 if (activeDropdown === el) activeDropdown = null;
            //             }, timeoutDuration);
            //         });
            //     });

            //     allNavItems.forEach(function (el) {
            //         if (el.classList.contains('is-parent')) return;

            //         el.addEventListener('mouseenter', function () {
            //             if (!isBigScreen()) return;
            //             clearTimeout(hideTimeout);

            //             if (activeDropdown) {
            //                 activeDropdown.classList.remove('open');
            //                 activeDropdown = null;
            //             }
            //         });
            //     });
            // };

            // const mobileDDPanel = () => {
            //     const navPanel = nav.querySelector(".nav-panel-inner");

            //     parents.forEach(function (el) {
            //         const inner = el.querySelector(".nav-item-inner");
            //         const ddItems = el.querySelectorAll(".nav-dd-item");

            //         inner.addEventListener('click', function () {
            //             if (!window.matchMedia("(max-width: 992px)").matches) return;

            //             if (el.classList.contains("mob-open")) {
            //                 el.classList.remove("mob-open");
            //             } else {
            //                 parents.forEach(p => p.classList.remove("mob-open"));
            //                 el.classList.add("mob-open");

            //                 const elTop = el.getBoundingClientRect().top + navPanel.scrollTop - navPanel.getBoundingClientRect().top - 40;

            //                 gsap.to(navPanel, {
            //                     duration: 0.6,
            //                     scrollTo: { y: elTop, autoKill: true },
            //                     ease: "power2.inOut",
            //                     overwrite: true
            //                 });

            //                 animateDDItems(ddItems);
            //             }
            //         });
            //     });
            // };

            // const animateDDItems = (els) => {
            //     gsap.fromTo(els,
            //         {
            //             x: 16,
            //             autoAlpha: 0
            //         },
            //         {
            //             autoAlpha: 1,
            //             x: 0,
            //             duration: 0.4,
            //             ease: "power2.out",
            //             overwrite: true,
            //             stagger: { each: 0.08 }
            //         }
            //     );
            // };

            // const burgerEvent = () => {
            //     const burger = nav.querySelector(".nav-burger");

            //     let mm = gsap.matchMedia();

            //     mm.add(
            //         {
            //             isDesktop: `(min-width: 992px)`,
            //             isMobile: `(max-width: 991.98px)`,
            //         },
            //         (context) => {
            //             let { isDesktop, isMobile } = context.conditions;

            //             if (isDesktop) {
            //                 parents.forEach(p => p.classList.remove("open"));
            //             }

            //             if (isMobile) {
            //                 parents.forEach(p => p.classList.remove("mob-open"));
            //             }

            //             if (isDesktop) {
            //                 nav.classList.remove("mob-active");
            //                 baunfire.Global.siteScrolling();

            //                 burger.removeEventListener("click", burgerClickHandler);
            //             }

            //             if (isMobile) {
            //                 burger.addEventListener("click", burgerClickHandler);
            //             }

            //             return () => { };
            //         }
            //     );
            // };

            // const burgerClickHandler = () => {
            //     if (!nav.classList.contains("mob-active")) {
            //         showMobileNav();
            //     } else {
            //         hideMobileNav();
            //     }
            // };

            // const showMobileNav = () => {
            //     nav.classList.add("mob-active");
            //     baunfire.Global.siteScrolling(false);
            // };

            // const hideMobileNav = () => {
            //     nav.classList.remove("mob-active");
            //     baunfire.Global.siteScrolling();
            //     parents.forEach(p => p.classList.remove("open"));
            // };

            // burgerEvent();
            // desktopDDPanel();
            // mobileDDPanel();

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