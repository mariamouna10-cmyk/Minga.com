/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Monitor, Smartphone, Wifi, Battery, Radio } from "lucide-react";

interface DeviceFrameProps {
  children: React.ReactNode;
  currentLang: "en" | "ar";
}

export default function DeviceFrame({ children, currentLang }: DeviceFrameProps) {
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  const isAr = currentLang === "ar";

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 flex flex-col transition-colors duration-300">
      
      {/* Platform Simulator Control Panel */}
      <div className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 py-2 flex flex-col sm:flex-row justify-between items-center gap-2 z-50 shadow-sm text-xs select-none">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
          </span>
          <span className="font-bold text-neutral-800 dark:text-neutral-200">
            {isAr ? "محاكي المنصات لمينغا" : "Minga.com Multi-Platform Simulator"}
          </span>
        </div>

        {/* View Mode buttons */}
        <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
          <button
            onClick={() => setDeviceMode("desktop")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              deviceMode === "desktop" 
                ? "bg-white dark:bg-neutral-700 text-indigo-600 dark:text-white shadow-sm" 
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
            id="simulator-view-desktop"
          >
            <Monitor size={14} />
            <span>{isAr ? "موقع الويب الكامل" : "E-commerce Website"}</span>
          </button>
          <button
            onClick={() => setDeviceMode("mobile")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              deviceMode === "mobile" 
                ? "bg-white dark:bg-neutral-700 text-indigo-600 dark:text-white shadow-sm" 
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
            id="simulator-view-mobile"
          >
            <Smartphone size={14} />
            <span>{isAr ? "تطبيق الموبايل (iOS/Android)" : "Mobile App (Android/iOS)"}</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-neutral-400 text-[10px] font-mono">
          <span>PORT: 3000</span>
          <span>•</span>
          <span>SPEED: EXCELLENT</span>
        </div>
      </div>

      {/* Main Container viewport */}
      <div className="flex-1 flex justify-center items-center p-0 md:p-6 bg-neutral-100 dark:bg-neutral-950 transition-colors duration-300">
        {deviceMode === "desktop" ? (
          /* Full Website Container */
          <div className="w-full h-full min-h-[calc(100vh-42px)] flex flex-col bg-white dark:bg-neutral-900 shadow-sm">
            {children}
          </div>
        ) : (
          /* Mobile Frame Shell */
          <div className="relative w-[375px] h-[812px] bg-neutral-950 rounded-[56px] border-[12px] border-neutral-900 shadow-2xl overflow-hidden flex flex-col my-4">
            
            {/* Phone Screen Notch / Speaker bar */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-neutral-900 rounded-b-2xl z-50 flex items-center justify-center">
              <div className="w-16 h-1 bg-neutral-850 rounded-full mb-1"></div>
            </div>

            {/* Simulated Smartphone Status Bar */}
            <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white pt-3 px-6 pb-1.5 text-[10px] font-bold flex justify-between items-center z-40 relative select-none font-sans">
              <span>14:40</span>
              <div className="flex items-center gap-1">
                <Wifi size={10} />
                <span className="text-[8px] tracking-widest font-bold">5G</span>
                <Battery size={12} className="rotate-0" />
              </div>
            </div>

            {/* Inner scrollable phone body */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-neutral-900 rounded-b-[40px] flex flex-col">
              {children}
            </div>

            {/* Simulated iPhone Home Indicator swipe bar */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-neutral-400 rounded-full z-40"></div>
          </div>
        )}
      </div>

    </div>
  );
}
