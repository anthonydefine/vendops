"use client";

import { useState, useEffect } from "react";
import supabase from "../supabaseClient";

import StopCard from "./components/StopCard";
import IssueModal from "./components/IssueModal";
import AddNoteModal from "./components/AddNoteModal";
import UploadPhotoModal from "./components/UploadPhotoModal";
import ViewPhotoModal from "./components/ViewPhotoModal";
import DriverAvatar from "./components/DriverAvatar";
import Sidebar from "./components/Sidebar";

export default function DriverPage() {
  const [driver, setDriver] = useState(null);
  const [todayStops, setTodayStops] = useState([]);
  const [stopMeta, setStopMeta] = useState({});
  const [loading, setLoading] = useState(true);

  // Modals
  const [activeIssue, setActiveIssue] = useState(null);
  const [activeNote, setActiveNote] = useState(null);
  const [activePhotoStop, setActivePhotoStop] = useState(null);
  const [activePhotoUrl, setActivePhotoUrl] = useState(null);

  const today = new Date();
  const todayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const todayISO = today.toISOString().split("T")[0];

  // -----------------------------
  // Helpers
  // -----------------------------
  function getWeekType(startDate) {
    const start = new Date(startDate);
    const diffWeeks = Math.floor(
      (today - start) / (1000 * 60 * 60 * 24 * 7)
    );
    return diffWeeks % 2 === 0 ? "A" : "B";
  }

  // -----------------------------
  // Refresh stop meta
  // -----------------------------
  const refreshStopMeta = async (stopId) => {
    try {
      const [{ data: issues }, { data: notes }, { data: photos }] =
        await Promise.all([
          supabase.from("issues").select("*").eq("stop_id", stopId),
          supabase.from("notes").select("*").eq("stop_id", stopId),
          supabase
            .from("machine_photos")
            .select("*")
            .eq("stop_id", stopId)
            .order("created_at", { ascending: false }),
        ]);

      // group issues by machine
      const issuesByMachine = {};
      issues?.forEach((i) => {
        const type = i.machine_type || "unknown";
        if (!issuesByMachine[type]) issuesByMachine[type] = [];
        issuesByMachine[type].push(i);
      });

      // group notes by machine
      const notesByMachine = {};
      notes?.forEach((n) => {
        const type = n.machine_type || "unknown";
        if (!notesByMachine[type]) notesByMachine[type] = [];
        notesByMachine[type].push(n);
      });

      setStopMeta((prev) => ({
        ...prev,
        [stopId]: {
          issuesByMachine,
          notesByMachine,
          photos, // keep full list for future carousel
          latestPhoto: photos?.[0]?.photo_url || null,
        },
      }));
    } catch (err) {
      console.error("refreshStopMeta error:", err);
    }
  };

  // -----------------------------
  // Load driver + stops
  // -----------------------------
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setDriver(profile);

      const { data: stops } = await supabase
        .from("stops")
        .select("*")
        .eq("driver_id", user.id)
        .contains("days_of_week", [todayName])
        .lte("start_date", todayISO);

      const filteredStops = stops.filter((stop) => {
        if (stop.frequency === "weekly") return true;
        if (stop.frequency === "biweekly") {
          return getWeekType(stop.start_date) === stop.week_type;
        }
        return false;
      });

      setTodayStops(filteredStops);
      filteredStops.forEach((s) => refreshStopMeta(s.id));

      setLoading(false);
    };

    load();
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">VendOps</h1>
        <DriverAvatar driver={driver} />
      </div>

      <p>
        Today is: <strong>{todayName}</strong>
      </p>

      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-3 md:col-span-2 space-y-4">
          {todayStops.map((stop) => (
            <StopCard
              key={stop.id}
              stop={stop}
              meta={stopMeta[stop.id]}
              onReportIssue={(machine) => setActiveIssueStop({ stop, machine })}
              onAddNote={(machine) => setActiveNoteStop({ stop, machine })}
              onUploadPhoto={(stop) => setActivePhotoStop(stop)}
              onViewPhoto={(stop, photoUrl) => {
                setActivePhotoStop(stop);  // set stop for modal context
                setActivePhotoUrl(photoUrl);
              }}
            />
          ))}
        </div>

        <div className="hidden md:block">
          <Sidebar />
        </div>
      </div>

      {/* ---------------- Modals ---------------- */}

      {activeIssue && (
        <IssueModal
          stop={activeIssue.stop}
          machine={activeIssue.machine}
          driverId={driver.id}
          driverName={driver.full_name}
          onClose={() => {
            refreshStopMeta(activeIssue.stop.id);
            setActiveIssue(null);
          }}
        />
      )}

      {activeNote && (
        <AddNoteModal
          stop={activeNote.stop}
          machine={activeNote.machine}
          driverId={driver.id}
          onClose={() => {
            refreshStopMeta(activeNote.stop.id);
            setActiveNote(null);
          }}
        />
      )}

      {activePhotoStop && (
        <UploadPhotoModal
          stop={activePhotoStop}
          driver={driver}
          onUploaded={() => refreshStopMeta(activePhotoStop.id)}
          onClose={() => setActivePhotoStop(null)}
        />
      )}

      {activePhotoUrl && activePhotoStop && (
        <ViewPhotoModal
          stop={activePhotoStop}
          photoUrl={activePhotoUrl}
          onClose={() => setActivePhotoUrl(null)}
          onRetake={(stop) => setActivePhotoStop(stop)}
        />
      )}
    </div>
  );
}


