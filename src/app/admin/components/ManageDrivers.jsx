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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

export default function ManageDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [addingDriver, setAddingDriver] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const [newDriver, setNewDriver] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  async function fetchDrivers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "driver");

    if (!error) setDrivers(data || []);
  }

  async function handleAddDriver() {
    const { full_name, email, password } = newDriver;
    if (!full_name || !email || !password) return;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, role: "driver" },
      },
    });

    if (!error) {
      setAddingDriver(false);
      setNewDriver({ full_name: "", email: "", password: "" });
      fetchDrivers();
    }
  }

  async function handleDeleteDriver() {
    if (!selectedDriver) return;

    await supabase.from("profiles").delete().eq("id", selectedDriver.id);
    setDeleteModalOpen(false);
    setSelectedDriver(null);
    fetchDrivers();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Drivers</h2>
        <Button onClick={() => setAddingDriver(true)}>Add Driver</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.map((driver) => (
            <TableRow key={driver.id}>
              <TableCell>{driver.full_name}</TableCell>
              <TableCell>{driver.email}</TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setSelectedDriver(driver);
                    setDeleteModalOpen(true);
                  }}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add Driver */}
      <Dialog open={addingDriver} onOpenChange={setAddingDriver}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Driver</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              placeholder="Full Name"
              name='name'
              value={newDriver.full_name}
              onChange={(e) =>
                setNewDriver({ ...newDriver, full_name: e.target.value })
              }
            />
            <Input
              placeholder="Email"
              name='email'
              value={newDriver.email}
              onChange={(e) =>
                setNewDriver({ ...newDriver, email: e.target.value })
              }
            />
            <Input
              type="password"
              placeholder="Password"
              name='password'
              value={newDriver.password}
              onChange={(e) =>
                setNewDriver({ ...newDriver, password: e.target.value })
              }
            />
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setAddingDriver(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDriver}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Driver */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Driver</DialogTitle>
          </DialogHeader>

          <p>
            Delete <strong>{selectedDriver?.full_name}</strong>? This cannot be
            undone.
          </p>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDriver}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

