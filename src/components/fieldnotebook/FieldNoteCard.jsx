import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Thermometer, CloudRain, Pencil, Cloud, Home } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function FieldNoteCard({ note, onEdit }) {
  const sdgGoalColors = {
    1: "bg-red-600", 2: "bg-yellow-600", 3: "bg-green-600", 4: "bg-red-700",
    5: "bg-orange-600", 6: "bg-cyan-600", 7: "bg-yellow-500", 8: "bg-red-800",
    9: "bg-orange-700", 10: "bg-pink-600", 11: "bg-yellow-700", 12: "bg-yellow-800",
    13: "bg-green-700", 14: "bg-blue-600", 15: "bg-green-800", 16: "bg-blue-800",
    17: "bg-blue-900"
  };

  const categoryColors = {
    plastics_and_trash: "bg-pink-600 text-white",
    pollutants_and_waste: "bg-red-600 text-white",
    air_quality: "bg-sky-600 text-white",
    deforestation: "bg-orange-600 text-white",
    biodiversity_impacts: "bg-green-600 text-white",
    water_quality: "bg-blue-600 text-white",
    extreme_heat_and_drought_impacts: "bg-rose-600 text-white",
    fires_natural_or_human_caused: "bg-orange-700 text-white",
    conservation_restoration: "bg-emerald-600 text-white",
    human_disparities_and_inequity: "bg-violet-600 text-white",
    soundscape: "bg-indigo-600 text-white",
    other: "bg-gray-600 text-white"
  };

  const categoryLabels = {
    plastics_and_trash: "Plastics & Trash",
    pollutants_and_waste: "Pollutants & Waste",
    air_quality: "Air Quality",
    deforestation: "Deforestation",
    biodiversity_impacts: "Biodiversity",
    water_quality: "Water Quality",
    extreme_heat_and_drought_impacts: "Heat & Drought",
    fires_natural_or_human_caused: "Fires",
    conservation_restoration: "Conservation",
    human_disparities_and_inequity: "Human Disparities",
    soundscape: "Soundscape",
    other: "Other"
  };

  // Build full address string
  const getFullAddress = () => {
    const parts = [note.address, note.city, note.state, note.country].filter(Boolean);
    return parts.join(", ");
  };

  const fullAddress = getFullAddress();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="border-2 border-amber-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        {note.images && note.images.length > 0 && (
          <div className="grid grid-cols-2 gap-1 bg-gray-100">
            {note.images.slice(0, 4).map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Field note ${idx + 1}`}
                className="w-full h-32 object-cover"
              />
            ))}
          </div>
        )}

        <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl text-gray-900">{note.title}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(note)}
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-100"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(note.date), "MMM d, yyyy")}
            </Badge>
            {note.time && (
              <Badge variant="outline" className="flex items-center gap-1">
                {note.time}
              </Badge>
            )}
            {note.weather && (
              <Badge variant="outline" className="flex items-center gap-1">
                <CloudRain className="w-3 h-3" />
                {note.weather}
              </Badge>
            )}
            {note.temperature && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Thermometer className="w-3 h-3" />
                {note.temperature}
              </Badge>
            )}
          </div>

          <p className="text-gray-700 mb-4 line-clamp-3">{note.notes}</p>

          {note.impact_categories && note.impact_categories.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {note.impact_categories.map((category) => (
                  <Badge key={category} className={`${categoryColors[category]} border-0`}>
                    {categoryLabels[category] || category}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {note.location_name && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>{note.location_name}</span>
            </div>
          )}

          {fullAddress && (
            <div className="flex items-start gap-2 text-sm text-gray-600 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
              <Home className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 mb-1">Address:</p>
                <p className="text-blue-800">{fullAddress}</p>
              </div>
            </div>
          )}

          {note.human_impact && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <h4 className="text-sm font-semibold text-red-900 mb-1">Human Impact on Environment</h4>
              <p className="text-sm text-red-800">{note.human_impact}</p>
            </div>
          )}

          {note.climate_change_impacts && (
            <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-start gap-2 mb-1">
                <Cloud className="w-4 h-4 text-orange-700 mt-0.5 flex-shrink-0" />
                <h4 className="text-sm font-semibold text-orange-900">Observed Climate Change Impacts</h4>
              </div>
              <p className="text-sm text-orange-800">{note.climate_change_impacts}</p>
            </div>
          )}

          {note.tree_equity_index !== undefined && note.tree_equity_index !== null && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-green-900">Tree Equity Index Score</h4>
                <a 
                  href="https://www.treeequityscore.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-green-600 hover:text-green-800 underline"
                >
                  Learn more
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-green-700">{note.tree_equity_index}</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all" 
                      style={{ width: `${note.tree_equity_index}%` }}
                    />
                  </div>
                  <p className="text-xs text-green-700 mt-1">Score out of 100</p>
                </div>
              </div>
            </div>
          )}

          {note.action_plan && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-blue-900">Proposed Action Plan</h4>
              </div>
              <p className="text-sm text-blue-900 mb-3">{note.action_plan}</p>
              {note.sdg_goals && note.sdg_goals.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-blue-800 mb-2">Aligns with UN SDG Goals:</p>
                  <div className="flex flex-wrap gap-2">
                    {note.sdg_goals.map((goalNum) => (
                      <Badge 
                        key={goalNum} 
                        className={`${sdgGoalColors[goalNum]} text-white border-0 font-semibold`}
                      >
                        Goal {goalNum}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}