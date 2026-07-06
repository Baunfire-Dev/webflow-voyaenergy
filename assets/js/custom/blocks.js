(function () {
    baunfire.Blocks = {
        init() {
            this.sectionControls();
            this.heroHomepage();
            this.bridgeEBTL();
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

                const nav = document.querySelector("nav");
                const pageControls = document.querySelector(".section-controls");

                const mainHeading = self.querySelector(".hh-section.one .hh-heading");
                const mainPara = self.querySelector(".hh-section.one .hh-para");
                const mainImage = self.querySelector(".hh-section.one .hh-bg-img-outer");

                const timings = {
                    callDelay: 0.3,
                    reveal: {
                        duration: 1,
                    },
                    mainImage: {
                        duration: 2,
                        position: "<-0.04"
                    },
                    mainHeading: {
                        position: "<0.3"
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
                    introTL.to(pageReveal, {
                        yPercent: -120,
                        duration: timings.reveal.duration,
                        ease: "power4.Out"
                    });
                }

                if (mainImage) {
                    introTL.fromTo(mainImage,
                        {
                            scale: 1.3,
                        },
                        {
                            scale: 1,
                            duration: timings.mainImage.duration,
                            ease: "power4.Out",
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
                            return introTL.fromTo(split.words,
                                { y: "100%" },
                                { y: "-5%", duration: splitTextsProps.duration, ease: "power2.out", stagger: splitTextsProps.stagger },
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
                            return introTL.fromTo(split.words,
                                { y: "100%" },
                                { y: "-5%", duration: splitTextsProps.duration, ease: "power2.out", stagger: splitTextsProps.stagger },
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
                    const ebTL = handlePin(self);
                    this.energyBottleNeck(self, ebTL);
                    this.transitionLine(self, ebTL);
                });

                baunfire.Global.screenSizeChange();
            };

            const handlePin = (self) => {
                const inner = self.querySelector(".sb-inner");

                return gsap.timeline({
                    scrollTrigger: {
                        trigger: self,
                        pin: inner,
                        start: "top top",
                        end: "+=300%",
                        pinSpacing: true,
                        scrub: true,
                        invalidateOnRefresh: true,
                        markers: true
                    }
                });
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
                            return introTL.fromTo(split.words,
                                { y: "100%" },
                                { y: "-5%", duration: 0.8, ease: "power3.out", stagger: 0.06 },
                                "<0.2"
                            );
                        },
                    });
                }

                if (para) {
                    SplitText.create(para, {
                        type: "words",
                        mask: "words",
                        autoSplit: true,
                        onSplit(split) {
                            para.style.visibility = "visible";
                            para.style.opacity = "1";
                            return introTL.fromTo(split.words,
                                { y: "100%" },
                                { y: "-5%", duration: 0.8, ease: "power3.out", stagger: { amount: 0.4, from: "start" } },
                                "<0.4"
                            );
                        },
                    });
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
                const contentGroup = self.querySelector(".eb-content");
                const bgImage = self.querySelector(".eb-bg-img");

                ebTL.to({}, { duration: 1 });

                ebTL.to(contentGroup, { yPercent: -30, autoAlpha: 0, ease: "none", duration: 1.2 });
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
            const script = () => {
                const els = parent.querySelectorAll("section.transition-line");
                if (!els.length) return;

                els.forEach(self => {
                    handleTexts(self, ebTL);
                });
            };

            const handleTexts = (self, ebTL) => {
                const items = self.querySelectorAll(".tl-text-c");
                if (!items.length) return;

                const lines = [...items].map(item => {
                    const text = item.querySelector(".tl-text");

                    const split = SplitText.create(text, {
                        type: "chars, words",
                        autoSplit: false,
                    });

                    split.chars.forEach(c => {
                        c.dataset.fill = getComputedStyle(c).color;
                    });

                    gsap.set(split.chars, { color: "#EBEBEB" });

                    return { item, split };
                });

                lines.forEach(({ item, split }, i) => {
                    const isFirst = i === 0;
                    const isLast = i === lines.length - 1;

                    if (isLast) {
                        ebTL.set(item.querySelector(".tl-text-c-inner"), { yPercent: 14 }, 0);
                    }

                    if (isFirst) {
                        ebTL.set(item, { autoAlpha: 1 }, 0);
                    } else {
                        ebTL.to(item, { autoAlpha: 1, duration: 0.3, ease: "power2.out" });
                    }

                    ebTL.to(split.chars, {
                        color: (idx, target) => target.dataset.fill,
                        duration: 0.05,
                        ease: "none",
                        stagger: { each: 0.02, from: "start" },
                    }, isFirst ? "-=0.8" : undefined);

                    if (isLast) {
                        handleImages(self, item, ebTL);
                    }

                    ebTL.to({}, { duration: 0.3 });

                    if (!isLast) {
                        ebTL.to(item, { autoAlpha: 0, duration: 0.3, ease: "power2.in" });
                    }
                });
            };

            const handleImages = (self, target, ebTL) => {
                const imageContainer = self.querySelector(".tl-images");
                target.appendChild(imageContainer);
                target.classList.add("has-images");

                gsap.set(imageContainer, { xPercent: 120, autoAlpha: 0 });

                ebTL.to(target.querySelector(".tl-text-c-inner"), { ease: "none", duration: 0.8, yPercent: 0 }, "<0.2");
                
                ebTL.to(imageContainer, {
                    autoAlpha: 1,
                    ease: "none",
                    duration: 0.3,
                }, "<0.2");

                ebTL.to(imageContainer, {
                    xPercent: 0,
                    ease: "none",
                    duration: 1.6,
                }, "<0.2");
            };

            script();
        },
    };

    baunfire.addModule(baunfire.Blocks);
})();
