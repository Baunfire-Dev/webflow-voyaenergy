(function () {
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
                this.syncWebflowState(data.next);
                baunfire.lenis?.scrollTo(0, { immediate: true, force: true });
                baunfire.mount(data.next.container);
                this.holdTriggers();
                this.reinitWebflow();
                this.updateNavState();
                baunfire.Global.screenSizeChange();
            });

            barba.hooks.after(() => {
                baunfire.Global.siteScrolling(true);
                this.releaseTriggers();
                ScrollTrigger.refresh();
            });
        },

        holdTriggers() {
            this._held = ScrollTrigger.getAll();
            this._held.forEach(st => st.disable(false));
        },

        releaseTriggers() {
            if (!this._held) return;
            this._held.forEach(st => st.enable());
            this._held = null;
            ScrollTrigger.refresh();
        },

        reveal() {
            const self = this;
            return {
                name: 'reveal',
                leave() {
                    return self.coverIn();
                },
                enter(data) {
                    data.current?.container.remove();
                    return self.coverOut();
                },
                once(data) {
                    baunfire.mount(data.next.container);
                    self.holdTriggers();
                    self._intro = true;
                    return self.coverOut();
                },
            };
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

            const tl = gsap.timeline({ defaults: { duration: 1.2, ease: 'pageReveal' } });

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
            if (!e) {
                this.releaseTriggers();
                return;
            }

            const HOLD = this._intro ? 0.3 : 0;
            this._intro = false;

            const HANDOFF = 0.4;

            const tl = gsap.timeline({ defaults: { duration: 1.2, ease: 'pageReveal' } });

            tl.to(e.panel, { yPercent: -100 }, HOLD);
            if (e.inner) tl.to(e.inner, { yPercent: 100 }, HOLD);
            if (e.logo) tl.to(e.logo, { yPercent: -100 }, HOLD);

            tl.call(() => this.releaseTriggers(), null, HOLD + HANDOFF);

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

            if (baunfire.Animation) baunfire.Animation._navBound = false;
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