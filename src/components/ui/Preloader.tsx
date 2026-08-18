"use client";

import { useEffect, useState, useRef } from "react";
import gsap from "gsap";

export default function Preloader() {
  const [complete, setComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Run preloader animation precisely ~1.4 seconds for high impact without lag
    const counterObj = { val: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        setComplete(true);
      },
    });

    tl.to(counterObj, {
      val: 100,
      duration: 1.1,
      ease: "power2.inOut",
      onUpdate: () => {
        if (counterRef.current) {
          counterRef.current.innerText = `${Math.floor(counterObj.val)}%`;
        }
        if (progressRef.current) {
          progressRef.current.style.width = `${counterObj.val}%`;
        }
      },
    })
      .to(
        textRef.current,
        {
          y: -20,
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
        },
        "-=0.2"
      )
      .to(
        containerRef.current,
        {
          yPercent: -100,
          duration: 0.7,
          ease: "power4.inOut",
        },
        "-=0.1"
      );

    return () => {
      tl.kill();
    };
  }, []);

  if (complete) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-[#151515] text-[#f4f1eb] p-6 md:p-12 select-none"
    >
      <div className="flex justify-between items-center text-xs tracking-[0.3em] uppercase opacity-60 font-mono">
        <span>L&apos;OISEAU DÉ BEAUTY</span>
        <span>SOTD EDITION</span>
      </div>

      <div className="my-auto flex flex-col items-center justify-center text-center">
        <h1
          ref={textRef}
          className="font-syne text-4xl sm:text-7xl md:text-8xl tracking-tight font-light uppercase overflow-hidden"
        >
          <span>FORMULATION SCIENCE</span>
        </h1>
        <div className="mt-4 text-sm font-mono tracking-widest text-[#c1d399]">
          AWWARDS KINETIC E-COMMERCE
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-end text-sm font-mono">
          <span className="uppercase tracking-wider text-xs opacity-50">Loading Assets</span>
          <span ref={counterRef} className="text-2xl font-bold font-syne text-[#c1d399]">
            0%
          </span>
        </div>
        <div className="w-full h-[2px] bg-white/15 overflow-hidden">
          <div ref={progressRef} className="h-full bg-[#c1d399] w-0 transition-all duration-75" />
        </div>
      </div>
    </div>
  );
}
