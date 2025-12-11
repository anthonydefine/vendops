"use client";

import { Button } from "../../../components/ui/button";

export default function ViewPhotoModal({ photoUrl, onClose }) {
  if (!photoUrl) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-4 rounded-xl w-full max-w-md shadow-xl flex flex-col items-center">
        <h2 className="font-bold mb-4 text-xl">Machine Photo</h2>

        <div className="w-full max-h-[60vh] flex justify-center mb-4 overflow-hidden">
          <img
            src={photoUrl}
            alt="Machine Photo"
            className="object-contain max-h-[60vh] rounded-md"
          />
        </div>

        <Button onClick={onClose} className="w-full">
          Close
        </Button>
      </div>
    </div>
  );
}

