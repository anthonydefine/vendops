"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "../../../components/ui/button";

export default function ViewPhotoModal({ photoUrl, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-xl max-w-md w-full flex flex-col items-center">
        <h2 className="font-bold mb-3 text-lg">Machine Photo</h2>
        
        <Image 
          src={photoUrl} 
          alt="Machine Photo" 
          className="max-h-[60vh] w-auto rounded-md mb-4 object-contain"
          width={500}
          height={500}
          unoptimized
        />

        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}
