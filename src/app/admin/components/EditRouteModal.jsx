"use client";

import { useState, useEffect } from "react";
import supabase from "../../supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../../../components/ui/select";
import { Separator } from "../../../components/ui/separator";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

export default function EditRouteModal({ open, setOpen, route, onRouteUpdated }) {
  const [day, setDay] = useState(route.day_of_week);
  const [availableStops, setAvailableStops] = useState([]);
  const [selectedStops, setSelectedStops] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all stops and populate lists
  useEffect(() => {
    const fetchStops = async () => {
      const { data, error } = await supabase.from("stops").select("*");
      if (error) return console.error(error);

      const selected = data.filter((s) => route.stops.includes(s.id));
      const available = data.filter((s) => !route.stops.includes(s.id));

      setSelectedStops(selected);
      setAvailableStops(available);
    };
    fetchStops();
  }, [route]);

  const moveToSelected = (stop) => {
    setAvailableStops(availableStops.filter((s) => s.id !== stop.id));
    setSelectedStops([...selectedStops, stop]);
  };

  const moveToAvailable = (stop) => {
    setSelectedStops(selectedStops.filter((s) => s.id !== stop.id));
    setAvailableStops([...availableStops, stop]);
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const newStops = [...selectedStops];
    [newStops[index - 1], newStops[index]] = [newStops[index], newStops[index - 1]];
    setSelectedStops(newStops);
  };

  const moveDown = (index) => {
    if (index === selectedStops.length - 1) return;
    const newStops = [...selectedStops];
    [newStops[index + 1], newStops[index]] = [newStops[index], newStops[index + 1]];
    setSelectedStops(newStops);
  };

  const handleUpdateRoute = async () => {
    try {
      setLoading(true);
      const stopIds = selectedStops.map((s) => s.id);

      const { error } = await supabase
        .from("routes")
        .update({ day_of_week: day, stops: stopIds })
        .eq("id", route.id);

      if (error) throw error;

      onRouteUpdated?.();
      setOpen(false);
    } catch (err) {
      console.error("Error updating route:", err);
      alert("Failed to update route");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Route - {route.day_of_week}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 mt-4">
          {/* Available Stops */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Available Stops</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="max-h-64 overflow-y-auto space-y-2">
              {availableStops.map((stop) => (
                <div
                  key={stop.id}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <span>{stop.name}</span>
                  <Button size="icon" variant="ghost" onClick={() => moveToSelected(stop)}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Selected Stops */}
          <Card className="flex-1">
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Selected Stops</CardTitle>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <Separator />
            <CardContent className="max-h-64 overflow-y-auto space-y-2">
              {selectedStops.map((stop, index) => (
                <div
                  key={stop.id}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" onClick={() => moveUp(index)}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => moveDown(index)}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <span>{stop.name}</span>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => moveToAvailable(stop)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateRoute} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
