"use client";

import { useState, useEffect, useMemo } from "react";
import supabase from "../../supabaseClient";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Plus, Send, X } from "lucide-react";

const COLORS = ["#EF4444", "#F59E0B", "#3B82F6"];

export default function ManageDashboard({ setActiveTab }) {
  const [issues, setIssues] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [stops, setStops] = useState([]);
  const [routeNotes, setRouteNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterUrgency, setFilterUrgency] = useState("All");
  const [filterDriver, setFilterDriver] = useState("All");
  const [sortNewest, setSortNewest] = useState(true);

  // Route Note form state
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteMessage, setNoteMessage] = useState("");
  const [notePriority, setNotePriority] = useState("normal");
  const [noteTargetType, setNoteTargetType] = useState("all");
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [noteExpires, setNoteExpires] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch issues with driver and stop info
        const { data: issuesData } = await supabase
          .from("issues")
          .select(`
            *,
            driver:driver_id (full_name),
            stop:stop_id (name)
          `)
          .order("created_at", { ascending: false });

        setIssues(issuesData || []);

        // Fetch drivers
        const { data: driversData } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "driver");

        setDrivers(driversData || []);

        // Fetch stops
        const { data: stopsData } = await supabase
          .from("stops")
          .select("*");

        setStops(stopsData || []);

        // Fetch active route notes
        const { data: notesData } = await supabase
          .from("route_notes")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        setRouteNotes(notesData || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!noteMessage.trim()) return;

    setSubmittingNote(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const noteData = {
        message: noteMessage,
        priority: notePriority,
        target_type: noteTargetType,
        target_driver_ids: noteTargetType === "specific" ? selectedDrivers : [],
        expires_at: noteExpires || null,
        created_by: user.id,
        is_active: true,
      };

      const { data, error } = await supabase
        .from("route_notes")
        .insert([noteData])
        .select();

      if (error) throw error;

      setRouteNotes([data[0], ...routeNotes]);
      
      // Reset form
      setNoteMessage("");
      setNotePriority("normal");
      setNoteTargetType("all");
      setSelectedDrivers([]);
      setNoteExpires("");
      setShowNoteForm(false);
    } catch (error) {
      console.error("Error creating route note:", error);
      alert("Failed to create route note");
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const { error } = await supabase
        .from("route_notes")
        .update({ is_active: false })
        .eq("id", noteId);

      if (error) throw error;

      setRouteNotes(routeNotes.filter(note => note.id !== noteId));
    } catch (error) {
      console.error("Error deleting route note:", error);
      alert("Failed to delete route note");
    }
  };

  const toggleDriverSelection = (driverId) => {
    setSelectedDrivers(prev =>
      prev.includes(driverId)
        ? prev.filter(id => id !== driverId)
        : [...prev, driverId]
    );
  };

  const filteredIssues = useMemo(() => {
    return issues
      .filter(i => filterUrgency === "All" || i.urgency?.toLowerCase() === filterUrgency.toLowerCase())
      .filter(i => filterDriver === "All" || i.driver?.full_name === filterDriver)
      .sort((a, b) => sortNewest
        ? new Date(b.created_at) - new Date(a.created_at)
        : new Date(a.created_at) - new Date(b.created_at)
      );
  }, [issues, filterUrgency, filterDriver, sortNewest]);

  const countByUrgency = (urgency) =>
    issues.filter(i => i.urgency?.toLowerCase() === urgency.toLowerCase()).length;

  const issuesByUrgencyData = [
    { name: "High", value: countByUrgency("High") },
    { name: "Medium", value: countByUrgency("Medium") },
    { name: "Low", value: countByUrgency("Low") },
  ];

  const issuesByDayData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();

    return last7Days.map(day => ({
      day,
      count: issues.filter(i => i.created_at?.startsWith(day)).length,
    }));
  }, [issues]);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card onClick={() => setActiveTab("drivers")} className="cursor-pointer">
          <CardHeader>
            <CardTitle>Total Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{drivers.length}</p>
          </CardContent>
        </Card>

        <Card onClick={() => setActiveTab("drivers")} className="cursor-pointer">
          <CardHeader>
            <CardTitle>Total Stops</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stops.length}</p>
          </CardContent>
        </Card>

        <Card onClick={() => setActiveTab("maintenance")} className="cursor-pointer">
          <CardHeader>
            <CardTitle>Issues Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2">
            <div>High: {countByUrgency("High")}</div>
            <div>Medium: {countByUrgency("Medium")}</div>
            <div>Low: {countByUrgency("Low")}</div>
          </CardContent>
        </Card>
      </div>

      {/* Route Notes Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Route Notes for Drivers</CardTitle>
          <button
            onClick={() => setShowNoteForm(!showNoteForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus size={16} />
            New Note
          </button>
        </CardHeader>
        <CardContent>
          {showNoteForm && (
            <form onSubmit={handleCreateNote} className="mb-6 p-4 border rounded-lg bg-gray-50 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={noteMessage}
                  onChange={(e) => setNoteMessage(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={3}
                  placeholder="Enter message for drivers..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <Select value={notePriority} onValueChange={setNotePriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="important">Important</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Send To</label>
                  <Select value={noteTargetType} onValueChange={setNoteTargetType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Drivers</SelectItem>
                      <SelectItem value="specific">Specific Drivers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Expires (Optional)</label>
                  <input
                    type="date"
                    value={noteExpires}
                    onChange={(e) => setNoteExpires(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              {noteTargetType === "specific" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Select Drivers</label>
                  <div className="flex flex-wrap gap-2">
                    {drivers.map(driver => (
                      <button
                        key={driver.id}
                        type="button"
                        onClick={() => toggleDriverSelection(driver.id)}
                        className={`px-3 py-1 rounded ${
                          selectedDrivers.includes(driver.id)
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        {driver.full_name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submittingNote}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send size={16} />
                  {submittingNote ? "Sending..." : "Send Note"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNoteForm(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Active Notes List */}
          <div className="space-y-3">
            {routeNotes.length === 0 ? (
              <p className="text-gray-500">No active route notes.</p>
            ) : (
              routeNotes.map(note => (
                <div
                  key={note.id}
                  className={`p-4 border-l-4 rounded ${
                    note.priority === "urgent"
                      ? "border-red-500 bg-red-50"
                      : note.priority === "important"
                      ? "border-yellow-500 bg-yellow-50"
                      : "border-blue-500 bg-blue-50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={
                          note.priority === "urgent" ? "destructive" :
                          note.priority === "important" ? "warning" : "secondary"
                        }>
                          {note.priority}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {note.target_type === "all" ? "All Drivers" : `${note.target_driver_ids?.length || 0} Drivers`}
                        </span>
                        {note.expires_at && (
                          <span className="text-sm text-gray-600">
                            Expires: {new Date(note.expires_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-800">{note.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Created: {new Date(note.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="ml-4 p-1 text-gray-400 hover:text-red-600"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Issues by Urgency</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={issuesByUrgencyData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label
                >
                  {issuesByUrgencyData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Issues Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={issuesByDayData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={filterUrgency} onValueChange={setFilterUrgency}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterDriver} onValueChange={setFilterDriver}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by driver" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            {drivers.map(driver => (
              <SelectItem key={driver.id} value={driver.full_name}>
                {driver.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => setSortNewest(!sortNewest)}
        >
          Sort: {sortNewest ? "Newest First" : "Oldest First"}
        </button>
      </div>

      {/* Recent Issues Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Issues</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredIssues.length === 0 ? (
            <p>No issues found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stop</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIssues.map(issue => (
                  <TableRow key={issue.id}>
                    <TableCell>{issue.stop?.name || "Unknown Stop"}</TableCell>
                    <TableCell>{issue.driver?.full_name || "Unknown Driver"}</TableCell>
                    <TableCell>{issue.description}</TableCell>
                    <TableCell>
                      <Badge variant={
                        issue.urgency === "High" ? "destructive" :
                        issue.urgency === "Medium" ? "warning" : "secondary"
                      }>
                        {issue.urgency}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(issue.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
