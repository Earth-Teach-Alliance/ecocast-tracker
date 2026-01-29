import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Loader2, CheckCircle, AlertCircle, Download } from "lucide-react";
import { motion } from "framer-motion";

export default function CSVImport({ onImportComplete }) {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setStatus(null);

    try {
      // Upload the CSV file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Extract data from CSV
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: file_url,
        json_schema: {
          type: "object",
          properties: {
            entries: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  notes: { type: "string" },
                  description: { type: "string" },
                  date: { type: "string" },
                  time: { type: "string" },
                  weather: { type: "string" },
                  temperature: { type: "string" },
                  location_name: { type: "string" },
                  address: { type: "string" },
                  city: { type: "string" },
                  state: { type: "string" },
                  country: { type: "string" },
                  human_impact: { type: "string" },
                  climate_change_impacts: { type: "string" },
                  tags: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (result.status === "error") {
        setStatus({ type: "error", message: result.details });
        setIsUploading(false);
        return;
      }

      // Process entries
      const entries = result.output.entries || [];
      const processedEntries = entries.map(entry => ({
        title: entry.title || "Untitled Entry",
        notes: entry.notes || "",
        description: entry.description || "",
        date: entry.date || new Date().toISOString().split('T')[0],
        time: entry.time || "",
        weather: entry.weather || "",
        temperature: entry.temperature || "",
        location_name: entry.location_name || "",
        address: entry.address || "",
        city: entry.city || "",
        state: entry.state || "",
        country: entry.country || "",
        human_impact: entry.human_impact || "",
        climate_change_impacts: entry.climate_change_impacts || "",
        tags: entry.tags ? entry.tags.split(',').map(t => t.trim()) : [],
        impact_categories: [],
        images: [],
        visibility: "public"
      }));

      // Batch import to avoid rate limits (5 entries at a time)
      const batchSize = 5;
      let imported = 0;
      
      for (let i = 0; i < processedEntries.length; i += batchSize) {
        const batch = processedEntries.slice(i, i + batchSize);
        await base44.entities.FieldNote.bulkCreate(batch);
        imported += batch.length;
        setProgress(Math.round((imported / processedEntries.length) * 100));
        
        // Small delay between batches
        if (i + batchSize < processedEntries.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      setStatus({ 
        type: "success", 
        message: `Successfully imported ${processedEntries.length} field notes!` 
      });
      
      setTimeout(() => {
        onImportComplete();
      }, 2000);

    } catch (error) {
      setStatus({ 
        type: "error", 
        message: error.message || "Failed to import CSV file" 
      });
    }

    setIsUploading(false);
  };

  const downloadTemplate = () => {
    const csvContent = `title,notes,description,date,time,weather,temperature,location_name,address,city,state,country,human_impact,climate_change_impacts,tags
Example Entry,Detailed field observations here,Brief description,2024-01-15,14:30,Sunny,25°C,Central Park,"123 Park Ave",New York,NY,USA,Litter observed near trails,Heat stress on vegetation,"nature,pollution,urban"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'field_notes_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="border-2 border-cyan-900/50 bg-[#152033]">
        <CardHeader>
          <CardTitle className="text-white">Import from CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-cyan-300 text-sm mb-4">
              Upload a CSV file with your field notes. The file should include columns like: title, notes, description, date, location_name, etc.
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="flex gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-cyan-600 hover:bg-cyan-700 flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload CSV
                  </>
                )}
              </Button>

              <Button
                onClick={downloadTemplate}
                variant="outline"
                className="border-cyan-700 text-cyan-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Template
              </Button>
            </div>
          </div>

          {isUploading && progress > 0 && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-cyan-300 text-sm text-center">
                Importing entries... {progress}%
              </p>
            </div>
          )}

          {status && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-lg flex items-start gap-3 ${
                status.type === "success" 
                  ? "bg-green-900/30 border border-green-700" 
                  : "bg-red-900/30 border border-red-700"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <p className={status.type === "success" ? "text-green-200" : "text-red-200"}>
                {status.message}
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}