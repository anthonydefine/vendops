// pages/api/send-push.js
import webpush from "web-push";
import { createClient } from "../supabaseClient";

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// configure VAPID
webpush.setVapidDetails(
  `mailto:you@yourdomain.com`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { title, body, targetUserId, data } = req.body; // usage: targetUserId or broadcast

  // fetch subscriptions for admins or specific users
  // Example: notify all admins: select user_id where role = 'admin' OR use push_subscriptions table
  // Assuming push_subscriptions has subscription json
  let { data: subs, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('id, user_id, subscription')
    .eq('user_id', targetUserId); // or remove eq to send to all

  if (error) {
    console.error("error fetching subs", error);
    return res.status(500).json({ error: error.message });
  }

  const payload = JSON.stringify({ title, body, data });

  const results = [];
  for (const row of subs) {
    try {
      const subscription = typeof row.subscription === 'string' ? JSON.parse(row.subscription) : row.subscription;
      await webpush.sendNotification(subscription, payload);
      results.push({ id: row.id, ok: true });
    } catch (e) {
      console.error('send error', e);
      results.push({ id: row.id, ok: false, error: e.message });
      // optionally remove invalid subscriptions
    }
  }

  res.json({ results });
}
