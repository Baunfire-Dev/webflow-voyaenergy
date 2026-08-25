(function () {
    const templateURL = 'https://webflow-voyaenergy.pages.dev';

    baunfire.Global = {
        screenSizeChange() {
            ScrollTrigger.refresh();
            baunfire.lenis?.resize();
        },

        queueScreenSizeChange(delay = 0.1) {
            this.pendingRefresh?.kill();
            this.pendingRefresh = gsap.delayedCall(delay, () => {
                this.pendingRefresh = null;
                this.screenSizeChange();
            });
        },

        destroy() {
            this.pendingRefresh?.kill();
            this.pendingRefresh = null;
        },

        siteScrolling(enabled = true) {
            if (enabled) {
                document.documentElement.classList.remove('disable-scrolling');
                baunfire.lenis?.start();
            } else {
                document.documentElement.classList.add('disable-scrolling');
                baunfire.lenis?.stop();
            }
        },

        callAfterResize(func, delay = 0.2) {
            const dc = gsap.delayedCall(delay, func).pause();
            const handler = () => dc.restart(true);

            window.addEventListener("resize", handler);

            return () => {
                window.removeEventListener("resize", handler);
                dc.kill();
            };
        },

        fancyLog(message, type = "info") {
            const styles = {
                info: {
                    label: 'ℹ️ INFO:',
                    style1: 'color: white; background-color: #2196F3; padding: 2px 6px; border-radius: 4px;',
                    style2: 'color: #FFF;'
                },
                warn: {
                    label: '⚠️ WARNING:',
                    style1: 'color: black; background-color: #FFEB3B; padding: 2px 6px; border-radius: 4px;',
                    style2: 'color: #000;'
                },
                error: {
                    label: '⛔ ERROR:',
                    style1: 'color: white; background-color: #F44336; padding: 2px 6px; border-radius: 4px;',
                    style2: 'color: #FFF;'
                }
            };

            const { label, style1, style2 } = styles[type] || styles.info;

            if (typeof message === 'object') {
                console.log(`%c${label}`, style1);
                console.log(message);
            } else {
                console.log(`%c${label} %c ${message}`, style1, style2);
            }
        },

        importSplideScript(callback) {
            if (typeof Splide !== 'undefined') {
                callback?.();
                return;
            }

            if (this.splideLoading) {
                this.splideCallbacks = this.splideCallbacks || [];
                this.splideCallbacks.push(callback);
                return;
            }

            this.splideLoading = true;
            this.splideCallbacks = [];

            this.fancyLog('Loading Splide...');

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `${templateURL}/assets/css/external/splide.min.css`;
            document.head.appendChild(link);

            const script = document.createElement('script');
            script.src = `${templateURL}/assets/js/external/splide.min.js`;
            script.defer = true;

            script.onload = () => {
                this.fancyLog('Splide loaded.');
                this.splideLoading = false;
                callback?.();
                this.splideCallbacks.forEach(cb => cb?.());
                this.splideCallbacks = [];
            };

            script.onerror = () => {
                this.splideLoading = false;
                console.error('Failed to load Splide script.');
            };

            document.body.appendChild(script);
        },

        importSwiperScript(callback) {
            if (typeof Swiper !== 'undefined') {
                callback?.();
                return;
            }

            if (this.swiperLoading) {
                this.swiperCallbacks = this.swiperCallbacks || [];
                this.swiperCallbacks.push(callback);
                return;
            }

            this.swiperLoading = true;
            this.swiperCallbacks = [];

            this.fancyLog('Loading Swiper...');

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `${templateURL}/assets/css/external/swiper-bundle.min.css`;
            document.head.appendChild(link);

            const script = document.createElement('script');
            script.src = `${templateURL}/assets/js/external/swiper-bundle.min.js`;
            script.defer = true;

            script.onload = () => {
                this.fancyLog('Swiper loaded.');
                this.swiperLoading = false;
                callback?.();
                this.swiperCallbacks.forEach(cb => cb?.());
                this.swiperCallbacks = [];
            };

            script.onerror = () => {
                this.swiperLoading = false;
                console.error('Failed to load Swiper script.');
            };

            document.body.appendChild(script);
        },

        handleTextCount(el, duration = 0.8, withTrigger = false, parent) {
            const counter = el?.querySelector("[data-amount]");
            if (!counter) return;

            const rawAmount = counter.dataset.amount.toString();
            const clean = v => (v + "").replace(/[^\d\.-]/gi, "");
            const num = clean(rawAmount);
            const decimals = (num.split(".")[1] || "").length;

            const proxy = { val: 0 };

            const props = {
                val: +num,
                duration: duration,
                ease: "linear",
                onUpdate: () => {
                    counter.textContent = this.formatNumber(proxy.val, decimals);
                }
            };

            if (withTrigger && parent) {
                props.once = true;
                props.scrollTrigger = {
                    trigger: parent,
                    start: baunfire.anim.start
                };
            }

            gsap.to(proxy, props);
        },

        formatNumber(value, decimals) {
            let s = (+value).toLocaleString("en-US").split(".");
            return decimals ? s[0] + "." + ((s[1] || "") + "00000000").substr(0, decimals) : s[0];
        },
    };

    baunfire.addModule(baunfire.Global);
})();
