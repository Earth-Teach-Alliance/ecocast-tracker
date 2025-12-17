import React, { useMemo, useState } from 'react';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  LineChart, Line, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c'];

export default function ImpactCharts({ observations }) {
  const [activeTab, setActiveTab] = useState('categories');

  const data = useMemo(() => {
    if (!observations || observations.length === 0) return null;

    // Category Distribution
    const categoryCounts = {};
    observations.forEach(obs => {
      const categories = obs.impact_categories || ['other'];
      categories.forEach(cat => {
        const label = cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        categoryCounts[label] = (categoryCounts[label] || 0) + 1;
      });
    });
    const categoryData = Object.entries(categoryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Timeline (Observations over time)
    const timeMap = {};
    observations.forEach(obs => {
      if (!obs.created_date) return;
      const date = obs.created_date.split('T')[0];
      timeMap[date] = (timeMap[date] || 0) + 1;
    });
    const timeData = Object.entries(timeMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Geographic (Top Locations)
    const locationCounts = {};
    observations.forEach(obs => {
      // Prioritize country, then city, then state, then generic location name
      const loc = obs.country || obs.city || obs.state || 'Unknown';
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });
    const locationData = Object.entries(locationCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return { categoryData, timeData, locationData };
  }, [observations]);

  if (!data || observations.length === 0) return null;

  return (
    <Card className="border-2 border-cyan-900/50 bg-[#152033] shadow-lg mb-8">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          Analytics & Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-[#0a1628] border border-cyan-900/30 w-full justify-start mb-6 overflow-x-auto">
            <TabsTrigger value="categories" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-cyan-200">Impact Categories</TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-cyan-200">Timeline</TabsTrigger>
            <TabsTrigger value="geography" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-cyan-200">Geography</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1b263b', borderColor: '#0ea5e9', color: '#fff' }} />
                </PieChart>
             </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="timeline" className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.timeData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#a5f3fc' }}
                  tickFormatter={(str) => {
                    try {
                      return format(parseISO(str), 'MMM d');
                    } catch (e) {
                      return str;
                    }
                  }}
                />
                <YAxis tick={{ fill: '#a5f3fc' }} allowDecimals={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1b263b', borderColor: '#0ea5e9', color: '#fff' }}
                  labelFormatter={(str) => {
                    try {
                      return format(parseISO(str), 'MMM d, yyyy');
                    } catch (e) {
                      return str;
                    }
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="#06b6d4" fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="geography" className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.locationData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#a5f3fc' }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fill: '#a5f3fc', fontSize: 12 }} />
                <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#1b263b', borderColor: '#0ea5e9', color: '#fff' }} />
                <Bar dataKey="value" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}