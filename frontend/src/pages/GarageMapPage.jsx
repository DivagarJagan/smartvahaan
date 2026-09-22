import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"
import GarageMap from "../components/GarageMap"
import LoadingSpinner from "../components/LoadingSpinner"
import api from "../services/api"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: "" }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Map failed to render." }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, message: "" })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            marginTop: 20,
            padding: 20,
            backgroundColor: "#ffebee",
            border: "1px solid #ef9a9a",
            borderRadius: 8,
            color: "#b71c1c",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Map Rendering Error</h3>
          <p style={{ marginBottom: 0 }}>
            {this.state.message}
          </p>
        </div>
      )
    }

    return this.props.children
  }
}

export default function GarageMapPage() {
  const navigate = useNavigate()
  const { colors } = useTheme()
  // null = GPS not yet acquired (shows spinner), then real coords take over
  const [userLocation, setUserLocation] = useState(null)
  const [searchRadius, setSearchRadius] = useState(10)
  const [gpsLoading, setGpsLoading] = useState(true)
  const [premiumLoading, setPremiumLoading] = useState(false)
  const [isPremium, setIsPremium] = useState(true)
  const [geoError, setGeoError] = useState(null)
  const [statusMessage, setStatusMessage] = useState("")
  const watchIdRef = useRef(null)

  useEffect(() => {
    // Clear any cached garage data so fresh coords always fetch fresh results
    Object.keys(sessionStorage)
      .filter(k => k.startsWith("sv_garages_"))
      .forEach(k => sessionStorage.removeItem(k))

    checkPremiumStatus()
    startLiveLocation()

    return () => {
      // Stop GPS watch on unmount to save battery
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  const checkPremiumStatus = async () => {
    try {
      setPremiumLoading(true)
      // api already has baseURL=http://localhost:8000 — use relative path only
      const response = await api.get("/api/subscription/status")
      const hasPremium = Boolean(response.data?.is_premium)
      setIsPremium(hasPremium)
      if (!hasPremium) {
        setStatusMessage("Premium subscription is required to access Garage Map.")
      }
    } catch (error) {
      console.error("Error checking premium status:", error)
      // If subscription check fails (e.g. endpoint not found), allow access
      // so the GarageMap component itself handles the 403 gracefully
      setIsPremium(true)
      setStatusMessage("")
    } finally {
      setPremiumLoading(false)
    }
  }

  // ── Haversine distance helper (km) ───────────────────────────────────────────
  const distKm = (lat1, lng1, lat2, lng2) => {
    const R = 6371, toR = d => d * Math.PI / 180
    const dLat = toR(lat2 - lat1), dLng = toR(lng2 - lng1)
    const a = Math.sin(dLat/2)**2 + Math.cos(toR(lat1)) * Math.cos(toR(lat2)) * Math.sin(dLng/2)**2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  // ── Step 1: IP geolocation — fast, gives correct country/city ─────────────────
  const fetchIpLocation = async () => {
    // Try ipapi.co first
    try {
      const res = await fetch("https://ipapi.co/json/")
      const data = await res.json()
      if (data.latitude && data.longitude && !data.error) {
        return { lat: parseFloat(data.latitude), lng: parseFloat(data.longitude) }
      }
    } catch { /* ignore */ }
    // Fallback: ip-api.com
    try {
      const res2 = await fetch("http://ip-api.com/json/?fields=lat,lon,status")
      const data2 = await res2.json()
      if (data2.status === "success" && data2.lat && data2.lon) {
        return { lat: data2.lat, lng: data2.lon }
      }
    } catch { /* ignore */ }
    return null
  }

  // ── Main location strategy ────────────────────────────────────────────────────
  // 1. Show IP location immediately (correct country, no permission needed)
  // 2. Then try GPS; only accept if within 500 km of IP fix (rejects London default)
  const startLiveLocation = async () => {
    setGpsLoading(true)
    setGeoError(null)

    // ── Phase 1: IP location (fast, runs first) ───────────────────────────────
    const ipLoc = await fetchIpLocation()
    if (ipLoc) {
      setUserLocation(ipLoc)
      setGpsLoading(false)
    }

    // ── Phase 2: GPS refinement ───────────────────────────────────────────────
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const gpsLat = position.coords.latitude
        const gpsLng = position.coords.longitude

        // Only trust GPS if it agrees with IP-location within 500 km.
        // The browser's "network location" can silently return London (51.5, -0.1)
        // even for users in India — accept GPS only if it is geographically plausible.
        const MAX_PLAUSIBLE_DRIFT_KM = 500
        if (ipLoc) {
          const drift = distKm(ipLoc.lat, ipLoc.lng, gpsLat, gpsLng)
          if (drift > MAX_PLAUSIBLE_DRIFT_KM) {
            console.warn(`GPS rejected: ${drift.toFixed(0)} km from IP fix. Keeping IP location.`);
            // Don't set user location here, let the IP location be the source of truth
            return;
          }
        }
        // If we reach here, GPS is trusted
        setUserLocation({ lat: gpsLat, lng: gpsLng })
        setGpsLoading(false)
        setGeoError(null)
      },
      (error) => {
        console.error("Geolocation error:", error)
        setGeoError(
          `Location access denied or unavailable (Error: ${error.code}). Showing approximate location.`
        )
        if (!ipLoc) { // Only if IP fallback also failed
          setUserLocation({ lat: 12.9716, lng: 77.5946 }) // Default to Bengaluru
        }
        setGpsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // 15 seconds
        maximumAge: 0, // Force fresh reading
      }
    )
  }

  const handleRadiusChange = (event) => {
    setSearchRadius(Number(event.target.value))
}

return (
  <div className="garage-page-wrap" style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        flexWrap: "wrap",
        gap: "10px",
      }}
    >
      <h1 style={{ color: colors.text, margin: 0 }}>Find Nearby Garages</h1>
      <button
        onClick={() => navigate("/dashboard")}
        style={{
          padding: "8px 15px",
          backgroundColor: colors.primary,
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Back to Dashboard
      </button>
    </div>

    {premiumLoading ? (
      <LoadingSpinner message="Checking subscription..." />
    ) : !isPremium ? (
      <div
        style={{
          padding: "20px",
          backgroundColor: colors.backgroundOffset,
          borderRadius: "8px",
          textAlign: "center",
          color: colors.text,
        }}
      >
        <p>{statusMessage}</p>
        <button
          onClick={() => navigate("/subscription")}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            backgroundColor: colors.primary,
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Go Premium
        </button>
      </div>
    ) : (
      <>
        <div
          style={{
            marginBottom: "15px",
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <label htmlFor="radius-slider" style={{ color: colors.text }}>
            Search Radius: <strong>{searchRadius} km</strong>
          </label>
          <input
            id="radius-slider"
            type="range"
            min="5"
            max="50"
            step="5"
            value={searchRadius}
            onChange={handleRadiusChange}
            style={{ flexGrow: 1 }}
          />
        </div>

        {geoError && (
          <p style={{ color: "#ff7675", marginBottom: "15px" }}>
            {geoError}
          </p>
        )}

        <MapErrorBoundary resetKey={Date.now()}>
          {gpsLoading ? (
            <LoadingSpinner message="Acquiring your location..." />
          ) : userLocation ? (
            <GarageMap
              userLocation={userLocation}
              searchRadius={searchRadius}
              apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            />
          ) : (
            <p>Could not determine your location.</p>
          )}
        </MapErrorBoundary>
      </>
    )}
    <style>{`
      @media (max-width: 600px) {
        .garage-page-wrap { padding: 12px !important; }
        .garage-page-wrap h1 { font-size: 20px !important; }
      }
    `}</style>
  </div>
)
}
