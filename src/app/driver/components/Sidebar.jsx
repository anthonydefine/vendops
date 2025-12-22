"use client";

import React, { useState, useEffect } from 'react';

import supabase from '../../supabaseClient';
import { Badge } from '../../../components/ui/badge';
import { AlertCircle, Info, AlertTriangle } from 'lucide-react';


const Sidebar = () => {
  const [routeNotes, setRouteNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [driverId, setDriverId] = useState(null);

  useEffect(() => {
    const fetchRouteNotes = async () => {
      setLoading(true);
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setDriverId(user?.id);

        if (!user) return;

        // Fetch route notes targeted to this driver or all drivers
        const { data: notesData, error } = await supabase
          .from("route_notes")
          .select("*")
          .eq("is_active", true)
          .or(`target_type.eq.all,target_driver_ids.cs.{${user.id}}`)
          .order("priority", { ascending: false })
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Filter out expired notes
        const activeNotes = (notesData || []).filter(note => {
          if (!note.expires_at) return true;
          return new Date(note.expires_at) > new Date();
        });

        setRouteNotes(activeNotes);
      } catch (error) {
        console.error("Error fetching route notes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRouteNotes();

    // Set up real-time subscription for new notes
    const channel = supabase
      .channel('route_notes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'route_notes'
        },
        () => {
          fetchRouteNotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="text-red-600" size={20} />;
      case 'important':
        return <AlertTriangle className="text-yellow-600" size={20} />;
      default:
        return <Info className="text-blue-600" size={20} />;
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'important':
        return 'border-l-4 border-yellow-500 bg-yellow-50';
      default:
        return 'border-l-4 border-blue-500 bg-blue-50';
    }
  };

  if (loading) {
    return (
      <div className='border-2 rounded-2xl p-4 shadow-lg h-full'>
        <h2 className='text-xl font-bold mb-4'>Route Notes</h2>
        <p className='text-gray-500'>Loading notes...</p>
      </div>
    );
  }

  return (
    <div className='border-2 rounded-2xl p-4 shadow-lg h-full flex flex-col'>
      <h2 className='text-xl font-bold mb-4'>Route Notes</h2>
      
      {routeNotes.length === 0 ? (
        <div className='flex-1 flex items-center justify-center'>
          <p className='text-gray-500 text-center'>No active route notes</p>
        </div>
      ) : (
        <div className='space-y-3 overflow-y-auto flex-1'>
          {routeNotes.map(note => (
            <div
              key={note.id}
              className={`p-3 rounded ${getPriorityStyles(note.priority)}`}
            >
              <div className='flex items-start gap-2 mb-2'>
                {getPriorityIcon(note.priority)}
                <Badge variant={
                  note.priority === "urgent" ? "destructive" :
                  note.priority === "important" ? "warning" : "secondary"
                }>
                  {note.priority.toUpperCase()}
                </Badge>
              </div>
              
              <p className='text-gray-800 mb-2 whitespace-pre-wrap'>{note.message}</p>
              
              <div className='text-xs text-gray-500 space-y-1'>
                <p>{new Date(note.created_at).toLocaleDateString()} at {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                {note.expires_at && (
                  <p className='text-orange-600 font-medium'>
                    Expires: {new Date(note.expires_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;