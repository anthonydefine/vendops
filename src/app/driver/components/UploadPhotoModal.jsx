// UploadPhotoModal.jsx

"use client";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import supabase from "../../../app/supabaseClient";

export default function UploadPhotoModal({ stop, machine, driver, onClose, onUploaded }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      // 1️⃣ Create correct path
      const filename = `${Date.now()}-${file.name}`;
      const filePath = `${stop.id}/${filename}`;

      console.log("Uploading to:", filePath); // <--- GOOD

      // 2️⃣ Upload file
      const { data: storageData, error: uploadError } =
        await supabase.storage.from("machine_photos").upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3️⃣ Get public URL from EXACT SAME filePath
      const { data: urlData } = supabase.storage
        .from("machine_photos")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      console.log("Public URL:", publicUrl); // <--- GOOD

      // 4️⃣ Insert metadata into DB
      const { error: dbError } = await supabase
        .from("machine_photos")
        .insert({
          stop_id: stop.id,
          driver_id: driver.id,
          machine_type: machine.machine,
          photo_url: publicUrl,
          created_at: new Date().toISOString(),
        });

      if (dbError) throw dbError;

      if (onUploaded) onUploaded(publicUrl);
      onClose();
    } catch (err) {
      console.error("Error uploading photo:", err.message);
    }

    setUploading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white p-4 rounded shadow-lg w-80">
        <h2 className="font-semibold text-lg mb-2">Upload Photo</h2>

        <input type="file" accept="image/*" onChange={handleFileChange} />

        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        {uploading && <p className="text-sm mt-2">Uploading...</p>}
      </div>
    </div>
  );
}




