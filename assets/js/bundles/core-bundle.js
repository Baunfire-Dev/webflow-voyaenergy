import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import { CustomEase } from 'gsap/CustomEase';

import Lenis from 'lenis';
import barba from '@barba/core';
import barbaPrefetch from '@barba/prefetch';

gsap.registerPlugin(ScrollTrigger, SplitText, ScrollToPlugin, Flip, CustomEase);

CustomEase.create('pageReveal', 'M0,0 C0.77,0 0.175,1 1,1');

const lenis = new Lenis({
    anchors: true,
    lerp: 0.07,
    wheelMultiplier: 0.8,
});

lenis.on('scroll', ScrollTrigger.update);
ScrollTrigger.addEventListener('refresh', () => lenis.resize());
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;
window.ScrollToPlugin = ScrollToPlugin;
window.SplitText = SplitText;
window.Flip = Flip;
window.__lenis = lenis;
window.barba = barba;
window.barbaPrefetch = barbaPrefetch;

export { gsap, ScrollTrigger, ScrollToPlugin, SplitText, Flip, Lenis, barba, barbaPrefetch };
