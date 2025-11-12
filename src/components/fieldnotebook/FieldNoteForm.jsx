
import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Upload, MapPin, Loader2, Plus, Check, AlertCircle, Camera, Video, Mic, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../LanguageContext";

export default function FieldNoteForm({ note, onSubmit, onCancel }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState(note || {
    title: "",
    notes: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    time: "",
    weather: "",
    temperature: "",
    location_name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    images: [],
    media_type: "",
    media_url: "",
    impact_category: "",
    tags: [],
    human_impact: "",
    climate_change_impacts: "",
    tree_equity_index: ""
  });
  const [newTag, setNewTag] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(note?.media_url || null);
  const [showManualAddress, setShowManualAddress] = useState(false);
  const fileInputRef = useRef(null);
  const mediaInputRef = useRef(null);

  const getGPSLocation = () => {
    setGpsLoading(true);
    setLocationError(null);

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
        setLocationError(null);
        setGpsLoading(false);
      },
      (error) => {
        let message = "";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied. You can enter location manually below.";
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
        setShowManualAddress(true);
      }
    );
  };

  const handleMediaSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setMediaFile(selectedFile);
      
      let type = "";
      if (selectedFile.type.startsWith("image/")) type = "image";
      else if (selectedFile.type.startsWith("video/")) type = "video";
      else if (selectedFile.type.startsWith("audio/")) type = "audio";
      
      setFormData({ ...formData, media_type: type });

      const reader = new FileReader();
      reader.onloadend = () => setMediaPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setIsUploading(true);
    
    const uploadPromises = files.map(file => base44.integrations.Core.UploadFile({ file }));
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

  const addTag = () => {
    if (newTag.trim()) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()]
      });
      setNewTag("");
    }
  };

  const removeTag = (index) => {
    const newTags = formData.tags.filter((_, i) => i !== index);
    setFormData({ ...formData, tags: newTags });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let finalFormData = { ...formData };
    
    // Upload main media if selected
    if (mediaFile) {
      setIsUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file: mediaFile });
      finalFormData.media_url = file_url;
      setIsUploading(false);
    }
    
    onSubmit(finalFormData);
  };

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
              {note ? "Edit Entry" : "New Entry"}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Primary Media Upload */}
            <div>
              <Label>Primary Media (Photo, Video, or Audio)</Label>
              <input
                ref={mediaInputRef}
                type="file"
                accept="image/*,video/*,audio/*"
                onChange={handleMediaSelect}
                className="hidden"
              />
              
              {!mediaPreview ? (
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <Button
                    type="button"
                    className="h-24 flex flex-col gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0"
                    onClick={() => mediaInputRef.current?.click()}
                  >
                    <Camera className="w-6 h-6" />
                    <span className="text-sm">Photo</span>
                  </Button>
                  <Button
                    type="button"
                    className="h-24 flex flex-col gap-2 bg-green-600 hover:bg-green-700 text-white border-0"
                    onClick={() => mediaInputRef.current?.click()}
                  >
                    <Video className="w-6 h-6" />
                    <span className="text-sm">Video</span>
                  </Button>
                  <Button
                    type="button"
                    className="h-24 flex flex-col gap-2 bg-purple-600 hover:bg-purple-700 text-white border-0"
                    onClick={() => mediaInputRef.current?.click()}
                  >
                    <Mic className="w-6 h-6" />
                    <span className="text-sm">Audio</span>
                  </Button>
                </div>
              ) : (
                <div className="mt-2">
                  {formData.media_type === "image" && (
                    <img src={mediaPreview} alt="Preview" className="w-full rounded-lg" />
                  )}
                  {formData.media_type === "video" && (
                    <video src={mediaPreview} controls className="w-full rounded-lg" />
                  )}
                  {formData.media_type === "audio" && (
                    <div className="p-4 bg-gray-100 rounded-lg">
                      <audio src={mediaPreview} controls className="w-full" />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setMediaFile(null);
                      setMediaPreview(null);
                      setFormData({ ...formData, media_type: "", media_url: "" });
                    }}
                    className="mt-2"
                  >
                    Change Media
                  </Button>
                </div>
              )}
            </div>

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

            <div>
              <Label htmlFor="description">Brief Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Quick summary..."
                className="mt-2"
                rows={2}
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
              <Label htmlFor="notes">Detailed Field Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Detailed observations, behaviors, conditions..."
                className="mt-2 min-h-32"
              />
            </div>

            <div>
              <Label htmlFor="category">Impact Category</Label>
              <Select
                value={formData.impact_category}
                onValueChange={(value) => setFormData({ ...formData, impact_category: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pollutants_and_waste">Pollutants and Waste</SelectItem>
                  <SelectItem value="air_quality">Air Quality</SelectItem>
                  <SelectItem value="deforestation">Deforestation</SelectItem>
                  <SelectItem value="biodiversity_impacts">Biodiversity Impacts</SelectItem>
                  <SelectItem value="water_quality">Water Quality</SelectItem>
                  <SelectItem value="extreme_heat_and_drought_impacts">Extreme Heat and Drought</SelectItem>
                  <SelectItem value="fires_natural_or_human_caused">Fires</SelectItem>
                  <SelectItem value="conservation_restoration">Conservation/Restoration</SelectItem>
                  <SelectItem value="human_disparities_and_inequity">Human Disparities</SelectItem>
                  <SelectItem value="soundscape">Soundscape</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
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

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowManualAddress(!showManualAddress)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                {showManualAddress ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Hide Manual Address Entry
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Or Enter Address Manually
                  </>
                )}
              </Button>

              {showManualAddress && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <p className="text-sm text-blue-800 mb-2">
                    Enter the address details if you're not at the location:
                  </p>
                  <div>
                    <Label htmlFor="address" className="text-sm">Street Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Main Street"
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="city" className="text-sm">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="City"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-sm">State/Province</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="State"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-sm">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="Country"
                      className="mt-1"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            <div>
              <Label htmlFor="human_impact">Human Impact on Environment</Label>
              <Textarea
                id="human_impact"
                value={formData.human_impact}
                onChange={(e) => setFormData({ ...formData, human_impact: e.target.value })}
                placeholder="Describe observed human activities and their impact..."
                className="mt-2"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="climate_change_impacts">Observed Impacts of Climate Change on Humans and/or Environment</Label>
              <Textarea
                id="climate_change_impacts"
                value={formData.climate_change_impacts}
                onChange={(e) => setFormData({ ...formData, climate_change_impacts: e.target.value })}
                placeholder="Describe any observed impacts of climate change on people or the environment (e.g., extreme weather effects, temperature changes, habitat shifts, health impacts, resource scarcity)..."
                className="mt-2"
                rows={4}
              />
            </div>

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
                Tree Equity Score measures tree canopy distribution in relation to income, employment, race, age, and health.
              </p>
            </div>

            <div>
              <Label>Additional Images</Label>
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
                    Upload Additional Images
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

            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map((tag, idx) => (
                    <div key={idx} className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(idx)}
                        className="hover:bg-blue-200 rounded-full p-1"
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
            <Button type="submit" disabled={isUploading} className="flex-1 bg-amber-600 hover:bg-amber-700">
              {isUploading ? "Uploading..." : note ? "Update Entry" : "Create Entry"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </motion.div>
  );
}
