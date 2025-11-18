"use client";

import { useState, useEffect } from "react";
import supabase from "../../supabaseClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";

export default function ManageMaintenance() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  // Fetch issues from Supabase
  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("issues")
          .select(`
            *,
            driver:driver_id (full_name),
            stop:stop_id (name)
          `);

        if (urgencyFilter !== "all") {
          query = query.eq("urgency", urgencyFilter);
        }

        const { data, error } = await query.order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching issues:", error);
          return;
        }

        setIssues(data || []);
      } catch (err) {
        console.error("Error fetching issues:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [urgencyFilter]);

  const renderUrgencyBadge = (urgency) => {
    switch (urgency) {
      case "High":
        return <Badge variant="destructive">High</Badge>;
      case "Medium":
        return <Badge variant="warning">Medium</Badge>;
      case "Low":
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="default">{urgency}</Badge>;
    }
  };

  const getDaysAgo = (createdAt) => {
    if (!createdAt) return "";

    const date = new Date(createdAt);

    // Round up to the next hour
    if (date.getMinutes() > 0 || date.getSeconds() > 0 || date.getMilliseconds() > 0) {
      date.setHours(date.getHours() + 1, 0, 0, 0);
    }

    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return diffDays === 0 ? "Today" : `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  const handleResolveIssue = async (issueId) => {
    if (!confirm("Are you sure you want to resolve this issue?")) return;

    const { error } = await supabase
      .from("issues")
      .delete()
      .eq("id", issueId);

    if (error) {
      console.error("Error resolving issue:", error.message);
      alert("Failed to resolve issue.");
      return;
    }

    // Remove the issue from local state
    setIssues(prev => prev.filter(i => i.id !== issueId));
  };



  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Maintenance / Issues</h2>

        <div className="flex gap-2 items-center">
          <span>Filter by urgency:</span>
          <Select onValueChange={setUrgencyFilter} defaultValue="all">
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <p>Loading issues...</p>
      ) : issues.length === 0 ? (
        <p>No issues found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stop</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>Resolve</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell>{issue.stop?.name || "Unknown Stop"}</TableCell>
                <TableCell>{issue.driver?.full_name || "Unknown Driver"}</TableCell>
                <TableCell>{issue.description}</TableCell>
                <TableCell>{getDaysAgo(issue.created_at)}</TableCell>
                <TableCell>{renderUrgencyBadge(issue.urgency)}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleResolveIssue(issue.id)}
                  >
                    Resolve
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
