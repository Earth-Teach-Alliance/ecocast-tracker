
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Thermometer, CloudRain, Pencil, ExternalLink } from "lucide-react";
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

          {note.species_observed && note.species_observed.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Species Observed:</h4>
              <div className="flex flex-wrap gap-2">
                {note.species_observed.map((species, idx) => (
                  <Badge key={idx} className="bg-green-100 text-green-700 border-green-200">
                    {species}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {note.location_name && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <MapPin className="w-4 h-4" />
              <span>{note.location_name}</span>
            </div>
          )}

          {note.human_impact && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <h4 className="text-sm font-semibold text-red-900 mb-1">Human Impact on Environment</h4>
              <p className="text-sm text-red-800">{note.human_impact}</p>
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
                <a 
                  href="https://sdgs.un.org/goals" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  UN SDGs <ExternalLink className="w-3 h-3" />
                </a>
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
