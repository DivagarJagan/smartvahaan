import React, { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"
import GarageMap from "../components/GarageMap"
import LoadingSpinner from "../components/LoadingSpinner"
import api from "../services/api"
import { Geolocation } from "@capacitor/geolocation"

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
  const { colors, isDark } = useTheme()

  // Primary location state
  const [userLocation, setUserLocation] = useState(null)
  const [locationAddress, setLocationAddress] = useState("")
  const [locationSource, setLocationSource] = useState("Detecting...")
  const [searchRadius, setSearchRadius] = useState(10)
  
  // Status states
  const [gpsLoading, setGpsLoading] = useState(true)
  const [isLocating, setIsLocating] = useState(false)
  const [premiumLoading, setPremiumLoading] = useState(false)
  const [isPremium, setIsPremium] = useState(true)
  const [geoError, setGeoError] = useState(null)
  const [statusMessage, setStatusMessage] = useState("")
  
  // Search bar state
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchingLocation, setIsSearchingLocation] = useState(false)

  // Popular quick-jump cities in India
  const popularCities = [
    { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
    { name: "Chennai", lat: 13.0827, lng: 80.2707 },
    { name: "Coimbatore", lat: 11.0168, lng: 76.9558 },
    { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
    { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
    { name: "Delhi", lat: 28.6139, lng: 77.2090 },
  ]

  // ── Sync coordinates with backend profile (asynchronous) ────────────────────
  const syncLocationWithBackend = useCallback(async (lat, lng) => {
    try {
      await api.post("/api/garages/update-location", {
        latitude: lat,
        longitude: lng,
      })
    } catch {
      // Non-critical, ignore if endpoint is unauthenticated or temporarily unavailable
    }
  }, [])

  // ── Reverse geocode coordinates to human-readable address ───────────────────
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      )
      if (res.ok) {
        const data = await res.json()
        if (data?.address) {
          const a = data.address
          const parts = [
            a.suburb || a.neighbourhood || a.road || a.residential || a.commercial,
            a.city || a.town || a.village || a.county || a.state_district,
            a.state,
          ].filter(Boolean)
          const addr = parts.length > 0 ? parts.join(", ") : data.display_name.split(",").slice(0, 3).join(",")
          setLocationAddress(addr)
          return addr
        }
      }
    } catch (e) {
      console.warn("Reverse geocode fetch failed:", e)
    }
    const fallback = `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`
    setLocationAddress(fallback)
    return fallback
  }, [])

  // ── Step 1: IP geolocation fallback ─────────────────────────────────────────
  const fetchIpLocation = async () => {
    // 1. Try ipapi.co
    try {
      const res = await fetch("https://ipapi.co/json/")
      const data = await res.json()
      if (data.latitude && data.longitude && !data.error) {
        return {
          lat: parseFloat(data.latitude),
          lng: parseFloat(data.longitude),
          city: data.city ? `${data.city}, ${data.region || ""}` : "",
        }
      }
    } catch { /* ignore */ }

    // 2. Try freeipapi.com (reliable HTTPS CORS-enabled)
    try {
      const res = await fetch("https://freeipapi.com/api/json")
      const data = await res.json()
      if (data.latitude && data.longitude) {
        return {
          lat: parseFloat(data.latitude),
          lng: parseFloat(data.longitude),
          city: data.cityName ? `${data.cityName}, ${data.regionName || ""}` : "",
        }
      }
    } catch { /* ignore */ }

    return null
  }

  // ── Step 2: Main current location detector ──────────────────────────────────
  const detectLiveLocation = useCallback(async (userTriggered = false) => {
    setIsLocating(true)
    if (userTriggered) setGeoError(null)

    let acquiredCoords = null

    // A. Try Capacitor Native Geolocation if available
    try {
      const capPos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 8000,
      })
      if (capPos?.coords?.latitude && capPos?.coords?.longitude) {
        acquiredCoords = {
          lat: capPos.coords.latitude,
          lng: capPos.coords.longitude,
          source: "Device GPS",
        }
      }
    } catch {
      // Capacitor not native or not granted, proceed to web API
    }

    // B. Try Web navigator.geolocation
    if (!acquiredCoords && navigator.geolocation) {
      acquiredCoords = await new Promise((resolve) => {
        // High accuracy attempt
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude
            const lng = pos.coords.longitude
            // Filter out London emulator default (51.5, -0.12) or 0,0
            const isLondonDummy = Math.abs(lat - 51.5074) < 0.1 && Math.abs(lng - (-0.1278)) < 0.1
            if (isLondonDummy || (lat === 0 && lng === 0)) {
              resolve(null)
            } else {
              resolve({ lat, lng, source: "Live GPS" })
            }
          },
          () => {
            // Low accuracy / Wi-Fi fallback (crucial for Windows laptops without GPS chips)
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const lat = pos.coords.latitude
                const lng = pos.coords.longitude
                const isLondonDummy = Math.abs(lat - 51.5074) < 0.1 && Math.abs(lng - (-0.1278)) < 0.1
                if (isLondonDummy || (lat === 0 && lng === 0)) {
                  resolve(null)
                } else {
                  resolve({ lat, lng, source: "Network Location" })
                }
              },
              (err2) => {
                let msg = "Could not get device location."
                if (err2.code === 1) {
                  msg = "Location permission is blocked. Please allow browser location access or search your city below."
                } else if (err2.code === 2) {
                  msg = "Device location unavailable. You can search your city/area or click anywhere on the map."
                }
                setGeoError(msg)
                resolve(null)
              },
              { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
            )
          },
          { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 }
        )
      })
    }

    // C. If GPS / Browser Location succeeded:
    if (acquiredCoords) {
      setUserLocation({ lat: acquiredCoords.lat, lng: acquiredCoords.lng })
      setLocationSource(acquiredCoords.source)
      setGeoError(null)
      setIsLocating(false)
      setGpsLoading(false)
      localStorage.setItem("sv_last_location", JSON.stringify(acquiredCoords))
      reverseGeocode(acquiredCoords.lat, acquiredCoords.lng)
      syncLocationWithBackend(acquiredCoords.lat, acquiredCoords.lng)
      return
    }

    // D. Fallback: Network IP geolocation
    const ipLoc = await fetchIpLocation()
    if (ipLoc) {
      setUserLocation({ lat: ipLoc.lat, lng: ipLoc.lng })
      setLocationSource("Network IP Estimate")
      if (ipLoc.city) setLocationAddress(ipLoc.city)
      else reverseGeocode(ipLoc.lat, ipLoc.lng)

      setIsLocating(false)
      setGpsLoading(false)
      syncLocationWithBackend(ipLoc.lat, ipLoc.lng)
      if (!userTriggered) {
        setGeoError("Using approximate location based on your network. Click '🎯 Detect My Location' or search your area for exact results.")
      }
      return
    }

    // E. Fallback: Stored location or default
    const saved = localStorage.getItem("sv_last_location")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setUserLocation({ lat: parsed.lat, lng: parsed.lng })
        setLocationSource("Saved Location")
        setIsLocating(false)
        setGpsLoading(false)
        reverseGeocode(parsed.lat, parsed.lng)
        return
      } catch { /* ignore */ }
    }

    // Ultimate fallback: Chennai (13.0827, 80.2707)
    const fallbackCoords = { lat: 13.0827, lng: 80.2707 }
    setUserLocation(fallbackCoords)
    setLocationSource("Default Location")
    setIsLocating(false)
    setGpsLoading(false)
    reverseGeocode(fallbackCoords.lat, fallbackCoords.lng)
  }, [reverseGeocode, syncLocationWithBackend])

  // ── Search city / area / pincode ─────────────────────────────────────────────
  const handleLocationSearch = async (e) => {
    if (e) e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearchingLocation(true)
    setGeoError(null)

    try {
      const q = encodeURIComponent(searchQuery.trim())
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=5&addressdetails=1`)
      const data = await res.json()

      if (data && data.length > 0) {
        const top = data[0]
        const newLat = parseFloat(top.lat)
        const newLng = parseFloat(top.lon)
        const newCoords = { lat: newLat, lng: newLng }

        setUserLocation(newCoords)
        setLocationSource("City Search")
        const niceName = top.display_name.split(",").slice(0, 3).join(",")
        setLocationAddress(niceName)
        localStorage.setItem("sv_last_location", JSON.stringify({ ...newCoords, source: "City Search" }))
        syncLocationWithBackend(newLat, newLng)
        setSearchQuery("")
      } else {
        setGeoError(`Could not find "${searchQuery}". Please try a nearby city or area name.`)
      }
    } catch {
      setGeoError("Search request failed. Please check your internet connection.")
    } finally {
      setIsSearchingLocation(false)
    }
  }

  // ── Manual quick select city ────────────────────────────────────────────────
  const handleSelectCity = (city) => {
    const newCoords = { lat: city.lat, lng: city.lng }
    setUserLocation(newCoords)
    setLocationSource("Selected City")
    setLocationAddress(city.name)
    localStorage.setItem("sv_last_location", JSON.stringify({ ...newCoords, source: "Selected City" }))
    syncLocationWithBackend(city.lat, city.lng)
    setGeoError(null)
  }

  // ── Custom pin position (from dragging pin or clicking map) ──────────────────
  const handleCustomLocationChange = useCallback(({ lat, lng, source = "Custom Pin" }) => {
    const newCoords = { lat, lng }
    setUserLocation(newCoords)
    setLocationSource(source)
    reverseGeocode(lat, lng)
    localStorage.setItem("sv_last_location", JSON.stringify({ ...newCoords, source }))
    syncLocationWithBackend(lat, lng)
    setGeoError(null)
  }, [reverseGeocode, syncLocationWithBackend])

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    // Clear any cached garage data so fresh coords always fetch fresh results
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith("sv_garages_"))
      .forEach((k) => sessionStorage.removeItem(k))

    checkPremiumStatus()
    detectLiveLocation()
  }, [detectLiveLocation])

  const checkPremiumStatus = async () => {
    try {
      setPremiumLoading(true)
      const response = await api.get("/api/subscription/status")
      const hasPremium = Boolean(response.data?.is_premium)
      setIsPremium(hasPremium)
      if (!hasPremium) {
        setStatusMessage("Premium subscription is required to access Garage Map.")
      }
    } catch (error) {
      console.error("Error checking premium status:", error)
      setIsPremium(true)
      setStatusMessage("")
    } finally {
      setPremiumLoading(false)
    }
  }

  const primaryBtnColor = colors.buttonPrimary || colors.brand || "#1976d2"
  const cardBg = colors.card || (isDark ? "#0f1f38" : "#ffffff")
  const textMain = colors.text || (isDark ? "#f1f5f9" : "#111827")
  const textSub = colors.textSecondary || (isDark ? "#94a3b8" : "#6b7280")
  const borderColor = colors.border || (isDark ? "#1e3a5f" : "#e5e7eb")

  return (
    <div className="garage-page-wrap" style={{ padding: "20px", maxWidth: "1250px", margin: "0 auto" }}>
      {/* ── Page Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1 style={{ color: textMain, margin: 0, fontSize: "28px", fontWeight: 800 }}>
            Find Nearby Garages
          </h1>
          <p style={{ margin: "4px 0 0", color: textSub, fontSize: "14px" }}>
            Real-time verified auto service centers & workshops near your location
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            padding: "9px 18px",
            backgroundColor: primaryBtnColor,
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "14px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
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
            padding: "32px",
            backgroundColor: cardBg,
            borderRadius: "14px",
            textAlign: "center",
            color: textMain,
            border: `1px solid ${borderColor}`,
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔒</div>
          <h3 style={{ margin: "0 0 8px" }}>Premium Access Required</h3>
          <p style={{ color: textSub, margin: "0 0 16px" }}>{statusMessage}</p>
          <button
            onClick={() => navigate("/subscription")}
            style={{
              padding: "10px 24px",
              backgroundColor: primaryBtnColor,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Go Premium
          </button>
        </div>
      ) : (
        <>
          {/* ── Location & Search Control Panel ── */}
          <div
            style={{
              background: cardBg,
              borderRadius: "16px",
              border: `1px solid ${borderColor}`,
              padding: "18px 22px",
              marginBottom: "20px",
              boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
            }}
          >
            {/* Top row: Live Location Badge & Detect GPS Button */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "14px",
                paddingBottom: "16px",
                borderBottom: `1px solid ${borderColor}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: isDark ? "rgba(59,130,246,0.15)" : "#e0f2fe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    color: "#0284c7",
                    flexShrink: 0,
                  }}
                >
                  📍
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: textSub }}>
                      Current Location
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "12px",
                        background:
                          locationSource.includes("GPS")
                            ? "#dcfce7"
                            : locationSource.includes("Search")
                            ? "#e0e7ff"
                            : "#fef3c7",
                        color:
                          locationSource.includes("GPS")
                            ? "#15803d"
                            : locationSource.includes("Search")
                            ? "#4338ca"
                            : "#b45309",
                      }}
                    >
                      {locationSource}
                    </span>
                    {userLocation && (
                      <span style={{ fontSize: "11px", color: textSub, fontFamily: "monospace" }}>
                        ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: textMain,
                      marginTop: "2px",
                      maxWidth: "500px",
                    }}
                  >
                    {locationAddress || "Locating your position..."}
                  </div>
                </div>
              </div>

              {/* Action: Detect Location Button */}
              <button
                id="btn-detect-location"
                onClick={() => detectLiveLocation(true)}
                disabled={isLocating}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  backgroundColor: isLocating ? "#94a3b8" : primaryBtnColor,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: isLocating ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 10px rgba(37,99,235,0.25)",
                }}
              >
                <span
                  style={{
                    fontSize: "16px",
                    display: "inline-block",
                    animation: isLocating ? "spin 1s linear infinite" : "none",
                  }}
                >
                  {isLocating ? "⏳" : "🎯"}
                </span>
                {isLocating ? "Detecting GPS..." : "Use My Current Location"}
              </button>
            </div>

            {/* Bottom row: Search City/Area + Radius Control */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr",
                gap: "20px",
                marginTop: "16px",
                alignItems: "center",
              }}
              className="location-controls-grid"
            >
              {/* Search by City / Area */}
              <div>
                <form onSubmit={handleLocationSearch} style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search city, area, or pincode (e.g. Chennai, Indiranagar)..."
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: `1px solid ${borderColor}`,
                      background: isDark ? "#1e293b" : "#f8fafc",
                      color: textMain,
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isSearchingLocation}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: isDark ? "#334155" : "#e2e8f0",
                      color: textMain,
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: 600,
                      fontSize: "13px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isSearchingLocation ? "Searching..." : "🔍 Search"}
                  </button>
                </form>

                {/* Popular Quick Select Chips */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "11px", color: textSub, fontWeight: 600 }}>Quick Jump:</span>
                  {popularCities.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => handleSelectCity(city)}
                      style={{
                        padding: "3px 9px",
                        fontSize: "11px",
                        borderRadius: "14px",
                        border: `1px solid ${borderColor}`,
                        background: isDark ? "#1e293b" : "#ffffff",
                        color: textMain,
                        cursor: "pointer",
                        fontWeight: 500,
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = primaryBtnColor
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = borderColor
                      }}
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Radius slider */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <label htmlFor="radius-slider" style={{ color: textMain, fontSize: "13px", fontWeight: 600 }}>
                    Search Radius:
                  </label>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: primaryBtnColor,
                      background: isDark ? "rgba(59,130,246,0.15)" : "#eff6ff",
                      padding: "2px 10px",
                      borderRadius: "6px",
                    }}
                  >
                    {searchRadius} km
                  </span>
                </div>
                <input
                  id="radius-slider"
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
                  style={{
                    width: "100%",
                    accentColor: primaryBtnColor,
                    cursor: "pointer",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: textSub, marginTop: "4px" }}>
                  <span>5 km (Local)</span>
                  <span>25 km (City)</span>
                  <span>50 km (Extended)</span>
                </div>
              </div>
            </div>

            {/* Error or Notice Alert */}
            {geoError && (
              <div
                style={{
                  marginTop: "14px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  backgroundColor: isDark ? "rgba(239,68,68,0.15)" : "#fef2f2",
                  border: "1px solid #fca5a5",
                  color: isDark ? "#fca5a5" : "#b91c1c",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                }}
              >
                <span>⚠️ {geoError}</span>
                <button
                  onClick={() => setGeoError(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "inherit",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* ── Leaflet Interactive Map ── */}
          <MapErrorBoundary resetKey={userLocation ? `${userLocation.lat}-${userLocation.lng}` : "initial"}>
            {gpsLoading ? (
              <LoadingSpinner message="Detecting your current location..." />
            ) : userLocation ? (
              <GarageMap
                userLocation={userLocation}
                searchRadius={searchRadius}
                locationAddress={locationAddress}
                locationSource={locationSource}
                isLocating={isLocating}
                onDetectLocation={() => detectLiveLocation(true)}
                onLocationChange={handleCustomLocationChange}
              />
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: textSub }}>
                <p>Could not determine your location.</p>
                <button
                  onClick={() => detectLiveLocation(true)}
                  style={{
                    padding: "10px 20px",
                    background: primaryBtnColor,
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Retry Location Detection
                </button>
              </div>
            )}
          </MapErrorBoundary>
        </>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .garage-page-wrap { padding: 12px !important; }
          .location-controls-grid { grid-template-columns: 1fr !important; gap: 14px !important; }
        }
      `}</style>
    </div>
  )
}

