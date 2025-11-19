"use client";

import { useState } from "react";
import supabase from '../../supabaseClient';
import { Button } from "../../../components/ui/button";

export default function IssueModal({ stop, driverId, driverName, onClose }) {
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("low");

  const submitIssue = async () => {
    if (!description.trim()) return;

    await supabase.from("issues").insert({
      stop_id: stop.id,
      driver_id: driverId,
      urgency,
      description,
    });

    // Call API route to send push notification to admins
    await fetch('/api/send-push', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        title: 'New Issue',
        body: `${driverName} reported an issue at ${stop.name}`,
        targetUserId: adminUserId, // or send broadcast and server will query admins
        data: { issueId: newIssueId }
      })
    });

    alert("Issue reported successfully and admin notified!");

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl max-w-md w-full space-y-4">
        <h2 className="text-xl font-bold">Report Issue for {stop.name}</h2>

        <textarea
          className="w-full border rounded p-2"
          rows={4}
          placeholder="Describe the issue..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="space-y-2">
          <label className="font-medium">Urgency</label>
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="low">Low – Not urgent</option>
            <option value="medium">Medium – Needs attention</option>
            <option value="high">High – Requires immediate action</option>
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submitIssue}>Submit</Button>
        </div>
      </div>
    </div>
  );
}
