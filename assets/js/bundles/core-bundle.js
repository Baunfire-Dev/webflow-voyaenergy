import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';
import barba from '@barba/core';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Flip);

const lenis = new Lenis({
    anchors: true,
    lerp: 0.07,
    wheelMultiplier: 0.8,
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;
window.ScrollToPlugin = ScrollToPlugin;
window.SplitText = SplitText;
window.Flip = Flip;
window.__lenis = lenis;
window.barba = barba;

export { gsap, ScrollTrigger, ScrollToPlugin, SplitText, Flip, Lenis, barba };
