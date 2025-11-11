
import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UploadFile } from "@/integrations/Core";
import { X, Upload, MapPin, Loader2, Plus, Check, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function FieldNoteForm({ note, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(note || {
    title: "",
    notes: "",
    date: new Date().toISOString().split('T')[0],
    time: "",
    weather: "",
    temperature: "",
    location_name: "",
    species_observed: [],
    images: [],
    // impact_notes: "", // This field is being removed as per the outline
    human_impact: "",
    tree_equity_index: "",
    action_plan: "",
    sdg_goals: []
  });
  const [newSpecies, setNewSpecies] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const fileInputRef = useRef(null);

  const getGPSLocation = () => {
    setGpsLoading(true);
    setLocationError(null); // Reset error on new attempt

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationError(null); // Clear error on success
        setGpsLoading(false);
      },
      (error) => {
        let message = "";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied. You can enter location manually.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out.";
            break;
          default:
            message = "Unable to get location.";
        }
        setLocationError(message);
        setGpsLoading(false);
      }
    );
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setIsUploading(true);
    
    const uploadPromises = files.map(file => UploadFile({ file }));
    const results = await Promise.all(uploadPromises);
    const urls = results.map(r => r.file_url);
    
    setFormData({
      ...formData,
      images: [...(formData.images || []), ...urls]
    });
    setIsUploading(false);
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const addSpecies = () => {
    if (newSpecies.trim()) {
      setFormData({
        ...formData,
        species_observed: [...(formData.species_observed || []), newSpecies.trim()]
      });
      setNewSpecies("");
    }
  };

  const removeSpecies = (index) => {
    const newSpecies = formData.species_observed.filter((_, i) => i !== index);
    setFormData({ ...formData, species_observed: newSpecies });
  };

  const toggleSDGGoal = (goalNumber) => {
    const currentGoals = formData.sdg_goals || [];
    if (currentGoals.includes(goalNumber)) {
      setFormData({
        ...formData,
        sdg_goals: currentGoals.filter(g => g !== goalNumber)
      });
    } else {
      setFormData({
        ...formData,
        sdg_goals: [...currentGoals, goalNumber].sort((a, b) => a - b)
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const sdgGoals = [
    { number: 1, name: "No Poverty", color: "bg-red-600" },
    { number: 2, name: "Zero Hunger", color: "bg-yellow-600" },
    { number: 3, name: "Good Health", color: "bg-green-600" },
    { number: 4, name: "Quality Education", color: "bg-red-700" },
    { number: 5, name: "Gender Equality", color: "bg-orange-600" },
    { number: 6, name: "Clean Water", color: "bg-cyan-600" },
    { number: 7, name: "Clean Energy", color: "bg-yellow-500" },
    { number: 8, name: "Decent Work", color: "bg-red-800" },
    { number: 9, name: "Innovation", color: "bg-orange-700" },
    { number: 10, name: "Reduced Inequalities", color: "bg-pink-600" },
    { number: 11, name: "Sustainable Cities", color: "bg-yellow-700" },
    { number: 12, name: "Responsible Consumption", color: "bg-yellow-800" },
    { number: 13, name: "Climate Action", color: "bg-green-700" },
    { number: 14, name: "Life Below Water", color: "bg-blue-600" },
    { number: 15, name: "Life on Land", color: "bg-green-800" },
    { number: 16, name: "Peace & Justice", color: "bg-blue-800" },
    { number: 17, name: "Partnerships", color: "bg-blue-900" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-8"
    >
      <form onSubmit={handleSubmit}>
        <Card className="border-2 border-amber-200 shadow-2xl">
          <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50">
            <CardTitle className="text-amber-900">
              {note ? "Edit Field Note" : "New Field Note Entry"}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Summary of observation"
                className="mt-2"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Field Notes *</Label>
              <Textarea
                id="notes"
                required
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Detailed observations, behaviors, conditions..."
                className="mt-2 min-h-32"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weather">Weather</Label>
                <Input
                  id="weather"
                  value={formData.weather}
                  onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
                  placeholder="Sunny, cloudy, rainy..."
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  placeholder="25°C, 77°F..."
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="location"
                  value={formData.location_name}
                  onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                  placeholder="Location name"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={getGPSLocation}
                  disabled={gpsLoading}
                >
                  {gpsLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              {formData.latitude && formData.longitude && (
                <p className="text-sm text-emerald-700 mt-2 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  GPS: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </p>
              )}
              
              {locationError && (
                <p className="text-sm text-amber-600 mt-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {locationError}
                </p>
              )}
            </div>

            <div>
              <Label>Species Observed</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newSpecies}
                  onChange={(e) => setNewSpecies(e.target.value)}
                  placeholder="Add species name"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecies())}
                />
                <Button type="button" onClick={addSpecies}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.species_observed && formData.species_observed.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.species_observed.map((species, idx) => (
                    <div key={idx} className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                      <span>{species}</span>
                      <button
                        type="button"
                        onClick={() => removeSpecies(idx)}
                        className="hover:bg-green-200 rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* The previous 'Human Disparities Related to Climate Change' (impact_notes) field has been removed */}
            
            {/* New Human Impact field */}
            <div>
              <Label htmlFor="human_impact">Human Impact on Environment</Label>
              <Textarea
                id="human_impact"
                value={formData.human_impact}
                onChange={(e) => setFormData({ ...formData, human_impact: e.target.value })}
                placeholder="Describe observed human activities and their impact on the environment..."
                className="mt-2"
                rows={3}
              />
            </div>

            {/* New Tree Equity Index field */}
            <div>
              <Label htmlFor="tree_equity">Tree Equity Index Score</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  id="tree_equity"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.tree_equity_index}
                  onChange={(e) => setFormData({ ...formData, tree_equity_index: e.target.value ? parseFloat(e.target.value) : "" })}
                  placeholder="Enter score (0-100)"
                  className="flex-1"
                />
                <a 
                  href="https://www.treeequityscore.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline whitespace-nowrap"
                >
                  What is this?
                </a>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Tree Equity Score measures how well tree canopy is distributed in relation to income, employment, race, age, and health factors.
              </p>
            </div>

            {/* Proposed Action Plan field */}
            <div>
              <Label htmlFor="action_plan">Proposed Action Plan</Label>
              <Textarea
                id="action_plan"
                value={formData.action_plan}
                onChange={(e) => setFormData({ ...formData, action_plan: e.target.value })}
                placeholder="Describe actions that could address the observed issues..."
                className="mt-2"
                rows={4}
              />
            </div>

            {/* UN Sustainable Development Goals selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>UN Sustainable Development Goals</Label>
                <a 
                  href="https://sdgs.un.org/goals" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  View all SDG goals
                </a>
              </div>
              <p className="text-xs text-gray-600 mb-3">Select the SDG goals this action plan aligns with:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {sdgGoals.map((goal) => (
                  <button
                    key={goal.number}
                    type="button"
                    onClick={() => toggleSDGGoal(goal.number)}
                    className={`p-2 rounded-lg border-2 transition-all text-left ${
                      (formData.sdg_goals || []).includes(goal.number)
                        ? `${goal.color} text-white border-transparent shadow-lg`
                        : 'bg-white border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-bold text-sm">Goal {goal.number}</div>
                    <div className="text-xs">{goal.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Images</Label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full mt-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Images
                  </>
                )}
              </Button>

              {formData.images && formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img}
                        alt={`Upload ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex gap-3 border-t border-amber-100 bg-amber-50">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700">
              {note ? "Update Entry" : "Create Entry"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </motion.div>
  );
}
