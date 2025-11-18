"use client";

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";

export default function SubscribeButton() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div>
      {subscribed ? (
        <p>You are subscribed to notifications ✅</p>
      ) : (
        <p>You are not subscribed to notifications</p>
      )}
    </div>
    
  );
}
