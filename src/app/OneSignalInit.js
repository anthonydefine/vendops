"use client";

import { useEffect } from "react";
import OneSignal from "react-onesignal";

export default function OneSignalInit() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initOneSignal = async () => {
      await OneSignal.init({ 
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID, 
        notifyButton: { enable: true } 
      });
    };

    initOneSignal();
  }, []);

  return null; // This component doesn’t render anything
}
