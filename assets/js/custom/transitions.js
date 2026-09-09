(function () {
    const COVER_IN_DUR = 1;
    const COVER_OUT_DUR = 1;
    const COVER_HOLD = 0.3;
    const COVER_EASE = 'pageReveal';
    const FIRST_REVEAL_WAIT = 300;
    const FIRST_REVEAL_CALM_FRAMES = 3;
    const FIRST_REVEAL_CALM_MS = 24;

    baunfire.Transitions = {
        init() {
            if (typeof barba === 'undefined') {
                baunfire.mount();
                return;
            }

            document.addEventListener('click', (e) => {
                if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                const a = e.target.closest('a[href]');
                if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
                const url = new URL(a.href, location.href);
                if (url.hash) return;
                if (this.isSamePage(a.href)) e.preventDefault();
            }, true);

            // if (typeof barbaPrefetch !== 'undefined') {
            //     barba.use(barbaPrefetch, {
            //         root: document.querySelector('header') || document.body,
            //     });
            // }

            barba.init({
                timeout: 7000,
                prevent: ({ href }) => this.isSamePage(href),
                transitions: [this.reveal()],
            });

            barba.hooks.before(() => {
                baunfire.Global.siteScrolling(false);
            });

            barba.hooks.beforeEnter((data) => {
                baunfire.unmount();

                data.current?.container?.remove();
                this.syncWebflowState(data.next);

                baunfire.lenis?.scrollTo(0, { immediate: true, force: true });
                baunfire.mount(data.next.container);

                this.reinitWebflow();
                this.updateNavState();

                baunfire.Global.screenSizeChange();
                baunfire.Global.siteScrolling(true);
            });
        },

        reveal() {
            const self = this;
            return {
                name: 'reveal',
                leave() {
                    return self.coverIn();
                },
                enter() {
                    return self.coverOut();
                },
                once(data) {
                    return self.whenReady().then(() => {
                        baunfire.mount(data.next.container);
                        return self.coverOut();
                    });
                },
            };
        },

        whenReady() {
            return new Promise((resolve) => {
                let settled = false;
                let calm = 0;
                let last = performance.now();

                const proceed = () => {
                    if (settled) return;
                    settled = true;
                    resolve();
                };

                const watch = (now) => {
                    if (settled) return;

                    calm = now - last < FIRST_REVEAL_CALM_MS ? calm + 1 : 0;
                    last = now;

                    if (calm >= FIRST_REVEAL_CALM_FRAMES) proceed();
                    else requestAnimationFrame(watch);
                };

                requestAnimationFrame(watch);
                setTimeout(proceed, FIRST_REVEAL_WAIT);
            });
        },

        isSamePage(href) {
            try {
                const url = new URL(href, location.href);
                if (url.origin !== location.origin) return false;
                const here = location.pathname.replace(/\/$/, '') || '/';
                const there = url.pathname.replace(/\/$/, '') || '/';
                return here === there;
            } catch {
                return false;
            }
        },

        els() {
            const panel = document.querySelector('.page-reveal');
            if (!panel) return null;
            return {
                panel,
                inner: panel.querySelector('.page-reveal-inner'),
                logo: panel.querySelector('.page-reveal-logo svg'),
            };
        },

        coverIn() {
            const e = this.els();
            if (!e) return;

            const tl = gsap.timeline({ defaults: { duration: COVER_IN_DUR, ease: COVER_EASE } });

            tl.set(e.panel, { visibility: 'visible', yPercent: 100 });
            if (e.inner) tl.set(e.inner, { yPercent: -100 }, 0);
            if (e.logo) tl.set(e.logo, { yPercent: 100 }, 0);

            tl.to(e.panel, { yPercent: 0 }, 0);
            if (e.inner) tl.to(e.inner, { yPercent: 0 }, 0);
            if (e.logo) tl.to(e.logo, { yPercent: 0 }, 0);

            return tl;
        },

        coverOut() {
            const e = this.els();
            if (!e) return;

            const tl = gsap.timeline({ defaults: { duration: COVER_OUT_DUR, ease: COVER_EASE } });

            tl.to(e.panel, { yPercent: -100 }, COVER_HOLD);
            if (e.inner) tl.to(e.inner, { yPercent: 100 }, COVER_HOLD);
            if (e.logo) tl.to(e.logo, { yPercent: -100 }, COVER_HOLD);

            tl.set(e.panel, { visibility: 'hidden' })
                .set([e.panel, e.inner, e.logo].filter(Boolean), { clearProps: 'transform' });

            return tl;
        },

        syncWebflowState(next) {
            const dom = new DOMParser().parseFromString(next.html, 'text/html');

            const wfPage = dom.documentElement.getAttribute('data-wf-page');
            if (wfPage) document.documentElement.setAttribute('data-wf-page', wfPage);

            document.body.className = dom.body.className;

            const title = dom.querySelector('title');
            if (title) document.title = title.textContent;

            this.syncHeader(dom);
        },

        syncHeader(dom) {
            const nextHeader = dom.querySelector('header');
            const liveHeader = document.querySelector('header');
            if (!nextHeader || !liveHeader) return;

            const variant = nextHeader.getAttribute('data-wf--header--variant');
            if (variant) liveHeader.setAttribute('data-wf--header--variant', variant);

            liveHeader.innerHTML = nextHeader.innerHTML;

            if (baunfire.Animation) baunfire.Animation.navSetupDone = false;
        },

        reinitWebflow() {
            const wf = window.Webflow;
            if (!wf) return;

            wf.destroy();
            wf.ready();

            const ix2 = wf.require && wf.require('ix2');
            if (ix2 && ix2.init) ix2.init();
        },

        updateNavState() {
            const here = window.location.pathname.replace(/\/$/, '') || '/';
            document.querySelectorAll('header a[href]').forEach(a => {
                let path;
                try { path = new URL(a.href).pathname.replace(/\/$/, '') || '/'; }
                catch { return; }
                a.classList.toggle('w--current', path === here);
            });
        },
    };
})();