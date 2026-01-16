"use client";

import React, { useState, forwardRef } from "react";
import { Button } from "../../../components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";

const MACHINE_ICONS = {
  snack: "🍫",
  soda: "🥤",
  coffee: "☕",
  unknown: "🔧",
};

export default function StopCard({
  stop,
  meta,
  onReportIssue,
  onAddNote,
  onUploadPhoto,
  onViewPhoto,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [issueViewMachine, setIssueViewMachine] = useState(null);

  const issuesByMachine = meta?.issuesByMachine || {};
  const notesByMachine = meta?.notesByMachine || {};
  const latestPhoto = meta?.latestPhoto || null;

  // --- FULL ISSUE VIEW ---
  if (issueViewMachine) {
    const issues = issuesByMachine[issueViewMachine] || [];

    return (
      <div className="relative border-2 rounded-lg p-4 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">
            {stop.name} — {issueViewMachine.toUpperCase()} Issues
          </h2>
          <Button
            size="small"
            variant="ghost"
            onClick={() => setIssueViewMachine(null)}
          >
            ← Back
          </Button>
        </div>

        {issues.length === 0 ? (
          <p className="text-gray-500">No issues reported.</p>
        ) : (
          <ul className="space-y-3">
            {issues.map((issue) => (
              <li key={issue.id} className="border rounded-lg p-3">
                <div className="font-medium">
                  Urgency:{" "}
                  <span className="uppercase">{issue.urgency}</span>
                </div>
                <p className="text-sm text-gray-700">
                  {issue.description}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // --- NORMAL STOP CARD ---
  return (
    <div className="relative border-2 shadow-xl rounded-lg p-4 flex flex-col gap-3 hover:border-blue-500">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h2 className="font-semibold text-lg">{stop.name}</h2>
          {stop.address && (
            <p className="text-sm text-gray-500">{stop.address}</p>
          )}

          <Button
            size="small"
            variant="outline"
            onClick={() => {
              if (meta?.latestPhoto) {
                onViewPhoto(stop, meta.latestPhoto);
              } else {
                onUploadPhoto(stop);
              }
            }}
          >
            📸 {meta?.latestPhoto ? "View Photo" : "Upload Photo"}
          </Button>
        </div>

        {/* Machine Icons */}
        <div className="flex gap-2">
          {stop.machines?.map((machine) => {
            const hasIssues =
              (issuesByMachine[machine]?.length || 0) > 0;
            const hasNotes =
              (notesByMachine[machine]?.length || 0) > 0;

            return (
              <button
                key={machine}
                className="relative text-xl"
                onClick={() => {
                  if (hasIssues) {
                    setIssueViewMachine(machine);
                  } else {
                    setIsOpen(true);
                  }
                }}
              >
                {MACHINE_ICONS[machine] || MACHINE_ICONS.unknown}

                {(hasIssues || hasNotes) && (
                  <span className="absolute -top-2 -right-2 text-xs">
                    {hasIssues ? "⚠️" : "📝"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Machines */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger>
          <span className="inline-block p-2 border rounded-lg hover:bg-slate-50 cursor-pointer mt-2">
            {isOpen ? "Hide Machines" : "View Machines"}
          </span>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-3 space-y-2">
          {stop.machines?.map((machine) => (
            <MachineRow
              key={machine}
              stop={stop}
              machine={machine}
              issues={issuesByMachine[machine] || []}
              notes={notesByMachine[machine] || []}
              onAddNote={onAddNote}
              onReportIssue={onReportIssue}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

/* -----------------------------
   MACHINE ROW
----------------------------- */
const MachineRow = forwardRef(function MachineRow(
  {
    stop,
    machine,
    issues,
    notes,
    onAddNote,
    onReportIssue,
  },
  ref
) {
  return (
    <div
      ref={ref}
      className="border rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">
          {MACHINE_ICONS[machine] || "🔧"}
        </span>
        <span className="font-semibold capitalize">{machine}</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          size="small"
          variant="ghost"
          onClick={() => onReportIssue({ stop, machine })}
        >
          Report Issue
        </Button>

        <Button
          size="small"
          variant="ghost"
          onClick={() => onAddNote({ stop, machine })}
        >
          Add Note
        </Button>
      </div>
    </div>
  );
});









