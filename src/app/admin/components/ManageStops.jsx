"use client";

import { useEffect, useState } from "react";
import supabase from "../../supabaseClient";

import { Button } from "../../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";

import CreateStopModal from "./CreateStopModal";

export default function ManageStops() {
  const [stops, setStops] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [drivers, setDrivers] = useState([])

  useEffect(() => {
    fetchDrivers();
    fetchStops();
  }, []);

  console.log(drivers)

  async function fetchStops() {
    const { data } = await supabase
      .from("stops")
      .select("id, name, days_of_week, frequency, profiles(full_name)")
      .order("name");

    setStops(data || []);
  }

  async function fetchDrivers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "driver");

    if (!error) setDrivers(data || []);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Stops</h2>
        <Button onClick={() => setCreateOpen(true)}>Create Stop</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Stop</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Days</TableHead>
            <TableHead>Frequency</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stops.map((stop) => (
            <TableRow key={stop.id}>
              <TableCell>{stop.name}</TableCell>
              <TableCell>{stop.profiles?.full_name || "—"}</TableCell>
              <TableCell className="flex gap-1 flex-wrap">
                {stop.days_of_week?.map((day) => (
                  <Badge key={day} variant="secondary">
                    {day}
                  </Badge>
                ))}
              </TableCell>
              <TableCell>
                <Badge>{stop.frequency}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CreateStopModal
        open={createOpen}
        setOpen={setCreateOpen}
        onCreated={fetchStops}
        drivers={drivers}
      />
    </div>
  );
}
