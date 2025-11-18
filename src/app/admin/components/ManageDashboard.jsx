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

const COLORS = ["#EF4444", "#F59E0B", "#3B82F6"];

export default function ManageDashboard({ setActiveTab }) {
  const [issues, setIssues] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterUrgency, setFilterUrgency] = useState("All");
  const [filterDriver, setFilterDriver] = useState("All");
  const [sortNewest, setSortNewest] = useState(true);

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
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  // Prepare data for charts
  const issuesByUrgencyData = [
    { name: "High", value: countByUrgency("High") },
    { name: "Medium", value: countByUrgency("Medium") },
    { name: "Low", value: countByUrgency("Low") },
  ];

  const issuesByDayData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0]; // YYYY-MM-DD
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
