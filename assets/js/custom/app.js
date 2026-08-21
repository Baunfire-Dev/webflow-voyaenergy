(function (w) {
    'use strict';

    const baunfire = {
        booted: false,
        modules: [],
        anim: {
            start: "top 60%",
            startMobile: "top 70%"
        },
        lenis: null,
        ctx: null,
        _once: new Set(),

        boot() {
            if (this.booted) return;
            this.booted = true;
            this.smoothScroll();
            this.load();
        },

        mount(container) {
            container = container
                || document.querySelector('[data-barba="container"]')
                || document.querySelector('main')
                || document.body;

            this.ctx = gsap.context(() => {
                this.modules.forEach(mod => {
                    if (mod.once && this._once.has(mod)) return;
                    if (mod.selector && !container.querySelector(mod.selector)) return;
                    if (typeof mod.init === 'function') mod.init(baunfire, container);
                    if (mod.once) this._once.add(mod);
                });
            }, container);

            document.dispatchEvent(new CustomEvent('baunfire:ready'));
        },

        unmount() {
            this.modules.forEach(mod => {
                if (mod.once) return;
                if (typeof mod.destroy === 'function') mod.destroy();
            });
            
            this.ctx?.revert();
            this.ctx = null;

            ScrollTrigger.getAll().forEach(st => st.kill());
            SplitText.getAll?.().forEach(s => s.revert());
        },

        addModule(mod) {
            this.modules.push(mod);
        },

        load() {
            baunfire.Global.fancyLog('Baunfire loaded');
        },

        smoothScroll() {
            this.lenis = window.__lenis;
        },

        ready(callback) {
            this.boot();
            this.mount();
            if (typeof callback === 'function') callback(baunfire);
        }
    };

    w.baunfire = baunfire;

})(window);
