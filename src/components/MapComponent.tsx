'use client';

import { useRef, useEffect, useState } from 'react';
import type { CrowdDensity } from '@/lib/supabase';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';
import type { FeatureCollection, Feature, Point } from 'geojson';
import { predictCrowdMovement } from '@/lib/crowdSensors';

// For development, directly use the token
// In production, this should use environment variables properly
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

// Mecca coordinates with explicit type to match LngLatLike
const MECCA_CENTER: [number, number] = [39.826174, 21.422487];

// Mock data for prototype purposes
export const MOCK_CROWD_DATA: CrowdDensity[] = [
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
  // Additional data points for a more detailed map
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
  },
  {
    id: 7,
    location_name: 'Tent City Section A',
    coordinates: { lng: 39.889124, lat: 21.414501 },
    density_level: 'medium',
    updated_at: new Date().toISOString(),
    crowd_size: 120000,
    occupancy_percentage: '70',
    meta_data: {
      density: '3.4',
      capacity: 170000,
      sections: []
    }
  },
  {
    id: 8,
    location_name: 'Jamarat Central Access',
    coordinates: { lng: 39.871952, lat: 21.423850 },
    density_level: 'critical',
    updated_at: new Date().toISOString(),
    crowd_size: 150000,
    occupancy_percentage: '98',
    meta_data: {
      density: '7.2',
      capacity: 155000,
      sections: []
    }
  }
];

interface MapComponentProps {
  crowdData: CrowdDensity[];
}

// Location options for quick navigation
const LOCATION_OPTIONS = [
  { name: 'Masjid al-Haram', coordinates: [39.826174, 21.422487] },
  { name: 'Mina', coordinates: [39.892966, 21.413249] },
  { name: 'Jamaraat Bridge', coordinates: [39.873485, 21.42365] },
  { name: 'Arafat', coordinates: [39.984687, 21.355461] },
  { name: 'Muzdalifah', coordinates: [39.936322, 21.383082] },
];

// Route type definition
interface RouteData {
  start: string;
  destination: string;
  distance: string;
  duration: string;
  congestion_level: 'low' | 'medium' | 'high' | 'critical';
  directions: string[];
  via?: string[]; // Add optional via property for intermediate locations
  pilgrim_count_range?: string; // New field for pilgrim count range
  adjusted_walking_speed?: string; // New field for adjusted walking speed based on crowd
  crowd_impact?: string; // New field for crowd impact assessment
}

// Hajj route distances and walking times
const HAJJ_ROUTE_DATA = [
  { start: 'Masjid al-Haram', destination: 'Mina', distance: '8.5 km', duration: '2 hours' },
  { start: 'Mina', destination: 'Arafat', distance: '13 km', duration: '3 hours' },
  { start: 'Arafat', destination: 'Muzdalifah', distance: '8 km', duration: '2 hours' },
  { start: 'Muzdalifah', destination: 'Mina', distance: '4 km', duration: '1 hour' },
  { start: 'Mina', destination: 'Jamaraat Bridge', distance: '3 km', duration: '30 minutes' },
  { start: 'Jamaraat Bridge', destination: 'Masjid al-Haram', distance: '5 km', duration: '1 hour 15 minutes' },
];

// Helper function to get route data
const getRouteData = (start: string, destination: string) => {
  const routeData = HAJJ_ROUTE_DATA.find(
    route => 
      (route.start === start && route.destination === destination) ||
      (route.start === destination && route.destination === start)
  );
  
  if (routeData) {
    if (routeData.start === start) {
      return { distance: routeData.distance, duration: routeData.duration };
    } else {
      return { distance: routeData.distance, duration: routeData.duration };
    }
  }
  
  return { distance: 'Unknown', duration: 'Unknown' };
};

