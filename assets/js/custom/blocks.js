(function () {
    baunfire.Blocks = {
        init() {
            this.heroHomepage();
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
                const mainHeading = self.querySelector(".hh-section.one .hh-heading");
                const mainPara = self.querySelector(".hh-section.one .hh-para");
                const mainImage = self.querySelector(".hh-section.one .hh-bg-img-outer");

                const introTL = gsap.timeline({
                    paused: true,
                });

                ScrollTrigger.create({
                    trigger: self,
                    start: baunfire.anim.start,
                    once: true,
                    onEnter: () => {
                        gsap.delayedCall(0.1, () => introTL.play());
                    }
                });

                if (pageReveal) {
                    introTL.to(pageReveal, {
                        yPercent: -100,
                        duration: 1,
                        ease: "power2.inOut"
                    });
                }

                if (mainImage) {
                    introTL.fromTo(mainImage,
                        {
                            scale: 1.1,
                        },
                        {
                            scale: 1,
                            duration: 1,
                            ease: "power3.Out"
                        },
                        "<0.4"
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
                                { y: "-5%", duration: 0.8, ease: "power2.out", stagger: 0.06 },
                                "<0.2"
                            );
                        },
                    });
                }

                if (nav) {
                    introTL.fromTo(nav,
                        {
                            yPercent: -100,
                        },
                        {
                            yPercent: 0,
                            duration: 0.8,
                            ease: "power2.out"
                        },
                        "<0.2"
                    );
                }

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
                                { y: "-5%", duration: 0.8, ease: "power2.out", stagger: 0.06 },
                                "<0.3"
                            );
                        },
                    });
                }
            };

            const handleScroll = (self) => {
                const inner = self.querySelector(".hh-inner");
                const one = self.querySelector(".hh-section.one");
                const two = self.querySelector(".hh-section.two");
                const logo = two.querySelector(".hh-logo");
                const longPara = two.querySelector(".hh-long-para");
                if (!inner || !one || !two) return;

                const finalInset = () => {
                    const s = getComputedStyle(two);
                    const t = s.getPropertyValue("--frame-t").trim();
                    const x = s.getPropertyValue("--frame-x").trim();
                    const b = s.getPropertyValue("--frame-b").trim();
                    const r = s.getPropertyValue("--frame-r").trim();
                    return `inset(${t} ${x} ${b} ${x} round ${r})`;
                };

                SplitText.create(longPara, {
                    type: "words",
                    mask: "words",
                    autoSplit: true,
                    onSplit(split) {
                        gsap.set(two, { clipPath: "inset(0rem 0rem 0rem 0rem round 0rem)" });
                        gsap.set(logo, { autoAlpha: 0, y: "2rem" });
                        gsap.set(split.words, { yPercent: 110 });

                        const tl = gsap.timeline({
                            scrollTrigger: {
                                trigger: self,
                                start: "top top",
                                end: "+=250%",
                                scrub: 1,
                                pin: inner,
                                pinSpacing: true,
                                invalidateOnRefresh: true,
                            },
                        });

                        tl.to(one, { yPercent: -100, ease: "none", duration: 1 }, 0);
                        tl.to(logo, { autoAlpha: 1, y: 0, ease: "none", duration: 0.6 }, "<0.9");
                        tl.to(split.words, { yPercent: 0, ease: "none", stagger: 0.02, duration: 0.6 }, "<0.1");
                        tl.to({}, { duration: 1.0 });    
                        tl.to(two, { clipPath: finalInset(), ease: "none", duration: 0.6 });
                        tl.to({}, { duration: 1.0 });  

                        return tl;
                    },
                });
            };

            script();
        },

        animatedPlatform() {
            const script = () => {
                const els = document.querySelectorAll("section.animated-platform");
                if (!els.length) return;

                els.forEach(self => {
                    const mm = gsap.matchMedia();

                    mm.add({
                        isDesktop: "(min-width: 768px)",
                        isMobile: "(max-width: 767px)",
                    }, (context) => {
                        const { isDesktop } = context.conditions;
                        const octagons = octagonAnimation(self);
                        entranceWithPinAnimation(self, octagons, isDesktop);
                    });
                });
            }

            const entranceWithPinAnimation = (self, octagons) => {
                const allContainer = self.querySelector(".ap-container");
                const contentContainer = self.querySelector(".ap-content");
                const logo = self.querySelector(".ap-c-logo");
                const title = self.querySelector(".ap-title");
                const cta = self.querySelector(".ap-cta");
                const mediaContainer = self.querySelector(".ap-media");
                const mediaImage = self.querySelector(".ap-media img");

                const introTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: self,
                        start: baunfire.anim.start
                    },
                });

                if (logo) {
                    introTl.fromTo(logo,
                        { autoAlpha: 0, y: 40 },
                        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }
                    );
                }

                if (title) {
                    SplitText.create(title, {
                        type: "words",
                        mask: "words",
                        autoSplit: true,
                        onSplit(split) {
                            title.style.visibility = "visible";
                            title.style.opacity = "1";
                            return introTl.fromTo(split.words,
                                { y: "100%" },
                                { y: "-5%", duration: 0.6, ease: "power2.out", stagger: 0.03 },
                                logo ? "<0.2" : 0
                            );
                        },
                    });
                }

                if (cta) {
                    introTl.fromTo(cta,
                        { autoAlpha: 0, y: 40 },
                        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" },
                        "<0.3"
                    );
                }

                if (!contentContainer || !mediaContainer) return;

                const scrubTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: self,
                        start: "top top",
                        end: "+=130%",
                        scrub: 1,
                        pin: allContainer,
                        pinSpacing: true,
                        // anticipatePin: 1,
                        refreshPriority: 1,
                        fastScrollEnd: true,
                        invalidateOnRefresh: true,
                        onEnter: () => octagons && octagons.start(),
                        onEnterBack: () => octagons && octagons.start(),
                        onLeave: () => octagons && octagons.stop(),
                        onLeaveBack: () => octagons && octagons.stop(),
                    },
                });

                if (mediaImage) {
                    scrubTl.to(mediaImage, {
                        opacity: 1,
                        rotateX: 0,
                        duration: 1,
                        ease: "none",
                    }, 0);
                }

                scrubTl.to(contentContainer, {
                    yPercent: -200,
                    autoAlpha: 0,
                    duration: 1,
                    ease: "none",
                }, 1);

                scrubTl.to(mediaContainer, {
                    y: () => {
                        let offset = 0;
                        let node = mediaContainer;
                        while (node && node !== self) {
                            offset += node.offsetTop;
                            node = node.offsetParent;
                        }
                        const mediaCenterFromSectionTop = offset + mediaContainer.offsetHeight / 2;
                        const viewportCenter = window.innerHeight / 2;
                        return `+=${viewportCenter - mediaCenterFromSectionTop}`;
                    },
                    duration: 1,
                    ease: "none",
                }, 1.2);

                scrubTl.to({}, { duration: 0.5 });
            };

            const octagonAnimation = (self) => {
                const container = self.querySelector(".ap-octagons");
                if (!container) return null;

                const solids = gsap.utils.toArray(container.querySelectorAll("svg > path"));
                const ghosts = gsap.utils.toArray(container.querySelectorAll("svg g[opacity] > path"));

                if (!solids.length && !ghosts.length) return null;

                const REST_OPACITY = 0.4;
                const SOLID_PEAK = 1;
                const GHOST_PEAK = 1;
                const FADE_IN = 0.18;
                const HOLD = 0.4;
                const FADE_OUT = 0.5;
                const CYCLE_MIN = 0.4;
                const CYCLE_MAX = 0.8;

                const octagons = [
                    ...solids.map(el => ({ el, peak: SOLID_PEAK })),
                    ...ghosts.map(el => ({ el, peak: GHOST_PEAK })),
                ];

                gsap.set(octagons.map(o => o.el), { opacity: REST_OPACITY });

                let isActive = false;
                let pendingCall = null;

                const pulseRandom = () => {
                    if (!isActive) return;

                    const count = gsap.utils.random(2, Math.max(2, Math.round(octagons.length / 2)), 1);
                    const picks = gsap.utils.shuffle([...octagons]).slice(0, count);

                    picks.forEach(({ el, peak }) => {
                        gsap.timeline({ delay: gsap.utils.random(0, CYCLE_MAX) })
                            .to(el, { opacity: peak, duration: FADE_IN, ease: "power1.out" })
                            .to(el, { opacity: peak, duration: HOLD })
                            .to(el, { opacity: REST_OPACITY, duration: FADE_OUT, ease: "power1.inOut" });
                    });

                    pendingCall = gsap.delayedCall(gsap.utils.random(CYCLE_MIN, CYCLE_MAX), pulseRandom);
                };

                return {
                    start: () => {
                        if (isActive) return;
                        isActive = true;
                        pulseRandom();
                    },
                    stop: () => {
                        isActive = false;
                        pendingCall && pendingCall.kill();
                        gsap.killTweensOf(octagons.map(o => o.el));
                    },
                };
            };

            script();
        },
    };

    baunfire.addModule(baunfire.Blocks);
})();
