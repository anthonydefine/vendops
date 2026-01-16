"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import supabase from "../../../app/supabaseClient";

export default function UploadPhotoModal({ stop, driver, onClose, onUploaded }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      // 1️⃣ Create storage path: stop ID + timestamp + original filename
      const filename = `${Date.now()}-${file.name}`;
      const filePath = `${stop.id}/${filename}`;

      console.log("Uploading to:", filePath);

      // 2️⃣ Upload to Supabase Storage
      const { data: storageData, error: uploadError } =
        await supabase.storage.from("machine_photos").upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3️⃣ Get public URL
      const { data: urlData } = supabase.storage
        .from("machine_photos")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      console.log("Public URL:", publicUrl);

      // 4️⃣ Insert metadata into DB (stop-level only)
      const { error: dbError } = await supabase
        .from("machine_photos")
        .insert({
          stop_id: stop.id,
          driver_id: driver.id,
          photo_url: publicUrl,
          created_at: new Date().toISOString(),
        });

      if (dbError) throw dbError;

      if (onUploaded) onUploaded(publicUrl);
      onClose();
    } catch (err) {
      console.error("Error uploading photo:", err.message || err);
      alert("Failed to upload photo. Please try again.");
    }

    setUploading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded shadow-lg w-80">
        <h2 className="font-semibold text-lg mb-2">Upload Photo</h2>

        <input type="file" accept="image/*" onChange={handleFileChange} />

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {uploading && <p className="text-sm mt-2">Uploading...</p>}
        </div>
      </div>
    </div>
  );
}





