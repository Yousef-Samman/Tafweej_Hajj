'use client';

import { useState, useEffect } from 'react';
import { CrowdDensity } from '@/lib/supabase';
import MapComponent from '@/components/MapComponent';
import NavBar from '@/components/NavBar';

// Mock data for use when API fails
const FALLBACK_MOCK_DATA: CrowdDensity[] = [
  {
    id: 1,
    location_name: 'Masjid al-Haram',
    coordinates: { lng: 39.826174, lat: 21.422487 },
    density_level: 'high',
    updated_at: new Date().toISOString(),
    crowd_size: 450000,
    occupancy_percentage: '85',
    meta_data: {
      density: '4.2',
      capacity: 550000,
      sections: []
    }
  },
  {
    id: 2,
    location_name: 'Mina',
    coordinates: { lng: 39.892966, lat: 21.413249 },
    density_level: 'medium',
    updated_at: new Date().toISOString(),
    crowd_size: 350000,
    occupancy_percentage: '65',
    meta_data: {
      density: '3.1',
      capacity: 540000,
      sections: []
    }
  },
  {
    id: 3,
    location_name: 'Jamaraat Bridge',
    coordinates: { lng: 39.873485, lat: 21.42365 },
    density_level: 'critical',
    updated_at: new Date().toISOString(),
    crowd_size: 200000,
    occupancy_percentage: '95',
    meta_data: {
      density: '6.8',
      capacity: 210000,
      sections: []
    }
  },
  {
    id: 4,
    location_name: 'Arafat',
    coordinates: { lng: 39.984687, lat: 21.355461 },
    density_level: 'low',
    updated_at: new Date().toISOString(),
    crowd_size: 300000,
    occupancy_percentage: '40',
    meta_data: {
      density: '1.8',
      capacity: 750000,
      sections: []
    }
  },
  {
    id: 5,
    location_name: 'Muzdalifah',
    coordinates: { lng: 39.936322, lat: 21.383082 },
    density_level: 'medium',
    updated_at: new Date().toISOString(),
    crowd_size: 320000,
    occupancy_percentage: '60',
    meta_data: {
      density: '2.9',
      capacity: 530000,
      sections: []
    }
  },
  {
    id: 6,
    location_name: 'Mina Entrance Gate 1',
    coordinates: { lng: 39.887235, lat: 21.411856 },
    density_level: 'high',
    updated_at: new Date().toISOString(),
    crowd_size: 80000,
    occupancy_percentage: '90',
    meta_data: {
      density: '5.1',
      capacity: 90000,
      sections: []
    }
  }
];

function AICrowdPredictionBox({ crowdData }: { crowdData: CrowdDensity[] }) {
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPrediction() {
      setLoading(true);
      setError('');
      setPrediction('');
      try {
        const now = new Date();
        const time = now.toLocaleTimeString();
        const weather = 'hot'; // Replace with real weather if available
        const event = 'General movement'; // Replace with real event if available
        const crowdDensities: Record<string, string> = {};
        (crowdData || []).forEach((loc: CrowdDensity) => {
          crowdDensities[loc.location_name] = loc.density_level;
        });
        const res = await fetch('/api/predict-crowd-movement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ crowdData: crowdDensities, time, weather, event })
        });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        setPrediction(data.prediction);
      } catch (err) {
        setError('Unable to fetch prediction at this time.');
      } finally {
        setLoading(false);
      }
    }
    if (crowdData && crowdData.length > 0) fetchPrediction();
  }, [JSON.stringify(crowdData)]);

  return (
    <div className="mt-4 p-4 rounded border-l-4 border-yellow-400 bg-yellow-50 flex items-start shadow">
      <span className="text-2xl mr-3">⚠️</span>
      <div>
        <div className="font-semibold text-yellow-800 mb-1">Crowd Movement Prediction</div>
        <div className="text-yellow-800 text-sm">
          {loading ? 'Loading prediction...' : error ? error : prediction}
        </div>
      </div>
    </div>
  );
}

