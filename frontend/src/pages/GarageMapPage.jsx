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

  const startLiveLocation = () => {
    setGpsLoading(true)
    setGeoError(null)
    if (!navigator.geolocation) {
      setUserLocation({ lat: 11.0601, lng: 77.1084 }) // last-resort fallback
      setGpsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
        }

        setUserLocation(newLoc)
        setGpsLoading(false)

        // Then start watching for changes
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const wLat = pos.coords.latitude
            const wLng = pos.coords.longitude
            setUserLocation({ lat: wLat, lng: wLng })
          },
          () => {},
          { enableHighAccuracy: true, maximumAge: 0 }
        )

        // Silently update backend with live location
        api.post("/api/garages/update-location", {
          latitude: newLoc.lat,
          longitude: newLoc.lng,
        }).catch(() => { })
      },
      async (err) => {
        console.warn("GPS error:", err.message)
        // Set an explicit UI warning
        setGeoError("True GPS was blocked by your browser. Displaying approximate city location.")
        try {
          // Fallback to IP geolocation if GPS is denied or unavailable
          const res = await fetch("https://ipapi.co/json/")
          const data = await res.json()
          if (data.latitude && data.longitude) {
            setUserLocation({ lat: parseFloat(data.latitude), lng: parseFloat(data.longitude) })
            setGpsLoading(false)
            return
          }
        } catch (ipErr) {
          console.warn("IP Geolocation fallback failed:", ipErr)
        }
        setUserLocation(prev => prev || { lat: 11.0601, lng: 77.1084 }) // ultimate fallback
        setGpsLoading(false)
      },
      {
        enableHighAccuracy: false, // Fastest possible initial fix
        timeout: 8000, // wait slightly longer to give user time to click allow
        maximumAge: 0,
      }
    )
  }

  // Manual "Refresh" button — clears cache and restarts watch
  const getUserLocation = () => {
    Object.keys(sessionStorage)
      .filter(k => k.startsWith("sv_garages_"))
      .forEach(k => sessionStorage.removeItem(k))
    setGpsLoading(true)
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
    }
    startLiveLocation()
  }

  const [searchQuery, setSearchQuery] = useState("")

  const handleManualLocationChange = (newLoc) => {
    // If user dragged the pin or clicked the map, stop live GPS updates so it doesn't snap back
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setUserLocation(newLoc)
  }

  const handleCitySearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    setGpsLoading(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current)
          watchIdRef.current = null
        }
        setUserLocation({ lat: parseFloat(lat), lng: parseFloat(lon) })
      } else {
        alert("Location not found. Try a different city name.")
      }
    } catch (err) {
      console.warn("Failed to search location.")
    }
    setGpsLoading(false)
  }

  const styles = {
    container: {
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "30px 20px",
      backgroundColor: colors.background,
      minHeight: "100vh"
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "30px",
      flexWrap: "wrap",
      gap: "20px"
    },
    title: {
      fontSize: "32px",
      fontWeight: "bold",
      color: colors.text,
      margin: 0
    },
    subtitle: {
      fontSize: "14px",
      color: colors.textSecondary,
      margin: "5px 0 0 0"
    },
    controlPanel: {
      display: "flex",
      gap: "15px",
      alignItems: "center",
      flexWrap: "wrap"
    },
    radiusControl: {
      display: "flex",
      alignItems: "center",
      gap: "10px"
    },
    radiusLabel: {
      fontSize: "14px",
      fontWeight: "bold",
      color: colors.text
    },
    radiusInput: {
      padding: "8px 12px",
      fontSize: "14px",
      border: `1px solid ${colors.border}`,
      borderRadius: "6px",
      width: "80px"
    },
    radiusUnit: {
      fontSize: "14px",
      color: colors.textSecondary
    },
    button: {
      padding: "10px 20px",
      fontSize: "14px",
      fontWeight: "bold",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      backgroundColor: "#1976d2",
      color: "white",
      transition: "all 0.3s"
    },
    infoBox: {
      backgroundColor: "#e3f2fd",
      border: "1px solid #1976d2",
      borderRadius: "8px",
      padding: "15px 20px",
      marginBottom: "20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "15px"
    },
    infoText: {
      fontSize: "14px",
      color: "#1565c0",
      margin: 0
    }
  }

  if (premiumLoading) {
    return <LoadingSpinner />
  }

  if (!isPremium) {
    return (
      <div style={styles.container}>
        <div style={{
          backgroundColor: "#fff3e0",
          border: "1px solid #ff9800",
          borderRadius: "8px",
          padding: "20px",
          marginTop: "20px",
          color: "#e65100"
        }}>
          <h2 style={{ marginTop: 0, marginBottom: "8px" }}>Premium Access Required</h2>
          <p style={{ marginTop: 0, marginBottom: "16px" }}>{statusMessage}</p>
          <button
            style={styles.button}
            onClick={() => navigate("/premium-features")}
          >
            Go to Premium Plans
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🗺️ Garage Map</h1>
          <p style={styles.subtitle}>Find nearby car service centers and garages</p>
        </div>

        <div style={styles.controlPanel}>
          <form style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginRight: "15px" }} onSubmit={handleCitySearch}>
            <input
              type="text"
              placeholder="Search City or Location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ ...styles.radiusInput, width: "180px" }}
            />
            <button type="submit" style={{...styles.button, backgroundColor: "#546e7a"}}>
              🔍 Search
            </button>
          </form>

          <div style={styles.radiusControl}>
            <label style={styles.radiusLabel}>Radius:</label>
            <input
              type="number"
              min="1"
              max="50"
              value={searchRadius}
              onChange={(e) => setSearchRadius(Math.max(1, parseInt(e.target.value) || 10))}
              style={styles.radiusInput}
            />
            <span style={styles.radiusUnit}>km</span>
          </div>

          <button
            style={styles.button}
            onClick={getUserLocation}
            title="Try again if location access was denied or failed. If denied, allow location in your browser settings."
          >
            📍 My Location
          </button>
        </div>
      </div>

      {userLocation && (
        <>
          <div style={styles.infoBox}>
            <p style={styles.infoText}>
              📍 Showing garages within {searchRadius} km of your location ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})
            </p>
            <button
              style={{ ...styles.button, backgroundColor: "#4caf50" }}
              onClick={() => navigate("/premium-features")}
            >
              Manage Subscription
            </button>
          </div>

          {geoError && (
            <div style={{ backgroundColor: "#ffebee", border: "1px solid #ffcdd2", color: "#c62828", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", fontWeight: "600" }}>
              ⚠️ {geoError} To fix this, click the Lock Icon (🔒) or Location Icon in your browser's address bar and allow location access, then click "My Location".
            </div>
          )}

          <MapErrorBoundary resetKey={`${userLocation.lat}-${userLocation.lng}-${searchRadius}`}>
            <GarageMap 
              userLocation={userLocation} 
              radius={searchRadius} 
              onLocationChange={handleManualLocationChange}
            />
          </MapErrorBoundary>
        </>
      )}
    </div>
  )
}
