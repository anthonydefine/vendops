"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function SubscribeButton() {
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    // Ensure OneSignal exists
    if (typeof window !== "undefined") {
      window.OneSignal = window.OneSignal || [];

      // Check if already subscribed
      window.OneSignal.push(async () => {
        const isPushEnabled = await window.OneSignal.isPushNotificationsEnabled();
        setSubscribed(isPushEnabled);
      });
    }
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

  if (subscribed) return <p className="text-green-600 font-semibold">Subscribed to notifications ✅</p>;

  return (
    <Button onClick={handleSubscribe}>
      Subscribe to Push Notifications
    </Button>
  );
}
