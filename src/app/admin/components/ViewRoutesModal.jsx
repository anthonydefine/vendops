"use client";

import { useState, useEffect } from "react";
import supabase from "@/app/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function ViewRoutesModal({ open, setOpen, driver, onEditRoute }) {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    if (!driver) return;

    const fetchRoutes = async () => {
      const { data: routesData, error: routesError } = await supabase
        .from("routes")
        .select("id, day_of_week, stops")
        .eq("driver_id", driver.id);

      if (routesError) return console.error(routesError);

      const { data: stopsData, error: stopsError } = await supabase
        .from("stops")
        .select("id, name");

      if (stopsError) return console.error(stopsError);

      const stopsMap = {};
      stopsData.forEach((s) => (stopsMap[s.id] = s.name));

      const mappedRoutes = routesData.map((r) => ({
        ...r,
        stops: r.stops.map((id) => stopsMap[id] || "Unknown stop"),
      }));

      setRoutes(mappedRoutes);
    };

    fetchRoutes();
  }, [driver]);


  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Routes for {driver?.full_name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {routes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No routes created for this driver.</p>
            ) : (
              routes.map((route) => (
                <Card key={route.id}>
                  <CardHeader className="flex justify-between items-center">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {route.day_of_week}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-2 space-y-1">
                    {route.stops.length > 0 ? (
                      <ul className="list-disc list-inside text-sm">
                        {route.stops.map((stopId, idx) => (
                          <li key={idx}>{stopId}</li> // will replace with stop names next
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No stops added yet.</p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditRoute?.(route)}
                    >
                      Edit
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
          <DialogFooter className="mt-4 flex justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
