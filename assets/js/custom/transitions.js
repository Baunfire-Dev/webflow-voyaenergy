(function () {
    baunfire.Transitions = {
        init() {
            if (typeof barba === 'undefined') {
                baunfire.mount();
                return;
            }

            barba.init({
                timeout: 7000,
                transitions: [this.fade()],
            });

            barba.hooks.before(() => {
                baunfire.Global.siteScrolling(false);
            });

            barba.hooks.afterLeave(() => {
                baunfire.unmount();
            });

            barba.hooks.beforeEnter((data) => {
                this.syncWebflowState(data.next);
                baunfire.lenis?.scrollTo(0, { immediate: true, force: true });
                gsap.set(data.next.container, { opacity: 0 });
            });

            barba.hooks.afterEnter((data) => {
                baunfire.mount(data.next.container);
                this.reinitWebflow();
                this.updateNavState();
                baunfire.Global.screenSizeChange();
            });

            barba.hooks.after(() => {
                baunfire.Global.siteScrolling(true);
                ScrollTrigger.refresh();
            });
        },

        fade() {
            return {
                name: 'fade',
                leave(data) {
                    return gsap.to(data.current.container, {
                        opacity: 0,
                        duration: 0.4,
                        ease: 'power2.out',
                    });
                },
                enter(data) {
                    return gsap.to(data.next.container, {
                        opacity: 1,
                        duration: 0.4,
                        ease: 'power2.out',
                    });
                },
                once(data) {
                    baunfire.mount(data.next.container);
                },
            };
        },

        syncWebflowState(next) {
            const dom = new DOMParser().parseFromString(next.html, 'text/html');

            const wfPage = dom.documentElement.getAttribute('data-wf-page');
            if (wfPage) document.documentElement.setAttribute('data-wf-page', wfPage);

            document.body.className = dom.body.className;

            const title = dom.querySelector('title');
            if (title) document.title = title.textContent;
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
