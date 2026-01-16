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
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Checkbox } from "../../../../@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../../../components/ui/select";
import { toast } from "sonner";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MACHINES = [
  { key: "soda", label: "Soda" },
  { key: "snack", label: "Snack" },
  { key: "frozen", label: "Frozen" },
  { key: "combo", label: "Combo" },
  { key: "coffee", label: "Coffee" },
];

export default function CreateStopModal({ open, setOpen, onCreated }) {
  const [drivers, setDrivers] = useState([]);
  const [driverId, setDriverId] = useState(null);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [days, setDays] = useState([]);
  const [machines, setMachines] = useState([]);
  const [frequency, setFrequency] = useState("weekly");
  const [weekType, setWeekType] = useState(null);
  const [startDate, setStartDate] = useState("");

  useEffect(() => {
    if (open) fetchDrivers();
  }, [open]);

  const fetchDrivers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "driver")
      .order("full_name");

    if (error) {
      console.error(error);
      toast.error("Failed to load drivers");
      return;
    }

    setDrivers(data || []);
  };

  const toggleItem = (value, setter) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleCreate = async () => {
    if (
      !name ||
      !driverId ||
      days.length === 0 ||
      machines.length === 0 ||
      !startDate
    ) {
      toast.error("Please complete all required fields");
      return;
    }

    const { error } = await supabase.from("stops").insert({
      name,
      address,
      driver_id: driverId,
      days_of_week: days,
      frequency,
      week_type: frequency === "biweekly" ? weekType : null,
      start_date: startDate,
      machines,
    });

    if (error) {
      console.error(error);
      toast.error("Failed to create stop");
      return;
    }

    toast.success("Stop created");
    onCreated?.();
    setOpen(false);

    // Reset
    setDriverId(null);
    setName("");
    setAddress("");
    setDays([]);
    setMachines([]);
    setFrequency("weekly");
    setWeekType(null);
    setStartDate("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='bg-white'>
        <DialogHeader>
          <DialogTitle>Create New Stop</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stop Name */}
          <Input
            placeholder="Stop Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Address */}
          <Input
            placeholder="Address (optional)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          {/* Driver */}
          <div>
            <Label>Assigned Driver</Label>
            <Select value={driverId} onValueChange={setDriverId}>
              <SelectTrigger>
                <SelectValue placeholder="Select driver" />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Days */}
          <div>
            <Label>Service Days</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {DAYS.map((day) => (
                <label key={day} className="flex items-center gap-2">
                  <Checkbox
                    checked={days.includes(day)}
                    onCheckedChange={() => toggleItem(day, setDays)}
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>

          {/* Machines */}
          <div>
            <Label>Machines at this Stop</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {MACHINES.map((m) => (
                <label key={m.key} className="flex items-center gap-2">
                  <Checkbox
                    checked={machines.includes(m.key)}
                    onCheckedChange={() => toggleItem(m.key, setMachines)}
                  />
                  {m.label}
                </label>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {frequency === "biweekly" && (
            <div>
              <Label>Week Type</Label>
              <Select value={weekType} onValueChange={setWeekType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select A or B" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Week A</SelectItem>
                  <SelectItem value="B">Week B</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Start Date */}
          <div>
            <Label>Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create Stop</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
