"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible"
import ViewPhotoModal from "./ViewPhotoModal";

export default function StopCard({ stop, meta, onReportIssue, onAddNote, onUploadPhoto }) {
  const [viewPhoto, setViewPhoto] = useState(false);
  return (
    <div className="relative border rounded-lg p-4 flex flex-col gap-2">
      {/* Top-right badges */}
      <div className="absolute top-2 right-2 flex gap-1">
        {meta?.hasIssues && <Badge variant="destructive">🚨</Badge>}
        {meta?.hasNotes && <Badge variant="secondary">📝</Badge>}
        {meta?.hasPhotos && <Badge variant="default">📷</Badge>}
      </div>

      {/* Stop info */}
      <div>
        <h2 className="font-semibold text-lg">{stop.name}</h2>
        {stop.address && <p className="text-sm text-gray-500">{stop.address}</p>}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button variant="destructive" onClick={() => onReportIssue(stop)}>
          Report Issue
        </Button>
        <Button variant="secondary" onClick={() => onAddNote(stop)}>
          Add Note
        </Button>
        <Button onClick={() => onUploadPhoto(stop)}>
          Upload Photo
        </Button>

        {meta?.latestPhoto && (
          <Button variant="outline" onClick={() => setViewPhoto(true)}>
            View Latest Photo
          </Button>
        )}
      </div>

      {viewPhoto && (
        <ViewPhotoModal 
          photoUrl={meta?.photos[0]?.photo_url} 
          onClose={() => setViewPhoto(false)} 
        />
      )}

      {/* Collapsible details */}
      {meta && (
        <Collapsible>
          <CollapsibleTrigger>View Details</CollapsibleTrigger>
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

            {meta.photos?.length > 0 && (
              <div>
                <strong>Photos:</strong>
                <div className="flex gap-2 flex-wrap">
                  {meta.photos.map((p) => (
                    <a
                      key={p.id}
                      href={p.photo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-blue-600"
                    >
                      View
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
