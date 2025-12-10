"use client";

import { useState } from "react";
import supabase from "../../supabaseClient";
import { Button } from "../../../components/ui/button";

export default function UploadPhotoModal({ stop, driver, onClose, onUploaded }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event) => {
    console.log("STOP:", stop);
    console.log("DRIVER:", driver);

    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const filePath = `${stop.id}/${Date.now()}-${file.name}`;

      // 1. Upload to storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from("machine_photos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      console.log("Upload result:", uploadData, uploadError);
      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: urlData, error: urlError } = supabase
        .storage
        .from("machine_photos")
        .getPublicUrl(filePath);

      console.log("URL result:", urlData, urlError);
      if (urlError) throw urlError;

      const publicUrl = urlData.publicUrl;

      // 3. Insert metadata record
      const { data: insertData, error: insertError } = await supabase
        .from("machine_photos")
        .insert({
          stop_id: stop.id,
          driver_id: driver.id,
          photo_url: publicUrl,
        });

      console.log("Insert result:", insertData, insertError);
      if (insertError) throw insertError;

      // 4. Callback
      onClose();

    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Failed to upload photo — see console for details.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-80 text-center">
        <h2 className="font-bold text-lg mb-4">Upload Machine Photo</h2>

        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          disabled={uploading}
        />

        {uploading && <p className="mt-2">Uploading...</p>}

        <div className="mt-4 flex justify-between">
          <Button onClick={onClose} variant="secondary" disabled={uploading}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}



