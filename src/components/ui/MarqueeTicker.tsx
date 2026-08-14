"use client";

import React from "react";

export default function MarqueeTicker() {
  const items = [
    "*",
    "GLOBE TRADING ",
    "NEW BIOTECH FORMULATIONS",
    "*",
    "50% VIP PRIVILEGE",
    "LIMITED GRASSE BATCH",
    "*",
    "GLOBE TRADING ",
    "PARIS • SEOUL LABORATORY",
    "*",
    "NEW IN",
    "CELLULAR ELIXIR",
  ];

  return (
    <div className="w-full bg-[#c1d399] text-[#111111] py-3.5 overflow-hidden border-y border-[#111111] relative select-none">
      <div className="animate-marquee flex items-center whitespace-nowrap font-mono text-xs md:text-sm uppercase tracking-[0.25em] font-bold">
        {items.concat(items).map((text, index) => (
          <div key={index} className="flex items-center mx-8">
            <span className={text === "*" ? "text-lg md:text-2xl font-black leading-none" : ""}>
              {text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