// Get walking path coordinates for route
const getWalkingPathCoordinates = (start: string, destination: string): [number, number][] => {
  console.log(`Getting walking path from ${start} to ${destination}`);
  
  // Test a simple direct path for debugging
  if (start === 'Masjid al-Haram' && destination === 'Mina') {
    console.log("Using test path for Masjid al-Haram to Mina");
    return [
      [39.826174, 21.422487], // Start at Masjid al-Haram
      [39.836205, 21.421284], // Point along Ibrahim Al Khalil Road
      [39.846582, 21.419021], // Continue along Ibrahim Al Khalil Road
      [39.856521, 21.417418], // Turn onto Makkah-Mina Road
      [39.870362, 21.415731], // Continue on main road
      [39.882647, 21.414231], // Continue along road
      [39.892966, 21.413249]  // End at Mina
    ];
  }
  
  // Define realistic walking paths between key locations that follow actual roads and pedestrian paths
  const pathCoordinates: Record<string, Record<string, [number, number][]>> = {
    'Mina': {
      'Jamaraat Bridge': [
        [39.892966, 21.413249], // Mina start
        [39.891612, 21.413653], // Follow the main path in Mina
        [39.889962, 21.414218], // Continue along the path
        [39.888723, 21.414612], // Curve along Mina road
        [39.887455, 21.414844], // Follow the pedestrian walkway
        [39.886298, 21.415178], // Major route intersection
        [39.884962, 21.415683], // Following the pilgrimage path
        [39.883516, 21.416172], // Beginning curve towards Jamaraat
        [39.882354, 21.416651], // Continue along road
        [39.881132, 21.417208], // Approach to Al-Jamarat intersection
        [39.880062, 21.417835], // Turn at Al-Jamarat Road
        [39.879122, 21.418586], // Follow the curve of the road
        [39.878302, 21.419332], // Pilgrim pathway
        [39.877328, 21.420012], // Approaching Jamaraat complex
        [39.876226, 21.420674], // Continue on path
        [39.875109, 21.421541], // Follow the walkway
        [39.874318, 21.422413], // Getting closer to Jamaraat Bridge
        [39.873875, 21.423212], // Almost at Jamaraat Bridge
        [39.873485, 21.42365]   // Jamaraat Bridge destination
      ],
      'Muzdalifah': [
        [39.892966, 21.413249], // Mina start
        [39.894245, 21.412631], // Exit Mina valley
        [39.895648, 21.411835], // Moving toward Muzdalifah
        [39.897221, 21.410712], // Follow the path out of Mina
        [39.898824, 21.409568], // Continue along pedestrian route
        [39.900586, 21.408312], // Curve of the road
        [39.902428, 21.406837], // Follow the pilgrimage path
        [39.904312, 21.405244], // Continue along the walkway
        [39.906387, 21.403525], // Major walkway
        [39.908623, 21.401812], // Following the main route
        [39.911247, 21.400084], // Turn along the path
        [39.913872, 21.398256], // Continue along the road
        [39.916528, 21.396423], // Curve of the pilgrimage route
        [39.919213, 21.394615], // Approaching Muzdalifah
        [39.922108, 21.392651], // Continue along the path
        [39.925175, 21.390623], // Following main walkway
        [39.928367, 21.388518], // Getting closer to Muzdalifah
        [39.931595, 21.386421], // Almost at Muzdalifah
        [39.934237, 21.384631], // Final approach
        [39.936322, 21.383082]  // Muzdalifah destination
      ]
    },
    'Masjid al-Haram': {
      'Mina': [
        [39.826174, 21.422487], // Masjid al-Haram start
        [39.827582, 21.422392], // Exit Masjid al-Haram
        [39.829153, 21.422251], // Follow Ibrahim Al Khalil Road
        [39.830815, 21.422073], // Continue on Ibrahim Al Khalil
        [39.832545, 21.421857], // Follow the main road
        [39.834238, 21.421612], // Continue east
        [39.836205, 21.421284], // Curve of the road
        [39.838151, 21.420861], // Follow the road
        [39.840178, 21.420418], // Major intersection
        [39.842285, 21.419925], // Continue along Ibrahim Al Khalil
        [39.844387, 21.419482], // Curve in the road
        [39.846582, 21.419021], // Follow the road
        [39.848951, 21.418534], // Continue east
        [39.851424, 21.418037], // Road curve
        [39.853982, 21.417682], // Follow the road
        [39.856521, 21.417418], // Makkah-Mina Road begins
        [39.859138, 21.417151], // Continue on Makkah-Mina Road
        [39.861843, 21.416871], // Follow the curve
        [39.864584, 21.416524], // Continue along the road
        [39.867421, 21.416132], // Major junction
        [39.870362, 21.415731], // Continue on main road
        [39.873358, 21.415318], // Approaching Mina
        [39.876354, 21.414982], // Getting closer to Mina
        [39.879457, 21.414621], // Follow the curve
        [39.882647, 21.414231], // Continue along road
        [39.885852, 21.413826], // Almost at Mina
        [39.889137, 21.413521], // Entering Mina
        [39.892966, 21.413249]  // Mina destination
      ],
      'Arafat': [
        [39.826174, 21.422487], // Masjid al-Haram start
        [39.828542, 21.421832], // Exit through the southeastern gate
        [39.830743, 21.421076], // Follow Al-Haram Road southeast
        [39.832916, 21.420125], // Continue on the main road
        [39.835168, 21.419084], // Follow the pilgrim route
        [39.837589, 21.417842], // Continue southeast
        [39.840214, 21.416517], // Major intersection
        [39.842901, 21.415148], // Follow the main route
        [39.845715, 21.413807], // Continue on Makkah-Arafat Highway
        [39.848718, 21.412382], // Follow the road
        [39.851914, 21.410836], // Continue southeast
        [39.855301, 21.409275], // Follow the main highway
        [39.858824, 21.407652], // Highway curve
        [39.862521, 21.405927], // Continue on Makkah-Arafat Highway
        [39.866371, 21.404076], // Follow the road
        [39.870392, 21.402148], // Continue along the pilgrimage route
        [39.874558, 21.400127], // Highway segment
        [39.878921, 21.398026], // Continue southeast
        [39.883472, 21.395852], // Follow the curve
        [39.888214, 21.393571], // Continue on Route 15
        [39.893157, 21.391152], // Follow the highway
        [39.898324, 21.388617], // Highway curve
        [39.903698, 21.385962], // Continue toward Arafat
        [39.909292, 21.383214], // Follow the main route
        [39.915147, 21.380321], // Continue southeast
        [39.921236, 21.377324], // Approaching Arafat
        [39.927571, 21.374251], // Follow the pilgrim path
        [39.934142, 21.371072], // Continue toward Arafat
        [39.940942, 21.367784], // Getting closer to Arafat
        [39.947973, 21.364342], // Follow the main road
        [39.955238, 21.360814], // Continue to Arafat Plain
        [39.962753, 21.357185], // Almost at Arafat
        [39.970521, 21.355872], // Final approach
        [39.978458, 21.355582], // Entering Arafat Plain
        [39.984687, 21.355461]  // Arafat destination
      ],
      'Jamaraat Bridge': [
        [39.826174, 21.422487], // Masjid al-Haram start
        [39.827683, 21.422593], // Exit through the northern gate
        [39.829238, 21.422731], // Follow King Fahd Road
        [39.830953, 21.422948], // Continue north
        [39.832741, 21.423176], // Follow the pilgrim path
        [39.834582, 21.423321], // Continue on the main road
        [39.836491, 21.423485], // Road curve
        [39.838531, 21.423512], // Continue along the road
        [39.840572, 21.423485], // Major intersection
        [39.842672, 21.423371], // Follow the main route
        [39.844812, 21.423142], // Continue along the road
        [39.847091, 21.422857], // Road curve
        [39.849382, 21.422596], // Follow the main path
        [39.851782, 21.422351], // Continue on the route
        [39.854215, 21.422173], // Slight curve
        [39.856652, 21.422103], // Follow the road
        [39.859172, 21.422137], // Continue along the path
        [39.861721, 21.422242], // Slight curve north
        [39.864286, 21.422386], // Follow the road
        [39.866863, 21.422593], // Continue on the path
        [39.869451, 21.422832], // Approaching Jamaraat Bridge
        [39.872047, 21.423085], // Getting closer
        [39.873485, 21.42365]   // Jamaraat Bridge destination
      ]
    },
    'Arafat': {
      'Muzdalifah': [
        [39.984687, 21.355461], // Arafat start
        [39.982136, 21.355872], // Leaving Arafat Plain
        [39.979582, 21.356324], // Follow Western Exit Road
        [39.976821, 21.357163], // Continue on the path
        [39.974135, 21.358124], // Follow the pilgrim route
        [39.971482, 21.359175], // Continue along the road
        [39.968943, 21.360421], // Main pilgrim route
        [39.966381, 21.361752], // Continue on Arafat-Muzdalifah Road
        [39.963862, 21.363157], // Follow the curve of the road
        [39.961372, 21.364642], // Continue along the path
        [39.958923, 21.366184], // Follow the main route
        [39.956482, 21.367792], // Continue west
        [39.954072, 21.369469], // Pedestrian pathway
        [39.951752, 21.371182], // Continue along the road
        [39.949374, 21.372892], // Follow the main route
        [39.946923, 21.374524], // Continue toward Muzdalifah
        [39.944364, 21.376079], // Approaching Muzdalifah Valley
        [39.941797, 21.377651], // Continue along the route
        [39.939057, 21.379186], // Follow the main path
        [39.936322, 21.383082]  // Muzdalifah destination
      ]
    },
    'Muzdalifah': {
      'Mina': [
        [39.936322, 21.383082], // Muzdalifah start
        [39.934164, 21.384383], // Leaving Muzdalifah Valley
        [39.931986, 21.385736], // Follow Muzdalifah Valley Road
        [39.930013, 21.387042], // Continue along the path
        [39.927968, 21.388428], // Follow the main route
        [39.925832, 21.389812], // Continue northwest
        [39.923682, 21.391205], // Muzdalifah-Mina Connection
        [39.921583, 21.392614], // Follow the pilgrim walkway
        [39.919321, 21.394052], // Continue along the path
        [39.917091, 21.395508], // Follow the route
        [39.914685, 21.396953], // Continue toward Mina
        [39.912382, 21.398387], // Main pilgrim pathway
        [39.909952, 21.399842], // Continue along the route
        [39.907512, 21.401235], // Follow the path
        [39.905129, 21.402748], // Continue northwest
        [39.902732, 21.404243], // Approaching Mina
        [39.900346, 21.405725], // Follow the main path
        [39.897986, 21.407272], // Continue along the route
        [39.895582, 21.408859], // Almost at Mina
        [39.893253, 21.410486], // Entering Mina Valley
        [39.892966, 21.413249]  // Mina destination
      ]
    },
    'Jamaraat Bridge': {
      'Masjid al-Haram': [
        [39.873485, 21.42365],  // Jamaraat Bridge start
        [39.871963, 21.423427], // Exit Jamarat Complex
        [39.869287, 21.423157], // Western Exit route
        [39.866612, 21.422923], // Continue along the path
        [39.863938, 21.422753], // Follow the main route
        [39.861283, 21.422591], // Continue southwest
        [39.858634, 21.422388], // Major intersection
        [39.855987, 21.422238], // Follow Mina-Makkah Pedestrian Way
        [39.853248, 21.422054], // Continue along the path
        [39.850574, 21.421832], // Follow the route
        [39.847912, 21.421623], // Continue southwest
        [39.845242, 21.421317], // Main pilgrim walkway
        [39.842546, 21.421084], // Continue along the route
        [39.839872, 21.420781], // Follow the path
        [39.836932, 21.420483], // Getting closer to Masjid al-Haram
        [39.834015, 21.420185], // Continue along Ibrahim Al Khalil
        [39.831075, 21.420614], // Follow the main route
        [39.828651, 21.421058], // Almost at Masjid al-Haram
        [39.826174, 21.422487]  // Masjid al-Haram destination
      ],
      'Mina': [
        [39.873485, 21.42365],  // Jamaraat Bridge start
        [39.874052, 21.422842], // Exit Jamarat Complex
        [39.874738, 21.421956], // Follow the walkway north
        [39.875485, 21.420961], // Continue along the path
        [39.876358, 21.419932], // Follow the pilgrim route
        [39.877324, 21.418957], // Continue along Al-Jamarat Road
        [39.878375, 21.418085], // Follow the curve
        [39.879486, 21.417294], // Continue toward Mina
        [39.880621, 21.416584], // Follow the main path
        [39.881962, 21.415882], // Continue along the route
        [39.883354, 21.415254], // Getting closer to Mina
        [39.884862, 21.414753], // Follow the main path
        [39.886418, 21.414273], // Continue along the route
        [39.888021, 21.413871], // Approaching Mina Valley
        [39.889684, 21.413557], // Almost at Mina
        [39.891472, 21.413356], // Final approach
        [39.892966, 21.413249]  // Mina destination
      ]
    }
  };
  
  // Try to get the predefined path
  const path = pathCoordinates[start]?.[destination];
  
  // If path exists, return it
  if (path) {
    console.log(`Found predefined path from ${start} to ${destination} with ${path.length} points`);
    return path;
  }
  
  // If no predefined path exists, create reverse path if possible
  if (pathCoordinates[destination]?.[start]) {
    console.log(`Using reversed path from ${destination} to ${start}`);
    return [...pathCoordinates[destination][start]].reverse();
  }
  
  // Fallback: Find the start and end points from LOCATION_OPTIONS
  console.log("No predefined path found, using direct line");
  const startPoint = LOCATION_OPTIONS.find(loc => loc.name === start);
  const endPoint = LOCATION_OPTIONS.find(loc => loc.name === destination);
  
  // If both points exist, return a simple path between them
  if (startPoint && endPoint) {
    return [
      [startPoint.coordinates[0] as number, startPoint.coordinates[1] as number],
      [endPoint.coordinates[0] as number, endPoint.coordinates[1] as number]
    ];
  }
  
  // Last resort: return empty array if no coordinates can be found
  console.error("Could not find coordinates for route");
  return [];
};

