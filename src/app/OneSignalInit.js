"use client";

import { useEffect } from "react";
import OneSignal from "react-onesignal";

export default function OneSignalInit() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initOneSignal = async () => {
      await OneSignal.init({ 
        appId: '10f7a6e8-8673-4358-a0ab-00495a00d605', 
        notifyButton: { enable: true } 
      });
    };

    initOneSignal();
  }, []);

  return null; // This component doesn’t render anything
}
