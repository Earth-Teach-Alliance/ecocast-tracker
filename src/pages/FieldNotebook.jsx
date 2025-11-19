import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FieldNoteCard from "../components/fieldnotebook/FieldNoteCard";
import FieldNoteForm from "../components/fieldnotebook/FieldNoteForm";

export default function FieldNotebook() {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const data = await base44.entities.FieldNote.list("-created_date");
    console.log('FieldNotebook - Loaded notes:', data.length);
    setNotes(data);
    setIsLoading(false);
  };

  const handleSubmit = async (noteData) => {
    console.log('FieldNotebook - Submitting note data:', noteData);
    try {
      if (editingNote) {
        const result = await base44.entities.FieldNote.update(editingNote.id, noteData);
        console.log('FieldNotebook - Update result:', result);
      } else {
        const result = await base44.entities.FieldNote.create(noteData);
        console.log('FieldNotebook - Create result:', result);
      }
      setShowForm(false);
      setEditingNote(null);
      await loadNotes();
    } catch (error) {
      console.error('FieldNotebook - Submit error:', error);
      alert('Failed to save entry: ' + (error.message || 'Unknown error'));
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setShowForm(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0a1628] to-[#1b263b]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1b263b] to-[#0d1b2a] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">My Field Notes</h1>
            <p className="text-lg text-cyan-300">Document your detailed observations and findings. You can leave blank anything that doesn't apply.</p>
          </div>
          <Button
            onClick={() => {
              setEditingNote(null);
              setShowForm(!showForm);
            }}
            className="bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-500/30">

            <Plus className="w-5 h-5 mr-2" />
            New Entry
          </Button>
        </div>

        <AnimatePresence>
          {showForm &&
          <FieldNoteForm
            note={editingNote}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingNote(null);
            }} />

          }
        </AnimatePresence>

        <div className="grid gap-6 md:grid-cols-2">
          <AnimatePresence>
            {notes.map((note) =>
            <FieldNoteCard
              key={note.id}
              note={note}
              onEdit={handleEdit} />

            )}
          </AnimatePresence>
        </div>

        {notes.length === 0 && !showForm &&
        <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-cyan-900/20 rounded-full flex items-center justify-center">
              <Plus className="w-12 h-12 text-cyan-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">Start Your Field Journal</h3>
            <p className="text-cyan-100 mb-6">Create detailed entries of your environmental observations</p>
            <Button
            onClick={() => setShowForm(true)}
            className="bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-500/30">

              Create First Entry
            </Button>
          </div>
        }
      </div>
    </div>);

}