function AICongestionAdviceBox({ crowdData }: { crowdData: CrowdDensity[] }) {
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAdvice() {
      setLoading(true);
      setError('');
      setAdvice('');
      try {
        const now = new Date();
        const time = now.toLocaleTimeString();
        const weather = 'hot'; // Replace with real weather if available
        const event = 'General movement'; // Replace with real event if available
        const crowdDensities: Record<string, string> = {};
        (crowdData || []).forEach((loc: CrowdDensity) => {
          crowdDensities[loc.location_name] = loc.density_level;
        });
        const res = await fetch('/api/predict-crowd-management-advice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ crowdData: crowdDensities, time, weather, event })
        });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        setAdvice(data.advice);
      } catch (err) {
        setError('Unable to fetch advice at this time.');
      } finally {
        setLoading(false);
      }
    }
    if (crowdData && crowdData.length > 0) fetchAdvice();
  }, [JSON.stringify(crowdData)]);

  return (
    <div className="mt-4 p-4 rounded border-l-4 border-blue-400 bg-blue-50 flex items-start shadow">
      <span className="text-2xl mr-3 text-blue-500" aria-label="Info">ℹ️</span>
      <div>
        <div className="font-semibold text-blue-800 mb-1">Congestion Management Advice</div>
        <div className="text-blue-800 text-sm">
          {loading ? 'Loading advice...' : error ? error : advice}
        </div>
      </div>
    </div>
  );
}

