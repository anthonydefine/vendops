"use client";

import { useEffect } from "react";

export default function OneSignalInit() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const script = document.createElement("script");
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.async = true;
    document.head.appendChild(script);

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function (OneSignal) {
      await OneSignal.init({
        appId: "10f7a6e8-8673-4358-a0ab-00495a00d605",
        safari_web_id: "web.onesignal.auto.2e21fe47-8329-4413-bae9-ecef4da3342d",
        notifyButton: {
          enable: true,
        },
      });
    });
  }, []);

  return null;
}
