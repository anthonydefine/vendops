// app/api/send-admin-notification/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title, message } = await req.json();

    const ONE_SIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
    const ONE_SIGNAL_REST_KEY = process.env.ONESIGNAL_REST_KEY;

    if (!ONE_SIGNAL_APP_ID || !ONE_SIGNAL_REST_KEY) {
      return NextResponse.json({ error: "Missing OneSignal keys" }, { status: 500 });
    }

    const body = {
      app_id: ONE_SIGNAL_APP_ID,
      included_segments: ["Admins"], // make sure admins are tagged this way in OneSignal
      headings: { en: title },
      contents: { en: message },
    };

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${ONE_SIGNAL_REST_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error sending OneSignal notification:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
