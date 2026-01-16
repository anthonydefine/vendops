"use client";

import { Button } from "../../../components/ui/button";
import supabase from "../../supabaseClient";

export default function ViewPhotoModal({
  stop,
  photoUrl,
  onClose,
  onRetake,
}) {
  if (!photoUrl || !stop) return null;

  const handleRetake = async () => {
    try {
      // 1️⃣ Fetch latest photo record for this stop
      const { data: photos, error: fetchError } = await supabase
        .from("machine_photos")
        .select("*")
        .eq("stop_id", stop.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;
      if (!photos || photos.length === 0) {
        throw new Error("No photo found to retake.");
      }

      const photo = photos[0];

      // 2️⃣ Delete DB record
      const { error: deleteError } = await supabase
        .from("machine_photos")
        .delete()
        .eq("id", photo.id);

      if (deleteError) throw deleteError;

      // 3️⃣ Delete from storage
      const filePath = photo.photo_url.split("/machine_photos/")[1];

      if (filePath) {
        await supabase.storage
          .from("machine_photos")
          .remove([filePath]);
      }

      // 4️⃣ Close viewer & reopen upload
      onClose();
      onRetake(stop);
    } catch (err) {
      console.error("Error retaking photo:", err);
      alert("Failed to retake photo. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-4 rounded-xl w-full max-w-md shadow-xl flex flex-col items-center gap-4">
        <h2 className="font-bold text-xl">Stop Photo</h2>

        <div className="w-full max-h-[60vh] flex justify-center overflow-hidden">
          <img
            src={photoUrl}
            alt="Stop Photo"
            className="object-contain max-h-[60vh] rounded-md"
          />
        </div>

        <div className="flex w-full gap-2">
          <Button
            variant="outline"
            className="w-1/2"
            onClick={onClose}
          >
            Close
          </Button>

          <Button
            className="w-1/2"
            onClick={handleRetake}
          >
            Retake Photo
          </Button>
        </div>
      </div>
    </div>
  );
}


