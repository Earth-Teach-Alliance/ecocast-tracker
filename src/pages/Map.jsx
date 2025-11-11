import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Image, Video, Volume2, User } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function MapPage() {
  const [center, setCenter] = useState([0, 0]);

  const { data: observations = [], isLoading } = useQuery({
    queryKey: ['fieldnotes'],
    queryFn: () => base44.entities.FieldNote.list(),
    initialData: [],
  });

  useEffect(() => {
    const withCoords = observations.filter(obs => obs.latitude && obs.longitude);
    if (withCoords.length > 0) {
      setCenter([withCoords[0].latitude, withCoords[0].longitude]);
    }
  }, [observations]);

  const categoryColors = {
    pollutants_and_waste: "bg-red-500",
    air_quality: "bg-sky-500",
    deforestation: "bg-orange-500",
    biodiversity_impacts: "bg-green-500",
    water_quality: "bg-blue-500",
    extreme_heat_and_drought_impacts: "bg-rose-500",
    fires_natural_or_human_caused: "bg-orange-600",
    conservation_restoration: "bg-emerald-500",
    human_disparities_and_inequity: "bg-violet-500",
    soundscape: "bg-indigo-500",
    other: "bg-gray-500"
  };

  const getMediaIcon = (type) => {
    switch(type) {
      case "image": return <Image className="w-4 h-4" />;
      case "video": return <Video className="w-4 h-4" />;
      case "audio": return <Volume2 className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const observationsWithCoords = observations.filter(obs => obs.latitude && obs.longitude);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0a1628] to-[#1b263b]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-gradient-to-r from-[#0a1628] to-[#1b263b] text-white p-6 shadow-lg shadow-cyan-500/20 border-b border-cyan-900/30">
        <h1 className="text-3xl font-bold mb-2">Global Impact Map</h1>
        <p className="text-cyan-300">
          {observationsWithCoords.length} observations documented worldwide
        </p>
      </div>

      <div className="flex-1 relative">
        <MapContainer
          center={center}
          zoom={observationsWithCoords.length > 0 ? 10 : 2}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {observationsWithCoords.map((obs) => (
            <Marker
              key={obs.id}
              position={[obs.latitude, obs.longitude]}
            >
              <Popup maxWidth={300}>
                <Card className="border-none shadow-none">
                  {obs.media_type === "image" && obs.media_url && (
                    <img
                      src={obs.media_url}
                      alt={obs.title}
                      className="w-full h-32 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="p-3">
                    <h3 className="font-bold text-lg mb-2">{obs.title}</h3>
                    {obs.description && <p className="text-sm text-gray-600 mb-3">{obs.description}</p>}
                    
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      {obs.media_type && (
                        <Badge className="bg-gray-100 text-gray-700 border-0">
                          {getMediaIcon(obs.media_type)}
                          <span className="ml-1">{obs.media_type}</span>
                        </Badge>
                      )}
                      
                      {obs.impact_category && (
                        <Badge className={`${categoryColors[obs.impact_category]} text-white border-0`}>
                          {obs.impact_category.replace(/_/g, ' ')}
                        </Badge>
                      )}
                    </div>
                    
                    {obs.location_name && (
                      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {obs.location_name}
                      </p>
                    )}

                    <Link 
                      to={createPageUrl("Profile")}
                      className="text-xs text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1 mt-2"
                    >
                      <User className="w-3 h-3" />
                      View {obs.created_by}'s profile
                    </Link>
                  </div>
                </Card>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {observationsWithCoords.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
            <div className="text-center p-8">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-emerald-600" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Locations Yet</h3>
              <p className="text-gray-600">Start documenting observations with GPS coordinates to see them on the map</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}