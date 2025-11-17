"use client";

import { useState } from "react";
import supabase from "@/app/supabaseClient";
import { Button } from "@/components/ui/button";

export default function AddNoteModal({ stop, driverId, onClose }) {
  const [note, setNote] = useState("");

  const saveNote = async () => {
    if (!note.trim()) return;

    await supabase.from("stop_notes").insert({
      stop_id: stop.id,
      driver_id: driverId,
      note,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl max-w-md w-full space-y-4">
        <h2 className="text-xl font-bold">Add Note for {stop.name}</h2>

        <textarea
          className="w-full border rounded p-2"
          rows={4}
          placeholder="Write a note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={saveNote}>Save</Button>
        </div>
      </div>
    </div>
  );
}
