"use client";

import React, { useState, useMemo, forwardRef } from "react";
import { Button } from "../../../components/ui/button";
import { CameraIcon } from "lucide-react";
import { MessageSquareMore, MessageSquareWarning } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";

// Simple emoji icons per machine
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
  const [activeMachineView, setActiveMachineView] = useState(null); // single machine issue view

  // Stable refs for scrolling
  const machineRefs = useMemo(() => {
    const refs = {};
    stop.machines?.forEach((m) => {
      refs[m] = React.createRef();
    });
    return refs;
  }, [stop.machines]);

  // Group issues and notes by machine
  const issuesByMachine = useMemo(() => {
    return (meta?.issues || []).reduce((acc, i) => {
      const type = i.machine_type || "unknown";
      if (!acc[type]) acc[type] = [];
      acc[type].push(i);
      return acc;
    }, {});
  }, [meta?.issues]);

  const notesByMachine = useMemo(() => {
    return (meta?.notes || []).reduce((acc, n) => {
      const type = n.machine_type || "unknown";
      if (!acc[type]) acc[type] = [];
      acc[type].push(n);
      return acc;
    }, {});
  }, [meta?.notes]);

  // --- Render single machine view if activeMachineView is set ---
  if (activeMachineView) {
    const machine = activeMachineView;
    return (
      <div className="relative border-2 shadow-xl rounded-lg p-4">
        <div className="absolute top-2 right-2">
          <Button size="small" variant="ghost" onClick={() => setActiveMachineView(null)}>
            ← Go Back
          </Button>
        </div>
        <MachineRow
          stop={stop}
          machine={machine}
          issues={issuesByMachine[machine] || []}
          notes={notesByMachine[machine] || []}
          latestPhoto={machine === "snack" ? meta?.latestPhoto : null}
          onAddNote={onAddNote}
          onReportIssue={onReportIssue}
          onUploadPhoto={onUploadPhoto}
          onViewPhoto={onViewPhoto}
        />
      </div>
    );
  }

  // --- Normal stop card view ---
  return (
    <div className="relative border-2 shadow-xl rounded-lg p-4 flex flex-col gap-2 hover:border-blue-500">
      {/* Stop info */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-semibold text-lg">{stop.name}</h2>
          {stop.address && <p className="text-sm text-gray-500">{stop.address}</p>}
        </div>

        {/* Top-right machine icons */}
        <div className="flex gap-2">
          {stop.machines?.map((machine) => {
            const hasIssues = (issuesByMachine[machine] || []).length > 0;
            const hasNotes = (notesByMachine[machine] || []).length > 0;
            const icon = MACHINE_ICONS[machine] || MACHINE_ICONS.unknown;

            return (
              <span
                key={machine}
                className="relative cursor-pointer text-xl"
                onClick={() => {
                  if (hasIssues) {
                    setActiveMachineView(machine);
                  } else {
                    setIsOpen(true);
                    setTimeout(() => {
                      machineRefs[machine]?.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }, 100);
                  }
                }}
              >
                {icon}
                {(hasIssues || hasNotes) && (
                  <span className="absolute -top-2 -right-2 text-sm">
                    {hasIssues && "⚠️"}
                    {hasNotes && "📝"}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* Collapsible for machine details */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger>
          <span className="p-2 border rounded-lg hover:bg-slate-50 cursor-pointer mt-2 inline-block">
            {isOpen ? "Hide Machines" : "View Machines"}
          </span>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-2 space-y-2">
          {stop.machines?.map((machine) => (
            <MachineRow
              key={machine}
              ref={machineRefs[machine]}
              stop={stop}
              machine={machine}
              issues={issuesByMachine[machine] || []}
              notes={notesByMachine[machine] || []}
              latestPhoto={machine === "snack" ? meta?.latestPhoto : null}
              onAddNote={onAddNote}
              onReportIssue={onReportIssue}
              onUploadPhoto={onUploadPhoto}
              onViewPhoto={onViewPhoto}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// MachineRow forwards ref for scrolling
const MachineRow = forwardRef(function MachineRow(
  { stop, machine, issues, notes, latestPhoto, onAddNote, onReportIssue, onUploadPhoto, onViewPhoto },
  ref
) {
  return (
    <div
      ref={ref}
      className="border rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-2">
        <span className="text-xl">{MACHINE_ICONS[machine] || "🔧"}</span>
        <span className="font-semibold capitalize">{machine}</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        {/* Report Issue button always says 'Report Issue' */}
        <Button size="small" variant="ghost" onClick={() => onReportIssue(machine)}>
          Report Issue
        </Button>

        {/* Notes button */}
        <Button size="small" variant="ghost" onClick={() => onAddNote(machine)}>
          Add Note
        </Button>

        {/* Snack machine photo */}
        {machine === "snack" && (
          <Button
            size="small"
            variant="outline"
            onClick={() =>
              latestPhoto ? onViewPhoto(latestPhoto) : onUploadPhoto(machine)
            }
          >
            📸 {latestPhoto ? "View Photo" : "Upload Photo"}
          </Button>
        )}
      </div>
    </div>
  );
});





