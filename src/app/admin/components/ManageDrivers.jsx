"use client";
import { useEffect, useState } from "react";
import supabase from "../../supabaseClient";

import CreateRouteModal from "./CreateRouteModal";
import ViewRoutesModal from "./ViewRoutesModal";
import EditRouteModal from "./EditRouteModal";

import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";

export default function ManageDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addingDriver, setAddingDriver] = useState(false);
  const [newDriver, setNewDriver] = useState({ full_name: "", email: "", password: "" });
  const [routes, setRoutes] = useState([]);

  const [createRouteOpen, setCreateRouteOpen] = useState(false);
  const [viewRoutesOpen, setViewRoutesOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [editRouteOpen, setEditRouteOpen] = useState(false);

  // Fetch drivers and their routes
  useEffect(() => {
    fetchDrivers();
  }, []);

  async function fetchDrivers() {
    const { data: driversData, error } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("role", "driver");

    if (error) console.error(error);

    if (driversData) {
      // Get routes per driver
      const { data: routesData } = await supabase.from("routes").select("id, driver_id, day_of_week");
      const driversWithRoutes = driversData.map((driver) => {
        const driverRoutes = routesData?.filter((r) => r.driver_id === driver.id) || [];
        return { ...driver, routes: driverRoutes };
      });
      setDrivers(driversWithRoutes);
    }
  }

  // Add new driver (basic)
  async function handleAddDriver() {
    if (!newDriver.full_name || !newDriver.email || !newDriver.password) return alert("All fields required.");
    const { data, error } = await supabase.auth.signUp({
      email: newDriver.email,
      password: newDriver.password,
      options: {
        data: { full_name: newDriver.full_name, role: "driver" },
      },
    });
    if (error) {
      console.error(error);
      alert("Error adding driver");
    } else {
      setAddingDriver(false);
      setNewDriver({ full_name: "", email: "", password: "" });
      fetchDrivers();
    }
  }

  // Delete driver
  async function handleDeleteDriver() {
    if (!selectedDriver) return;
    const { error } = await supabase.from("profiles").delete().eq("id", selectedDriver.id);
    if (error) {
      console.error(error);
      alert("Error deleting driver");
    } else {
      setDeleteModalOpen(false);
      setSelectedDriver(null);
      fetchDrivers();
    }
  }

  const openCreateRoute = (driver) => {
    setSelectedDriver(driver);
    setCreateRouteOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Manage Drivers</h2>
        <Button onClick={() => setAddingDriver(true)}>Add Driver</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Driver Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Days / Routes</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.map((driver) => (
            <TableRow key={driver.id}>
              <TableCell>{driver.full_name}</TableCell>
              <TableCell>{driver.email}</TableCell>
              <TableCell>
                {driver.routes?.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {driver.routes.map((route) => (
                      <Badge
                        key={route.id}
                        className="cursor-pointer hover:bg-primary/80"
                        onClick={() => {setSelectedDriver(driver), setViewRoutesOpen(true)}}
                      >
                        {route.day_of_week.slice(0, 3)}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <Button size="sm" onClick={() => openCreateRoute(driver)}>
                    Create Route
                  </Button>
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setSelectedDriver(driver);
                    setDeleteModalOpen(true);
                  }}
                >
                  Delete
                </Button>
                <Button size="sm" onClick={() => openCreateRoute(driver)}>
                  Create Route
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add Driver Modal */}
      <Dialog open={addingDriver} onOpenChange={setAddingDriver}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Driver</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Full Name"
              value={newDriver.full_name}
              onChange={(e) => setNewDriver({ ...newDriver, full_name: e.target.value })}
            />
            <Input
              placeholder="Email"
              value={newDriver.email}
              onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
            />
            <Input
              placeholder="Password"
              type="password"
              value={newDriver.password}
              onChange={(e) => setNewDriver({ ...newDriver, password: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setAddingDriver(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDriver}>Add Driver</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete <strong>{selectedDriver?.full_name}</strong>? This action cannot
            be undone.
          </p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDriver}>
              Delete Driver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedDriver && (
        <CreateRouteModal
          open={createRouteOpen}
          setOpen={setCreateRouteOpen}
          driver={selectedDriver}
          onRouteCreated={fetchDrivers} // refresh table after route creation
        />
      )}

      {selectedDriver && !editingRoute && (
        <ViewRoutesModal
          open={viewRoutesOpen}
          setOpen={setViewRoutesOpen}
          driver={selectedDriver}
          onEditRoute={(route) => {
            setViewRoutesOpen(false);
            setEditingRoute(route);
            setEditRouteOpen(true); // hide the other modal
          }}
        />
      )}

      {editingRoute && (
        <EditRouteModal
          open={editRouteOpen}
          setOpen={(val) => {
            // if modal closed, clear editingRoute
            if (!val) {
              setEditRouteOpen(false);
              setEditingRoute(null);
            } else {
              setEditRouteOpen(true);
            }
          }}
          route={editingRoute}
          onRouteUpdated={async () => {
            // refresh routes/drivers as needed
            setEditRouteOpen(false);
            setEditingRoute(null);
            await fetchDrivers();           // or whatever refresh function you have
          }}
        />
      )}
    </div>
  );
}
