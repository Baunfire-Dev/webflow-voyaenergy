(function (w) {
    'use strict';

    const baunfire = {
        initialized: false,
        modules: [],
        anim: {
            start: "top 60%"
        },
        lenis: null,
        init() {
            if (this.initialized) return;
            this.initialized = true;

            this.modules.forEach(mod => {
                if (mod.selector && !document.querySelector(mod.selector)) return;
                if (typeof mod.init === 'function') mod.init(baunfire);
            });

            document.dispatchEvent(new CustomEvent('baunfire:ready'));
        },
        addModule(mod) {
            this.modules.push(mod);
        },
        load() {
            console.log('Baunfire loaded');
        },
        smoothScroll() {
            this.lenis = window.__lenis;
        },
        ready(callback) {
            baunfire.smoothScroll();
            baunfire.init();
            if (typeof callback === 'function') callback(baunfire);
        }
    };

    w.baunfire = baunfire;

})(window);