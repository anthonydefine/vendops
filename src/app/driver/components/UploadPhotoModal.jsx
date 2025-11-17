"use client";

import { useState } from "react";
import supabase from "../../supabaseClient";
import { Button } from "@/components/ui/button";

export default function UploadPhotoModal({ stop, onClose }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const uploadPhoto = async () => {
    if (!file) return;

    setUploading(true);

    const filePath = `${stop.id}/${Date.now()}-${file.name}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("machine_photos")
      .upload(filePath, file);

    if (uploadError) {
      console.error(uploadError);
      setUploading(false);
      return;
    }

    // Get public URL
    const { data } = supabase.storage
      .from("machine_photos")
      .getPublicUrl(filePath);

    // Save in DB
    await supabase.from("stop_photos").insert({
      stop_id: stop.id,
      image_url: data.publicUrl,
    });

    setUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl max-w-md w-full space-y-4">
        <h2 className="text-xl font-bold">Upload Photo for {stop.name}</h2>

        <input
          type="file"
          accept="image/*"
          className="w-full"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={uploading} onClick={uploadPhoto}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
}
