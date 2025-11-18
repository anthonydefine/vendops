"use client";

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";

export default function SubscribeButton() {
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.OneSignal) return; // SDK not loaded yet

    window.OneSignal.push(async function () {
      try {
        const isEnabled = await window.OneSignal.isPushNotificationsEnabled();
        setSubscribed(isEnabled);
      } catch (err) {
        console.error("OneSignal not ready yet:", err);
      }
    });
  }, []);

  const handleSubscribe = () => {
    if (typeof window === "undefined") return;

    window.OneSignal.push(() => {
      window.OneSignal.showNativePrompt(); // asks the user to subscribe
      window.OneSignal.on("subscriptionChange", (isSubscribed) => {
        setSubscribed(isSubscribed);
      });
    });
  };

  return (
    <div>
      {subscribed ? (
        <p>You are subscribed to notifications ✅</p>
      ) : (
        <Button onClick={handleSubscribe}>
          Subscribe to Push Notifications
        </Button>
      )}
    </div>
    
  );
}