export default function MapComponent({ crowdData = [] }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const routeLayer = useRef<string | string[] | null>(null);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'light'>('streets');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const animationFrameId = useRef<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const routeCoordsRef = useRef<[number, number][]>([]);
  const [prediction, setPrediction] = useState('');
  const [predictionLoading, setPredictionLoading] = useState(false);

  // Use real data if available, otherwise use mock data
  const displayData = crowdData.length > 0 ? crowdData : MOCK_CROWD_DATA;
  
  // Set isMounted to true after component mounts to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function fetchPrediction() {
      setPredictionLoading(true);
      try {
        const now = new Date();
        const time = now.toLocaleTimeString();
        const weather = 'hot'; // Replace with real weather if available
        const event = 'General movement'; // Replace with real event if available
        const crowdDensities: Record<string, string> = {};
        (crowdData.length > 0 ? crowdData : MOCK_CROWD_DATA).forEach(loc => {
          crowdDensities[loc.location_name] = loc.density_level;
        });
        const res = await fetch('/api/predict-crowd-movement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ crowdData: crowdDensities, time, weather, event }),
        });
        const data = await res.json();
        setPrediction(data.prediction || 'Unable to fetch prediction at this time.');
      } catch (err) {
        setPrediction('Unable to fetch prediction at this time.');
      } finally {
        setPredictionLoading(false);
      }
    }
    fetchPrediction();
  }, [crowdData]);

  // Handle location selection
  const handleLocationSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locationName = e.target.value;
    if (!map.current || locationName === '') return;
    
    const location = LOCATION_OPTIONS.find(loc => loc.name === locationName);
    if (location) {
      map.current.flyTo({
        center: location.coordinates as [number, number],
        zoom: 15,
        essential: true,
        duration: 1500
      });
    }
  };

  // Handle map style change
  const handleStyleChange = (style: 'streets' | 'satellite' | 'light') => {
    if (!map.current) return;
    
    let styleUrl = 'mapbox://styles/mapbox/streets-v11';
    if (style === 'satellite') styleUrl = 'mapbox://styles/mapbox/satellite-streets-v11';
    if (style === 'light') styleUrl = 'mapbox://styles/mapbox/light-v10';
    
    map.current.setStyle(styleUrl);
    setMapStyle(style);
  };

  // Function to add congestion circles
  const addCongestionCircles = () => {
    if (!map.current) {
      console.log('[DEBUG] Map not initialized');
      return;
    }

    // Debug: log displayData
    console.log('[DEBUG] displayData:', displayData);

    // Use a unique suffix for this session
    const suffix = '_v1';
    const sourceId = 'congestion-points' + suffix;
    const layerId = 'congestion-circles' + suffix;

    // Remove existing circle layer and source if they exist
    try {
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
        console.log('[DEBUG] Removed existing', layerId, 'layer');
      }
    } catch (e) {
      console.error('[DEBUG] Error removing layer', layerId, e);
    }
    try {
      if (map.current.getSource(sourceId)) {
        map.current.removeSource(sourceId);
        console.log('[DEBUG] Removed existing', sourceId, 'source');
      }
    } catch (e) {
      console.error('[DEBUG] Error removing source', sourceId, e);
    }

    // Prepare GeoJSON for points: use displayData (crowd data) as in the original
    const features: Feature<Point>[] = displayData.map(point => ({
      type: 'Feature',
      properties: {
        density: point.density_level,
        location: point.location_name,
        crowd_size: point.crowd_size,
        occupancy: point.occupancy_percentage,
        capacity: point.meta_data?.capacity || 0
      },
      geometry: {
        type: 'Point',
        coordinates: [point.coordinates.lng, point.coordinates.lat],
      },
    }));

    const geojson: FeatureCollection<Point> = {
      type: 'FeatureCollection',
      features,
    };

    console.log('[DEBUG] Adding congestion circles GeoJSON:', geojson);
    console.log('[DEBUG] Number of features:', features.length);

    try {
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: geojson,
      });
      console.log('[DEBUG] ' + sourceId + ' source added');
    } catch (e) {
      console.error('[DEBUG] Error adding ' + sourceId + ' source:', e);
      return;
    }

    try {
      map.current.addLayer({
        id: layerId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'crowd_size'],
            0, 10,
            100000, 15,
            500000, 20,
            1000000, 25
          ],
          'circle-color': [
            'match',
            ['get', 'density'],
            'low', '#10B981',
            'medium', '#F59E0B',
            'high', '#F97316',
            'critical', '#EF4444',
            '#888888',
          ],
          'circle-opacity': 0.7,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });
      console.log('[DEBUG] ' + layerId + ' layer added');
    } catch (e) {
      console.error('[DEBUG] Error adding ' + layerId + ' layer:', e);
      return;
    }

    // Add click handler for circles
    try {
      map.current.on('click', layerId, (e) => {
        if (!e.features?.[0]) return;
        const properties = e.features[0].properties;
        if (!properties) return;
        const coordinates = (e.features[0].geometry as Point).coordinates.slice();
        const location = properties.location;
        const crowdSize = properties.crowd_size;
        const occupancy = properties.occupancy;
        const capacity = properties.capacity;
        const density = properties.density;
        // Create popup content
        const popupContent = `
          <div class=\"p-2\">
            <h3 class=\"font-semibold text-lg mb-2\">${location}</h3>
            <div class=\"space-y-1\">
              <p class=\"text-sm\">
                <span class=\"font-medium\">Pilgrims:</span> 
                ${crowdSize.toLocaleString()}
              </p>
              <p class=\"text-sm\">
                <span class=\"font-medium\">Capacity:</span> 
                ${capacity.toLocaleString()}
              </p>
              <p class=\"text-sm\">
                <span class=\"font-medium\">Occupancy:</span> 
                ${occupancy}%
              </p>
              <p class=\"text-sm\">
                <span class=\"font-medium\">Density Level:</span> 
                <span class=\"capitalize\">${density}</span>
              </p>
            </div>
          </div>
        `;
        new mapboxgl.Popup()
          .setLngLat(coordinates as [number, number])
          .setHTML(popupContent)
          .addTo(map.current!);
      });
      map.current.on('mouseenter', layerId, () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', layerId, () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
      console.log('[DEBUG] Event handlers for', layerId, 'added');
    } catch (e) {
      console.error('[DEBUG] Error adding event handlers for', layerId, e);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return;
    setIsMounted(true);
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: MECCA_CENTER,
      zoom: 13,
      pitch: 40,
      bearing: -30,
    });
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }), 'top-right');
    map.current.on('load', () => {
      if (!map.current) return;
      console.log('Map loaded successfully');
      // Add 3D buildings if not already added
      if (!map.current.getSource('composite')) {
        map.current.addSource('composite', {
          type: 'vector',
          url: 'mapbox://mapbox.mapbox-streets-v8'
        });
      }
      // Add 3D building layer
      map.current.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 14,
        'paint': {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': [
            'interpolate', ['linear'], ['zoom'],
            14, 0,
            16, ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate', ['linear'], ['zoom'],
            14, 0,
            16, ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.6
        }
      });
      // If there's a previously calculated route, redisplay it
      if (routeData) {
        console.log('Redisplaying route after map load');
        const routeCoordinates = routeData.directions
          .map(d => d.split(', ').map(Number))
          .filter(coord => coord.length === 2) as [number, number][];
        displayRouteOnMap(routeCoordinates);
      }
      // Always add congestion circles after map is loaded
      console.log('[DEBUG] Map loaded, calling addCongestionCircles');
      addCongestionCircles();
    });
    map.current.on('style.load', () => {
      // ... existing route redisplay code ...
    });
    // Clean up on unmount
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [displayData, mapStyle]);

  // Poll for map loaded and add congestion circles
  useEffect(() => {
    if (!map.current) return;
    let pollId: NodeJS.Timeout | null = null;
    function pollForLoaded() {
      if (map.current && map.current.loaded()) {
        console.log('[DEBUG] Map loaded (polled), calling addCongestionCircles');
        addCongestionCircles();
        if (pollId) clearInterval(pollId);
      }
    }
    pollId = setInterval(pollForLoaded, 100);
    return () => {
      if (pollId) clearInterval(pollId);
    };
  }, [displayData, mapStyle]);

  // Toggle heatmap layer
  useEffect(() => {
    if (!map.current || !map.current.loaded()) return;
    
    // If we're showing the heatmap
    if (showHeatmap) {
      // Check if the source already exists
      if (!map.current.getSource('crowd-density')) {
        // Create points data for heatmap
        const points = displayData.map(point => ({
          'type': 'Feature' as const,
          'properties': {
            'density': point.density_level === 'low' ? 1 :
                     point.density_level === 'medium' ? 2 : 
                     point.density_level === 'high' ? 3 : 4
          },
          'geometry': {
            'type': 'Point' as const,
            'coordinates': [point.coordinates.lng, point.coordinates.lat]
          }
        }));

        // Add source for heatmap
        map.current.addSource('crowd-density', {
          'type': 'geojson',
          'data': {
            'type': 'FeatureCollection',
            'features': points
          }
        });

        // Add heatmap layer
        map.current.addLayer({
          'id': 'crowd-heatmap',
          'type': 'heatmap',
          'source': 'crowd-density',
          'paint': {
            'heatmap-weight': ['get', 'density'],
            'heatmap-intensity': 0.8,
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(33,102,172,0)',
              0.2, 'rgb(103,169,207)',
              0.4, 'rgb(209,229,240)',
              0.6, 'rgb(253,219,199)',
              0.8, 'rgb(239,138,98)',
              1, 'rgb(178,24,43)'
            ],
            'heatmap-radius': 30,
            'heatmap-opacity': 0.7
          }
        });
      }
    } else {
      // Remove heatmap if it exists
      if (map.current.getLayer('crowd-heatmap')) {
        map.current.removeLayer('crowd-heatmap');
      }
      if (map.current.getSource('crowd-density')) {
        map.current.removeSource('crowd-density');
      }
    }
  }, [showHeatmap, displayData]);

  // Calculate route between two points
  const handleCalculateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startLocation || !endLocation) {
      setError('Please select both start and destination locations');
      return;
    }
    if (startLocation === endLocation) {
      setError('Start and destination cannot be the same');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Get coordinates for start and end
      const start = LOCATION_OPTIONS.find(loc => loc.name === startLocation);
      const end = LOCATION_OPTIONS.find(loc => loc.name === endLocation);
      if (!start || !end) throw new Error('Invalid locations');
      
      // Call Mapbox Directions API
      const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${start.coordinates[0]},${start.coordinates[1]};${end.coordinates[0]},${end.coordinates[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch route from Mapbox Directions API');
      const data = await response.json();
      if (!data.routes || !data.routes[0] || !data.routes[0].geometry) throw new Error('No route found');
      
      const routeCoords = data.routes[0].geometry.coordinates as [number, number][];
      displayRouteOnMap(routeCoords);
      
      // Create route data object
      const routeInfo: RouteData = {
        start: startLocation,
        destination: endLocation,
        distance: `${(data.routes[0].distance / 1000).toFixed(1)} km`,
        duration: `${Math.round(data.routes[0].duration / 60)} minutes`,
        congestion_level: getLocationDensity(startLocation) as 'low' | 'medium' | 'high' | 'critical',
        directions: routeCoords.map((coord, index) => {
          if (index === 0) return `Start at ${startLocation}`;
          if (index === routeCoords.length - 1) return `Arrive at ${endLocation}`;
          return `Continue along the route`;
        }),
        pilgrim_count_range: `${displayData.find(item => item.location_name === startLocation)?.crowd_size?.toLocaleString() || '0'} - ${displayData.find(item => item.location_name === endLocation)?.crowd_size?.toLocaleString() || '0'} pilgrims`,
        adjusted_walking_speed: `${Math.round(data.routes[0].duration / 60 * 1.2)} minutes (adjusted for crowd)`,
        crowd_impact: `Current crowd density: ${getLocationDensity(startLocation)} at start, ${getLocationDensity(endLocation)} at destination`
      };
      
      setRouteData(routeInfo);
      
      // Fit map to route
      if (routeCoords.length > 1 && map.current) {
        const bounds = new mapboxgl.LngLatBounds();
        routeCoords.forEach((coord: [number, number]) => bounds.extend(coord));
        map.current.fitBounds(bounds, { padding: 100, maxZoom: 15 });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to calculate route. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Display route on the map
  const displayRouteOnMap = (coordinates: [number, number][]) => {
    if (!map.current || !map.current.loaded()) return;
    removeExistingRoute();
    if (coordinates.length < 2) return;
    
    // Ensure coordinates are properly typed
    const typedCoordinates = coordinates.map(coord => 
      Array.isArray(coord) && coord.length === 2 ? [coord[0], coord[1]] as [number, number] : null
    ).filter((coord): coord is [number, number] => coord !== null);

    map.current.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: typedCoordinates
        }
      }
    });
    map.current.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 6,
        'line-opacity': 0.9
      }
    });
    routeLayer.current = 'route-line';
    routeCoordsRef.current = coordinates;
  };
  
  const removeExistingRoute = () => {
    if (!map.current || !map.current.loaded()) return;
    // Remove route layer and source if they exist
    if (map.current.getLayer('route-line')) {
      map.current.removeLayer('route-line');
    }
    if (map.current.getSource('route')) {
      map.current.removeSource('route');
    }
    routeLayer.current = null;
  };
  
  // Close route panel and clear route
  const handleCloseRoutePanel = () => {
    setShowRoutePanel(false);
    setStartLocation('');
    setEndLocation('');
    setRouteData(null);
    setError('');
    removeExistingRoute();
  };
  
  // Helper to get color for density level
  const getDensityColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Get crowd density for a location
  const getLocationDensity = (locationName: string) => {
    return displayData.find(item => item.location_name === locationName)?.density_level || 'unknown';
  };

  const handleStartNavigation = () => {
    if (!map.current || !startLocation) return;
    const start = LOCATION_OPTIONS.find(loc => loc.name === startLocation);
    if (!start) return;
    map.current.flyTo({
      center: start.coordinates as [number, number],
      zoom: 17,
      pitch: 60,
      bearing: 0,
      speed: 1.2,
      curve: 1.5,
      essential: true,
    });
  };

  return (
    <div className="relative w-full h-full">
      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden bg-gray-200" />
      
      {/* Only render UI components after component is mounted */}
      {isMounted && (
        <>
          {/* Start Navigation Button */}
          <div className="absolute bottom-4 left-4 z-20">
            <button
              className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-primary-dark transition"
              onClick={handleStartNavigation}
              disabled={routeCoordsRef.current.length === 0}
            >
              Start
            </button>
          </div>
          {/* Controls overlay */}
          <div className="absolute top-4 left-4 z-10 flex flex-col space-y-3">
            {/* Location selector */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden w-56">
              <select
                className="w-full p-2 border-0 bg-transparent text-slate-700 dark:text-slate-200 text-sm"
                onChange={handleLocationSelect}
                defaultValue=""
              >
                <option value="">Jump to location...</option>
                {LOCATION_OPTIONS.map((location) => (
                  <option key={location.name} value={location.name}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Map style controls */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 flex space-x-1">
              <button
                className={`px-2 py-1 text-xs rounded ${mapStyle === 'streets' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-slate-700 dark:text-slate-200'}`}
                onClick={() => handleStyleChange('streets')}
              >
                Streets
              </button>
              <button
                className={`px-2 py-1 text-xs rounded ${mapStyle === 'satellite' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-slate-700 dark:text-slate-200'}`}
                onClick={() => handleStyleChange('satellite')}
              >
                Satellite
              </button>
              <button
                className={`px-2 py-1 text-xs rounded ${mapStyle === 'light' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-slate-700 dark:text-slate-200'}`}
                onClick={() => handleStyleChange('light')}
              >
                Light
              </button>
            </div>
            
            {/* View toggle */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-md p-2">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={showHeatmap}
                    onChange={() => setShowHeatmap(!showHeatmap)}
                  />
                  <div className="block bg-gray-200 dark:bg-gray-700 w-10 h-6 rounded-full"></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${showHeatmap ? 'transform translate-x-full bg-primary' : ''}`}></div>
                </div>
                <div className="ml-3 text-xs text-slate-700 dark:text-slate-200">
                  Heatmap View
                </div>
              </label>
            </div>
            
            {/* Route planner button */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden">
              <button
                className="w-full p-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
                onClick={() => setShowRoutePanel(!showRoutePanel)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Route Planner
              </button>
            </div>
          </div>
          
          {/* Route planner panel */}
          {showRoutePanel && (
            <div className="absolute right-4 top-4 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-md p-4 w-80">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-slate-800 dark:text-slate-200">Route Planner</h3>
                <button 
                  onClick={handleCloseRoutePanel}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {routeData ? (
                <div className="mt-6 bg-white dark:bg-slate-800 rounded-lg shadow p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Route Information</h3>
                    <button 
                      className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                      onClick={() => setRouteData(null)}
                    >
                      Clear
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Starting Point</div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{routeData.start}</div>
                    </div>
                    
                    {routeData.via && routeData.via.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Via</div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {routeData.via.join(', ')}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Destination</div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{routeData.destination}</div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Distance</div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{routeData.distance}</div>
                      </div>
                      
                      <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Duration</div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{routeData.duration}</div>
                      </div>
                      
                      <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Congestion</div>
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${
                            routeData.congestion_level === 'low' ? 'bg-green-500' : 
                            routeData.congestion_level === 'medium' ? 'bg-yellow-500' : 
                            routeData.congestion_level === 'high' ? 'bg-orange-500' : 'bg-red-500'
                          }`}></div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                            {routeData.congestion_level}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional walking time guidance based on congestion */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 p-2 rounded text-xs">
                      <p className="font-medium mb-1">Walking Time Estimate:</p>
                      <p>Standard walking time: {routeData.duration}</p>
                      {routeData.congestion_level === 'medium' && (
                        <p>Current congestion may add 15-20 minutes to your journey.</p>
                      )}
                      {routeData.congestion_level === 'high' && (
                        <p>Due to high congestion, add 30-45 minutes to your journey time.</p>
                      )}
                      {routeData.congestion_level === 'critical' && (
                        <p className="text-red-600 dark:text-red-400 font-medium">Due to critical congestion, add 45-60 minutes to your journey time. Consider alternative routes if available.</p>
                      )}
                      <p className="mt-1 text-green-700 dark:text-green-400">Distance: {routeData.distance}</p>
                      <p className="text-xs opacity-80 mt-1">The walk between {routeData.start} and {routeData.destination} is a standard Hajj route segment.</p>
                    </div>
                    
                    {routeData.pilgrim_count_range && (
                      <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Pilgrims in Area</div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{routeData.pilgrim_count_range}</div>
                      </div>
                    )}
                    
                    {routeData.adjusted_walking_speed && (
                      <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Walking Speed</div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{routeData.adjusted_walking_speed}</div>
                      </div>
                    )}
                    
                    {routeData.crowd_impact && (
                      <div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Crowd Impact</div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{routeData.crowd_impact}</div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                  <form onSubmit={handleCalculateRoute}>
                    <div className="grid grid-cols-1 gap-3 mb-3">
                      <div>
                        <label htmlFor="start" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Your Current Location
                        </label>
                        <select
                          id="start"
                          value={startLocation}
                          onChange={(e) => setStartLocation(e.target.value)}
                          className="w-full rounded-md border-gray-300 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="">Select location</option>
                          {LOCATION_OPTIONS.map((location) => {
                            const density = getLocationDensity(location.name);
                            return (
                              <option key={`start-${location.name}`} value={location.name}>
                                {location.name} {density !== 'unknown' ? `(${density})` : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="destination" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Your Destination
                        </label>
                        <select
                          id="destination"
                          value={endLocation}
                          onChange={(e) => setEndLocation(e.target.value)}
                          className="w-full rounded-md border-gray-300 shadow-sm py-2 px-3 bg-white dark:bg-gray-700 border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="">Select destination</option>
                          {LOCATION_OPTIONS.map((location) => {
                            const density = getLocationDensity(location.name);
                            return (
                              <option key={`end-${location.name}`} value={location.name}>
                                {location.name} {density !== 'unknown' ? `(${density})` : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                    
                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-2 rounded mb-4 text-xs">
                        {error}
                      </div>
                    )}
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 p-2 rounded mb-3 text-xs">
                      <p>Routes are based on official Hajj distance data and current crowd density levels. The map will display the optimal path with accurate walking times.</p>
                    </div>
                    
                    {/* Quick Route Selection */}
                    <div className="mb-3">
                      <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Quick Route Selection:</div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setStartLocation('Masjid al-Haram');
                            setEndLocation('Mina');
                          }}
                          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-xs py-1 px-2 rounded text-gray-700 dark:text-gray-300"
                        >
                          Masjid al-Haram → Mina
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStartLocation('Mina');
                            setEndLocation('Arafat');
                          }}
                          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-xs py-1 px-2 rounded text-gray-700 dark:text-gray-300"
                        >
                          Mina → Arafat
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStartLocation('Arafat');
                            setEndLocation('Muzdalifah');
                          }}
                          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-xs py-1 px-2 rounded text-gray-700 dark:text-gray-300"
                        >
                          Arafat → Muzdalifah
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStartLocation('Muzdalifah');
                            setEndLocation('Mina');
                          }}
                          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-xs py-1 px-2 rounded text-gray-700 dark:text-gray-300"
                        >
                          Muzdalifah → Mina
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStartLocation('Mina');
                            setEndLocation('Jamaraat Bridge');
                          }}
                          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-xs py-1 px-2 rounded text-gray-700 dark:text-gray-300"
                        >
                          Mina → Jamaraat Bridge
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStartLocation('Jamaraat Bridge');
                            setEndLocation('Masjid al-Haram');
                          }}
                          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-xs py-1 px-2 rounded text-gray-700 dark:text-gray-300"
                        >
                          Jamaraat → Masjid al-Haram
                        </button>
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary text-white font-medium py-2 px-4 rounded hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 text-sm"
                    >
                      {loading ? 'Calculating...' : 'Find Best Route'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </>
      )}
      
      {/* Add custom styles for pulse animation */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(239, 68, 68, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
        .custom-popup .mapboxgl-popup-content {
          border-radius: 8px;
          padding: 0;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }
        .custom-popup .mapboxgl-popup-tip {
          border-top-color: white !important;
          border-bottom-color: white !important;
        }
        .dark .custom-popup .mapboxgl-popup-content {
          background-color: #1e293b;
          color: #f1f5f9;
          border-color: #334155;
        }
        .dark .custom-popup .mapboxgl-popup-tip {
          border-top-color: #1e293b !important;
          border-bottom-color: #1e293b !important;
        }
      `}</style>
    </div>
  );
} 