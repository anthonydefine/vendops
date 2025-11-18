"use client";

import { useState, useEffect } from "react";
import supabase from "../supabaseClient";
import { Button } from "@/components/ui/button";

import StopCard from "./components/StopCard";
import IssueModal from "./components/IssueModal";
import AddNoteModal from "./components/AddNoteModal";
import UploadPhotoModal from "./components/UploadPhotoModal";
import SubscribeButton from "../components/SubscribeButton";

import OneSignalInit from "../components/OneSignalInit";

export default function DriverPage() {
  const [driver, setDriver] = useState(null);
  const [todayRoute, setTodayRoute] = useState(null);
  const [todayStops, setTodayStops] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [activeIssueStop, setActiveIssueStop] = useState(null);
  const [activeNoteStop, setActiveNoteStop] = useState(null);
  const [activePhotoStop, setActivePhotoStop] = useState(null);

  const [stopMeta, setStopMeta] = useState({});

  const currentDay = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // Fetch driver + today’s route
  useEffect(() => {
    const loadDriver = async () => {
      setLoading(true);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Get profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setDriver(profile);

        // Get routes assigned to driver
        const { data: routeData } = await supabase
          .from("routes")
          .select("*")
          .eq("driver_id", user.id);

        if (!routeData) {
          setLoading(false);
          return;
        }

        // Find today's route
        const routeToday = routeData.find(
          (r) => r.day_of_week === currentDay
        );

        setTodayRoute(routeToday || null);
      } catch (err) {
        console.error("Error loading driver:", err.message);
      }

      setLoading(false);
    };

    loadDriver();
  }, [currentDay]);

  // Fetch STOP OBJECTS for today
  useEffect(() => {
    const loadStops = async () => {
      if (!todayRoute || !todayRoute.stops?.length) {
        setTodayStops([]);
        return;
      }

      try {
        const stopIds = todayRoute.stops.map((id) => id.toString());

        const { data: stopsData, error } = await supabase
          .from("stops")
          .select("*")
          .in("id", stopIds);

        if (error) {
          console.error("Error fetching stops:", error.message);
          setTodayStops([]);
          return;
        }

        const sortedStops = stopIds
          .map((id) => stopsData.find((s) => s.id === id))
          .filter(Boolean);

        setTodayStops(sortedStops);
      } catch (err) {
        console.error("Error loading stops:", err.message);
        setTodayStops([]);
      }
    };

    loadStops();
  }, [todayRoute]);

  useEffect(() => {
    if (todayStops.length === 0) return;

    const fetchStopMeta = async () => {
      const stopMeta = {};

      for (const stop of todayStops) {
        const stopId = stop.id;

        // Fetch issues
        const { data: issueData } = await supabase
          .from("issues")
          .select("*")
          .eq("stop_id", stopId);

        // Notes
        const { data: notesData } = await supabase
        .from("stop_notes")
        .select("*")
        .eq("stop_id", stopId);

        // Photos
        const { data: photoData } = await supabase
          .from("machine_photos")
          .select("*")
          .eq("stop_id", stopId);

        stopMeta[stopId] = {
          hasIssues: issueData?.length > 0,
          hasNotes: notesData.length > 0,
          hasPhotos: photoData?.length > 0,
          issues: issueData || [],
          notes: notesData || [],
          photos: photoData || []
        };
      }

      setStopMeta(stopMeta);
    };

    fetchStopMeta();
  }, [todayStops]);



  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <>
      <OneSignalInit />
      <div className="p-6 space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Welcome, {driver?.full_name || "Driver"}
          </h1>
          <Button onClick={handleLogout}>Logout</Button>
          <SubscribeButton />
        </div>

        <p>Today is: <strong>{currentDay}</strong></p>

        {/* NO ROUTE */}
        {!todayRoute && (
          <p>No route assigned for today.</p>
        )}

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
            driverName={driver.name}
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
            onClose={() => setActivePhotoStop(null)}
          />
        )}
      </div>
    </>
    
  );
}
