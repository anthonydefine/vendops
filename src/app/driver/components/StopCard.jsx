"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { CameraIcon } from "lucide-react";
import { MessageSquareMore } from "lucide-react";
import { MessageSquareWarning } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible"

export default function StopCard({ stop, meta, onReportIssue, onAddNote, onUploadPhoto, onViewPhoto }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative border-2 shadow-xl rounded-lg p-4 flex flex-col gap-2 hover:border-blue-500">
      {/* Top-right badges */}
      <div className="absolute top-2 right-2 flex gap-1">
        {meta?.hasIssues && <MessageSquareWarning />}
        {meta?.hasNotes && <MessageSquareMore />}
        {meta?.hasPhotos && <CameraIcon />}
      </div>

      {/* Stop info */}
      <div>
        <h2 className="font-semibold text-lg">{stop.name}</h2>
        {stop.address && <p className="text-sm text-gray-500">{stop.address}</p>}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button variant='ghost' onClick={() => onReportIssue(stop)}>
          <MessageSquareWarning />
          <span className="hidden md:block">
            Report Issue
          </span>
        </Button>
        <Button variant="ghost" onClick={() => onAddNote(stop)}>
          <MessageSquareMore />
          <span className="hidden md:block">
            Add Note
          </span>
        </Button>
        {meta?.latestPhoto ? (
          <Button
            variant="outline"
            onClick={() => onViewPhoto(meta.latestPhoto)}
          >
            View Latest Photo
          </Button>
        ) : (
          <Button className='p-2' variant='outline' size='small' onClick={() => onUploadPhoto(stop)}>
              <CameraIcon />
              Upload Photo
          </Button>
        )}
        
        
      </div>
      {/* Collapsible details */}
      {(meta?.issues?.length > 0 || meta?.notes?.length > 0) && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger>
            <span className="p-2 border rounded-lg hover:bg-slate-50 cursor-pointer">
              {isOpen ? "Hide Details" : "View Details"}
            </span>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-2 space-y-2">
            
            {meta.issues?.length > 0 && (
              <div>
                <strong>Issues:</strong>
                <ul className="list-disc ml-4">
                  {meta.issues.map((i) => (
                    <li key={i.id}>
                      {i.description} ({i.urgency})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {meta.notes?.length > 0 && (
              <div>
                <strong>Notes:</strong>
                <ul className="list-disc ml-4">
                  {meta.notes.map((n, idx) => (
                    <li key={idx}>{n.note}</li>
                  ))}
                </ul>
              </div>
            )}

          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
