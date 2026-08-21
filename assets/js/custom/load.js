document.addEventListener('DOMContentLoaded', function () {
    window.baunfire.boot();
    window.baunfire.Transitions.init();
});

const settle = () => window.baunfire.Transitions.settle();

window.addEventListener('load', settle);
// document.fonts?.ready.then(settle);