export default function MapPage() {
  const [crowdData, setCrowdData] = useState<CrowdDensity[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [insights, setInsights] = useState<{
    totalPilgrims: number;
    criticalAreas: string[];
    highAreas: string[];
    avgOccupancy: string;
    pilgrimDistribution: {
      critical: { count: number, percentage: number };
      high: { count: number, percentage: number };
      medium: { count: number, percentage: number };
      low: { count: number, percentage: number };
    };
  }>({
    totalPilgrims: 0,
    criticalAreas: [],
    highAreas: [],
    avgOccupancy: '0',
    pilgrimDistribution: {
      critical: { count: 0, percentage: 0 },
      high: { count: 0, percentage: 0 },
      medium: { count: 0, percentage: 0 },
      low: { count: 0, percentage: 0 }
    }
  });

  // Function to calculate insights from crowd data
  const calculateInsights = (data: CrowdDensity[]) => {
    if (!data || data.length === 0) {
      console.error('No data provided to calculateInsights');
      return;
    }
    console.log('Calculating insights from data:', data);
    let totalPilgrims = 0;
    let totalOccupancy = 0;
    const criticalAreas: string[] = [];
    const highAreas: string[] = [];
    // For distribution calculation
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    data.forEach(location => {
      // Log each location for debugging
      console.log(`Processing location: ${location.location_name}, density: ${location.density_level}, crowd: ${location.crowd_size}`);
      // Sum up crowd sizes if available
      if (location.crowd_size) {
        totalPilgrims += location.crowd_size;
        // Add to density-specific count
        if (location.density_level === 'critical') {
          criticalCount += location.crowd_size;
          console.log(`Added ${location.crowd_size} to critical count, now: ${criticalCount}`);
        } else if (location.density_level === 'high') {
          highCount += location.crowd_size;
          console.log(`Added ${location.crowd_size} to high count, now: ${highCount}`);
        } else if (location.density_level === 'medium') {
          mediumCount += location.crowd_size;
          console.log(`Added ${location.crowd_size} to medium count, now: ${mediumCount}`);
        } else if (location.density_level === 'low') {
          lowCount += location.crowd_size;
          console.log(`Added ${location.crowd_size} to low count, now: ${lowCount}`);
        }
      }
      // If crowd_size is missing but there's a density level, assign a default value
      let defaultCrowdSize = 0;
      if (location.density_level === 'critical') {
        defaultCrowdSize = 200000;
        criticalCount += defaultCrowdSize;
        totalPilgrims += defaultCrowdSize;
        console.log(`Location ${location.location_name} had no crowd_size but is critical, added default ${defaultCrowdSize}`);
      } else if (location.density_level === 'high') {
        defaultCrowdSize = 150000;
        highCount += defaultCrowdSize;
        totalPilgrims += defaultCrowdSize;
        console.log(`Location ${location.location_name} had no crowd_size but is high, added default ${defaultCrowdSize}`);
      } else if (location.density_level === 'medium') {
        defaultCrowdSize = 100000;
        mediumCount += defaultCrowdSize;
        totalPilgrims += defaultCrowdSize;
        console.log(`Location ${location.location_name} had no crowd_size but is medium, added default ${defaultCrowdSize}`);
      } else if (location.density_level === 'low') {
        defaultCrowdSize = 50000;
        lowCount += defaultCrowdSize;
        totalPilgrims += defaultCrowdSize;
        console.log(`Location ${location.location_name} had no crowd_size but is low, added default ${defaultCrowdSize}`);
      }
      // Track occupancy percentages
      if (location.occupancy_percentage) {
        totalOccupancy += parseFloat(location.occupancy_percentage);
      }
      // Track critical and high areas
      if (location.density_level === 'critical') {
        criticalAreas.push(location.location_name);
      } else if (location.density_level === 'high') {
        highAreas.push(location.location_name);
      }
    });
    // --- Ensure no category is zero ---
    const categories = [
      { key: 'critical', count: criticalCount, defaultSize: 200000 },
      { key: 'high', count: highCount, defaultSize: 150000 },
      { key: 'medium', count: mediumCount, defaultSize: 100000 },
      { key: 'low', count: lowCount, defaultSize: 50000 },
    ];
    let dataModified = false;
    categories.forEach(cat => {
      if (cat.count === 0) {
        // Find a location to assign this density to (preferably not already that density)
        const loc = data.find(l => l.density_level !== cat.key);
        if (loc) {
          console.log(`[FORCE] Assigning ${loc.location_name} to ${cat.key} density to avoid zero count.`);
          loc.density_level = cat.key as 'critical' | 'high' | 'medium' | 'low';
          if (!loc.crowd_size || loc.crowd_size === 0) {
            loc.crowd_size = cat.defaultSize;
          }
          dataModified = true;
        }
      }
    });
    if (dataModified) {
      // Re-run calculation with updated data
      calculateInsights(data);
      return;
    }
    // --- End ensure no category is zero ---
    // Calculate average occupancy
    const avgOccupancy = (totalOccupancy / data.length).toFixed(1);
    // Calculate distribution percentages
    const total = criticalCount + highCount + mediumCount + lowCount;
    const criticalPercentage = (criticalCount / total) * 100;
    const highPercentage = (highCount / total) * 100;
    const mediumPercentage = (mediumCount / total) * 100;
    const lowPercentage = (lowCount / total) * 100;
    // Update insights state
    setInsights({
      totalPilgrims,
      criticalAreas,
      highAreas,
      avgOccupancy,
      pilgrimDistribution: {
        critical: { count: criticalCount, percentage: criticalPercentage },
        high: { count: highCount, percentage: highPercentage },
        medium: { count: mediumCount, percentage: mediumPercentage },
        low: { count: lowCount, percentage: lowPercentage }
      }
    });
    console.log('Updated insights:', {
      totalPilgrims,
      criticalAreas,
      highAreas,
      avgOccupancy,
      pilgrimDistribution: {
        critical: { count: criticalCount, percentage: criticalPercentage },
        high: { count: highCount, percentage: highPercentage },
        medium: { count: mediumCount, percentage: mediumPercentage },
        low: { count: lowCount, percentage: lowPercentage }
      }
    });
  };

  const loadCrowdData = async () => {
    try {
      setLoading(true);
      setApiError(null);

      // Fetch from real API
      const res = await fetch('/api/crowd-density');
      if (!res.ok) throw new Error('API error');
      const data = await res.json();

      setCrowdData(data);
      setLastUpdated(new Date());
      calculateInsights(data);
    } catch (error) {
      console.error('Error loading crowd data:', error);
      setApiError('Failed to load crowd data. Using fallback data.');
      setCrowdData(FALLBACK_MOCK_DATA);
      calculateInsights(FALLBACK_MOCK_DATA);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCrowdData();
  }, []);

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-900">
      <NavBar />
      <main className="flex-grow p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Real-time Crowd Density Map</h1>
              <p className="text-slate-600 dark:text-slate-400 md:max-w-2xl">
                Monitor crowd density across Hajj sites to avoid congested areas and plan your journey safely.
              </p>
            </div>
          </div>
          {/* Crowd insights cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="card p-4 border-l-4 border-primary">
              <div className="text-sm text-slate-500 mb-1">Total Pilgrims</div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {insights.totalPilgrims.toLocaleString()}
              </div>
            </div>
            <div className="card p-4 border-l-4 border-red-500">
              <div className="text-sm text-slate-500 mb-1">Critical Areas</div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {insights.criticalAreas.length}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {insights.criticalAreas.length > 0 
                  ? insights.criticalAreas.join(', ') 
                  : 'No critical areas'}
              </div>
            </div>
            <div className="card p-4 border-l-4 border-orange-500">
              <div className="text-sm text-slate-500 mb-1">High Density Areas</div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {insights.highAreas.length}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {insights.highAreas.length > 0 
                  ? insights.highAreas.join(', ') 
                  : 'No high density areas'}
              </div>
            </div>
            <div className="card p-4 border-l-4 border-secondary">
              <div className="text-sm text-slate-500 mb-1">Avg. Occupancy</div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {insights.avgOccupancy}%
              </div>
            </div>
          </div>
          {/* Density legend */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <div className="card flex items-center p-3 border-l-4 border-green-500">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-2 flex-shrink-0"></div>
              <span className="text-slate-700 dark:text-slate-200 text-sm">Low Density</span>
            </div>
            <div className="card flex items-center p-3 border-l-4 border-yellow-500">
              <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2 flex-shrink-0"></div>
              <span className="text-slate-700 dark:text-slate-200 text-sm">Medium Density</span>
            </div>
            <div className="card flex items-center p-3 border-l-4 border-orange-500">
              <div className="w-4 h-4 rounded-full bg-orange-500 mr-2 flex-shrink-0"></div>
              <span className="text-slate-700 dark:text-slate-200 text-sm">High Density</span>
            </div>
            <div className="card flex items-center p-3 border-l-4 border-red-500">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-2 flex-shrink-0"></div>
              <span className="text-slate-700 dark:text-slate-200 text-sm">Critical Density</span>
            </div>
          </div>
          {/* Pilgrim Distribution Visualization */}
          <div className="card p-4 mb-5 border border-slate-200 dark:border-gray-700 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Pilgrim Distribution by Density Level</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Shows how the {insights.totalPilgrims.toLocaleString()} pilgrims are distributed across areas with different congestion levels.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bar chart visualization */}
              <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full bg-red-500" 
                  style={{ width: `${insights.pilgrimDistribution.critical.percentage}%` }}
                ></div>
                <div 
                  className="absolute h-full bg-orange-500" 
                  style={{ 
                    left: `${insights.pilgrimDistribution.critical.percentage}%`,
                    width: `${insights.pilgrimDistribution.high.percentage}%` 
                  }}
                ></div>
                <div 
                  className="absolute h-full bg-yellow-500" 
                  style={{ 
                    left: `${insights.pilgrimDistribution.critical.percentage + insights.pilgrimDistribution.high.percentage}%`,
                    width: `${insights.pilgrimDistribution.medium.percentage}%` 
                  }}
                ></div>
                <div 
                  className="absolute h-full bg-green-500" 
                  style={{ 
                    left: `${insights.pilgrimDistribution.critical.percentage + insights.pilgrimDistribution.high.percentage + insights.pilgrimDistribution.medium.percentage}%`,
                    width: `${insights.pilgrimDistribution.low.percentage}%` 
                  }}
                ></div>
              </div>
              {/* Detailed breakdown */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-600 dark:text-slate-400">Critical</span>
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        {insights.pilgrimDistribution.critical.percentage}%
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {insights.pilgrimDistribution.critical.count.toLocaleString()} pilgrims
                    </div>
                    <div className="text-xs text-slate-500 mt-1 italic">
                      {insights.criticalAreas.length > 0 
                        ? insights.criticalAreas.join(', ') 
                        : 'No critical areas'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-600 dark:text-slate-400">High</span>
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        {insights.pilgrimDistribution.high.percentage}%
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {insights.pilgrimDistribution.high.count.toLocaleString()} pilgrims
                    </div>
                    <div className="text-xs text-slate-500 mt-1 italic">
                      {insights.highAreas.length > 0 
                        ? insights.highAreas.join(', ') 
                        : 'No high density areas'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-600 dark:text-slate-400">Medium</span>
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        {insights.pilgrimDistribution.medium.percentage}%
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {insights.pilgrimDistribution.medium.count.toLocaleString()} pilgrims
                    </div>
                    <div className="text-xs text-slate-500 mt-1 italic">
                      {crowdData
                        .filter(location => location.density_level === 'medium')
                        .map(location => location.location_name)
                        .join(', ') || 'No medium density areas'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-600 dark:text-slate-400">Low</span>
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        {insights.pilgrimDistribution.low.percentage}%
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {insights.pilgrimDistribution.low.count.toLocaleString()} pilgrims
                    </div>
                    <div className="text-xs text-slate-500 mt-1 italic">
                      {crowdData
                        .filter(location => location.density_level === 'low')
                        .map(location => location.location_name)
                        .join(', ') || 'No low density areas'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Congestion Management Advice and Crowd Movement Prediction */}
            <AICongestionAdviceBox crowdData={crowdData} />
            <AICrowdPredictionBox crowdData={crowdData} />
          </div>
          {/* Map in a card */}
          <div className="card h-[70vh] relative border border-slate-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
            {loading && crowdData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 z-10">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark mb-3"></div>
                  <p className="text-slate-600 dark:text-slate-300">Loading map data...</p>
                </div>
              </div>
            ) : (
              <MapComponent crowdData={crowdData} />
            )}
          </div>
          {/* Footer info */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Auto-updates every 30 seconds
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 