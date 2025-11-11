
import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Video, Mic, Upload as UploadIcon, MapPin, Check, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "../components/LanguageContext";

export default function Upload() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    media_type: "",
    impact_category: "",
    tags: "",
    location_name: ""
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [manualLocation, setManualLocation] = useState({
    city: "",
    state: "",
    country: ""
  });
  const [isGeocodingLocation, setIsGeocodingLocation] = useState(false);
  const fileInputRef = useRef(null);

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
        setLocation({
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
            message = "Location access denied. Please enable location permissions.";
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

  useEffect(() => {
    if (!location) {
      getGPSLocation();
    }
  }, []);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      let type = "";
      if (selectedFile.type.startsWith("image/")) type = "image";
      else if (selectedFile.type.startsWith("video/")) type = "video";
      else if (selectedFile.type.startsWith("audio/")) type = "audio";
      
      setFormData({ ...formData, media_type: type });

      if (type === "image" || type === "video" || type === "audio") {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const geocodeManualLocation = async () => {
    if (!manualLocation.city || !manualLocation.country) {
      setLocationError("Please enter at least city and country");
      return;
    }

    setIsGeocodingLocation(true);
    setLocationError(null);

    try {
      const locationString = [
        manualLocation.city,
        manualLocation.state,
        manualLocation.country
      ].filter(Boolean).join(", ");

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Convert this location to GPS coordinates: ${locationString}. Return ONLY a JSON object with latitude and longitude as numbers, nothing else.`,
        response_json_schema: {
          type: "object",
          properties: {
            latitude: { type: "number" },
            longitude: { type: "number" }
          },
          required: ["latitude", "longitude"]
        }
      });

      if (result.latitude && result.longitude) {
        setLocation({
          latitude: result.latitude,
          longitude: result.longitude
        });
        setFormData({
          ...formData,
          location_name: locationString
        });
        setLocationError(null);
      } else {
        setLocationError("Could not find coordinates for that location");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setLocationError("Failed to geocode location. Please try again.");
    }

    setIsGeocodingLocation(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !formData.title) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const tags = formData.tags ? formData.tags.split(",").map(t_item => t_item.trim()) : [];

      const observationData = {
        ...formData,
        tags,
        media_url: file_url,
        latitude: location?.latitude,
        longitude: location?.longitude
      };

      await base44.entities.Observation.create(observationData);
      navigate(createPageUrl("Feed"));
    } catch (error) {
      console.error("Error uploading:", error);
    }
    setIsUploading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1b263b] to-[#0d1b2a] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">{t("documentChange")}</h1>
          <p className="text-lg text-cyan-300">{t("shareObservations")}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-2 border-slate-700 shadow-xl mb-6 bg-gray-900/50 text-gray-100">
            <CardHeader className="border-b border-slate-700 bg-gradient-to-r from-gray-800 to-gray-700">
              <CardTitle className="flex items-center gap-2 text-cyan-300">
                <UploadIcon className="w-6 h-6" />
                {t("uploadMedia")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/mp4,video/quicktime,video/*,audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!file ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-32 flex flex-col gap-3 border-2 border-cyan-500 bg-cyan-600 hover:bg-cyan-700 text-white"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-8 h-8 text-white" />
                    <span className="font-semibold">{t("photo")}</span>
                    <span className="text-xs text-cyan-100">JPG, PNG</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-32 flex flex-col gap-3 border-2 border-green-700 bg-green-800 hover:bg-green-900 text-white"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Video className="w-8 h-8 text-white" />
                    <span className="font-semibold">{t("video")}</span>
                    <span className="text-xs text-green-100">MP4, MOV</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-32 flex flex-col gap-3 border-2 border-purple-500 bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Mic className="w-8 h-8 text-white" />
                    <span className="font-semibold">{t("audio")}</span>
                    <span className="text-xs text-purple-100">MP3, WAV</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {preview && formData.media_type === "image" && (
                    <div className="rounded-lg overflow-hidden border-2 border-slate-600">
                      <img src={preview} alt="Preview" className="w-full" />
                    </div>
                  )}
                  {preview && formData.media_type === "video" && (
                    <div className="rounded-lg overflow-hidden border-2 border-slate-600">
                      <video src={preview} controls className="w-full" />
                    </div>
                  )}
                  {preview && formData.media_type === "audio" && (
                    <div className="rounded-lg overflow-hidden border-2 border-slate-600 bg-slate-800 p-4">
                      <audio src={preview} controls className="w-full" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-cyan-400" />
                    <span className="font-medium">{file.name}</span>
                    <span className="text-slate-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                  >
                    Choose Different File
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-700 shadow-xl mb-6 bg-gray-900/50 text-gray-100">
            <CardHeader className="border-b border-slate-700 bg-gradient-to-r from-gray-800 to-gray-700">
              <CardTitle className="text-cyan-300">{t("details")}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <Label htmlFor="title" className="text-base font-semibold text-white">{t("title")} *</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="What did you observe?"
                  className="mt-2 bg-gray-800 text-white border-slate-700 focus:border-cyan-500"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-base font-semibold text-white">{t("description")}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your observation..."
                  className="mt-2 min-h-32 bg-gray-800 text-white border-slate-700 focus:border-cyan-500"
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-base font-semibold text-white">{t("category")}</Label>
                <Select
                  value={formData.impact_category}
                  onValueChange={(value) => setFormData({ ...formData, impact_category: value })}
                >
                  <SelectTrigger className="mt-2 bg-gray-800 text-white border-slate-700 focus:border-cyan-500">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white border-slate-700">
                    <SelectItem value="pollutants_and_waste">{t("pollutantsAndWaste")}</SelectItem>
                    <SelectItem value="air_quality">{t("airQuality")}</SelectItem>
                    <SelectItem value="deforestation">{t("deforestation")}</SelectItem>
                    <SelectItem value="biodiversity_impacts">{t("biodiversityImpacts")}</SelectItem>
                    <SelectItem value="water_quality">{t("waterQuality")}</SelectItem>
                    <SelectItem value="extreme_heat_and_drought_impacts">{t("extremeHeatAndDroughtImpacts")}</SelectItem>
                    <SelectItem value="fires_natural_or_human_caused">{t("firesNaturalOrHumanCaused")}</SelectItem>
                    <SelectItem value="conservation_restoration">{t("conservationRestoration")}</SelectItem>
                    <SelectItem value="human_disparities_and_inequity">{t("humanDisparitiesAndInequity")}</SelectItem>
                    <SelectItem value="soundscape">{t("soundscape")}</SelectItem>
                    <SelectItem value="other">{t("other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tags" className="text-base font-semibold text-white">{t("tags")}</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="wildlife, habitat, conservation"
                  className="mt-2 bg-gray-800 text-white border-slate-700 focus:border-cyan-500"
                />
              </div>

              <div>
                <Label className="text-base font-semibold text-white mb-3 block">{t("location")}</Label>
                
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={formData.location_name}
                      onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                      placeholder="Location name (optional)"
                      className="flex-1 bg-gray-800 text-white border-slate-700 focus:border-cyan-500"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={getGPSLocation}
                      disabled={gpsLoading}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                      {gpsLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-gray-900 px-2 text-slate-400">{t("orEnterManually")}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder={`${t("city")} *`}
                      value={manualLocation.city}
                      onChange={(e) => setManualLocation({ ...manualLocation, city: e.target.value })}
                      className="bg-gray-800 text-white border-slate-700 focus:border-cyan-500"
                    />
                    <Input
                      placeholder={t("state")}
                      value={manualLocation.state}
                      onChange={(e) => setManualLocation({ ...manualLocation, state: e.target.value })}
                      className="bg-gray-800 text-white border-slate-700 focus:border-cyan-500"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder={`${t("country")} *`}
                      value={manualLocation.country}
                      onChange={(e) => setManualLocation({ ...manualLocation, country: e.target.value })}
                      className="flex-1 bg-gray-800 text-white border-slate-700 focus:border-cyan-500"
                    />
                    <Button
                      type="button"
                      onClick={geocodeManualLocation}
                      disabled={isGeocodingLocation || !manualLocation.city || !manualLocation.country}
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      {isGeocodingLocation ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        t("getCoordinates")
                      )}
                    </Button>
                  </div>
                </div>
                
                {location && (
                  <Alert className="mt-3 border-cyan-700 bg-cyan-900/30">
                    <Check className="h-4 w-4 text-cyan-400" />
                    <AlertDescription className="text-cyan-300 text-sm">
                      GPS coordinates captured: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </AlertDescription>
                  </Alert>
                )}
                
                {locationError && (
                  <Alert className="mt-3 border-amber-700 bg-amber-900/30">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <AlertDescription className="text-amber-300 text-sm">
                      {locationError}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={!file || !formData.title || isUploading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-lg py-6 text-white"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t("uploading")}...
              </>
            ) : (
              <>
                <UploadIcon className="w-5 h-5 mr-2" />
                {t("submitReport")}
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
