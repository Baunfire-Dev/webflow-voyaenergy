(function () {
    baunfire.Blocks = {
        init() {
            this.sectionControls();
            this.heroHomepage();
            this.bridgeEBTL();
            this.howItWorks();
            this.systemOverview();
            this.contentGridItems();
            this.contactBanner();
        },

        sectionControls() {
            const handleCTAHover = (self) => {
                const trigger = document.querySelector(".sc-anchors");
                const cta = trigger.querySelector(".sc-anchor-cta");
                const itemsContainer = trigger.querySelector(".sc-anchor-items-c");
                const items = trigger.querySelectorAll(".sc-anchor-item");
                items[0].classList.add("active");

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

                trigger.addEventListener("mouseenter", () => hoverTL.timeScale(1).play());
                trigger.addEventListener("mouseleave", () => hoverTL.timeScale(1.4).reverse());
            }

            const handleScrollIndicator = () => {
                const svg = document.getElementById('indicator');
                const line = document.getElementById('dline');
                const head = document.getElementById('dhead');
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

                addEventListener('scroll', () => {
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
                }, { passive: true });
            };

            handleCTAHover();
            handleScrollIndicator();
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
                const pageReveal = document.querySelector(".page-reveal");
                // const pageMark = pageReveal.querySelector(".page-mark");
                const pageSlats = pageReveal.querySelectorAll(".page-slat");

                const nav = document.querySelector("nav");
                const pageControls = document.querySelector(".section-controls");

                const mainHeading = self.querySelector(".hh-section.one .hh-heading");
                const mainPara = self.querySelector(".hh-section.one .hh-para");
                const mainImage = self.querySelector(".hh-section.one .hh-bg-img-outer");

                const timings = {
                    callDelay: 0.3,
                    reveal: {
                        markFade: {
                            duration: 0.6,
                        },
                        slat: {
                            duration: 0.7,
                            stagger: 0.08,
                            position: "<",
                        },
                    },
                    mainImage: {
                        duration: 2.5,
                        position: "<-0.02"
                    },
                    mainHeading: {
                        position: "<0.6"
                    },
                    navControls: {
                        duration: 0.6,
                        position: "<0.4"
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

                if (pageReveal) {
                    // introTL.fromTo(pageMark,
                    //     { autoAlpha: 1, },
                    //     { autoAlpha: 0, yPercent: -10, duration: timings.reveal.markFade.duration, ease: "power1.out" }
                    // );

                    introTL.fromTo(pageSlats,
                        { yPercent: 0 },
                        {
                            yPercent: -102,
                            duration: timings.reveal.slat.duration,
                            ease: "power3.inOut",
                            stagger: timings.reveal.slat.stagger,
                            onComplete: () => pageReveal.remove(),
                        },
                        // timings.reveal.slat.position
                    );
                }

                if (mainImage) {
                    introTL.fromTo(mainImage,
                        {
                            scale: 1.3,
                        },
                        {
                            scale: 1,
                            duration: timings.mainImage.duration,
                            ease: "power2.out",
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
                            gsap.set(split.words, { willChange: "transform" });
                            return introTL.fromTo(split.words,
                                { y: "100%" },
                                {
                                    y: "-5%", duration: splitTextsProps.duration, ease: "power2.out", stagger: splitTextsProps.stagger,
                                    onComplete: () => gsap.set(split.words, { willChange: "auto" }),
                                },
                                timings.mainHeading.position
                            );
                        },
                    });
                }

                introTL.addLabel("nav_controls", timings.navControls.position)

                introTL.fromTo(nav,
                    {
                        yPercent: -100,
                    },
                    {
                        yPercent: 0,
                        duration: timings.navControls.duration,
                        ease: "power2.out"
                    },
                    "nav_controls"
                );

                introTL.fromTo(pageControls,
                    {
                        y: 100,
                    },
                    {
                        y: 0,
                        duration: timings.navControls.duration,
                        ease: "power2.out"
                    },
                    "nav_controls"
                );

                if (mainPara) {
                    SplitText.create(mainPara, {
                        type: "words",
                        mask: "words",
                        autoSplit: true,
                        onSplit(split) {
                            mainPara.style.visibility = "visible";
                            mainPara.style.opacity = "1";
                            gsap.set(split.words, { willChange: "transform" });
                            return introTL.fromTo(split.words,
                                { y: "100%" },
                                {
                                    y: "-5%", duration: splitTextsProps.duration, ease: "power2.out", stagger: splitTextsProps.stagger,
                                    onComplete: () => gsap.set(split.words, { willChange: "auto" }),
                                },
                                timings.mainPara.position
                            );
                        },
                    });
                }
            };

            const handleScroll = (self) => {
                const siteAnchors = document.querySelector(".sc-anchors");

                const heroInner = self.querySelector(".hh-inner");

                const sectionOne = self.querySelector(".hh-section.one");
                const sectionOneImage = sectionOne.querySelector(".hh-bg-img-outer");

                const mainHeading = sectionOne.querySelector(".hh-heading");
                const mainPara = sectionOne.querySelector(".hh-para");

                const sectionTwo = self.querySelector(".hh-section.two");
                const sectionTwoLogo = sectionTwo.querySelector(".hh-logo");
                const sectionTwoImage = sectionTwo.querySelector(".hh-bg-img");
                const sectionTwoContent = sectionTwo.querySelector(".hh-content.two");
                const sectionTwoBGOverlay = sectionTwo.querySelector(".hh-bg-overlay");

                const secondaryPara = sectionTwo.querySelector(".hh-long-para");

                if (!heroInner || !sectionOne || !sectionTwo) return;

                const imageMask = () => {
                    const s = getComputedStyle(sectionTwo);
                    const y = s.getPropertyValue("--frame-y").trim();
                    const x = s.getPropertyValue("--frame-x").trim();
                    const r = s.getPropertyValue("--frame-r").trim();
                    return `inset(${y} ${x} ${y} ${x} round ${r})`;
                };

                SplitText.create(secondaryPara, {
                    type: "words",
                    mask: "words",
                    autoSplit: true,
                    onSplit(split) {
                        gsap.set(split.words, { yPercent: 110 });

                        gsap.set(sectionOneImage, { yPercent: 0 });

                        gsap.set([mainHeading, mainPara], { yPercent: 0, autoAlpha: 1 });

                        gsap.set(sectionTwo, { clipPath: "inset(0rem 0rem 0rem 0rem round 0rem)", yPercent: 40 });
                        gsap.set(sectionTwoLogo, { autoAlpha: 0, y: "2rem" });

                        gsap.set([sectionTwoContent, sectionTwoBGOverlay], { autoAlpha: 1 });

                        const tl = gsap.timeline({
                            scrollTrigger: {
                                trigger: heroInner,
                                start: "top top",
                                end: "+=250%",
                                scrub: 1,
                                pin: true,
                                // anticipatePin: 1,
                                invalidateOnRefresh: true,
                            },
                        });

                        tl.to(sectionOne, { yPercent: -100, ease: "none", duration: 1.4 }, 0);
                        tl.to(sectionOneImage, { yPercent: 40, ease: "none", duration: 1.4 }, "<");
                        tl.to(sectionTwo, { yPercent: 0, ease: "none", duration: 1.4 }, "<");

                        tl.to(mainHeading, { yPercent: -140, autoAlpha: 0, ease: "none", duration: 0.85 }, "<");
                        tl.to(mainPara, { yPercent: -110, autoAlpha: 0, ease: "none", duration: 1.0 }, "<0.08");

                        tl.to(sectionTwoLogo, { autoAlpha: 1, y: 0, ease: "none", duration: 0.6 }, 0.9);
                        tl.to(split.words, { yPercent: 0, ease: "none", stagger: 0.1, duration: 0.6 }, "<0.1");

                        tl.to({}, { duration: 1 });

                        tl.to(sectionTwo, { clipPath: imageMask(), ease: "none", duration: 0.8 });

                        tl.to([sectionTwoContent, sectionTwoBGOverlay], { autoAlpha: 0, ease: "none", duration: 0.6 }, "<");

                        tl.call(() => siteAnchors.classList.remove("dark"), null, ">");
                        tl.call(() => siteAnchors.classList.add("dark"), null, "<");

                        tl.to({}, { duration: 0.5 });

                        return tl;
                    },
                });

                gsap.set(sectionTwoImage, { scale: 1.06, transformOrigin: "center center" });

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
            };

            script();
        },

        bridgeEBTL() {
            const script = () => {
                const els = document.querySelectorAll("section.section-bridge-eb-tl");
                if (!els.length) return;

                els.forEach(self => {
                    const inner = self.querySelector(".sb-inner");

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

                    this.energyBottleNeck(self, ebTL);
                    this.transitionLine(self, ebTL);
                });

                baunfire.Global.screenSizeChange();
            };

            script();
        },

        energyBottleNeck(sectionParent, ebTL) {
            const script = () => {
                const els = sectionParent.querySelectorAll("section.energy-bottleneck");
                if (!els.length) return;

                els.forEach(self => {
                    handleEntrance(self);
                    handleParallax(self);
                    handleExit(self, ebTL);
                });
            };

            const handleEntrance = (self) => {
                const logo = self.querySelector(".eb-icon");
                const heading = self.querySelector(".eb-title");
                const para = self.querySelector(".eb-para");

                const introTL = gsap.timeline({
                    scrollTrigger: {
                        trigger: sectionParent,
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
                            gsap.set(split.words, { willChange: "transform" });
                            return introTL.fromTo(split.words,
                                { y: "100%" },
                                {
                                    y: "-5%", duration: 0.8, ease: "power3.out", stagger: 0.06,
                                    onComplete: () => gsap.set(split.words, { willChange: "auto" }),
                                },
                                "<0.2"
                            );
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

                gsap.set(bgImage, {
                    scale: 1.15,
                    transformOrigin: "top center"
                })

                gsap.fromTo(bgImage,
                    {
                        yPercent: -14,
                    },
                    {
                        yPercent: 0,
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
                    yPercent: 14,
                    ease: "none",
                    duration: 2.5
                }, "<");
            };

            script();
        },

        transitionLine(parent, ebTL) {
            const RESTING_COLOR = "#EBEBEB";
            const LIFT_OFFSET = 80;

            const script = () => {
                const els = parent.querySelectorAll("section.transition-line");
                if (!els.length) return;

                els.forEach(self => handleTexts(self, ebTL));
            };

            const handleTexts = (self, ebTL) => {
                const items = [...self.querySelectorAll(".tl-text-c")];
                if (!items.length) return;

                const lines = items.map((item, i) => setupTextGroup(self, item, i, items.length));

                lines.forEach(line => textGroupAnim(line, ebTL));
            };

            const setupTextGroup = (self, item, i, total) => {
                const isFirst = i === 0;
                const isLast = i === total - 1;

                const text = item.querySelector(".tl-text");
                const split = SplitText.create(text, { type: "chars, words", autoSplit: false });

                split.chars.forEach(c => (c.dataset.fill = getComputedStyle(c).color));
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

            const textGroupAnim = (line, ebTL) => {
                const { item, split, imagesInner, isFirst, isLast } = line;

                if (isFirst) {
                    ebTL.set(item, { autoAlpha: 1 }, 0);
                } else {
                    ebTL.to(item, { autoAlpha: 1, duration: 0.3, ease: "power2.out" });
                }

                if (isLast) {
                    const inner = item.querySelector(".tl-text-c-inner");
                    ebTL.fromTo(inner,
                        { y: () => yPercentLift(inner) },
                        { y: 0, ease: "none", duration: 1.6, immediateRender: false },
                        "<"
                    );
                }

                ebTL.to(split.chars, {
                    color: (idx, target) => target.dataset.fill,
                    duration: 0.05,
                    ease: "none",
                    stagger: { each: 0.02, from: "start" },
                }, isFirst ? "-=0.8" : "<0.2");

                if (isLast && imagesInner) {
                    ebTL.to(imagesInner, {
                        xPercent: 0,
                        ease: "none",
                        duration: 1.6,
                    }, "<0.4");

                    ebTL.to(imagesInner, {
                        autoAlpha: 1,
                        ease: "none",
                        duration: 0.6,
                    }, "<0.2");
                }

                ebTL.to({}, { duration: 0.3 });

                if (!isLast) {
                    ebTL.to(item, { autoAlpha: 0, duration: 0.3, ease: "power2.in" });
                }
            };

            const yPercentLift = (inner) => {
                const tc = inner.closest(".tl-text-c");
                const outer = inner.closest(".tl-text-c-outer");
                const tcCenter = tc.offsetHeight / 2;
                const outerCenter = outer.offsetTop + outer.offsetHeight / 2;
                return (tcCenter - outerCenter) - LIFT_OFFSET;
            };

            script();
        },

        howItWorks() {
            const script = () => {
                const els = document.querySelectorAll("section.how-it-works");
                if (!els.length) return;

                els.forEach(self => {
                    ScrollTrigger.addEventListener("refreshInit", () => handleVisualBalance(self));
                    handleVisualBalance(self);
                    ScrollTrigger.refresh();

                    handleEntrance(self);
                    handleBGSwitch(self);
                    handleSlides(self);
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

                gsap.set(head, {
                    paddingTop: `${paddingTop / rootFontSize}rem`,
                    paddingBottom: `${paddingBottom / rootFontSize}rem`,
                });
            };

            const handleEntrance = (self) => {
                const heading = self.querySelector(".hiw-title");
                if (!heading) return;

                const introTL = gsap.timeline({
                    scrollTrigger: {
                        trigger: self,
                        start: "top 90%",
                    }
                });

                SplitText.create(heading, {
                    type: "words",
                    mask: "words",
                    autoSplit: true,
                    onSplit(split) {
                        heading.style.visibility = "visible";
                        heading.style.opacity = "1";
                        gsap.set(split.words, { willChange: "transform" });
                        return introTL.fromTo(split.words,
                            { y: "100%" },
                            {
                                y: "-5%", duration: 0.8, ease: "power3.out", stagger: 0.08,
                                onComplete: () => gsap.set(split.words, { willChange: "auto" }),
                            },
                        );
                    },
                });
            };

            const handleBGSwitch = (self) => {
                const head = self.querySelector(".hiw-head");
                if (!head) return;

                const switchTL = gsap.timeline({
                    scrollTrigger: {
                        trigger: head,
                        start: "top 90%",
                        end: "top 70%",
                        scrub: 1,
                    }
                });

                const title = head.querySelector(".hiw-title");
                const dots = head.querySelectorAll("svg path");
                const main = document.querySelector("main.g-main");

                switchTL.addLabel("color-transition")

                if (title) {
                    switchTL.to(title, {
                        color: "#fff",
                        ease: "none"
                    }, "color-transition");
                }

                switchTL.to(dots, {
                    fill: "#BCBCBC",
                    ease: "none"
                }, "color-transition");

                switchTL.fromTo(main,
                    { backgroundColor: "#fff" },
                    { backgroundColor: "#1a1a1a", ease: "none", immediateRender: true, overwrite: true },
                    "color-transition"
                );
            };

            const animateFirstSlide = (panel) => {
                const els = [
                    panel.querySelector(".hiw-c-brow"),
                    panel.querySelector(".hiw-c-title"),
                    panel.querySelector(".hiw-para"),
                ];

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
                            start: baunfire.anim.start,
                        }
                    }
                );
            };

            const handleSlides = (self) => {
                const body = self.querySelector(".hiw-body");
                if (!body) return;

                const main = document.querySelector("main.g-main");
                const slides = self.querySelector(".hiw-slides");
                const panels = gsap.utils.toArray(".hiw-slide", slides);
                const dotContainer = self.querySelector(".hiw-pagination");
                const dots = dotContainer.querySelectorAll("svg circle");
                if (!panels.length) return;

                gsap.matchMedia().add("(min-width: 768px)", () => {
                    const INTRO_DUR = 0.3;
                    const H_START = INTRO_DUR;
                    const H_DUR = panels.length - 1;

                    const covers = self.querySelectorAll(".hiw-cover");
                    const firstImg = panels[0].querySelector(".hiw-img");

                    const master = gsap.timeline({
                        scrollTrigger: {
                            trigger: body,
                            start: "top top",
                            end: () => "+=" + (INTRO_DUR + H_DUR) * panels[0].offsetWidth,
                            scrub: 1,
                            pin: body,
                            anticipatePin: 1,
                            invalidateOnRefresh: true,
                            pinSpacing: true,
                        }
                    });

                    master.to(covers, {
                        scale: 1.4,
                        ease: "none",
                        duration: INTRO_DUR,
                    }, 0);

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

                    master.to(panels, {
                        xPercent: -100 * (panels.length - 1),
                        ease: "none",
                        duration: H_DUR,
                        onReverseComplete: () => gsap.set(main, { backgroundColor: "#1a1a1a" }),
                    }, H_START);

                    master.fromTo(main,
                        { backgroundColor: "#1a1a1a" },
                        { backgroundColor: "#fff", ease: "none", duration: 0.05, immediateRender: false },
                        H_START
                    );

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
                            .fromTo([brow, title, para],
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
                });
            };

            const activateDot = (dot, active = true) => {
                gsap.to(dot, { fill: active ? "#f1b510" : "#c7c7c7", duration: 0.6, ease: "power2.out" });
            };

            script();
        },

        systemOverview() {
            const script = () => {
                const els = document.querySelectorAll("section.system-overview");
                if (!els.length) return;

                els.forEach(self => {
                    const PX_PER_SEC = 800;
                    const soTL = gsap.timeline();

                    const sceneContainer = self.querySelector(".so-scenes");

                    handleEntrance(self);
                    handleSceneOne(self, soTL);

                    ScrollTrigger.create({
                        animation: soTL,
                        trigger: sceneContainer,
                        pin: sceneContainer,
                        start: "top top",
                        end: () => "+=" + soTL.duration() * PX_PER_SEC,
                        pinSpacing: true,
                        scrub: 1,
                        invalidateOnRefresh: true,
                    });
                });
            };

            const handleEntrance = (self) => {
                const sceneOne = self.querySelector(".so-scene.is-s1");
                const logo = sceneOne.querySelector(".so-icon");
                const heading = sceneOne.querySelector(".so-title");
                const para = sceneOne.querySelector(".so-para");

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
                            gsap.set(split.words, { willChange: "transform" });
                            return introTL.fromTo(split.words,
                                { y: "100%" },
                                {
                                    y: "-5%", duration: 0.8, ease: "power3.out", stagger: 0.06,
                                    onComplete: () => gsap.set(split.words, { willChange: "auto" }),
                                },
                                "<0.2"
                            );
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
                        clipPath: "inset(5rem 4rem 5rem 4rem round 0.5rem)",
                    },
                    {
                        clipPath: "inset(0rem 0rem 0rem 0rem round 0rem)",
                        duration: 0.8,
                        ease: "none"
                    }
                );

                soTL.to({}, { duration: 0.5 });

                if (contentContainer) {
                    soTL.to(contentContainer, {
                        yPercent: -100,
                        autoAlpha: 0,
                        ease: "power2.out",
                        duration: 1
                    });
                }

                soTL.add(
                    Flip.fit(generatorMain, generatorShadow1, {
                        duration: 1.4,
                        ease: "power2.out",
                    }),
                    "<0.3"
                );

                soTL.add(
                    Flip.fit(generatorMain, generatorShadow2, {
                        duration: 0.8,
                        ease: "power2.out",
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
                        ease: "power2.out",
                        scale: true
                    })
                );

                soTL.to({}, { duration: 0.5 });

                soTL.add(
                    Flip.fit(generatorMain, generatorS2No3, {
                        duration: 0.8,
                        ease: "power2.out",
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
                const heading = self.querySelector(".cgi-title");
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
                            gsap.set(split.words, { willChange: "transform" });
                            return introTL.fromTo(split.words,
                                { y: "100%" },
                                {
                                    y: "-5%", duration: 0.8, ease: "power3.out", stagger: 0.06,
                                    onComplete: () => gsap.set(split.words, { willChange: "auto" }),
                                },
                            );
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
                            onStart: () => {
                                animateItems(activePanel);
                            }
                        },
                        "<0.1"
                    );

                }
            };

            const handleTabs = (self) => {
                const tabs = [...self.querySelectorAll('.cgi-tab[target]')];
                const panels = [...self.querySelectorAll('.cgi-panel[panel-key]')];

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
                    animateItems(activePanel);

                    baunfire.Global.screenSizeChange();
                };

                return panels[0];
            };

            const animateItems = (panel) => {
                const items = panel.querySelectorAll(".cgi-card");

                gsap.fromTo(items,
                    {
                        autoAlpha: 0,
                        rotateX: "-96deg"
                    },
                    {
                        autoAlpha: 1,
                        rotateX: 0,
                        stagger: 0.14,
                        ease: "power2.out",
                        duration: 0.8,
                        overwrite: true
                    }
                )
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
                            gsap.set(split.words, { willChange: "transform" });
                            return introTL.fromTo(split.words,
                                { y: "100%" },
                                {
                                    y: "-5%", duration: 0.8, ease: "power3.out", stagger: 0.06,
                                    onComplete: () => gsap.set(split.words, { willChange: "auto" }),
                                },
                            );
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
    };

    baunfire.addModule(baunfire.Blocks);
})();
