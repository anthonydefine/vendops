"use client";

import { useState, useEffect } from "react";
import supabase from "../supabaseClient";

import { Button } from "../../components/ui/button";
import StopCard from "./components/StopCard";
import IssueModal from "./components/IssueModal";
import AddNoteModal from "./components/AddNoteModal";
import UploadPhotoModal from "./components/UploadPhotoModal";

export default function DriverPage() {
  const [driver, setDriver] = useState(null);
  const [todayRoute, setTodayRoute] = useState(null);
  const [todayStops, setTodayStops] = useState([]);
  const [stopMeta, setStopMeta] = useState({});
  const [loading, setLoading] = useState(true);

  // Modal states
  const [activeIssueStop, setActiveIssueStop] = useState(null);
  const [activeNoteStop, setActiveNoteStop] = useState(null);
  const [activePhotoStop, setActivePhotoStop] = useState(null);

  const currentDay = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // Load driver + route
  useEffect(() => {
    const loadDriver = async () => {
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

      const { data: routeData } = await supabase
        .from("routes")
        .select("*")
        .eq("driver_id", user.id);

      const todaysRoute = routeData?.find(
        (r) => r.day_of_week === currentDay
      );

      setTodayRoute(todaysRoute || null);
      setLoading(false);
    };

    loadDriver();
  }, [currentDay]);

  // Load the STOP OBJECTS
  useEffect(() => {
    if (!todayRoute?.stops?.length) {
      setTodayStops([]);
      return;
    }

    const loadStops = async () => {
      const stopIds = todayRoute.stops.map((s) => s.toString());

      const { data } = await supabase
        .from("stops")
        .select("*")
        .in("id", stopIds);

      const sorted = stopIds
        .map((id) => data.find((s) => s.id === id))
        .filter(Boolean);

      setTodayStops(sorted);
    };

    loadStops();
  }, [todayRoute]);

  // Load per-stop metadata (issues, notes, photos)
  useEffect(() => {
    if (todayStops.length === 0) return;

    const fetchMeta = async () => {
      const meta = {};

      for (const stop of todayStops) {
        const stopId = stop.id;

        const { data: issues } = await supabase
          .from("issues")
          .select("*")
          .eq("stop_id", stopId);

        const { data: notes } = await supabase
          .from("stop_notes")
          .select("*")
          .eq("stop_id", stopId);

        const { data: photos } = await supabase
          .from("machine_photos")
          .select('*')
          .eq("stop_id", stopId)

        meta[stopId] = {
          hasIssues: issues?.length > 0,
          hasNotes: notes?.length > 0,
          hasPhotos: photos?.length > 0,
          latestPhoto: photos?.[0]?.photo_url || null,
          issues,
          notes,
          photos,
        };
      }

      setStopMeta(meta);
    };

    fetchMeta();
  }, [todayStops]);

  // 🔥 When a photo is uploaded, update only that stop's metadata
  const handlePhotoUploaded = async (stop) => {
    const stopId = stop.id;

    const { data: photos } = await supabase
      .from("machine_photos")
      .select("photo_url, created_at")
      .eq("stop_id", stopId)
      .order("created_at", { ascending: false })
      .limit(1);

    setStopMeta((prev) => ({
      ...prev,
      [stopId]: {
        ...prev[stopId],
        hasPhotos: !!photos?.length,
        latestPhoto: photos?.[0]?.photo_url || null,
        photos,
      },
    }));
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Welcome, {driver?.full_name || "Driver"}
        </h1>
        <Button onClick={handleLogout}>Logout</Button>
      </div>

      <p>Today is: <strong>{currentDay}</strong></p>

      {/* NO ROUTE */}
      {!todayRoute && <p>No route assigned for today.</p>}

      {/* ROUTE BUT NO STOPS */}
      {todayRoute && todayStops.length === 0 && (
        <p>No stops for today's route.</p>
      )}

      {/* ROUTE WITH STOPS */}
      {todayRoute && todayStops.length > 0 && (
        <div className="space-y-4">
          {todayStops.map((stop) => (
            <StopCard
              key={stop.id}
              stop={stop}
              meta={stopMeta[stop.id]}
              onReportIssue={(s) => setActiveIssueStop(s)}
              onAddNote={(s) => setActiveNoteStop(s)}
              onUploadPhoto={(s) => setActivePhotoStop(s)}
            />
          ))}
        </div>
      )}

      {/* MODALS */}
      {activeIssueStop && (
        <IssueModal
          stop={activeIssueStop}
          driverId={driver?.id}
          driverName={driver?.full_name}
          onClose={() => setActiveIssueStop(null)}
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
          stop={activePhotoStop}
          driver={driver}
          onUploaded={() => handlePhotoUploaded(activePhotoStop)}
          onClose={() => setActivePhotoStop(null)}
        />
      )}
    </div>
  );
}

