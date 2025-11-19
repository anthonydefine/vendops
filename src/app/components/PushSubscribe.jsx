// app/driver/components/PushSubscribe.jsx
"use client";
import { useState } from "react";
import supabase from "../supabaseClient"; // your supabase client
import { urlBase64ToUint8Array } from "../../lib/push-utils";

export default function PushSubscribe({ user }) {
  const [subscribed, setSubscribed] = useState(false);

  async function subscribe() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Push notifications not supported in this browser.");
      return;
    }

    const registration = await navigator.serviceWorker.register("/sw.js");
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

    console.log("VAPID KEY:", process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey
    });

    // Save subscription to Supabase push_subscriptions table
    const payload = {
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.getKey ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))) : null,
      auth: subscription.getKey ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')))) : null,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from("push_subscriptions").insert(payload);
    if (error) {
      console.error("Failed to save subscription:", error);
      return;
    }
    setSubscribed(true);
  }

  return (
    <div>
      <button className="bg-teal-300 p-2 rounded-2xl hover:bg-teal-500 cursor-pointer" onClick={subscribe} disabled={subscribed}>
        {subscribed ? "Subscribed" : "Subscribe to Push"}
      </button>
    </div>
  );
}
