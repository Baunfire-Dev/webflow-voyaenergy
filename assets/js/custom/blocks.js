const theme = require("../../../config.json");

(function () {
    const COLLECTION_ENDPOINTS = {
        resources: {
            dataURL: `${theme.pages}/api/collection?name=resources`,
            slug: 'resource',
            data: []
        }
    };

    baunfire.Blocks = {
        init() {
            const blocks = [
                "sectionControls",

                "heroHomepage",
                "bridgeEBTL",
                "howItWorks",
                "advanceTechnology",
                "systemOverview",
                "densePower",
                "systemDetailPopup",
                "contentGridItems",
                "contactBanner",
                "wideImageBanner",

                "heroFiftyFifty",
                "heroWithGallery",
                "heroContact",
                "richtextContent",
                "resourcesDetailPage",

                "scrollingTimeline",

                "largeText",
                "resourcesGrid",
                "teamGrid",
                "teamCarousel",
            ];

            blocks.forEach(name => {
                try {
                    this[name]();
                } catch (err) {
                    baunfire.Global.fancyLog(`Blocks.${name}() failed: ${err.message}`, "error");
                    console.error(err);
                }
            });
        },

        destroy() {
            if (this._scHandler) {
                removeEventListener('scroll', this._scHandler);
                this._scHandler = null;
            }
            if (this._hiwRefresh) {
                ScrollTrigger.removeEventListener("refreshInit", this._hiwRefresh);
                this._hiwRefresh = null;
            }
            if (this._soResize) {
                removeEventListener('resize', this._soResize);
                this._soResize = null;
            }
            if (this._scOutside) {
                document.removeEventListener('click', this._scOutside);
                this._scOutside = null;
            }
            if (this._swipers) {
                this._swipers.forEach(s => s.destroy?.(true, true));
                this._swipers = null;
            }
        },

        sectionControls() {
            const SCROLL_PX_PER_SEC = 12000;
            const SCROLL_MIN_DUR = 0.8;
            const SCROLL_MAX_DUR = 2.4;
            const SCROLL_OFFSETS = {
                "how-it-works": -300,
            };

            let items = [];

            const setActive = (item) => {
                items.forEach(i => i.classList.toggle("active", i === item));
            };

            const resolve = (item) => {
                const hash = (item.getAttribute("href") || "").trim();
                if (hash.length < 2 || !hash.startsWith("#")) return null;

                const id = hash.slice(1);
                const target = document.getElementById(id);

                return target ? { id, target } : null;
            };

            const script = () => {
                const el = document.querySelector(".section-controls");
                if (!el) return;

                items = [...el.querySelectorAll(".sc-anchor-item")];

                const menu = handleCTAToggle(el);
                handleAnchorClicks(el, menu);
                handleActiveState();
                handleStickyEnd(el);
                handleScrollIndicator(el);
            };

            const handleStickyEnd = (self) => {
                const footer = document.querySelector("footer.footer");
                if (!footer) return;

                ScrollTrigger.create({
                    trigger: footer,
                    start: "top bottom",
                    onToggle: ({ isActive }) => self.classList.toggle("is-unstuck", isActive),
                });
            };

            const handleActiveState = () => {
                const pairs = items.map(item => {
                    const resolved = resolve(item);
                    return resolved ? { item, target: resolved.target } : null;
                }).filter(Boolean);

                if (!pairs.length) return;

                setActive(pairs[0].item);

                pairs.forEach(({ item, target }) => {
                    ScrollTrigger.create({
                        trigger: target,
                        start: "top center",
                        end: "bottom center",
                        onEnter: () => setActive(item),
                        onEnterBack: () => setActive(item),
                    });
                });
            };

            const handleAnchorClicks = (self, menu) => {
                if (!items.length) return;

                self.addEventListener("click", (e) => {
                    const item = e.target.closest(".sc-anchor-item");
                    if (!item) return;

                    const resolved = resolve(item);
                    if (!resolved) return;

                    const { id, target } = resolved;

                    e.preventDefault();

                    setActive(item);

                    menu?.close();

                    const offset = SCROLL_OFFSETS[id] || 0;
                    const targetY = target.getBoundingClientRect().top + window.scrollY + offset;
                    const distance = Math.abs(targetY - window.scrollY);
                    const duration = gsap.utils.clamp(
                        SCROLL_MIN_DUR,
                        SCROLL_MAX_DUR,
                        distance / SCROLL_PX_PER_SEC
                    );

                    baunfire.lenis?.scrollTo(targetY, {
                        duration,
                        easing: t => 1 - Math.pow(1 - t, 3),
                    });
                });
            };

            const handleCTAToggle = (self) => {
                const trigger = self.querySelector(".sc-anchors");
                if (!trigger) return null;

                const cta = trigger.querySelector(".sc-anchor-cta");
                const itemsContainer = trigger.querySelector(".sc-anchor-items-c");
                if (!cta || !itemsContainer) return null;

                const hoverTL = gsap.timeline({ paused: true });

                hoverTL
                    .fromTo(cta,
                        {
                            scale: 1,
                            autoAlpha: 1,
                        },
                        {
                            scale: 0.4,
                            autoAlpha: 0,
                            transformOrigin: "bottom left",
                            duration: 0.4,
                            ease: "power2.out"
                        }
                    )
                    .fromTo(itemsContainer,
                        {
                            clipPath: "inset(100% 100% 0% 0% round 0.5rem)",
                        },
                        {
                            clipPath: "inset(0% 0% 0% 0% round 0.5rem)",
                            duration: 0.4,
                            ease: "power2.out"
                        },
                        "<0.2"
                    )
                    .fromTo(Array.from(items).reverse(),
                        {
                            x: -10,
                            autoAlpha: 0,
                        },
                        {
                            x: 0,
                            duration: 0.4,
                            ease: "power2.out",
                            autoAlpha: 1,
                            stagger: { amount: 0.3, from: "start" }
                        },
                        "<0.2"
                    )

                let isOpen = false;

                const open = () => {
                    if (isOpen) return;
                    isOpen = true;
                    hoverTL.timeScale(1).play();
                };

                const close = () => {
                    if (!isOpen) return;
                    isOpen = false;
                    hoverTL.timeScale(1.4).reverse();
                };

                cta.addEventListener("click", (e) => {
                    e.stopPropagation();
                    isOpen ? close() : open();
                });

                this._scOutside = (e) => {
                    if (!isOpen || trigger.contains(e.target)) return;
                    close();
                };

                document.addEventListener("click", this._scOutside);

                return { close };
            };

            const handleScrollIndicator = (self) => {
                const svg = self.querySelector('#indicator');
                const line = self.querySelector('#dline');
                const head = self.querySelector('#dhead');
                if (!svg || !line || !head) return;

                const len = line.getTotalLength();

                const arrowTL = gsap.timeline({
                    repeat: -1,
                    repeatDelay: 0.2,
                })

                let fadeOut = false;

                const mm = gsap.matchMedia();

                gsap.set(line, {
                    strokeDasharray: len,
                    strokeDashoffset: len
                });

                gsap.set(head, {
                    autoAlpha: 0,
                    y: -4
                });

                arrowTL
                    .to(line, {
                        strokeDashoffset: 0,
                        duration: 0.6,
                        ease: 'power2.out'
                    })
                    .to(head, {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.4,
                        ease: 'back.out(2)'
                    },
                        '-=0.1'
                    )
                    .to([head, line], {
                        autoAlpha: 0,
                        y: 2,
                        duration: 0.6,
                        ease: 'power2.out'
                    },
                        '<0.3'
                    )
                    .set(line, {
                        strokeDashoffset: len
                    })
                    .set(head, {
                        y: -4
                    })

                this._scHandler = () => {
                    if (fadeOut) return;

                    fadeOut = true;
                    arrowTL.pause();

                    gsap.to(svg, {
                        autoAlpha: 0,
                        y: 14,
                        scale: 0.85,
                        duration: 0.5,
                        ease: 'power3.in'
                    });
                };
                addEventListener('scroll', this._scHandler, { passive: true });
            };

            script();
        },

        heroHomepage() {
            const script = () => {
                const els = document.querySelectorAll("section.hero-homepage");
                if (!els.length) return;

                els.forEach(self => {
                    handleEntrance(self);
                    handleScroll(self);
                });
            }

            const handleEntrance = (self) => {
                const nav = document.querySelector("nav");
                const pageControls = document.querySelector(".section-controls");

                const mainHeading = self.querySelector(".hh-section.one .hh-heading");
                const mainImage = self.querySelector(".hh-section.one .hh-bg-img-outer");

                const timings = {
                    callDelay: 0,
                    mainImage: {
                        duration: 2,
                        position: "<-0.2"
                    },
                    mainHeading: {
                        position: "<0.6"
                    },
                    mainPara: {
                        position: "<0.3"
                    },
                }

                const splitTextsProps = {
                    duration: 0.8,
                    stagger: 0.06
                }

                const introTL = gsap.timeline({
                    paused: true,
                });

                ScrollTrigger.create({
                    trigger: self,
                    start: baunfire.anim.start,
                    once: true,
                    onEnter: () => {
                        gsap.delayedCall(timings.callDelay, () => introTL.play());
                    }
                });

                if (mainImage) {
                    introTL.to(mainImage,
                        {
                            scale: 1,
                            duration: timings.mainImage.duration,
                            ease: "power2.inOut",
                        },
                        timings.mainImage.position
                    );
                }

                if (mainHeading) {
                    SplitText.create(mainHeading, {
                        type: "words",
                        mask: "words",
                        autoSplit: true,
                        onSplit(split) {
                            mainHeading.style.visibility = "visible";
                            mainHeading.style.opacity = "1";
                            gsap.set(split.words, { y: "100%", willChange: "transform" });
                            introTL.fromTo(split.words,
                                { y: "100%" },
                                {
                                    y: "-5%", duration: splitTextsProps.duration, ease: "power2.inOut", stagger: splitTextsProps.stagger,
                                    onComplete: () => gsap.set(split.words, { willChange: "auto" }),
                                },
                                timings.mainHeading.position
                            );
                            return introTL.recent();
                        },
                    });
                }
            };

            const handleScroll = (self) => {
                const siteAnchors = document.querySelector(".sc-anchors");

                const heroInner = self.querySelector(".hh-inner");
                const sectionOne = self.querySelector(".hh-section.one");
                const sectionTwo = self.querySelector(".hh-section.two");

                if (!heroInner || !sectionOne || !sectionTwo) return;

                const sectionOneImage = sectionOne.querySelector(".hh-bg-img-outer");

                const mainHeading = sectionOne.querySelector(".hh-heading");
                const mainPara = sectionOne.querySelector(".hh-para");

                const sectionTwoLogo = sectionTwo.querySelector(".hh-logo");
                const sectionTwoImage = sectionTwo.querySelector(".hh-bg-img");
                const sectionTwoContent = sectionTwo.querySelector(".hh-content.two");
                const sectionTwoBGOverlay = sectionTwo.querySelector(".hh-bg-overlay");

                const secondaryPara = sectionTwo.querySelector(".hh-long-para");

                const imageMask = () => {
                    const s = getComputedStyle(sectionTwo);
                    const y = s.getPropertyValue("--frame-y").trim();
                    const x = s.getPropertyValue("--frame-x").trim();
                    const r = s.getPropertyValue("--frame-r").trim();
                    return `inset(${y} ${x} ${y} ${x} round ${r})`;
                };

                const mm = gsap.matchMedia();

                mm.add("(min-width: 992px)", () => {
                    gsap.set(sectionOneImage, { yPercent: 0 });
                    gsap.set([mainHeading, mainPara], { yPercent: 0, autoAlpha: 1 });
                    gsap.set(sectionTwo, { clipPath: "inset(0rem 0rem 0rem 0rem round 0rem)", yPercent: 40 });
                    gsap.set([sectionTwoContent, sectionTwoBGOverlay], { autoAlpha: 1 });

                    const tl = gsap.timeline({
                        scrollTrigger: {
                            trigger: heroInner,
                            start: "top top",
                            end: "+=140%",
                            scrub: 1,
                            pin: true,
                            invalidateOnRefresh: true,
                        },
                    });

                    tl.to(sectionOne, { yPercent: -100, ease: "power1.out", duration: 1.8 }, 0);
                    tl.to(sectionOneImage, { yPercent: 40, ease: "power1.out", duration: 1.8 }, "<");
                    tl.to(sectionTwo, { yPercent: 0, ease: "power1.out", duration: 1.8 }, "<");
                    tl.fromTo(sectionTwoImage,
                        {
                            scale: 1.2
                        },
                        {
                            scale: 1.06,
                            ease: "power1.out",
                            duration: 1.8,
                            transformOrigin: "center center"
                        },
                        "<"
                    );

                    tl.to(mainHeading, { yPercent: -140, autoAlpha: 0, ease: "none", duration: 0.85 }, "<");
                    tl.to(mainPara, { yPercent: -110, autoAlpha: 0, ease: "none", duration: 1.0 }, "<0.08");

                    const PIN_TAIL = 1;

                    tl.addLabel("reveal2", ">+0.2");

                    tl.to({}, { duration: PIN_TAIL }, 0);

                    tl.to({}, { duration: 1 });

                    tl.to(sectionTwo, { clipPath: imageMask(), ease: "none", duration: 0.8 });

                    tl.to([sectionTwoContent, sectionTwoBGOverlay], { autoAlpha: 0, ease: "none", duration: 0.6 }, "<");

                    tl.to({}, { duration: 0.5 });

                    const masterST = tl.scrollTrigger;

                    let revealed = false;
                    let reveal2TL = null;
                    let reveal2ST = null;

                    const split = SplitText.create(secondaryPara, {
                        type: "words",
                        mask: "words",
                        autoSplit: true,
                        onSplit(split) {
                            reveal2TL?.kill();
                            reveal2ST?.kill();

                            if (revealed) {
                                gsap.set(sectionTwoLogo, { autoAlpha: 1, y: 0 });
                                gsap.set(split.words, { yPercent: 0 });
                                return;
                            }

                            gsap.set(sectionTwoLogo, { autoAlpha: 0, y: 40 });
                            gsap.set(split.words, { y: "110%" });
                            gsap.set(split.words, { willChange: "transform" });

                            reveal2TL = gsap.timeline({ paused: true });

                            reveal2TL.to(sectionTwoLogo, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0);

                            reveal2TL.to(
                                split.words,
                                {
                                    y: "-5%",
                                    duration: 0.8,
                                    ease: "pageReveal",
                                    stagger: { amount: 0.6, from: "start" },
                                    onComplete: () => {
                                        gsap.set(split.words, { willChange: "auto" });
                                    },
                                },
                                "<-0.1"
                            );

                            reveal2ST = ScrollTrigger.create({
                                trigger: heroInner,
                                start: () => masterST.labelToScroll("reveal2"),
                                once: true,
                                refreshPriority: -1,
                                onEnter: () => { revealed = true; reveal2TL.play(); },
                            });
                        },
                    });

                    gsap.to(sectionTwoImage, {
                        yPercent: 14,
                        ease: "none",
                        scrollTrigger: {
                            trigger: heroInner,
                            start: "bottom bottom",
                            end: "bottom top",
                            scrub: true,
                            invalidateOnRefresh: true,
                        },
                    });

                    return () => {
                        reveal2TL?.kill();
                        reveal2ST?.kill();
                        split?.revert();
                    };
                });

                mm.add("(max-width: 991.98px)", () => {
                    let mobileTL = null;

                    const split = SplitText.create(secondaryPara, {
                        type: "words",
                        mask: "words",
                        autoSplit: true,
                        onSplit(split) {
                            mobileTL?.kill();

                            gsap.set(sectionTwoLogo, { autoAlpha: 0, y: 40 });
                            gsap.set(split.words, { y: "110%", willChange: "transform" });

                            mobileTL = gsap.timeline({
                                scrollTrigger: {
                                    trigger: sectionTwoContent,
                                    start: baunfire.anim.startMobile,
                                    once: true,
                                },
                            });

                            mobileTL.to(sectionTwoLogo, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0);

                            mobileTL.to(split.words, {
                                y: "-5%",
                                duration: 0.8,
                                ease: "pageReveal",
                                stagger: { amount: 0.6, from: "start" },
                                onComplete: () => gsap.set(split.words, { willChange: "auto" }),
                            }, "<-0.1");

                            return mobileTL;
                        },
                    });

                    return () => {
                        mobileTL?.kill();
                        split?.revert();
                    };
                });
            };

            script();
        },

        bridgeEBTL() {
            const script = () => {
                const els = document.querySelectorAll("section.section-bridge-eb-tl");
                if (!els.length) return;

                els.forEach(self => {
                    const inner = self.querySelector(".sb-inner");

                    const mm = gsap.matchMedia();

                    mm.add("(min-width: 992px)", () => {
                        const ebTL = gsap.timeline({
                            scrollTrigger: {
                                trigger: self,
                                pin: inner,
                                start: "top top",
                                end: "+=400%",
                                pinSpacing: true,
                                scrub: true,
                                invalidateOnRefresh: true,
                            }
                        });

                        this.energyBottleNeck(self, ebTL, true);
                        this.transitionLine(self, ebTL, true);
                    });

                    mm.add("(max-width: 991.98px)", () => {
                        this.energyBottleNeck(self, null, false);
                        this.transitionLine(self, null, false);
                    });
                });
            };

            script();
        },

        energyBottleNeck(sectionParent, ebTL, isDesktop) {
            const script = () => {
                const els = sectionParent.querySelectorAll("section.energy-bottleneck");
                if (!els.length) return;

                els.forEach(self => {
                    handleEntrance(self);

                    if (isDesktop) {
                        handleParallax(self);
                        handleExit(self, ebTL);
                    }
                });
            };

            const handleEntrance = (self) => {
                const contentInner = self.querySelector(".eb-content-inner");
                const logo = self.querySelector(".eb-icon");
                const heading = self.querySelector(".eb-title");
                const para = self.querySelector(".eb-para");

                const introTL = gsap.timeline({
                    scrollTrigger: {
                        trigger: contentInner,
                        start: "top 70%",
                        once: true,

                    }
                });

                if (logo) {
                    introTL.fromTo(logo,
                        { autoAlpha: 0, y: 40 },
                        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }
                    );
                }

                if (heading) {
                    SplitText.create(heading, {
                        type: "words",
                        mask: "words",
                        autoSplit: true,
                        onSplit(split) {
                            heading.style.visibility = "visible";
                            heading.style.opacity = "1";
                            gsap.set(split.words, { y: "100%", willChange: "transform" });
                            introTL.fromTo(split.words,
                                { y: "100%" },
                                {
                                    y: "-5%", duration: 0.8, ease: "pageReveal", stagger: 0.06,
                                    onComplete: () => gsap.set(split.words, { willChange: "auto" }),
                                },
                                "<-0.1"
                            );
                            return introTL.recent();
                        },
                    });
                }

                if (para) {
                    introTL.fromTo(para,
                        { autoAlpha: 0, y: 40 },
                        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" },
                        "<0.4"
                    );
                }
            };

            const handleParallax = (self) => {
                const bgImage = self.querySelector(".eb-bg-img");

                gsap.fromTo(bgImage,
                    {
                        scale: 1.25,
                        yPercent: 0,
                    },
                    {
                        scale: 1.15,
                        yPercent: -6,
                        transformOrigin: "top center",
                        ease: "none",
                        scrollTrigger: {
                            trigger: self,
                            start: "top bottom",
                            end: "top 10%",
                            scrub: 1,
                        }
                    }
                )
            };

            const handleExit = (self, ebTL) => {
                const inner = self.querySelector(".eb-inner");
                const bgImage = self.querySelector(".eb-bg-img");

                ebTL.to(inner, { yPercent: -100, ease: "none", duration: 2.5 }, "<0.6");

                ebTL.to(bgImage, {
                    yPercent: 0,
                    ease: "none",
                    duration: 2.5
                }, "<");
            };

            script();
        },

        transitionLine(parent, ebTL, isDesktop) {
            const RESTING_COLOR = "#EBEBEB";
            const MOBILE_END = "+=200%";

            const script = () => {
                const els = parent.querySelectorAll("section.transition-line");
                if (!els.length) return;

                els.forEach(self => {

                    let tl = ebTL;

                    if (!isDesktop) {
                        tl = gsap.timeline({
                            scrollTrigger: {
                                trigger: self,
                                pin: true,
                                start: "top top",
                                end: MOBILE_END,
                                pinSpacing: true,
                                scrub: true,
                                invalidateOnRefresh: true,
                            }
                        });
                    }

                    handleTexts(self, tl);
                });
            };

            const handleTexts = (self, tl) => {
                const items = [...self.querySelectorAll(".tl-text-c")];
                if (!items.length) return;

                const lines = items.map((item, i) => setupTextGroup(self, item, i, items.length));

                lines.forEach(line => textGroupAnim(line, tl));
            };

            const setupTextGroup = (self, item, i, total) => {
                const isFirst = i === 0;
                const isLast = i === total - 1;

                const text = item.querySelector(".tl-text");
                const split = SplitText.create(text, { type: "chars, words", autoSplit: false });

                const main = document.querySelector("main.g-main");
                const wasDark = main?.classList.contains("is-hiw-dark");

                if (wasDark) main.classList.remove("is-hiw-dark");
                split.chars.forEach(c => (c.dataset.fill = getComputedStyle(c).color));
                if (wasDark) main.classList.add("is-hiw-dark");

                gsap.set(split.chars, { color: RESTING_COLOR });

                let imagesInner = null;

                if (isLast) {
                    const images = self.querySelector(".tl-images");
                    item.appendChild(images);
                    item.classList.add("has-images");
                    imagesInner = images.querySelector(".tl-images-inner");
                    gsap.set(imagesInner, { xPercent: 80, autoAlpha: 0 });
                }

                return { item, split, imagesInner, isFirst, isLast };
            };

            const textGroupAnim = (line, tl) => {
                const { item, split, imagesInner, isFirst, isLast } = line;

                if (isFirst) {
                    tl.set(item, { autoAlpha: 1 }, 0);
                } else {
                    tl.to(item, { autoAlpha: 1, duration: 0.3, ease: "power2.out" });
                }

                if (isLast) {
                    const inner = item.querySelector(".tl-text-c-inner");
                    tl.fromTo(inner,
                        { y: () => yLift(inner) },
                        { y: 0, ease: "none", duration: 1.2, immediateRender: false },
                        "<"
                    );
                }

                tl.to(split.chars, {
                    color: (idx, target) => target.dataset.fill,
                    duration: 0.05,
                    ease: "none",
                    stagger: { each: 0.02, from: "start" },
                }, isFirst ? "-=0.8" : "<0.1");

                if (isLast && imagesInner) {
                    tl.to(imagesInner, {
                        autoAlpha: 1,
                        ease: "power1.out",
                        duration: 0.8,
                    }, "<0.4");

                    tl.to(imagesInner, {
                        xPercent: 0,
                        ease: "none",
                        duration: 2,
                    }, "<0.1");
                }

                tl.to({}, { duration: 0.3 });

                if (!isLast) {
                    tl.to(item, { autoAlpha: 0, duration: 0.3, ease: "power2.in" });
                }
            };

            const yLift = (inner) => {
                const tc = inner.closest(".tl-text-c");
                const images = tc.querySelector(".tl-images");
                if (!images) return 0;

                const cs = getComputedStyle(tc);
                const gap = parseFloat(cs.rowGap) || 0;
                const padTop = parseFloat(cs.paddingTop) || 0;
                const padBottom = parseFloat(cs.paddingBottom) || 0;

                return (images.offsetHeight + gap) / 2 - (padTop - padBottom) / 2;
            };

            script();
        },

        howItWorks() {
            const INTRO_DUR = 0.3;
            const isDesktop = () => window.matchMedia("(min-width: 992px)").matches;

            const script = () => {
                const els = document.querySelectorAll("section.how-it-works");
                if (!els.length) return;

                els.forEach(self => {
                    this._hiwRefresh = () => handleVisualBalance(self);
                    ScrollTrigger.addEventListener("refreshInit", this._hiwRefresh);
                    handleVisualBalance(self);
                    ScrollTrigger.refresh();

                    handleEntrance(self);
                    handleBGSwitch(self);

                    const mm = gsap.matchMedia();

                    mm.add("(min-width: 992px)", () => {
                        handleSlides(self);
                    });

                    mm.add("(max-width: 991.98px)", () => {
                        handleMobileSlides(self);
                    });
                });
            };

            const handleVisualBalance = (self) => {
                const minSpacing = 188;
                const rootFontSize = parseFloat(
                    getComputedStyle(document.documentElement).fontSize
                );

                const head = self.querySelector(".hiw-head");
                const hasImg = document.querySelector(".tl-text-c.has-images");
                const images = hasImg?.querySelector(".tl-images");

                if (!head || !hasImg || !images) return;

                const gap =
                    hasImg.getBoundingClientRect().bottom -
                    images.getBoundingClientRect().bottom;

                const paddingTop = gap < minSpacing ? minSpacing - gap : 0;
                const paddingBottom = Math.max(gap, minSpacing);

                const nextTop = `${(paddingTop / rootFontSize).toFixed(3)}rem`;
                const nextBottom = `${(paddingBottom / rootFontSize).toFixed(3)}rem`;

                if (head.style.paddingTop === nextTop && head.style.paddingBottom === nextBottom) return;

                gsap.set(head, {
                    paddingTop: nextTop,
                    paddingBottom: nextBottom,
                });
            };

            const handleEntrance = (self) => {
                const heading = self.querySelector(".hiw-title");
                if (!heading) return;

                const introTL = gsap.timeline({
                    scrollTrigger: {
                        trigger: self,
                        start: "top 60%",
                    }
                });

                SplitText.create(heading, {
                    type: "words",
                    mask: "words",
                    autoSplit: true,
                    onSplit(split) {
                        heading.style.visibility = "visible";
                        heading.style.opacity = "1";
                        gsap.set(split.words, { y: "100%", willChange: "transform" });
                        introTL.fromTo(split.words,
                            { y: "100%" },
                            {
                                y: "-5%", duration: 0.8, ease: "power3.out", stagger: 0.08,
                                onComplete: () => gsap.set(split.words, { willChange: "auto" }),
                            },
                        );
                        return introTL.recent();
                    },
                });
            };

            const handleBGSwitch = (self) => {
                const head = self.querySelector(".hiw-head");
                const body = self.querySelector(".hiw-body");
                const panels = gsap.utils.toArray(".hiw-slide", self.querySelector(".hiw-slides"));
                if (!head || !body || !panels.length) return;

                const main = document.querySelector("main.g-main");
                if (!main) return;

                ScrollTrigger.create({
                    trigger: head,
                    start: "top 60%",
                    endTrigger: body,
                    end: () => isDesktop()
                        ? "top top-=" + INTRO_DUR * panels[0].offsetWidth
                        : "bottom bottom",
                    invalidateOnRefresh: true,
                    onToggle: ({ isActive }) => main.classList.toggle("is-hiw-dark", isActive),
                });
            };

            const animateFirstSlide = (panel) => {
                const els = [
                    panel.querySelector(".hiw-c-brow"),
                    panel.querySelector(".hiw-c-title"),
                    panel.querySelector(".hiw-para"),
                ].filter(Boolean);

                if (!els.length) return;

                return gsap.fromTo(els,
                    { y: 40, autoAlpha: 0 },
                    {
                        y: 0,
                        autoAlpha: 1,
                        duration: 0.6,
                        ease: "power3.out",
                        stagger: 0.08,
                        scrollTrigger: {
                            trigger: panel.closest(".hiw-body"),
                            start: "top 20%",
                        }
                    }
                );
            };

            const handleMobileSlides = (self) => {
                const slides = self.querySelector(".hiw-slides");
                if (!slides) return;

                const panels = gsap.utils.toArray(".hiw-slide", slides);
                if (!panels.length) return;

                panels.forEach(panel => {
                    const els = [
                        panel.querySelector(".hiw-c-brow"),
                        panel.querySelector(".hiw-c-title"),
                        panel.querySelector(".hiw-para"),
                    ].filter(Boolean);

                    if (!els.length) return;

                    gsap.fromTo(els,
                        { y: 40, autoAlpha: 0 },
                        {
                            y: 0,
                            autoAlpha: 1,
                            duration: 0.8,
                            ease: "power3.out",
                            stagger: 0.08,
                            scrollTrigger: {
                                trigger: panel,
                                start: baunfire.anim.startMobile,
                            }
                        }
                    );
                });

                const cover = panels[0].querySelector(".hiw-cover") || self.querySelector(".hiw-cover");
                if (!cover) return;

                gsap.fromTo(cover,
                    { scale: 1 },
                    {
                        scale: 1.4,
                        ease: "none",
                        scrollTrigger: {
                            trigger: panels[0],
                            start: "top bottom",
                            end: "top 10%",
                            scrub: 1,
                        }
                    }
                );
            };

            const handleSlides = (self) => {
                const body = self.querySelector(".hiw-body");
                if (!body) return;

                const slides = self.querySelector(".hiw-slides");
                if (!slides) return;

                const panels = gsap.utils.toArray(".hiw-slide", slides);
                if (!panels.length) return;

                const dotContainer = self.querySelector(".hiw-pagination");
                const dots = dotContainer ? dotContainer.querySelectorAll("svg circle") : [];

                const H_START = INTRO_DUR;
                const H_DUR = panels.length - 1;

                const cover = panels[0].querySelector(".hiw-cover") || self.querySelector(".hiw-cover");
                const firstImg = panels[0].querySelector(".hiw-img");

                const master = gsap.timeline({
                    scrollTrigger: {
                        trigger: body,
                        start: "top top",
                        end: () => "+=" + (INTRO_DUR + H_DUR) * panels[0].offsetWidth,
                        scrub: 1,
                        pin: body,
                        invalidateOnRefresh: true,
                        pinSpacing: true,
                    }
                });

                if (cover) {
                    master.to(cover, {
                        scale: 1.4,
                        ease: "none",
                        duration: INTRO_DUR,
                    }, 0);
                }

                if (dotContainer) {
                    master.fromTo(dotContainer,
                        {
                            autoAlpha: 0,
                            scale: 0,
                            rotate: '45deg',
                        },
                        {
                            scale: 1,
                            rotate: 0,
                            autoAlpha: 1,
                            ease: "none",
                            duration: 0.4
                        },
                        "<"
                    );
                }

                master.to(panels, {
                    xPercent: -100 * (panels.length - 1),
                    ease: "none",
                    duration: H_DUR,
                }, H_START);

                if (firstImg) {
                    master.fromTo(firstImg,
                        { xPercent: 0 },
                        { xPercent: 14, ease: "none", duration: 1 },
                        H_START
                    );
                }

                animateFirstSlide(panels[0]);

                panels.slice(1).forEach((panel, index, arr) => {
                    const isLast = index === arr.length - 1;

                    const contentContainer = panel.querySelector(".hiw-content");
                    const brow = panel.querySelector(".hiw-c-brow");
                    const title = panel.querySelector(".hiw-c-title");
                    const para = panel.querySelector(".hiw-para");
                    const img = panel.querySelector(".hiw-img");

                    const dot = dots[index + 1];

                    const enterTL = gsap.timeline({ paused: true });

                    enterTL
                        .fromTo([brow, title, para].filter(Boolean),
                            { x: 60, autoAlpha: 0 },
                            {
                                x: 0,
                                autoAlpha: 1,
                                duration: 1,
                                ease: "power3.out",
                                stagger: 0.08,
                            }
                        );

                    ScrollTrigger.create({
                        trigger: contentContainer,
                        containerAnimation: master,
                        start: "left 60%",
                        end: "right center",
                        animation: enterTL,
                    });

                    if (dot) {
                        ScrollTrigger.create({
                            trigger: panel,
                            containerAnimation: master,
                            start: "left center",
                            end: "right center",
                            onEnter: () => activateDot(dot),
                            onLeaveBack: () => activateDot(dot, false),
                        });
                    }

                    if (img) {
                        gsap.fromTo(img,
                            { xPercent: 0 },
                            {
                                xPercent: 14,
                                ease: "none",
                                scrollTrigger: {
                                    trigger: panel,
                                    containerAnimation: master,
                                    start: "left center",
                                    end: isLast ? "right right" : "right 10%",
                                    scrub: 1
                                }
                            }
                        );
                    }
                });
            };

            const activateDot = (dot, active = true) => {
                gsap.timeline()
                    .to(dot.parentElement, {
                        rotation: active ? "-=72" : "+=72",
                        duration: 0.6,
                        ease: "power2.out"
                    })
                    .to(dot, {
                        fill: active ? "#f1b510" : "#c7c7c7",
                        duration: 0.6,
                        ease: "power2.out"
                    }, "<");
            };

            script();
        },

        advanceTechnology() {
            const PX_PER_SEC_DESKTOP = 350;
            const PX_PER_SEC_MOBILE = 300;

            const script = () => {
                const els = document.querySelectorAll("section.advance-technology");
                if (!els.length) return;

                els.forEach(self => {
                    handleEntrance(self);
                    handleTransitions(self);
                });
            };

            const handleEntrance = (self) => {
                const header = self.querySelector(".at-header");
                if (!header) return;

                const logo = header.querySelector(".at-icon");
                const heading = header.querySelector(".at-title");
                const para = header.querySelector(".at-para");

                const introTL = gsap.timeline({
                    scrollTrigger: {
                        trigger: header,
                        start: baunfire.anim.start,
                        once: true,
                    }
                });

                if (logo) {
                    introTL.fromTo(logo,
                        { autoAlpha: 0, y: 40 },
                        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }
                    );
                }

                if (heading) {
                    SplitText.create(heading, {
                        type: "words",
                        mask: "words",
                        autoSplit: true,
                        onSplit(split) {
                            heading.style.visibility = "visible";
                            heading.style.opacity = "1";
                            gsap.set(split.words, { y: "100%", willChange: "transform" });
                            introTL.fromTo(split.words,
                                { y: "100%" },
                                {
                                    y: "-5%", duration: 0.8, ease: "pageReveal", stagger: 0.06,
                                    onComplete: () => gsap.set(split.words, { willChange: "auto" }),
                                },
                                "<-0.1"
                            );
                            return introTL.recent();
                        },
                    });
                }

                if (para) {
                    introTL.fromTo(para,
                        { autoAlpha: 0, y: 40 },
                        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" },
                        "<0.4"
                    );
                }
            };

            const handleTransitions = (self) => {
                const body = self.querySelector(".at-outer");
                const bg = self.querySelector(".at-bg");
                const cardsContainer = self.querySelector(".at-cards");
                const cards = self.querySelectorAll(".at-cards .at-card");

                if (!body || !bg || !cardsContainer || !cards.length) return;

                const mm = gsap.matchMedia();

                mm.add("(min-width: 768px)", () => {
                    gsap.set(cardsContainer, { height: 0 });
                    gsap.set(cards, { y: "100vh" });

                    const BG_DUR = 0.8;
                    const CONTAINER_DUR = 0.8;
                    const CARD_DUR = 1.4;
                    const TOTAL_CARDS_DUR = cards.length * CARD_DUR;
                    const HOLD_DUR = 0.5 * 2;
                    const TOTAL_DURATION = BG_DUR + CONTAINER_DUR + TOTAL_CARDS_DUR + HOLD_DUR;

                    const tl = gsap.timeline({
                        scrollTrigger: {
                            trigger: body,
                            start: "top top",
                            end: () => "+=" + (TOTAL_DURATION * PX_PER_SEC_DESKTOP),
                            pin: true,
                            pinSpacing: true,
                            scrub: 1,
                            invalidateOnRefresh: true,
                            // markers: true
                        }
                    });

                    tl.fromTo(bg, { "--frame-p": 1 }, {
                        "--frame-p": 0,
                        duration: BG_DUR,
                        ease: "none"
                    })

                    tl.to({}, { duration: HOLD_DUR });

                    tl.to(cardsContainer, {
                        height: "auto",
                        overflow: "visible",
                        duration: CONTAINER_DUR,
                        ease: "power1.out"
                    })

                    tl.to(cards, {
                        y: 0,
                        duration: CARD_DUR,
                        stagger: 0.2,
                        ease: "power1.out"
                    }, "<0.2");

                    tl.to({}, { duration: HOLD_DUR });
                });

                mm.add("(max-width: 767.98px)", () => {
                    const BG_DUR = 0.8;
                    const CARDS_DUR = 3;
                    const HOLD_DUR = 0.5;

                    const TOTAL_MOBILE_DURATION = BG_DUR + CARDS_DUR + HOLD_DUR;

                    gsap.set(cardsContainer, {
                        position: 'absolute',
                        padding: 0,
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        yPercent: 100
                    });

                    const tl = gsap.timeline({
                        scrollTrigger: {
                            trigger: body,
                            start: "top top",
                            end: () => "+=" + (TOTAL_MOBILE_DURATION * PX_PER_SEC_MOBILE),
                            pin: true,
                            pinSpacing: true,
                            scrub: 1,
                            invalidateOnRefresh: true,
                        }
                    });

                    tl.fromTo(bg, { "--frame-p": 1 }, {
                        "--frame-p": 0,
                        duration: BG_DUR,
                        ease: "power1.out"
                    })

                    tl.to({}, { duration: HOLD_DUR });

                    tl.to(cardsContainer, {
                        yPercent: -10,
                        duration: CARDS_DUR,
                        ease: "power1.out"
                    }, "<0.2");
                });
            };

            script();
        },

        systemOverview() {
            const PX_PER_SEC_DESKTOP = 550;
            const PX_PER_SEC_MOBILE = 280;

            const script = () => {
                const els = document.querySelectorAll("section.system-overview");
                if (!els.length) return;

                els.forEach(self => {
                    handleEntrance(self);

                    const mm = gsap.matchMedia();

                    mm.add("(min-width: 992px)", () => buildScenes(self, PX_PER_SEC_DESKTOP));
                    mm.add("(max-width: 991.98px)", () => buildScenes(self, PX_PER_SEC_MOBILE));
                });
            };

            const buildScenes = (self, pxPerSec) => {
                const sceneContainer = self.querySelector(".so-scenes");
                if (!sceneContainer) return;

                let ctx = null;
                let lastWidth = window.innerWidth;

                const create = () => {
                    ctx?.revert();

                    ctx = gsap.context(() => {
                        const soTL = gsap.timeline();

                        handleSceneOne(self, soTL);
                        handleSceneTwo(self, soTL);
                        handleSceneThree(self, soTL);
                        handleSceneFour(self, soTL);

                        ScrollTrigger.create({
                            animation: soTL,
                            trigger: sceneContainer,
                            pin: sceneContainer,
                            start: "top top",
                            end: () => "+=" + soTL.duration() * pxPerSec,
                            pinSpacing: true,
                            scrub: 1,
                            invalidateOnRefresh: true,
                        });
                    }, self);
                };

                create();

                const handler = baunfire.Global.callAfterResize(() => {
                    if (window.innerWidth === lastWidth) return;

                    lastWidth = window.innerWidth;
                    create();
                    baunfire.Global.screenSizeChange();
                });

                this._soResize = handler;

                return () => {
                    removeEventListener("resize", handler);
                    if (this._soResize === handler) this._soResize = null;
                    ctx?.revert();
                };
            };

            const handleEntrance = (self) => {
                const sceneOne = self.querySelector(".so-scene.is-s1");
                if (!sceneOne) return;

                const contentContainer = sceneOne.querySelector(".so-content");

                const logo = sceneOne.querySelector(".so-icon");
                const heading = sceneOne.querySelector(".so-title");
                const para = sceneOne.querySelector(".so-para");

                const introTL = gsap.timeline({
                    scrollTrigger: {
                        trigger: contentContainer,
                        start: baunfire.anim.start,
                    }
                });

                if (logo) {
                    introTL.fromTo(logo,
                        { autoAlpha: 0, y: 40 },
                        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }
                    );
                }

                if (heading) {
                    SplitText.create(heading, {
                        type: "words",
                        mask: "words",
                        autoSplit: true,
                        onSplit(split) {
                            heading.style.visibility = "visible";
                            heading.style.opacity = "1";
                            gsap.set(split.words, { y: "100%", willChange: "transform" });
                            introTL.fromTo(split.words,
                                { y: "100%" },
                                {
                                    y: "-5%", duration: 0.8, ease: "pageReveal", stagger: 0.06,
                                    onComplete: () => gsap.set(split.words, { willChange: "auto" }),
                                },
                                "<-0.1"
                            );
                            return introTL.recent();
                        },
                    });
                }

                if (para) {
                    introTL.fromTo(para,
                        { autoAlpha: 0, y: 40 },
                        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" },
                        "<0.4"
                    );
                }
            };

            const handleSceneOne = (self, soTL) => {
                const sceneOne = self.querySelector(".so-scene.is-s1");
                const sceneTwo = self.querySelector(".so-scene.is-s2");
                if (!sceneOne || !sceneTwo) return;

                const box = sceneOne.querySelector(".so-box");
                const contentContainer = sceneOne.querySelector(".so-content");

                const generatorMain = sceneOne.querySelector(".so-gen.is-s1");
                const generatorShadow1 = sceneOne.querySelector(".so-gen-shadow.is-s1-shadow-1");
                const generatorShadow2 = sceneOne.querySelector(".so-gen-shadow.is-s1-shadow-2");
                const generatorS2No3 = sceneTwo.querySelector(".so-gen.is-s2.is-no-3");

                const panel = sceneOne.querySelector(".so-panel");

                soTL.to({}, { duration: 0.2 });

                soTL.fromTo(box,
                    {
                        "--frame-p": 1,
                    },
                    {
                        "--frame-p": 0,
                        duration: 0.8,
                        ease: "none",
                    }
                );

                soTL.to({}, { duration: 0.5 });

                if (contentContainer) {
                    soTL.to(contentContainer, {
                        yPercent: -100,
                        autoAlpha: 0,
                        ease: "power1.out",
                        duration: 1
                    });
                }

                soTL.add(
                    Flip.fit(generatorMain, generatorShadow1, {
                        duration: 1.2,
                        ease: "power1.out",
                    }),
                    "<0.3"
                );

                soTL.add(
                    Flip.fit(generatorMain, generatorShadow2, {
                        duration: 0.8,
                        ease: "power1.out",
                        scale: true
                    })
                );

                if (panel) {
                    soTL.fromTo(panel,
                        {
                            y: 80,
                            autoAlpha: 0,
                        },
                        {
                            y: 0,
                            autoAlpha: 1,
                            ease: "power1.out",
                            duration: 0.6,
                            onStart: () => {
                                baunfire.Global.handleTextCount(panel);
                            }
                        },
                        "<0.4"
                    );
                }

                soTL.add(
                    Flip.fit(generatorMain, generatorShadow2, {
                        duration: 0.8,
                        ease: "power1.out",
                        scale: true
                    })
                );

                soTL.add(
                    Flip.fit(generatorMain, generatorS2No3, {
                        duration: 0.8,
                        ease: "power1.out",
                        scale: true
                    })
                );

                if (panel) {
                    soTL.to(panel,
                        {
                            y: 80,
                            autoAlpha: 0,
                            ease: "power1.out",
                            duration: 0.6,
                        },
                        "<0.4"
                    );
                }

                soTL.set(sceneOne, { autoAlpha: 0, pointerEvents: "none" })
                soTL.set(sceneTwo, { autoAlpha: 1 })
            };

            const handleSceneTwo = (self, soTL) => {
                const sceneTwo = self.querySelector(".so-scene.is-s2");
                const sceneThree = self.querySelector(".so-scene.is-s3");
                if (!sceneTwo || !sceneThree) return;

                const generator1 = sceneTwo.querySelector(".so-gen.is-s2.is-no-1");
                const generator2 = sceneTwo.querySelector(".so-gen.is-s2.is-no-2");
                const generator3 = sceneTwo.querySelector(".so-gen.is-s2.is-no-3");
                const generator4 = sceneTwo.querySelector(".so-gen.is-s2.is-no-4");
                const generator5 = sceneTwo.querySelector(".so-gen.is-s2.is-no-5");

                const generatorContainer = sceneTwo.querySelector(".so-gens.is-s2.is-main");
                const generatorContainerShadow = sceneTwo.querySelector(".so-gens.is-s2.is-shadow");

                const generatorS2250kwMain = sceneTwo.querySelector(".so-gen2.is-s2.is-main");
                const generatorS2250kwShadow = sceneTwo.querySelector(".so-gen2.is-s2.is-shadow");
                const generatorS3250kw = sceneThree.querySelector(".so-gen2.is-s3");

                if (!generator1 || !generator2 || !generator3 || !generator4 || !generator5) return;
                if (!generatorContainer || !generatorContainerShadow) return;
                if (!generatorS2250kwMain || !generatorS2250kwShadow) return;

                const subGenerators = [generator1, generator2, generator4, generator5];

                const secondaryGenerators = [generator2, generator4];
                const secondaryOverlays = [generator2.querySelector(".so-gen-overlay"), generator4.querySelector(".so-gen-overlay")].filter(Boolean);

                const tertiaryGenerators = [generator1, generator5];
                const tertiaryOverlays = [generator1.querySelector(".so-gen-overlay"), generator5.querySelector(".so-gen-overlay")].filter(Boolean);

                const text = sceneTwo.querySelector(".so-scene-para");

                const secondaryGenStates = Flip.getState(secondaryGenerators, {
                    props: "transform,opacity",
                });

                const tertiaryGenStates = Flip.getState(tertiaryGenerators, {
                    props: "transform,opacity",
                });

                Flip.fit(generator1, generator2, { scale: true });
                Flip.fit(generator5, generator4, { scale: true });
                Flip.fit(generator2, generator3, { scale: true });
                Flip.fit(generator4, generator3, { scale: true });

                gsap.set(subGenerators, { opacity: 0 });

                soTL.add(
                    Flip.to(secondaryGenStates, {
                        duration: 0.8,
                        ease: "power1.out",
                        scale: true,
                    }),
                );

                soTL.fromTo(secondaryOverlays,
                    {
                        autoAlpha: 1
                    },
                    {
                        autoAlpha: 0,
                        ease: "power1.out",
                        duration: 0.8,
                    },
                    "<0.4"
                );

                soTL.add(
                    Flip.to(tertiaryGenStates, {
                        duration: 0.8,
                        ease: "power1.out",
                        scale: true,
                    }),
                    "<0.6"
                );

                soTL.fromTo(tertiaryOverlays,
                    {
                        autoAlpha: 1
                    },
                    {
                        autoAlpha: 0,
                        ease: "power1.out",
                        duration: 0.8,
                    },
                    "<0.4"
                );

                if (text) {
                    soTL.fromTo(text,
                        {
                            y: 40,
                            autoAlpha: 0,
                        },
                        {
                            y: 0,
                            autoAlpha: 1,
                            ease: "power1.out",
                            duration: 0.6,
                        },
                        "<-0.2"
                    );
                }

                soTL.to({}, { duration: 0.2 });

                soTL.add(
                    Flip.fit(generatorContainer, generatorContainerShadow, {
                        duration: 0.8,
                        ease: "power1.out",
                        scale: true,
                    })
                );

                if (text) {
                    soTL.to(text,
                        {
                            autoAlpha: 0,
                            ease: "power1.out",
                            duration: 0.4,
                        },
                        "<"
                    );
                }

                gsap.set(generatorS2250kwMain, { y: 0, yPercent: 100 });

                soTL.to(generatorS2250kwMain,
                    {
                        autoAlpha: 1,
                        ease: "power1.out",
                        duration: 0.8,
                    },
                    "<0.1"
                );

                soTL.add(
                    Flip.fit(generatorS2250kwMain, generatorS2250kwShadow, {
                        duration: 1,
                        ease: "power1.out",
                        scale: true
                    }),
                    "<"
                );

                soTL.set(sceneTwo, { autoAlpha: 0, pointerEvents: "none" })
                soTL.set(sceneThree, { autoAlpha: 1 })
            };

            const handleSceneThree = (self, soTL) => {
                const sceneThree = self.querySelector(".so-scene.is-s3");
                if (!sceneThree) return;

                const generatorS3Main = sceneThree.querySelector(".so-gen2.is-s3.is-main");
                const panel = sceneThree.querySelector(".so-panel");
                if (!generatorS3Main) return;

                gsap.set(generatorS3Main, { y: 0, yPercent: -50 });

                if (panel) {
                    soTL.fromTo(panel,
                        {
                            y: 80,
                            autoAlpha: 0,
                        },
                        {
                            y: 0,
                            autoAlpha: 1,
                            ease: "power1.out",
                            duration: 0.6,
                            onStart: () => {
                                baunfire.Global.handleTextCount(panel);
                            }
                        },
                        "<"
                    );
                }

                soTL.to({}, { duration: 0.5 });

                soTL.to(generatorS3Main,
                    {
                        yPercent: -300,
                        autoAlpha: 0,
                        ease: "power1.out",
                        duration: 2,
                    },
                );

                if (panel) {
                    soTL.to(panel,
                        {
                            yPercent: 100,
                            autoAlpha: 0,
                            ease: "power1.out",
                            duration: 0.8,
                        },
                        "<"
                    );
                }
            };

            const handleSceneFour = (self, soTL) => {
                const sceneFour = self.querySelector(".so-scene.is-s4");
                if (!sceneFour) return;

                gsap.set(sceneFour, { autoAlpha: 1 });

                const text = sceneFour.querySelector(".so-scene-para");
                const panel = sceneFour.querySelector(".so-panel");

                const generatorColMain = sceneFour.querySelector(".so-gen-col.is-main");
                const generatorColShadow = sceneFour.querySelector(".so-gen-col.is-shadow");
                const generatorColShadow2 = sceneFour.querySelector(".so-gen-col.is-shadow-2");

                const generator2MWMain = sceneFour.querySelector(".so-gen3.is-main");
                const generator2MWShadow = sceneFour.querySelector(".so-gen3.is-shadow");

                if (!generatorColMain || !generatorColShadow || !generatorColShadow2) return;
                if (!generator2MWMain || !generator2MWShadow) return;

                const CELL_DUR = 0.8;

                const fitToShadow = (mainEl, shadowEl, vars = {}) =>
                    Flip.fit(mainEl, shadowEl, {
                        duration: 0.8,
                        ease: "power1.out",
                        scale: true,
                        ...vars
                    });

                const animateCell = (mainEl, shadowEl, pos) => {
                    if (!mainEl || !shadowEl) return;

                    const overlay = mainEl.querySelector(".so-gen-overlay");
                    soTL.add(fitToShadow(mainEl, shadowEl, { duration: CELL_DUR }), pos);
                    soTL.fromTo(mainEl,
                        { autoAlpha: 0 },
                        { autoAlpha: 1, duration: CELL_DUR, ease: "power1.out" },
                        "<"
                    );

                    if (overlay) {
                        soTL.fromTo(overlay,
                            { autoAlpha: 1 },
                            { autoAlpha: 0, duration: CELL_DUR, ease: "power4.in" },
                            "<"
                        );
                    }
                };

                const collapseRowCells = (row, pos) => {
                    if (!row) return;

                    const cellMain = (n) => row.querySelector(`.so-gen-cell.is-no-${n}.is-main`);
                    const cellShadow = (n) => row.querySelector(`.so-gen-cell.is-no-${n}.is-shadow`);

                    animateCell(cellMain(3), cellShadow(3), pos);
                    animateCell(cellMain(2), cellShadow(2), "<0.15");
                    animateCell(cellMain(10), cellShadow(10), "<");
                    animateCell(cellMain(1), cellShadow(1), "<0.15");
                    animateCell(cellMain(9), cellShadow(9), "<");
                };

                const ROW_GAP = 0.04;
                const CELL_LEAD = 0.15;
                const CASCADE_START = 0.3;
                const PHASE_GAP = -0.3;
                const CELL_ROW_GAP = 0.15;

                const s1 = "s1GenStart";
                const SCENE_OVERLAP = "<1";
                soTL.addLabel(s1, SCENE_OVERLAP);

                soTL.add(fitToShadow(generatorColMain, generatorColShadow, { duration: 0.8 }), s1);

                const rows = [1, 2, 3, 4].map((n) => ({
                    main: sceneFour.querySelector(`.so-gens-row.is-no-${n}.is-main`),
                    shadow: sceneFour.querySelector(`.so-gens-row.is-no-${n}.is-shadow`)
                }));

                let rowsEnd = CASCADE_START;

                rows.forEach((row, i) => {
                    const rowAt = CASCADE_START + ROW_GAP * i;

                    if (row.main && row.shadow) {
                        soTL.add(fitToShadow(row.main, row.shadow), `${s1}+=${rowAt}`);
                        soTL.fromTo(row.main,
                            { autoAlpha: 0 },
                            { autoAlpha: 1, duration: 0.6, ease: "power1.out" },
                            "<"
                        );
                    }

                    rowsEnd = rowAt + 0.6;
                });

                const cellsStart = rowsEnd + PHASE_GAP;

                rows.forEach((row, i) => {
                    const cellsAt = cellsStart + CELL_ROW_GAP * i;
                    collapseRowCells(row.main, `${s1}+=${cellsAt}`);
                });

                if (text) {
                    soTL.fromTo(text,
                        {
                            y: 40,
                            autoAlpha: 0,
                        },
                        {
                            y: 0,
                            autoAlpha: 1,
                            ease: "power1.out",
                            duration: 0.6,
                        },
                        "<0.4"
                    );
                }

                soTL.to({}, { duration: 0.5 });

                soTL.add(
                    Flip.fit(generatorColMain, generatorColShadow2, {
                        duration: 0.8,
                        ease: "power1.out",
                        scale: true
                    })
                );

                if (text) {
                    soTL.to(text,
                        {
                            autoAlpha: 0,
                            ease: "power1.out",
                            duration: 0.6
                        },
                        "<0.2"
                    );
                }

                soTL.to(generator2MWMain,
                    {
                        autoAlpha: 1,
                        ease: "power1.out",
                        duration: 0.6,
                    },
                    "<0.2"
                );

                soTL.add(
                    Flip.fit(generator2MWMain, generator2MWShadow, {
                        duration: 1,
                        ease: "power1.out",
                        scale: true
                    }),
                    "<0.2"
                );

                if (panel) {
                    soTL.fromTo(panel,
                        {
                            y: 80,
                            autoAlpha: 0,
                        },
                        {
                            y: 0,
                            autoAlpha: 1,
                            ease: "power1.out",
                            duration: 0.6,
                            onStart: () => {
                                baunfire.Global.handleTextCount(panel);
                            }
                        },
                        "<"
                    );
                }

                soTL.to({}, { duration: 0.5 });

                soTL.set(generatorColMain, { autoAlpha: 0 });

                if (panel) {
                    soTL.to(panel,
                        {
                            autoAlpha: 0,
                            ease: "power1.out",
                            duration: 0.8,
                        },
                    );
                }

                // soTL.to(generator2MWMain,
                //     {
                //         autoAlpha: 0,
                //         ease: "power1.out",
                //         duration: 0.6,
                //     },
                //     "<0.2"
                // );

                // soTL.set(sceneFive, { autoAlpha: 1 })
            };

            script();
        },

        densePower() {
            const PX_PER_SEC_DESKTOP = 620;
            const LEAD_DUR = 0.6;
            const SWAP_DUR = 1;
            const STEP_HOLD = 0.5;
            const HOLD_DUR = 0.6;
            const LIFT = 32;
            const WRAPPER_SHIFT = -64;

            const script = () => {
                const els = document.querySelectorAll("section.dense-power");
                if (!els.length) return;

                els.forEach(self => {
                    handleEntrance(self);
                    handleAnimation(self);
                });
            };

            const handleEntrance = (self) => {
                const header = self.querySelector(".dp-header");
                if (!header) return;

                const logo = header.querySelector(".dp-icon");
                const heading = header.querySelector(".dp-title");
                const para = header.querySelector(".dp-head-para");

                const introTL = gsap.timeline({
                    scrollTrigger: {
                        trigger: header,
                        start: baunfire.anim.start,
                        once: true,
                    }
                });

                if (logo) {
                    introTL.fromTo(logo,
                        { autoAlpha: 0, y: 40 },
                        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }
                    );
                }

                if (heading) {
                    SplitText.create(heading, {
                        type: "words",
                        mask: "words",
                        autoSplit: true,
                        onSplit(split) {
                            heading.style.visibility = "visible";
                            heading.style.opacity = "1";
                            gsap.set(split.words, { y: "100%", willChange: "transform" });
                            introTL.fromTo(split.words,
                                { y: "100%" },
                                {
                                    y: "-5%", duration: 0.8, ease: "pageReveal", stagger: 0.06,
                                    onComplete: () => gsap.set(split.words, { willChange: "auto" }),
                                },
                                "<-0.1"
                            );
                            return introTL.recent();
                        },
                    });
                }

                if (para) {
                    introTL.fromTo(para,
                        { autoAlpha: 0, y: 40 },
                        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" },
                        "<0.4"
                    );
                }
            };

            const handleAnimation = (self) => {
                const body = self.querySelector(".dp-content-inner");
                const title = self.querySelector(".dp-c-title");
                const cardsWrapper = self.querySelector(".dp-cards-wrapper");
                const cards = gsap.utils.toArray(".dp-card", self);

                if (!body || !title || !cardsWrapper || cards.length < 2) return;

                const mm = gsap.matchMedia();

                mm.add("(min-width: 992px)", () => {
                    const images = cards.map(card => card.querySelector(".dp-c-img-wrap")).filter(Boolean);
                    const contents = cards.map(card => card.querySelector(".dp-c-content")).filter(Boolean);

                    if (images.length !== cards.length || contents.length !== cards.length) return;

                    gsap.set(cards, { autoAlpha: 1 });
                    gsap.set(images.slice(1), { autoAlpha: 0 });
                    gsap.set(contents.slice(1), { autoAlpha: 0, y: LIFT });
                    gsap.set(cardsWrapper, { y: 0 });

                    const dpTL = gsap.timeline();

                    dpTL.to({}, { duration: LEAD_DUR });

                    let at = LEAD_DUR;

                    dpTL.to([title, contents[0]], {
                        y: -LIFT,
                        autoAlpha: 0,
                        duration: SWAP_DUR * 0.5,
                        ease: "power2.out",
                    }, at);

                    dpTL.to(cardsWrapper, {
                        y: WRAPPER_SHIFT,
                        duration: SWAP_DUR,
                        ease: "power2.out",
                    }, at);

                    for (let i = 1; i < cards.length; i++) {
                        dpTL.to(images[i], {
                            autoAlpha: 1,
                            duration: SWAP_DUR * 0.6,
                            ease: "power1.inOut",
                        }, at);

                        dpTL.to(images[i - 1], {
                            autoAlpha: 0,
                            duration: SWAP_DUR * 0.6,
                            ease: "power1.inOut",
                        }, at);

                        if (i > 1) {
                            dpTL.to(contents[i - 1], {
                                y: -LIFT,
                                autoAlpha: 0,
                                duration: SWAP_DUR * 0.4,
                                ease: "power2.out",
                            }, at);
                        }

                        dpTL.to(contents[i], {
                            y: 0,
                            autoAlpha: 1,
                            duration: SWAP_DUR * 0.6,
                            ease: "power2.out",
                        }, at + SWAP_DUR * 0.4);

                        at += SWAP_DUR + STEP_HOLD;
                    }

                    dpTL.to({}, { duration: HOLD_DUR }, at);

                    ScrollTrigger.create({
                        animation: dpTL,
                        trigger: body,
                        start: "top top",
                        end: () => "+=" + dpTL.duration() * PX_PER_SEC_DESKTOP,
                        pin: true,
                        pinSpacing: true,
                        scrub: 1,
                        invalidateOnRefresh: true,
                    });
                });
            };
            
            script();
        },

        systemDetailPopup() {
            const script = () => {
                const els = document.querySelectorAll("section.system-detail-popup");
                if (!els.length) return;

                els.forEach(self => {
                    handleEntrance(self);
                    handleDialogs(self);
                });
            };

            const handleEntrance = (self) => {
                const logo = self.querySelector(".sdp-icon");
                const heading = self.querySelector(".sdp-title");
                const para = self.querySelector(".sdp-para");

                const introTL = gsap.timeline({
                    scrollTrigger: {
                        trigger: self,
                        start: baunfire.anim.start,
                    }
                });

                if (logo) {
                    introTL.fromTo(logo,
                        { autoAlpha: 0, y: 40 },
                        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }
                    );
                }

                if (heading) {
                    SplitText.create(heading, {
                        type: "words",
                        mask: "words",
                        autoSplit: true,
                        onSplit(split) {
                            heading.style.visibility = "visible";
                            heading.style.opacity = "1";
                            gsap.set(split.words, { y: "100%", willChange: "transform" });
                            introTL.fromTo(split.words,
                                { y: "100%" },
                                {
                                    y: "-5%", duration: 0.8, ease: "pageReveal", stagger: 0.06,
                                    onComplete: () => gsap.set(split.words, { willChange: "auto" }),
                                },
                                "<-0.1"
                            );
                            return introTL.recent();
                        },
                    });
                }

                if (para) {
                    introTL.fromTo(para,
                        { autoAlpha: 0, y: 40 },
                        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" },
                        "<0.4"
                    );
                }
            };

            const handleDialogs = (self) => {
                const triggers = self.querySelectorAll(".sdp-trigger");
                const dialogInners = self.querySelectorAll(".sdp-dialog-inner");
                if (!triggers.length || !dialogInners.length) return;

                const deactivateInners = () => {
                    dialogInners.forEach(inner => inner.classList.remove("active"));
                };

                const tabs = self.querySelectorAll(".sdp-l-tab");
                const tabByKey = new Map();
                tabs.forEach(tab => tabByKey.set(tab.dataset.key, tab));

                const innerByKey = new Map();
                dialogInners.forEach(inner => innerByKey.set(inner.dataset.key, inner));

                tabs.forEach(tab => {
                    const dialogInner = innerByKey.get(tab.dataset.key);
                    if (!dialogInner) return;

                    const num = dialogInner.querySelector(".sdp-stat-num");

                    tab.addEventListener('click', () => {
                        deactivateInners();
                        baunfire.Global.handleTextCount(num, 0.6);
                        dialogInner.classList.add("active");
                        dialogInner.scrollTop = 0;
                    });
                });

                triggers.forEach(trigger => {
                    const rawKey = trigger.dataset.key;
                    const isGen = rawKey.includes('gen');
                    const key = isGen ? 'generator' : rawKey;

                    const dialog = self.querySelector(`dialog[data-key='${key}']`);
                    if (!dialog) return;

                    const close = dialog.querySelector(".sdp-dialog-close");

                    trigger.addEventListener('click', () => {
                        if (isGen) {
                            tabByKey.get(rawKey)?.click();
                        }

                        baunfire.Global.siteScrolling(false);
                        dialog.showModal();
                    });

                    close?.addEventListener('click', () => {
                        dialog.close();
                        baunfire.Global.siteScrolling(true);
                    });
                });
            };

            script();
        },

        contentGridItems() {
            const script = () => {
                const els = document.querySelectorAll("section.content-grid-items");
                if (!els.length) return;

                els.forEach(self => {
                    const activePanel = handleTabs(self);
                    handleEntrance(self, activePanel);
                });

                baunfire.Global.screenSizeChange();
            }

            const handleEntrance = (self, activePanel) => {
                const heading = self.querySelector(".cgi-heading");
                const para = self.querySelector(".cgi-para");
                const tabContainer = self.querySelector(".cgi-tabs");
                const panelsContainer = self.querySelector(".cgi-panels");

                const introTL = gsap.timeline({
                    scrollTrigger: {
                        trigger: self,
                        start: baunfire.anim.start,
                        once: true,
                    }
                });

                if (heading) {
                    SplitText.create(heading, {
                        type: "words",
                        mask: "words",
                        autoSplit: true,
                        onSplit(split) {
                            heading.style.visibility = "visible";
                            heading.style.opacity = "1";
                            gsap.set(split.words, { y: "100%", willChange: "transform" });
                            introTL.fromTo(split.words,
                                { y: "100%" },
                                {
                                    y: "-5%", duration: 0.8, ease: "power3.out", stagger: 0.06,
                                    onComplete: () => gsap.set(split.words, { willChange: "auto" }),
                                },
                            );
                            return introTL.recent();
                        },
                    });
                }

                if (para) {
                    introTL.fromTo(para,
                        { autoAlpha: 0, y: 40 },
                        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" },
                        "<0.4"
                    );
                }

                if (tabContainer) {
                    introTL.fromTo(tabContainer,
                        { autoAlpha: 0 },
                        { autoAlpha: 1, duration: 0.6, ease: "power3.out" },
                        "<0.2"
                    );
                }

                if (panelsContainer) {
                    introTL.fromTo(panelsContainer,
                        { autoAlpha: 0 },
                        {
                            autoAlpha: 1, duration: 0.6, ease: "power3.out",
                        },
                        "<0.1"
                    );

                }
            };

            const handleTabs = (self) => {
                const tabs = [...self.querySelectorAll('.cgi-tab[target]')];
                const panels = [...self.querySelectorAll('.cgi-panel[panel-key]')];
                if (!tabs.length || !panels.length) return null;

                tabs[0].classList.add("active");
                panels[0].classList.add("active");

                tabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        if (tab.classList.contains('active')) return;
                        const targetId = tab.getAttribute('target');
                        updateTabsPanels(targetId, tab, tabs, panels);
                    });
                });

                const updateTabsPanels = (targetId, tab, tabs, panels) => {
                    const activePanel = panels.find(panel => panel.getAttribute('panel-key') === targetId);
                    if (!activePanel) return;

                    panels.forEach(panel => panel.classList.remove('active'));
                    tabs.forEach(panel => panel.classList.remove('active'));

                    tab.classList.add('active');
                    activePanel.classList.add('active');

                    baunfire.Global.screenSizeChange();
                };

                return panels[0];
            };

            script();
        },

        wideImageBanner() {
            const script = () => {
                const els = document.querySelectorAll("section.wide-image-banner");
                if (!els.length) return;

                els.forEach(self => {
                    handleEntrance(self);
                });
            }

            const handleEntrance = (self) => {
                const logo = self.querySelector(".wib-icon");
                const heading = self.querySelector(".wib-title");
                const para = self.querySelector(".wib-para");
                const cta = self.querySelector(".g-btn");

                const introTL = gsap.timeline({
                    scrollTrigger: {
                        trigger: self,
                        start: baunfire.anim.start,
                        once: true,
                    }
                });

                if (logo) {
                    introTL.fromTo(logo,
                        { autoAlpha: 0, y: 40 },
                        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }
                    );
                }

                if (heading) {
                    SplitText.create(heading, {
                        type: "words",
                        mask: "words",
                        autoSplit: true,
                        onSplit(split) {
                            heading.style.visibility = "visible";
                            heading.style.opacity = "1";
                            gsap.set(split.words, { y: "100%", willChange: "transform" });
                            introTL.fromTo(split.words,
                                { y: "100%" },
                                {
                                    y: "-5%", duration: 0.8, ease: "power3.out", stagger: 0.06,
                                    onComplete: () => gsap.set(split.words, { willChange: "auto" }),
                                },
                                "<0.2"
                            );
                            return introTL.recent();
                        },
                    });
                }

                if (para) {
                    introTL.fromTo(para,
                        { autoAlpha: 0, y: 40 },
                        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" },
                        "<0.4"
                    );
                }

                if (cta) {
                    introTL.fromTo(cta,
                        { autoAlpha: 0, y: 40 },
                        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" },
                        "<0.2"
                    );
                }
            };

            script();
        },

        contactBanner() {
            const script = () => {
                const els = document.querySelectorAll("section.contact-banner");
                if (!els.length) return;

                els.forEach(self => {
                    handleEntrance(self);
                });
            }

            const handleEntrance = (self) => {
                const heading = self.querySelector(".cb-title");
                const para = self.querySelector(".cb-para");

                const introTL = gsap.timeline({
                    scrollTrigger: {
                        trigger: self,
                        start: baunfire.anim.start,
                        once: true,
                    }
                });

                if (heading) {
                    SplitText.create(heading, {
                        type: "words",
                        mask: "words",
                        autoSplit: true,
                        onSplit(split) {
                            heading.style.visibility = "visible";
                            heading.style.opacity = "1";
                            gsap.set(split.words, { y: "100%", willChange: "transform" });
                            introTL.fromTo(split.words,
                                { y: "100%" },
                                {
                                    y: "-5%", duration: 0.8, ease: "power3.out", stagger: 0.06,
                                    onComplete: () => gsap.set(split.words, { willChange: "auto" }),
                                },
                            );
                            return introTL.recent();
                        },
                    });
                }

                if (para) {
                    introTL.fromTo(para,
                        { autoAlpha: 0, y: 40 },
                        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" },
                        "<0.4"
                    );
                }
            };

            script();
        },

        heroWithGallery() {
            const script = () => {
                const els = document.querySelectorAll("section.hero-with-gallery");
                if (!els.length) return;

                els.forEach(self => {
                    handleEntrance(self);
                    handleImages(self);
                });
            };

            const handleEntrance = (self) => {
                const mainHeading = self.querySelector(".g-heading");
                if (!mainHeading) return;

                const splitTextsProps = {
                    duration: 0.8,
                    stagger: 0.06
                }

                if (mainHeading) {
                    SplitText.create(mainHeading, {
                        type: "words",
                        mask: "words",
                        autoSplit: true,
                        onSplit(split) {
                            mainHeading.style.visibility = "visible";
                            mainHeading.style.opacity = "1";
                            gsap.set(split.words, { y: "100%", willChange: "transform" });
                            return gsap.fromTo(split.words,
                                { y: "100%" },
                                {
                                    y: "-5%",
                                    delay: 0.6,
                                    duration: splitTextsProps.duration,
                                    ease: "pageReveal",
                                    stagger: splitTextsProps.stagger,
                                    onComplete: () => gsap.set(split.words, { willChange: "auto" }),
                                }
                            );
                        },
                    });
                }
            };

            const handleImages = (self) => {
                const container = self.querySelector(".hwg-imgs");
                const imgsInner = self.querySelector(".hwg-imgs-inner");

                if (!container || !imgsInner) return;

                gsap.to(imgsInner, {
                    x: () => moveX(imgsInner, container),
                    ease: "none",
                    scrollTrigger: {
                        trigger: self,
                        start: "top top",
                        end: "bottom 20%",
                        scrub: 1,
                        invalidateOnRefresh: true
                    },
                });
            }

            const moveX = (imgsInner, container) => {
                const val = Math.max(0, imgsInner.scrollWidth - container.clientWidth);
                return val * -1;
            };

            script();
        },

        heroFiftyFifty() {
            const script = () => {
                const els = document.querySelectorAll("section.hero-fifty-fifty");
                if (!els.length) return;

                els.forEach(self => {
                    handleEntrance(self);
                });
            }

            const handleEntrance = (self) => {
                const mainHeading = self.querySelector(".g-heading");

                const splitTextsProps = {
                    duration: 0.8,
                    stagger: 0.06
                }

                if (mainHeading) {
                    SplitText.create(mainHeading, {
                        type: "words",
                        mask: "words",
                        autoSplit: true,
                        onSplit(split) {
                            mainHeading.style.visibility = "visible";
                            mainHeading.style.opacity = "1";
                            gsap.set(split.words, { y: "100%", willChange: "transform" });
                            return gsap.fromTo(split.words,
                                { y: "100%" },
                                {
                                    y: "-5%",
                                    delay: 0.6,
                                    duration: splitTextsProps.duration,
                                    ease: "pageReveal",
                                    stagger: splitTextsProps.stagger,
                                    onComplete: () => gsap.set(split.words, { willChange: "auto" }),
                                }
                            );
                        },
                    });
                }
            };

            script();
        },

        heroContact() {
            const script = () => {
                const els = document.querySelectorAll("section.hero-contact");
                if (!els.length) return;

                els.forEach(self => {
                    handleEntrance(self);
                });
            }

            const handleEntrance = (self) => {
                const mainHeading = self.querySelector(".g-heading");

                const splitTextsProps = {
                    duration: 0.8,
                    stagger: 0.06
                }

                if (mainHeading) {
                    SplitText.create(mainHeading, {
                        type: "words",
                        mask: "words",
                        autoSplit: true,
                        onSplit(split) {
                            mainHeading.style.visibility = "visible";
                            mainHeading.style.opacity = "1";
                            gsap.set(split.words, { y: "100%", willChange: "transform" });
                            return gsap.fromTo(split.words,
                                { y: "100%" },
                                {
                                    y: "-5%",
                                    delay: 0.6,
                                    duration: splitTextsProps.duration,
                                    ease: "pageReveal",
                                    stagger: splitTextsProps.stagger,
                                    onComplete: () => gsap.set(split.words, { willChange: "auto" }),
                                }
                            );
                        },
                    });
                }
            };

            script();
        },

        richtextContent() {
            const script = () => {
                const els = document.querySelectorAll("section.rich-text-content");
                if (!els.length) return;

                els.forEach(self => {
                    handleEntrance(self);
                });
            }

            const handleEntrance = (self) => {
                const mainHeading = self.querySelector(".g-heading");

                const splitTextsProps = {
                    duration: 0.8,
                    stagger: 0.06
                }

                if (mainHeading) {
                    SplitText.create(mainHeading, {
                        type: "words",
                        mask: "words",
                        autoSplit: true,
                        onSplit(split) {
                            mainHeading.style.visibility = "visible";
                            mainHeading.style.opacity = "1";
                            gsap.set(split.words, { y: "100%", willChange: "transform" });
                            return gsap.fromTo(split.words,
                                { y: "100%" },
                                {
                                    y: "-5%",
                                    delay: 0.6,
                                    duration: splitTextsProps.duration,
                                    ease: "power2.inOut",
                                    stagger: splitTextsProps.stagger,
                                    onComplete: () => gsap.set(split.words, { willChange: "auto" }),
                                }
                            );
                        },
                    });
                }
            };

            script();
        },

        largeText() {
            const script = () => {
                const els = document.querySelectorAll("section.large-text");
                if (!els.length) return;

                els.forEach(self => {
                    handleTextAnim(self);
                });
            };

            const handleTextAnim = (self) => {
                const text = self.querySelector(".lt-para");
                if (!text) return;

                SplitText.create(text, {
                    type: "words",
                    mask: "words",
                    autoSplit: true,
                    onSplit(split) {
                        text.style.visibility = "visible";
                        text.style.opacity = "1";

                        gsap.set(split.words, { y: "100%", willChange: "transform" });

                        return gsap.fromTo(
                            split.words,
                            {
                                y: "100%",
                            },
                            {
                                y: "-5%",
                                duration: 0.8,
                                ease: "pageReveal",
                                stagger: { amount: 0.6, from: "start" },
                                scrollTrigger: {
                                    trigger: self,
                                    start: baunfire.anim.start,
                                    once: true,
                                },
                                onComplete: () => {
                                    gsap.set(split.words, { willChange: "auto" });
                                },
                            }
                        );
                    },
                });
            };

            script();
        },

        resourcesGrid() {
            let dataPromise;

            const fetchData = () => dataPromise ??= fetch(COLLECTION_ENDPOINTS.resources.dataURL).then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            });

            const script = () => {
                const els = document.querySelectorAll("section.resources-grid");
                if (!els.length) return;

                els.forEach((self) => {
                    const container = self.querySelector(".cl-container");
                    const grid = container?.querySelector(".cl-c-inner");

                    if (!grid) return;

                    const resData = {
                        parent: self,
                        container: container,
                        grid: grid,
                        items: [],
                        tabs: self.querySelectorAll(".rg-tab"),
                        loadMore: self.querySelector(".rg-load-more"),
                        emptyText: self.querySelector(".cl-empty"),
                        activeCategory: null,
                        itemsPerPage: 3,
                        currentPage: 1,
                    };

                    getData(resData);
                });
            };

            const getData = (resData) => {
                const { container } = resData;

                if (COLLECTION_ENDPOINTS.resources.data) {
                    fetchData()
                        .then((data) => {
                            COLLECTION_ENDPOINTS.resources.data = data;
                            container.classList.add("loaded");

                            renderGrid(resData, data);
                            initializeFilter(resData);
                            initializeLoadMore(resData);
                            applyFilter(resData);
                            updateDisplay(resData, true);
                        })
                        .catch((err) => {
                            console.error("load failed", err);
                            container.classList.add("loaded");
                        });
                } else {
                    const data = COLLECTION_ENDPOINTS.resources.data;
                    renderGrid(resData, data);
                    initializeFilter(resData);
                    initializeLoadMore(resData);
                    applyFilter(resData);
                    updateDisplay(resData, true);
                }
            };

            const generateCard = (d) => `
                <div class="rg-card" data-category="${d.categorySlug}">
                    <a href="${window.location.origin}/${COLLECTION_ENDPOINTS.resources.slug}/${d.slug || '#'}" class="rg-card-inner w-inline-block">
                        <div class="rg-img-c">
                            <img loading="lazy" data-src="${d.image}" alt="resource-card-image" class="rg-img">
                        </div>

                        <div class="rg-content">
                            <div class="rg-c-inner">
                                <div class="rg-title-c">
                                    <p class="rg-eyebrow g-eyebrow">${d.categoryName}</p>
                                    <p class="rg-title g-p-lg">${d.name}</p>
                                </div>
                                <p class="rg-c-para g-p-sm">${d.excerpt}</p>
                            </div>

                            <div class="rg-cta-c">
                                <div class="g-btn">
                                    <div class="g-btn-inner">
                                        <div class="g-btn-text">Read more</div>
                                        <div class="g-btn-arrows">
                                            <div class="g-btn-arrow w-embed">
                                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M0.717547 10L0 9.28245L8.26763 1.01482L2.89597 1.0149V7.90008e-07H9.99989V7.10392H8.98499V1.73225L0.717547 10Z" fill="#f1b510"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>
            `;

            const renderGrid = (resData, data) => {
                const { grid } = resData;
                grid.innerHTML = data.map(generateCard).join("");
                resData.items = Array.from(grid.querySelectorAll(".rg-card"));
            };

            const initializeFilter = (resData) => {
                const { tabs } = resData;
                if (!tabs.length) return;

                tabs[0].classList.add("active");

                tabs.forEach((tab) => {
                    tab.addEventListener("click", () => {
                        const category = tab.dataset.category;

                        tabs.forEach((t) => t.classList.toggle("active", t === tab));

                        resData.activeCategory = category !== "all" ? category : null;
                        resData.currentPage = 1;
                        applyFilter(resData);
                        updateDisplay(resData);
                    });
                });
            };

            const applyFilter = (resData) => {
                const { items, activeCategory } = resData;

                items.forEach((item) => {
                    const matchesFilter = !activeCategory || item.dataset.category === activeCategory;
                    item.classList.toggle("in-listing", matchesFilter);
                });
            };

            const initializeLoadMore = (resData) => {
                const { loadMore } = resData;
                if (!loadMore) return;

                loadMore.addEventListener("click", () => {
                    resData.currentPage++;
                    updateDisplay(resData);
                });
            };

            const updateDisplay = (resData, isInitial = false) => {
                const { items, itemsPerPage, currentPage, emptyText } = resData;

                const filteredItems = items.filter((item) => item.classList.contains("in-listing"));
                const totalItems = filteredItems.length;

                emptyText?.classList.remove("active");
                items.forEach((item) => item.classList.remove("is-active"));

                if (totalItems === 0) {
                    emptyText?.classList.add("active");
                    hideLoadMore(resData);
                    baunfire.Global.screenSizeChange();
                    return;
                }

                const visibleCount = Math.min(currentPage * itemsPerPage, totalItems);
                const visibleItems = filteredItems.slice(0, visibleCount);
                visibleItems.forEach((item) => item.classList.add("is-active"));

                if (visibleCount < totalItems) {
                    showLoadMore(resData);
                } else {
                    hideLoadMore(resData);
                }

                baunfire.Global.screenSizeChange();

                loadImages(visibleItems);
            };

            const loadImages = (items) => {
                items.forEach((item) => {
                    const image = item.querySelector(".rg-img[data-src]");
                    if (!image) return;
                    image.src = image.dataset.src;
                    image.removeAttribute("data-src");
                    image.closest(".rg-img-c")?.classList.add("active");
                });
            };

            const showLoadMore = (resData) => {
                if (resData.loadMore) resData.loadMore.classList.add("active");
            };

            const hideLoadMore = (resData) => {
                if (resData.loadMore) resData.loadMore.classList.remove("active");
            };

            script();
        },

        resourcesDetailPage() {
            const script = () => {
                const els = document.querySelectorAll("section.res-container");
                if (!els.length) return;

                els.forEach(self => {
                    handleEntrance(self);
                });
            }

            const handleEntrance = (self) => {
                const mainHeading = self.querySelector(".res-title");

                const splitTextsProps = {
                    duration: 0.8,
                    stagger: 0.06
                }

                if (mainHeading) {
                    SplitText.create(mainHeading, {
                        type: "words",
                        mask: "words",
                        autoSplit: true,
                        onSplit(split) {
                            mainHeading.style.visibility = "visible";
                            mainHeading.style.opacity = "1";
                            gsap.set(split.words, { y: "100%", willChange: "transform" });
                            return gsap.fromTo(split.words,
                                { y: "100%" },
                                {
                                    y: "-5%",
                                    delay: 0.6,
                                    duration: splitTextsProps.duration,
                                    ease: "power2.inOut",
                                    stagger: splitTextsProps.stagger,
                                    onComplete: () => gsap.set(split.words, { willChange: "auto" }),
                                }
                            );
                        },
                    });
                }
            };

            script();
        },

        teamGrid() {
            const script = () => {
                const els = document.querySelectorAll("section.team-grid");
                if (!els.length) return;

                els.forEach(self => {
                    const cards = self.querySelectorAll(".tg-card");
                    const data = readData(self);

                    cards.forEach((card, i) => {
                        const dialog = createDialog(data[i]);
                        card.append(dialog);

                        const trigger = card.querySelector(".team-popup-trigger");
                        const close = dialog.querySelector(".team-popup-close");

                        trigger?.addEventListener("click", () => {
                            baunfire.Global.siteScrolling(false);
                            loadImage(card);
                            dialog.showModal();
                        });

                        close?.addEventListener("click", () => {
                            baunfire.Global.siteScrolling(true);
                            dialog.close();
                        });
                    });
                });
            };

            const readData = (self) => {
                return [...self.querySelectorAll(".tg-card")].map((item) => ({
                    img: item.querySelector(".tg-c-img")?.src ?? "",
                    name: item.querySelector(".tg-c-name")?.textContent.trim() ?? "",
                    position: item.querySelector(".tg-c-position")?.textContent.trim() ?? "",
                    linkedin: item.querySelector(".tg-shadow-linkedin")?.textContent.trim() ?? "",
                    bio: item.querySelector(".tg-shadow-bio")?.innerHTML.trim() ?? "",
                    tags: item.querySelector(".tg-shadow-tags")?.textContent.split(",").map(tag => tag.trim()).filter(Boolean) ?? []
                }));
            };

            const createDialog = (d) => {
                const dialog = document.createElement("dialog");

                dialog.innerHTML = `
                    <div class="team-popup">
                        <button type="button" class="team-popup-close" aria-label="Close">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M0.0229858 11.1601L11.1599 0.023202L13.0393 1.90256L1.90234 13.0395L0.0229858 11.1601ZM-0.000215885 1.90256L1.90234 1.25234e-08L13.0393 11.1369L11.1367 13.0395L-0.000215885 1.90256Z" fill="black"/>
                            </svg>
                        </button>

                        <div class="team-popup-inner" data-lenis-prevent>
                            <div class="team-popup-img">
                                ${d.img ? `<img loading="lazy" decoding="async" data-src="${d.img}" alt="${d.name}">` : ''}
                            </div>

                            <div class="team-popup-content">
                                <div class="team-popup-head">
                                    <p class="team-popup-name">${d.name}</p>
                                    ${d.position ? `<p class="team-popup-position">${d.position}</p>` : ""}
                                </div>

                                <div class="team-popup-bio">
                                    <div class="team-popup-rich-txt">
                                        ${d.bio}
                                    </div>

                                    ${d.tags.length ? `
                                        <div class="team-popup-tags">
                                            ${d.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}
                                        </div>
                                    ` : ""}

                                    ${d.linkedin ? `
                                        <a href="${d.linkedin}" target="_blank" rel="noopener">
                                            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect width="30" height="30" rx="3" fill="#1A1A1A"/>
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M22.7008 22H19.2972V17.0784C19.2972 15.7902 18.7648 14.9108 17.594 14.9108C16.6985 14.9108 16.2005 15.5043 15.9687 16.0762C15.8818 16.2815 15.8954 16.5675 15.8954 16.8534V22H12.5235C12.5235 22 12.5669 13.2819 12.5235 12.4895H15.8954V13.9821C16.0946 13.3295 17.1721 12.398 18.8915 12.398C21.0248 12.398 22.7008 13.766 22.7008 16.7118V22ZM9.1135 11.2999H9.09178C8.00523 11.2999 7.30078 10.5728 7.30078 9.65127C7.30078 8.71178 8.02605 8 9.13433 8C10.2417 8 10.9226 8.71 10.9443 9.64859C10.9443 10.5702 10.2417 11.2999 9.1135 11.2999ZM7.68921 12.4895H10.6908V22H7.68921V12.4895Z" fill="white"/>
                                            </svg>
                                        </a>
                                    ` : ""}
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                return dialog;
            };

            const loadImage = (item) => {
                const image = item.querySelector("[data-src]");
                if (!image) return;
                image.src = image.dataset.src;
                image.removeAttribute("data-src");
                image.parentElement.classList.add("active");
            };

            script();
        },

        teamCarousel() {
            const script = () => {
                const els = document.querySelectorAll("section.team-carousel");
                if (!els.length) return;

                baunfire.Global.importSwiperScript(() => {
                    els.forEach((self) => handleCarousel(self));
                });

                els.forEach(self => {
                    const cards = self.querySelectorAll(".tc-card");
                    const data = readData(self);

                    cards.forEach((card, i) => {
                        const dialog = createDialog(data[i]);
                        const tagsContainer = card.querySelector(".tc-c-tags");

                        if (tagsContainer) {
                            const tags = tagsContainer.textContent.split(",").map(tag => tag.trim()).filter(Boolean);

                            tagsContainer.innerHTML = "";

                            tags.forEach(tag => {
                                const span = document.createElement("span");
                                span.className = "tag";
                                span.textContent = tag;
                                tagsContainer.appendChild(span);
                            });
                        }

                        card.append(dialog);

                        const trigger = card.querySelector(".team-popup-trigger");
                        const close = dialog.querySelector(".team-popup-close");

                        trigger?.addEventListener("click", () => {
                            baunfire.Global.siteScrolling(false);
                            loadImage(card);
                            dialog.showModal();
                        });

                        close?.addEventListener("click", () => {
                            baunfire.Global.siteScrolling(true);
                            dialog.close();
                        });
                    });
                });
            };

            const handleCarousel = (self) => {
                const swiperEl = self.querySelector(".swiper.tc-carousel");
                if (!swiperEl) return;

                const instance = new Swiper(swiperEl, {
                    slidesPerView: 'auto',
                    spaceBetween: 24,
                    breakpoints: {
                        768: {
                            spaceBetween: 15,
                        }
                    },
                    navigation: {
                        prevEl: self.querySelector(".swiper-button-prev"),
                        nextEl: self.querySelector(".swiper-button-next"),
                    },
                    pagination: {
                        el: self.querySelector(".swiper-pagination"),
                        clickable: true,
                    },
                    on: {
                        afterInit: function () {
                            baunfire.Global.screenSizeChange();
                            swiperEl.classList.add('is-ready');
                        },
                    }
                });

                (this._swipers ||= []).push(instance);
            };

            const readData = (self) => {
                return [...self.querySelectorAll(".tc-card")].map((item) => ({
                    img: item.querySelector(".tc-c-img")?.src ?? "",
                    name: item.querySelector(".tc-c-name")?.textContent.trim() ?? "",
                    position: item.querySelector(".tc-c-position")?.textContent.trim() ?? "",
                    linkedin: item.querySelector(".tc-shadow-linkedin")?.textContent.trim() ?? "",
                    bio: item.querySelector(".tc-shadow-bio")?.innerHTML.trim() ?? "",
                    tags: item.querySelector(".tc-shadow-tags")?.textContent.split(",").map(tag => tag.trim()).filter(Boolean) ?? []
                }));
            };

            const createDialog = (d) => {
                const dialog = document.createElement("dialog");

                dialog.innerHTML = `
                    <div class="team-popup">
                        <button type="button" class="team-popup-close" aria-label="Close">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M0.0229858 11.1601L11.1599 0.023202L13.0393 1.90256L1.90234 13.0395L0.0229858 11.1601ZM-0.000215885 1.90256L1.90234 1.25234e-08L13.0393 11.1369L11.1367 13.0395L-0.000215885 1.90256Z" fill="black"/>
                            </svg>
                        </button>

                        <div class="team-popup-inner" data-lenis-prevent>
                            <div class="team-popup-img">
                                ${d.img ? `<img loading="lazy" decoding="async" data-src="${d.img}" alt="${d.name}">` : ''}
                            </div>

                            <div class="team-popup-content">
                                <div class="team-popup-head">
                                    <p class="team-popup-name">${d.name}</p>
                                    ${d.position ? `<p class="team-popup-position">${d.position}</p>` : ""}
                                </div>

                                <div class="team-popup-bio">
                                    <div class="team-popup-rich-txt">
                                        ${d.bio}
                                    </div>

                                    ${d.tags.length ? `
                                        <div class="team-popup-tags">
                                            ${d.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}
                                        </div>
                                    ` : ""}

                                    ${d.linkedin ? `
                                        <a href="${d.linkedin}" target="_blank" rel="noopener">
                                            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect width="30" height="30" rx="3" fill="#1A1A1A"/>
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M22.7008 22H19.2972V17.0784C19.2972 15.7902 18.7648 14.9108 17.594 14.9108C16.6985 14.9108 16.2005 15.5043 15.9687 16.0762C15.8818 16.2815 15.8954 16.5675 15.8954 16.8534V22H12.5235C12.5235 22 12.5669 13.2819 12.5235 12.4895H15.8954V13.9821C16.0946 13.3295 17.1721 12.398 18.8915 12.398C21.0248 12.398 22.7008 13.766 22.7008 16.7118V22ZM9.1135 11.2999H9.09178C8.00523 11.2999 7.30078 10.5728 7.30078 9.65127C7.30078 8.71178 8.02605 8 9.13433 8C10.2417 8 10.9226 8.71 10.9443 9.64859C10.9443 10.5702 10.2417 11.2999 9.1135 11.2999ZM7.68921 12.4895H10.6908V22H7.68921V12.4895Z" fill="white"/>
                                            </svg>
                                        </a>
                                    ` : ""}
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                return dialog;
            };

            const loadImage = (item) => {
                const image = item.querySelector("[data-src]");
                if (!image) return;
                image.src = image.dataset.src;
                image.removeAttribute("data-src");
                image.parentElement.classList.add("active");
            };

            script();
        },

        scrollingTimeline() {
            const script = () => {
                const els = document.querySelectorAll("section.scrolling-timeline");
                if (!els.length) return;

                els.forEach(self => {
                    handleAnimation(self);
                });
            };

            const handleAnimation = (self) => {
                const innerContainer = self.querySelector(".st-inner");
                const itemsWrapper = self.querySelector(".st-items");
                const inner = self.querySelector(".st-items-inner");
                const items = self.querySelectorAll(".st-item");

                const progressFill = self.querySelector(".st-progress-fill");
                const progressIndicator = self.querySelector(".st-progress-indicator");

                if (!itemsWrapper || !inner || !items.length) return;

                const firstItem = items[0];
                const lastItem = items[items.length - 1];

                const wrapperWidth = itemsWrapper.offsetWidth;
                const firstItemWidth = firstItem.offsetWidth;
                const lastItemWidth = lastItem.offsetWidth;

                const initialX = (wrapperWidth / 2) - (firstItemWidth / 2);

                const finalX =
                    (wrapperWidth / 2) -
                    (lastItem.offsetLeft + lastItemWidth / 2);

                gsap.set(inner, {
                    x: initialX
                });

                const master = gsap.timeline({
                    scrollTrigger: {
                        trigger: self,
                        // markers: true,
                        start: "top top",
                        end: () => `+=${Math.abs(finalX - initialX)}`,
                        // end: "bottom 25%",
                        pin: innerContainer,
                        scrub: true,
                        invalidateOnRefresh: true
                    }
                });

                master.to(inner, {
                    x: finalX,
                    ease: "none"
                });

                if (progressFill) {
                    master.to(progressFill, {
                        width: "100%",
                        ease: "none"
                    }, "<");
                }

                if (progressIndicator) {
                    master.to(progressIndicator, {
                        left: "100%",
                        ease: "none"
                    }, "<");
                }

                master.to({}, {
                    duration: 0.1
                });
            };

            script();
        }
    };

    baunfire.addModule(baunfire.Blocks);
})();