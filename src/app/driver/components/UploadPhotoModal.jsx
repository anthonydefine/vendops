"use client";

import { useState } from "react";
import supabase from "../../supabaseClient";
import { Button } from "../../../components/ui/button";

export default function UploadPhotoModal({ stop, driver, onClose, onUploaded }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      const filePath = `${stop.id}/${Date.now()}.jpg`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("machine_photos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("machine_photos")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // Insert DB row
      await supabase.from("machine_photos").insert({
        stop_id: stop.id,
        driver_id: driver.id,
        photo_url: publicUrl,
      });

      onUploaded(publicUrl);
      onClose();

    } catch (err) {
      console.error("Upload error:", err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-80 text-center">
        <h2 className="font-bold mb-3">Upload Machine Photo</h2>

        {/* THIS TRIGGERS THE CAMERA ON MOBILE */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleUpload}
        />

        <Button onClick={onClose} className="mt-4" variant="secondary">
          Cancel
        </Button>
      </div>
    </div>
  );
}

