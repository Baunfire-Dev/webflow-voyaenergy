(function () {
    baunfire.Blocks = {
        init() {
            this.heroHomepage();
            this.energyBottleNeck();
        },

        heroHomepage() {
            const script = () => {
                const els = document.querySelectorAll("section.hero-homepage");
                if (!els.length) return;

                els.forEach(self => {
                    handleEntrance(self);
                    handleScroll(self);
                    handleScrollIndicator(self);
                });
            }

            const handleEntrance = (self) => {
                const pageReveal = document.querySelector(".page-reveal");

                const nav = document.querySelector("nav");
                const pageControls = document.querySelector(".section-controls");

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

                introTL.fromTo(pageControls,
                    {
                        y: 100,
                    },
                    {
                        y: 0,
                        duration: 0.8,
                        ease: "power2.out"
                    },
                    "<"
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
                                { y: "-5%", duration: 0.8, ease: "power2.out", stagger: 0.06 },
                                "<0.3"
                            );
                        },
                    });
                }
            };

            const handleScroll = (self) => {
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

                        tl.to(sectionTwoLogo, { autoAlpha: 1, y: 0, ease: "none", duration: 0.6 }, ">-0.5");
                        tl.to(split.words, { yPercent: 0, ease: "none", stagger: 0.1, duration: 0.6 }, "<0.1");

                        tl.to(sectionTwoLogo, { autoAlpha: 1, y: 0, ease: "none", duration: 0.6 }, 0.9);
                        tl.to(split.words, { yPercent: 0, ease: "none", stagger: 0.1, duration: 0.6 }, "<0.1");

                        tl.to({}, { duration: 1 });

                        tl.to(sectionTwo, { clipPath: imageMask(), ease: "none", duration: 0.8 });
                        tl.to([sectionTwoContent, sectionTwoBGOverlay], { autoAlpha: 0, ease: "none", duration: 0.6 }, "<");

                        tl.to({}, { duration: 0.5 });

                        return tl;
                    },
                });

                gsap.set(sectionTwoImage, { scale: 1.06, transformOrigin: "center center" });

                gsap.to(sectionTwoImage, {
                    yPercent: 10,
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

            const handleScrollIndicator = (self) => {
                const svg = document.getElementById('indicator');
                const line = document.getElementById('dline');
                const len = line.getTotalLength();

                const arrowTL = gsap.timeline({
                    repeat: -1,
                    repeatDelay: 1,
                    paused: true
                })

                let fadeOut = false;

                const mm = gsap.matchMedia();

                gsap.set(line, {
                    strokeDasharray: len,
                    strokeDashoffset: len
                });

                gsap.set('#dhead', {
                    autoAlpha: 0,
                    y: -4
                });

                arrowTL
                    .to(line, {
                        strokeDashoffset: 0,
                        duration: 0.5,
                        ease: 'power2.out'
                    })
                    .to('#dhead', {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.25,
                        ease: 'back.out(2)'
                    },
                        '-=0.1'
                    )
                    .set(line, {
                        strokeDashoffset: len
                    })
                    .set('#dhead', {
                        autoAlpha: 0,
                        y: -4
                    })

                mm.add('(prefers-reduced-motion: no-preference)', () => {
                    arrowTL.play();
                    return () => arrowTL.pause();
                });

                mm.add('(prefers-reduced-motion: reduce)', () => {
                    gsap.set(line, { strokeDashoffset: 0 });
                    gsap.set('#dhead', {
                        autoAlpha: 1,
                        y: 0
                    });
                });

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

            script();
        },

        energyBottleNeck() {
            const script = () => {
                const els = document.querySelectorAll("section.energy-bottleneck");
                if (!els.length) return;

                els.forEach(self => {
                    handleEntrance(self);
                });
            }

            const handleEntrance = (self) => {
                const logo = self.querySelector(".eb-icon");
                const heading = self.querySelector(".eb-title");
                const para = self.querySelector(".eb-para");

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
                        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }
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
                                { y: "-5%", duration: 0.8, ease: "power2.out", stagger: 0.06 },
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
                                { y: "-5%", duration: 0.8, ease: "power2.out", stagger: { amount: 0.6, from: "start" } },
                                "<0.4"
                            );
                        },
                    });
                }
            };

            script();
        }
    };

    baunfire.addModule(baunfire.Blocks);
})();
