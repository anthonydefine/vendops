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
import ThemeToggle from "../components/ThemeToggle";

export default function DriverPage() {
  const [driver, setDriver] = useState(null);
  const [todayStops, setTodayStops] = useState([]);
  const [stopMeta, setStopMeta] = useState({});
  const [loading, setLoading] = useState(true);

  // Modal state
  const [activeIssueStop, setActiveIssueStop] = useState(null);
  const [activeNoteStop, setActiveNoteStop] = useState(null);
  const [activePhotoStop, setActivePhotoStop] = useState(null);
  const [activePhotoViewUrl, setActivePhotoViewUrl] = useState(null);

  const today = new Date();
  const todayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const todayISO = today.toISOString().split("T")[0];

  // ---------- Helpers ----------
  function getWeekType(startDate) {
    const start = new Date(startDate);
    const diffWeeks = Math.floor(
      (today - start) / (1000 * 60 * 60 * 24 * 7)
    );
    return diffWeeks % 2 === 0 ? "A" : "B";
  }

  const refreshStopMeta = async (stopId) => {
    console.log("Refreshing stop meta for:", stopId);

    try {
      const [{ data: issues, error: issuesError },
            { data: notes, error: notesError },
            { data: photos, error: photosError }] = await Promise.all([
        supabase.from("issues").select("*").eq("stop_id", stopId),
        supabase.from("notes").select("*").eq("stop_id", stopId),
        supabase
          .from("machine_photos")
          .select("*")
          .eq("stop_id", stopId)
          .order("created_at", { ascending: false }),
      ]);

      if (issuesError) throw issuesError;
      if (notesError) throw notesError;
      if (photosError) throw photosError;

      // Group issues and notes by machine
      const issuesByMachine = {};
      issues?.forEach((i) => {
        const type = i.machine_type || "unknown";
        if (!issuesByMachine[type]) issuesByMachine[type] = [];
        issuesByMachine[type].push(i);
      });

      const notesByMachine = {};
      notes?.forEach((n) => {
        const type = n.machine_type || "unknown";
        if (!notesByMachine[type]) notesByMachine[type] = [];
        notesByMachine[type].push(n);
      });

      // Group latest photo by machine
      const photosByMachine = {};
      photos?.forEach((p) => {
        if (!photosByMachine[p.machine_type]) {
          photosByMachine[p.machine_type] = p.photo_url;
        }
      });

      setStopMeta((prev) => ({
        ...prev,
        [stopId]: {
          issuesByMachine,
          notesByMachine,
          photosByMachine,
        },
      }));
    } catch (err) {
      console.error("Error refreshing stop meta:", err.message || err);
    }
  };

  // ---------- Load Driver + Stops ----------
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

      const { data: stops, error } = await supabase
        .from("stops")
        .select("*")
        .eq("driver_id", user.id)
        .contains("days_of_week", [todayName])
        .lte("start_date", todayISO);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const filteredStops = stops.filter((stop) => {
        if (stop.frequency === "weekly") return true;
        if (stop.frequency === "biweekly") {
          return getWeekType(stop.start_date) === stop.week_type;
        }
        return false;
      });

      setTodayStops(filteredStops);

      filteredStops.forEach((stop) => refreshStopMeta(stop.id));

      setLoading(false);
    };

    load();
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;

  // ---------- Render ----------
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">VendOps</h1>
        <div>
          <DriverAvatar driver={driver} />
        </div>
      </div>

      <p>
        Today is: <strong>{todayName}</strong>
      </p>

      {todayStops.length === 0 && (
        <p className="text-muted-foreground">
          No stops assigned for today.
        </p>
      )}

      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-3 md:col-span-2 space-y-4">
          {todayStops.map((stop) => (
            <StopCard
              key={stop.id}
              stop={stop}
              meta={stopMeta[stop.id]}
              onReportIssue={(machine) => setActiveIssueStop({ stop, machine })}
              onAddNote={(machine) => setActiveNoteStop({ stop, machine })}
              onUploadPhoto={(machine) => setActivePhotoStop({ stop, machine })}
              onViewPhoto={(url) => setActivePhotoViewUrl(url)}
            />
          ))}
        </div>

        <div className="hidden md:block">
          <Sidebar />
        </div>
      </div>

      {/* --- Modals --- */}
      {activeIssueStop && (
        <IssueModal
          stop={activeIssueStop?.stop}
          machine={activeIssueStop?.machine}
          driverId={driver?.id}
          driverName={driver?.full_name}
          onClose={(newIssue) => {
            if (newIssue) {
              setStopMeta((prev) => ({
                ...prev,
                [newIssue.stop_id]: {
                  ...prev[newIssue.stop_id],
                  issues: [...(prev[newIssue.stop_id]?.issues || []), newIssue],
                },
              }));
            }
            setActiveIssueStop(null);
          }}
        />
      )}

      {activeNoteStop && (
        <AddNoteModal
          stop={activeNoteStop}
          driverId={driver?.id}
          onClose={() => setActiveNoteStop(null)}
        />
      )}

      {activePhotoStop && (
        <UploadPhotoModal
          stop={activePhotoStop?.stop}
          machine={activePhotoStop?.machine}
          driver={driver}
          onUploaded={() => refreshStopMeta(activePhotoStop.stop.id)}
          onClose={() => setActivePhotoStop(null)}
        />
      )}

      {activePhotoViewUrl && (
        <ViewPhotoModal
          photoUrl={activePhotoViewUrl}
          onClose={() => setActivePhotoViewUrl(null)}
        />
      )}
    </div>
  );
}


