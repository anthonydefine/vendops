"use client";

import { useEffect, useState } from "react";
import supabase from "../../supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../../../components/ui/select";
import { Card } from "../../../components/ui/card";
import { ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function CreateRouteModal({ open, setOpen, driver, onRouteCreated }) {
  const [selectedDay, setSelectedDay] = useState("");
  const [allStops, setAllStops] = useState([]);
  const [selectedStops, setSelectedStops] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- FETCH STOPS ---------------- */

  useEffect(() => {
    const fetchStops = async () => {
      const { data, error } = await supabase.from("stops").select("*").order("name");
      if (error) {
        console.error(error);
        toast.error("Failed to load stops");
      } else {
        setAllStops(data);
      }
    };
    fetchStops();
  }, []);

  /* ---------------- STOP SELECTION ---------------- */

  const handleAddStop = (stop) => {
    if (selectedStops.find((s) => s.stop_id === stop.id)) return;

    setSelectedStops([
      ...selectedStops,
      {
        stop_id: stop.id,
        name: stop.name,
        visit_frequency: "weekly",
        week_type: null,
      },
    ]);
  };

  const handleRemoveStop = (stopId) => {
    setSelectedStops(selectedStops.filter((s) => s.stop_id !== stopId));
  };

  const moveStop = (index, direction) => {
    const newStops = [...selectedStops];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= selectedStops.length) return;
    [newStops[index], newStops[newIndex]] = [newStops[newIndex], newStops[index]];
    setSelectedStops(newStops);
  };

  const updateFrequency = (index, frequency) => {
    const newStops = [...selectedStops];
    newStops[index].visit_frequency = frequency;
    newStops[index].week_type = frequency === "weekly" ? null : "A";
    setSelectedStops(newStops);
  };

  const updateWeekType = (index, week) => {
    const newStops = [...selectedStops];
    newStops[index].week_type = week;
    setSelectedStops(newStops);
  };

  /* ---------------- SAVE ROUTE ---------------- */

  const handleFinishRoute = async () => {
    if (!driver?.id) {
      toast.error("No driver selected");
      return;
    }

    if (!selectedDay || selectedStops.length === 0) {
      toast.error("Please select a day and at least one stop");
      return;
    }

    setLoading(true);

    // 1️⃣ Create route
    const { data: route, error: routeError } = await supabase
      .from("routes")
      .insert({
        driver_id: driver.id,
        day_of_week: selectedDay,
      })
      .select()
      .single();

    if (routeError) {
      console.error(routeError);
      toast.error("Failed to create route");
      setLoading(false);
      return;
    }

    // 2️⃣ Insert route_stops
    const routeStopsPayload = selectedStops.map((stop, index) => ({
      route_id: route.id,
      stop_id: stop.stop_id,
      visit_frequency: stop.visit_frequency,
      week_type: stop.week_type,
      sort_order: index,
    }));

    const { error: routeStopsError } = await supabase
      .from("route_stops")
      .insert(routeStopsPayload);

    setLoading(false);

    if (routeStopsError) {
      console.error(routeStopsError);
      toast.error("Route created, but failed to add stops");
      return;
    }

    toast.success("Route created successfully!");
    onRouteCreated?.();
    setSelectedStops([]);
    setSelectedDay("");
    setOpen(false);
  };

  /* ---------------- RENDER ---------------- */

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-max">
        <DialogHeader>
          <DialogTitle>Create New Route for {driver?.full_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Day selector */}
          <div>
            <Label>Day of the Week</Label>
            <Select onValueChange={setSelectedDay} value={selectedDay}>
              <SelectTrigger>
                <SelectValue placeholder="Select a day" />
              </SelectTrigger>
              <SelectContent>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stops */}
          <div className="grid grid-cols-2 gap-4">
            {/* All stops */}
            <Card className="p-4 max-h-[400px] overflow-y-auto">
              <h3 className="font-semibold mb-2">All Stops</h3>
              <ul className="space-y-2">
                {allStops.map((stop) => (
                  <li
                    key={stop.id}
                    className="flex justify-between items-center bg-secondary rounded-md px-3 py-2"
                  >
                    <span>{stop.name}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleAddStop(stop)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Selected stops */}
            <Card className="p-4 max-h-[400px] overflow-y-auto">
              <h3 className="font-semibold mb-2">Route Stops</h3>

              {selectedStops.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No stops selected yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {selectedStops.map((stop, index) => (
                    <li
                      key={stop.stop_id}
                      className="bg-secondary rounded-md p-3 space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">
                          {index + 1}. {stop.name}
                        </span>

                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => moveStop(index, -1)}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => moveStop(index, 1)}
                            disabled={index === selectedStops.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleRemoveStop(stop.stop_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Frequency controls */}
                      <div className="flex gap-2">
                        <Select
                          value={stop.visit_frequency}
                          onValueChange={(val) => updateFrequency(index, val)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Biweekly</SelectItem>
                          </SelectContent>
                        </Select>

                        {stop.visit_frequency === "biweekly" && (
                          <Select
                            value={stop.week_type}
                            onValueChange={(val) => updateWeekType(index, val)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">Week A</SelectItem>
                              <SelectItem value="B">Week B</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleFinishRoute} disabled={loading}>
            {loading ? "Saving..." : "Finish Route"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
