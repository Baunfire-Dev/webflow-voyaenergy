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
