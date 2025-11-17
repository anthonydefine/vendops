"use client";

import { useEffect, useState } from "react";
import supabase from "@/app/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function CreateRouteModal({ open, setOpen, driver, onRouteCreated }) {
  const [selectedDay, setSelectedDay] = useState("");
  const [allStops, setAllStops] = useState([]);
  const [selectedStops, setSelectedStops] = useState([]);
  const [loading, setLoading] = useState(false);

  // fetch all stops
  useEffect(() => {
    const fetchStops = async () => {
      const { data, error } = await supabase.from("stops").select("*");
      if (error) console.error("Error fetching stops:", error);
      else setAllStops(data);
    };
    fetchStops();
  }, []);

  const handleAddStop = (stop) => {
    if (!selectedStops.find((s) => s.id === stop.id)) {
      setSelectedStops([...selectedStops, stop]);
    }
  };

  const handleRemoveStop = (stopId) => {
    setSelectedStops(selectedStops.filter((s) => s.id !== stopId));
  };

  const moveStop = (index, direction) => {
    const newStops = [...selectedStops];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= selectedStops.length) return;
    [newStops[index], newStops[newIndex]] = [newStops[newIndex], newStops[index]];
    setSelectedStops(newStops);
  };

  const handleFinishRoute = async () => {
    if (!driver?.id) {
      console.error("No driver selected");
      toast.error("No driver selected");
      return;
    }
    
    if (!selectedDay || selectedStops.length === 0) {
      toast.error("Please select a day and at least one stop");
      return;
    }

    setLoading(true);
    const stopIds = selectedStops.map((stop) => stop.id);

    const { error } = await supabase.from("routes").insert([
      {
        driver_id: driver.id,
        day_of_week: selectedDay,
        stops: stopIds,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error(error);
      toast.error("Failed to create route");
    } else {
      toast.success("Route created successfully!");
      onRouteCreated?.();
      setSelectedStops([]);
      setSelectedDay("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl">
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

          {/* Two-column stop selector */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left column - available stops */}
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

            {/* Right column - selected stops */}
            <Card className="p-4 max-h-[400px] overflow-y-auto">
              <h3 className="font-semibold mb-2">Selected Stops (Route Order)</h3>
              {selectedStops.length === 0 ? (
                <p className="text-sm text-muted-foreground">No stops selected yet.</p>
              ) : (
                <ul className="space-y-2">
                  {selectedStops.map((stop, index) => (
                    <li
                      key={stop.id}
                      className="flex justify-between items-center bg-secondary rounded-md px-3 py-2"
                    >
                      <span>
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
                          onClick={() => handleRemoveStop(stop.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

