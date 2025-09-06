import React, { useEffect, useRef, useState, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  Camera,
  MapPin,
  Users,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

// Extend window type for Globe
declare global {
  interface Window {
    Globe: any;
  }
}

// Global civic data for tooltip functionality
const CIVIC_DATA = [
  {
    country: "United States",
    lat: 39.8283,
    lng: -98.5795,
    issues: 847,
    resolved: 623,
    cities: ["New York", "San Francisco", "Chicago", "Seattle"],
  },
  {
    country: "United Kingdom",
    lat: 55.3781,
    lng: -3.436,
    issues: 234,
    resolved: 189,
    cities: ["London", "Manchester", "Edinburgh"],
  },
  {
    country: "Singapore",
    lat: 1.3521,
    lng: 103.8198,
    issues: 78,
    resolved: 71,
    cities: ["Singapore"],
  },
  {
    country: "Germany",
    lat: 51.1657,
    lng: 10.4515,
    issues: 156,
    resolved: 134,
    cities: ["Berlin", "Munich", "Hamburg"],
  },
  {
    country: "Australia",
    lat: -25.2744,
    lng: 133.7751,
    issues: 92,
    resolved: 78,
    cities: ["Sydney", "Melbourne", "Brisbane"],
  },
  {
    country: "Canada",
    lat: 56.1304,
    lng: -106.3468,
    issues: 145,
    resolved: 112,
    cities: ["Toronto", "Vancouver", "Montreal"],
  },
  {
    country: "France",
    lat: 46.2276,
    lng: 2.2137,
    issues: 203,
    resolved: 167,
    cities: ["Paris", "Lyon", "Marseille"],
  },
];

// Major civic centers for arc connections
const CIVIC_CENTERS = [
  { lat: 40.7128, lng: -74.006, name: "New York" },
  { lat: 51.5074, lng: -0.1278, name: "London" },
  { lat: 48.8566, lng: 2.3522, name: "Paris" },
  { lat: 35.6762, lng: 139.6503, name: "Tokyo" },
  { lat: 1.3521, lng: 103.8198, name: "Singapore" },
  { lat: -33.8688, lng: 151.2093, name: "Sydney" },
  { lat: 37.7749, lng: -122.4194, name: "San Francisco" },
  { lat: 52.52, lng: 13.405, name: "Berlin" },
  { lat: 43.6532, lng: -79.3832, name: "Toronto" },
  { lat: -23.5505, lng: -46.6333, name: "São Paulo" },
];

const generateCivicArcs = (n = 20) =>
  Array.from({ length: n }, () => {
    let a = 0, b = 0;
    while (a === b) {
      a = Math.floor(Math.random() * CIVIC_CENTERS.length);
      b = Math.floor(Math.random() * CIVIC_CENTERS.length);
    }
    return {
      startLat: CIVIC_CENTERS[a].lat,
      startLng: CIVIC_CENTERS[a].lng,
      endLat: CIVIC_CENTERS[b].lat,
      endLng: CIVIC_CENTERS[b].lng,
      color: "rgba(59, 130, 246, 0.6)", // Blue-500 with transparency
    };
  });

// Civic-themed color palette
const CIVIC_COLORS = [
  "#3b82f6", // Blue-500 (Primary civic)
  "#1d4ed8", // Blue-700 (Government)
  "#1e40af", // Blue-800 (Authority)
  "#1e3a8a", // Blue-900 (Institution)
  "#60a5fa", // Blue-400 (Community)
  "#93c5fd", // Blue-300 (Engagement)
  "#10b981", // Emerald-500 (Resolution)
  "#059669", // Emerald-600 (Progress)
  "#dc2626", // Red-600 (Urgent issues)
  "#ea580c", // Orange-600 (Pending)
];

const GlobeComponent: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [tooltip, setTooltip] = useState<{
    country: string;
    x: number;
    y: number;
    issues: number;
    resolved: number;
    cities: string[];
  } | null>(null);

  const arcData = useMemo(() => generateCivicArcs(25), []);

  useEffect(() => {
    // Skip on mobile
    if (window.innerWidth < 1024) return;

    // Preload resources
    const imagePreloader = new Image();
    imagePreloader.src = "//cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg";

    const preloadScript = document.createElement("link");
    preloadScript.rel = "preload";
    preloadScript.href = "//cdn.jsdelivr.net/npm/globe.gl@2.28.4/dist/globe.gl.min.js";
    preloadScript.as = "script";
    document.head.appendChild(preloadScript);
  }, []);

  useEffect(() => {
    if (globeRef.current || !containerRef.current || window.innerWidth < 1024) return;

    const ensureScript = () =>
      new Promise<void>((res) => {
        if (window.Globe) return res();
        const s = document.createElement("script");
        s.src = "//cdn.jsdelivr.net/npm/globe.gl@2.28.4/dist/globe.gl.min.js";
        s.onload = () => res();
        document.head.appendChild(s);
      });

    const boot = async () => {
      await ensureScript();

      let geoJson;
      const cachedData = sessionStorage.getItem("globeCivicData");
      if (cachedData) {
        geoJson = JSON.parse(cachedData);
      } else {
        try {
          const response = await fetch(
            "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
          );
          geoJson = await response.json();
          sessionStorage.setItem("globeCivicData", JSON.stringify(geoJson));
        } catch (error) {
          console.error("Error loading globe data:", error);
          geoJson = { features: [] };
        }
      }

      if (!containerRef.current) return;

      try {
        const globe = window.Globe()(containerRef.current);
        globe
          .globeImageUrl("//cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg")
          .polygonsData(geoJson.features)
          .polygonCapColor(() => {
            const weightedIndex = Math.random() < 0.7
              ? Math.floor(Math.random() * 6)
              : Math.floor(Math.random() * CIVIC_COLORS.length);
            return CIVIC_COLORS[weightedIndex];
          })
          .polygonSideColor(() => 'rgba(0, 100, 0, 0.15)')
          .polygonStrokeColor(() => '#111')
          .polygonAltitude(0.01)
          .arcsData(arcData)
          .arcColor("color")
          .arcDashLength(0.6)
          .arcDashGap(0.3)
          .arcDashAnimateTime(2000)
          .arcAltitude(0.3)
          .backgroundColor("rgba(0,0,0,0)")
          .atmosphereColor("#3b82f6")
          .atmosphereAltitude(0.15);

        const controls = globe.controls();
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.15;
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.dampingFactor = 0.2;

        // Adjust the point of view to zoom in and center the globe
        globe.pointOfView({ lat: 20, lng: 0, altitude: 1.5 }, 1500);

        globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        globe.renderer().shadowMap.enabled = false;

        globeRef.current = globe;
        setLoaded(true);
      } catch (error) {
        console.error("Error initializing globe:", error);
      }
    };

    boot().catch(console.error);

    return () => {
      if (globeRef.current) {
        try {
          if (globeRef.current._destructor) {
            globeRef.current._destructor();
          }
        } catch (e) {
          console.warn("Could not properly dispose globe:", e);
        }
        globeRef.current = null;
      }
    };
  }, [arcData]);

  if (window.innerWidth < 1024) return null;

  return (
    <>
      <div
        className="globe-wrapper"
        style={{
          position: "absolute",
          top: "0",
          right: "0",
          width: "43%", // Cover the right half completely
          height: "100%", // Adjusted height to fit the screen
          overflow: "hidden",
          zIndex: 1,
          opacity: loaded ? 1 : 0,
          transition: "opacity 1.5s ease-out",
          willChange: "transform, opacity",
        }}
      >
        <div
          ref={containerRef}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </div>

      {tooltip && (
        <div
          className="fixed z-50 bg-black/90 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4 pointer-events-none"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            transform: "translateY(-100%)",
          }}
        >
          <div className="text-white font-semibold text-sm mb-2">
            {tooltip.country}
          </div>
          <div className="space-y-1 text-xs">
            <div className="text-blue-300">
              Issues Reported: <span className="font-semibold text-white">{tooltip.issues}</span>
            </div>
            <div className="text-green-300">
              Issues Resolved: <span className="font-semibold text-white">{tooltip.resolved}</span>
            </div>
            <div className="text-gray-300">
              Active Cities: {tooltip.cities.join(", ")}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const MemoizedGlobe = memo(GlobeComponent);

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Globe Background */}
      <section className="relative h-screen overflow-hidden">
        {/* Globe Background - Right Half */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <MemoizedGlobe />
        </div>
        
        {/* Left Half Content */}
        <div className="relative z-20 h-full flex items-center">
          <div className="w-full lg:w-1/2 px-8 lg:px-16">
            <div className="max-w-2xl">
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-blue-900 mb-6 tracking-tight leading-none">
                City
                <span className="block text-blue-600">Snap</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-700 mb-8 font-light leading-relaxed">
                Capture. Report. Transform your community with the power of civic engagement.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-center"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transition-all duration-300 text-center"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
          
          {/* Right Half - Globe Space (invisible but maintains layout) */}
          <div className="hidden lg:block w-1/2"></div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-8 lg:left-16 z-20">
          <div className="animate-bounce">
            <ArrowDown className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-blue-600 text-sm mt-2 font-medium">Scroll to continue</p>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-8">
            About City Snap
          </h2>
          
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            City Snap is a revolutionary platform that empowers citizens to report civic issues 
            through simple photo submissions. Our AI-powered system verifies reports and connects 
            communities with local authorities to create positive change.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-3">Snap & Report</h3>
              <p className="text-gray-600">
                Take a photo of any civic issue and submit it instantly with location data.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-3">AI Verification</h3>
              <p className="text-gray-600">
                Our ML models verify reports to ensure authenticity and proper categorization.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-3">Community Action</h3>
              <p className="text-gray-600">
                Connect with local authorities and track progress until issues are resolved.
              </p>
            </div>
          </div>
          
          <div className="mt-16">
            <Link
              to="/register"
              className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Join City Snap Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-blue-900">City Snap</h3>
          </div>
          
          <p className="text-gray-600 mb-6">
            Empowering communities through technology and civic engagement.
          </p>
          
          <div className="flex justify-center space-x-8 mb-6">
            <Link to="/login" className="text-blue-600 hover:text-blue-700 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="text-blue-600 hover:text-blue-700 transition-colors">
              Register
            </Link>
            <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors">
              About
            </a>
            <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors">
              Contact
            </a>
          </div>
          
          <div className="border-t border-blue-200 pt-6">
            <p className="text-gray-500 text-sm">
              &copy; 2024 City Snap. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;