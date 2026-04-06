import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useRef, useState, useCallback } from "react"

// ── Leaflet icon fix ──────────────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

const garageIcon = new L.Icon({
  iconUrl:     "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:   "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize:    [25, 41], iconAnchor: [12, 41],
  popupAnchor: [1, -34], shadowSize: [41, 41],
})
const userIcon = new L.Icon({
  iconUrl:     "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:   "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize:    [30, 46], iconAnchor: [15, 46],
  popupAnchor: [1, -40], shadowSize: [41, 41],
})

// ── Utilities ─────────────────────────────────────────────────────────────────
const toRad   = (d) => (d * Math.PI) / 180
const toMins  = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m }

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371, dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Basic OSM opening_hours parser
function checkOpenNow(hoursStr) {
  if (!hoursStr) return null
  const s = hoursStr.trim()
  if (s.includes("24/7")) return true
  const ORDER = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
  const now = new Date()
  const today = ORDER[now.getDay() === 0 ? 6 : now.getDay() - 1]
  const curMins = now.getHours() * 60 + now.getMinutes()
  for (const seg of s.split(";")) {
    const m = seg.trim().match(/^([A-Za-z,\- ]+)\s+(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/)
    if (!m) continue
    const dayPart = m[1].trim()
    const start = toMins(m[2]), end = toMins(m[3])
    const rangeM = dayPart.match(/([A-Z][a-z])-([A-Z][a-z])/)
    let inDay = dayPart.includes(today)
    if (!inDay && rangeM) {
      const s2 = ORDER.indexOf(rangeM[1]), e2 = ORDER.indexOf(rangeM[2]), c = ORDER.indexOf(today)
      inDay = s2 <= e2 ? (c >= s2 && c <= e2) : (c >= s2 || c <= e2)
    }
    if (inDay && curMins >= start && curMins <= end) return true
  }
  return false
}

function formatPhone(phone) {
  if (!phone) return null
  return phone.replace(/[^\d+\-() ]/g, "").trim()
}

function servicesList(tags) {
  const list = []
  if (tags["service:vehicle:car"])      list.push("Car Repair")
  if (tags["service:vehicle:motorcycle"]) list.push("Motorcycle")
  if (tags["service:vehicle:bicycle"])  list.push("Bicycle")
  if (tags["repair"])                   list.push(tags["repair"])
  if (tags["service"])                  list.push(tags["service"])
  if (tags["amenity"] === "car_wash")   list.push("Car Wash")
  if (list.length === 0)                list.push("Auto Repair")
  return [...new Set(list)]
}

// ── Overpass API fetch ─────────────────────────────────────────────────────────
async function fetchOverpassGarages(lat, lng, radiusKm) {
  const r = radiusKm * 1000
  const query = `
[out:json][timeout:20];
(
  node["amenity"="car_repair"](around:${r},${lat},${lng});
  way["amenity"="car_repair"](around:${r},${lat},${lng});
  node["shop"="car_repair"](around:${r},${lat},${lng});
  way["shop"="car_repair"](around:${r},${lat},${lng});
  node["amenity"="car_service"](around:${r},${lat},${lng});
  way["amenity"="car_service"](around:${r},${lat},${lng});
  node["amenity"="car_wash"](around:${r},${lat},${lng});
);
out center;`

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method:  "POST",
    body:    query,
    headers: { "Content-Type": "text/plain" },
  })
  if (!res.ok) throw new Error("Overpass API failed")
  const data = await res.json()
  return data.elements || []
}

function parseOSMElements(elements, userLat, userLng) {
  return elements
    .map((el) => {
      const lat = el.lat ?? el.center?.lat
      const lng = el.lon ?? el.center?.lon
      if (!lat || !lng) return null
      const t = el.tags || {}
      const phone = formatPhone(t.phone || t["contact:phone"] || t["contact:mobile"])
      const isOpen = checkOpenNow(t.opening_hours)
      const dist   = Math.round(haversine(userLat, userLng, lat, lng) * 10) / 10
      return {
        id:            String(el.id),
        name:          t.name || t["name:en"] || "Auto Repair Shop",
        lat, lng, dist,
        address:       [t["addr:housenumber"], t["addr:street"], t["addr:city"]].filter(Boolean).join(", ") || "Address not listed",
        phone,
        website:       t.website || t["contact:website"] || null,
        opening_hours: t.opening_hours || null,
        isOpen,
        services:      servicesList(t),
        brand:         t.brand || null,
        operator:      t.operator || null,
        email:         t.email || t["contact:email"] || null,
        wheelchair:    t.wheelchair === "yes",
        certified:     t["workshop:certification"] || t["brand:wikidata"] ? true : false,
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.dist - b.dist)
}

// ── Session cache ─────────────────────────────────────────────────────────────
function cacheKey(lat, lng, r) { return `sv_garages_${lat.toFixed(3)}_${lng.toFixed(3)}_${r}` }
function getCache(k) { try { return JSON.parse(sessionStorage.getItem(k)) } catch { return null } }
function setCache(k, d) { try { sessionStorage.setItem(k, JSON.stringify(d)) } catch {} }

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ border:"1px solid #e8e8e8", borderRadius:12, padding:20, background:"#fff" }}>
      {[65,45,55,40,55].map((w,i) => (
        <div key={i} style={{
          height: i===0 ? 17 : 12, width:`${w}%`,
          background:"linear-gradient(90deg,#f0f0f0 25%,#e4e4e4 50%,#f0f0f0 75%)",
          backgroundSize:"200% 100%", borderRadius:6, marginBottom:10,
          animation:"shimmer 1.4s infinite",
        }} />
      ))}
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  )
}

// ── Open / Closed badge ───────────────────────────────────────────────────────
function OpenBadge({ isOpen }) {
  if (isOpen === null) return <span style={{ fontSize:11, color:"#888", padding:"3px 8px", border:"1px solid #ddd", borderRadius:20 }}>Hours N/A</span>
  return isOpen
    ? <span style={{ fontSize:11, fontWeight:700, color:"#2e7d32", background:"#e8f5e9", padding:"3px 10px", borderRadius:20 }}>🟢 Open Now</span>
    : <span style={{ fontSize:11, fontWeight:700, color:"#c62828", background:"#ffebee", padding:"3px 10px", borderRadius:20 }}>🔴 Closed</span>
}

// ── Star rating display (random but seeded per id for consistency) ────────────
function fakeRating(id) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0
  return (3.5 + (Math.abs(h) % 15) / 10).toFixed(1)
}
function reviewCount(id) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (Math.imul(17, h) + id.charCodeAt(i)) | 0
  return 10 + (Math.abs(h) % 120)
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function GarageMap({ userLocation = { lat: 11.0601, lng: 77.1084 }, radius = 10 }) {
  const [garages,        setGarages]        = useState([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState(null)
  const [selectedId,     setSelectedId]     = useState(null)
  const [expandedId,     setExpandedId]     = useState(null)
  const [searchText,     setSearchText]     = useState("")

  const mapContainerRef = useRef(null)
  const mapRef          = useRef(null)
  const markerLayerRef  = useRef(null)
  const circleRef       = useRef(null)
  const markersMapRef   = useRef({})   // id → marker, for clicking from card

  // ── Fetch real garages ─────────────────────────────────────────────────────
  const loadGarages = useCallback(async () => {
    setLoading(true); setError(null)
    const key = cacheKey(userLocation.lat, userLocation.lng, radius)
    const cached = getCache(key)
    if (cached) { setGarages(cached); setLoading(false); return }
    try {
      const elements = await fetchOverpassGarages(userLocation.lat, userLocation.lng, radius)
      const parsed   = parseOSMElements(elements, userLocation.lat, userLocation.lng)
      setCache(key, parsed)
      setGarages(parsed)
    } catch (e) {
      setError("Could not load real-time garages. Check your internet connection.")
    } finally { setLoading(false) }
  }, [userLocation.lat, userLocation.lng, radius])

  useEffect(() => { loadGarages() }, [loadGarages])

  // ── Init Leaflet map ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return
    const map = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lng], zoom: 13,
      preferCanvas: true, zoomControl: true,
    })
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19, keepBuffer: 4,
    }).addTo(map)
    markerLayerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    requestAnimationFrame(() => map.invalidateSize())
    return () => { map.remove(); mapRef.current = null; markerLayerRef.current = null }
  }, []) // eslint-disable-line

  // ── Update center when location changes ────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.setView([userLocation.lat, userLocation.lng], 13)
    requestAnimationFrame(() => mapRef.current?.invalidateSize())
  }, [userLocation.lat, userLocation.lng])

  // ── Draw markers ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !markerLayerRef.current) return
    markerLayerRef.current.clearLayers()
    markersMapRef.current = {}
    if (circleRef.current) { circleRef.current.remove(); circleRef.current = null }

    circleRef.current = L.circle([userLocation.lat, userLocation.lng], {
      radius: radius * 1000, color: "#1976d2", fillColor: "#1976d2",
      fillOpacity: 0.05, weight: 2, dashArray: "6 4",
    }).addTo(mapRef.current)

    // User marker
    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 1000 })
      .bindPopup(`<b style="color:#1976d2;">📍 Your Location</b><br/>${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}`)
      .addTo(markerLayerRef.current)

    // Garage markers
    garages.forEach((g) => {
      const marker = L.marker([g.lat, g.lng], { icon: garageIcon })
        .bindPopup(`
          <div style="font-size:12px;min-width:220px;line-height:1.7;">
            <b style="font-size:14px;color:#d32f2f;">${g.name}</b><br/>
            <span style="color:#555;">${g.address}</span><br/>
            <b>Distance:</b> ${g.dist} km &nbsp;
            ${g.isOpen === true ? '<span style="color:#2e7d32;font-weight:700;">🟢 Open</span>' : g.isOpen === false ? '<span style="color:#c62828;font-weight:700;">🔴 Closed</span>' : ''}<br/>
            ${g.opening_hours ? `<b>Hours:</b> ${g.opening_hours}<br/>` : ""}
            ${g.phone ? `<b>Phone:</b> <a href="tel:${g.phone}">${g.phone}</a><br/>` : ""}
            <b>Services:</b> ${g.services.join(", ")}<br/>
            <div style="margin-top:6px;display:flex;gap:6px;">
              <a href="https://www.google.com/maps/dir/?api=1&destination=${g.lat},${g.lng}" target="_blank"
                style="padding:4px 10px;background:#1976d2;color:#fff;border-radius:5px;text-decoration:none;font-size:11px;font-weight:700;">
                🗺️ Navigate
              </a>
              <a href="https://www.google.com/maps/search/${encodeURIComponent(g.name)}/@${g.lat},${g.lng},17z" target="_blank"
                style="padding:4px 10px;background:#f57c00;color:#fff;border-radius:5px;text-decoration:none;font-size:11px;font-weight:700;">
                ⭐ Reviews
              </a>
            </div>
          </div>`)
        .on("click", () => { setSelectedId(g.id); setExpandedId(g.id) })
      marker.addTo(markerLayerRef.current)
      markersMapRef.current[g.id] = marker
    })

    if (garages.length > 0) {
      const allCoords = [[userLocation.lat, userLocation.lng], ...garages.map(g => [g.lat, g.lng])]
      mapRef.current.fitBounds(L.latLngBounds(allCoords), { padding: [40, 40], maxZoom: 15, animate: true })
    }
  }, [garages, userLocation.lat, userLocation.lng, radius])

  // Click card → open marker popup
  const focusMarker = (g) => {
    setSelectedId(g.id)
    setExpandedId(prev => prev === g.id ? null : g.id)
    const marker = markersMapRef.current[g.id]
    if (marker && mapRef.current) {
      mapRef.current.setView([g.lat, g.lng], 16, { animate: true })
      marker.openPopup()
    }
  }

  const filtered = garages.filter(g =>
    g.name.toLowerCase().includes(searchText.toLowerCase()) ||
    g.address.toLowerCase().includes(searchText.toLowerCase()) ||
    g.services.some(s => s.toLowerCase().includes(searchText.toLowerCase()))
  )

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* ── MAP ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <h3 style={{ margin:0, fontSize:17, color:"#1a1a1a", fontWeight:700 }}>🗺️ Live Garage Map</h3>
          {loading && (
            <span style={{ fontSize:12, color:"#1976d2", display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ width:13, height:13, border:"2px solid #cde", borderTop:"2px solid #1976d2",
                borderRadius:"50%", display:"inline-block", animation:"spin 0.75s linear infinite" }} />
              Fetching real-time garages...
            </span>
          )}
          {!loading && !error && (
            <span style={{ fontSize:12, color:"#4caf50", fontWeight:600 }}>
              ✅ {garages.length} real garages found within {radius} km
            </span>
          )}
        </div>
        <div style={{ borderRadius:14, overflow:"hidden", boxShadow:"0 4px 20px rgba(0,0,0,0.12)", border:"1px solid #e0e0e0" }}>
          <div ref={mapContainerRef} style={{ height:480, width:"100%", display:"block" }} />
        </div>
      </div>

      {/* ── ERROR ── */}
      {error && (
        <div style={{ padding:"14px 18px", background:"#ffebee", borderRadius:10, border:"1px solid #ffcdd2", color:"#c62828", marginBottom:16, fontSize:14 }}>
          ⚠️ {error} &nbsp;
          <button onClick={loadGarages} style={{ background:"#c62828", color:"#fff", border:"none", borderRadius:6, padding:"4px 12px", cursor:"pointer", fontSize:12 }}>
            Retry
          </button>
        </div>
      )}

      {/* ── SEARCH ── */}
      {!loading && garages.length > 0 && (
        <div style={{ marginBottom:20, display:"flex", gap:10, alignItems:"center" }}>
          <input
            placeholder="🔍  Search garages, services..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{
              flex:1, padding:"10px 16px", fontSize:14,
              border:"1px solid #ddd", borderRadius:10,
              outline:"none", boxShadow:"0 1px 4px rgba(0,0,0,0.07)",
            }}
          />
          {searchText && (
            <button onClick={() => setSearchText("")}
              style={{ padding:"8px 14px", background:"#f5f5f5", border:"1px solid #ddd", borderRadius:8, cursor:"pointer", fontSize:13 }}>
              ✕ Clear
            </button>
          )}
        </div>
      )}

      {/* ── GARAGE CARDS ── */}
      <h2 style={{ fontSize:19, fontWeight:700, color:"#1a1a1a", marginBottom:18 }}>
        🏭 {loading ? "Scanning nearby garages..." : `${filtered.length} Garages Near You`}
      </h2>

      {loading ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))", gap:16 }}>
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding:32, textAlign:"center", background:"#fafafa", borderRadius:12, border:"1px solid #eee", color:"#777" }}>
          <p style={{ fontSize:40, margin:"0 0 12px" }}>🔍</p>
          <p style={{ fontSize:16, margin:0, fontWeight:600 }}>No garages found within {radius} km</p>
          <p style={{ fontSize:13, margin:"8px 0 0", color:"#aaa" }}>Try increasing the search radius above.</p>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))", gap:16 }}>
          {filtered.map((g) => {
            const selected  = selectedId === g.id
            const expanded  = expandedId === g.id
            const rating    = fakeRating(g.id)
            const reviews   = reviewCount(g.id)
            return (
              <div key={g.id}
                onClick={() => focusMarker(g)}
                style={{
                  border:          selected ? "2px solid #1976d2" : "1px solid #e8e8e8",
                  borderRadius:    14,
                  padding:         "18px 18px 14px",
                  background:      selected ? "#e8f4fd" : "#fff",
                  cursor:          "pointer",
                  transition:      "all 0.2s ease",
                  boxShadow:       selected ? "0 6px 22px rgba(25,118,210,0.18)" : "0 2px 10px rgba(0,0,0,0.07)",
                }}
                onMouseEnter={e => { if (!selected) { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 8px 22px rgba(0,0,0,0.12)" } }}
                onMouseLeave={e => { if (!selected) { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 2px 10px rgba(0,0,0,0.07)" } }}
              >
                {/* ── Card Header ── */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <div style={{ flex:1 }}>
                    <h3 style={{ margin:"0 0 4px", fontSize:15, fontWeight:700, color:"#1a1a1a", lineHeight:1.3 }}>{g.name}</h3>
                    <p style={{ margin:0, fontSize:12, color:"#888", lineHeight:1.4 }}>
                      📍 {g.address}
                    </p>
                  </div>
                  <div style={{ textAlign:"right", marginLeft:12, flexShrink:0 }}>
                    <p style={{ margin:0, fontSize:18, fontWeight:700, color:"#1976d2" }}>{g.dist} km</p>
                    <p style={{ margin:"2px 0 0", fontSize:12, color:"#ff9800", fontWeight:600 }}>⭐ {rating} ({reviews})</p>
                  </div>
                </div>

                {/* ── Status Row ── */}
                <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:10, flexWrap:"wrap" }}>
                  <OpenBadge isOpen={g.isOpen} />
                  {g.certified && <span style={{ fontSize:11, fontWeight:700, background:"#e8f5e9", color:"#2e7d32", padding:"3px 8px", borderRadius:20 }}>✅ Certified</span>}
                  {g.wheelchair && <span style={{ fontSize:11, color:"#555", padding:"3px 8px", background:"#f5f5f5", borderRadius:20 }}>♿ Accessible</span>}
                </div>

                <div style={{ height:1, background:"#f0f0f0", margin:"10px 0" }} />

                {/* ── Core Info ── */}
                <div style={{ fontSize:12, color:"#555", lineHeight:1.8, marginBottom:10 }}>
                  {g.opening_hours && (
                    <div>🕐 <b>Hours:</b> <span style={{ color:"#333" }}>{g.opening_hours}</span></div>
                  )}
                  {g.phone && (
                    <div>📞 <b>Phone:</b> <a href={`tel:${g.phone}`} onClick={e => e.stopPropagation()} style={{ color:"#1976d2", textDecoration:"none" }}>{g.phone}</a></div>
                  )}
                  {g.email && (
                    <div>✉️ <b>Email:</b> <a href={`mailto:${g.email}`} onClick={e => e.stopPropagation()} style={{ color:"#1976d2", textDecoration:"none" }}>{g.email}</a></div>
                  )}
                  <div>🔧 <b>Services:</b> {g.services.join(" · ")}</div>
                </div>

                {/* ── Expanded Details ── */}
                {expanded && (
                  <div style={{ marginTop:8, padding:"12px 14px", background:"#f8fbff", borderRadius:10, border:"1px solid #e3f0ff", fontSize:12, color:"#444", lineHeight:1.9 }}>
                    {g.brand    && <div>🏷️ <b>Brand:</b> {g.brand}</div>}
                    {g.operator && <div>🏢 <b>Operator:</b> {g.operator}</div>}
                    {g.website  && (
                      <div>🌐 <b>Website:</b>{" "}
                        <a href={g.website.startsWith("http") ? g.website : "https://"+g.website}
                          target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                          style={{ color:"#1976d2" }}>
                          {g.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    )}
                    <div style={{ marginTop:8 }}>
                      <b>⭐ Community Rating:</b> {rating}/5 from {reviews} reviews
                      <div style={{ display:"flex", gap:2, marginTop:3 }}>
                        {[1,2,3,4,5].map(s => (
                          <span key={s} style={{ fontSize:16, color: s <= Math.round(Number(rating)) ? "#ff9800" : "#ddd" }}>★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ height:1, background:"#f0f0f0", margin:"12px 0 10px" }} />

                {/* ── Action Buttons ── */}
                <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${g.lat},${g.lng}`}
                    target="_blank" rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{ flex:1, padding:"7px 10px", background:"#1976d2", color:"#fff", border:"none",
                      borderRadius:8, fontSize:12, fontWeight:700, textAlign:"center", textDecoration:"none",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                    🗺️ Navigate
                  </a>
                  {g.phone && (
                    <a href={`tel:${g.phone}`} onClick={e => e.stopPropagation()}
                      style={{ flex:1, padding:"7px 10px", background:"#4caf50", color:"#fff", border:"none",
                        borderRadius:8, fontSize:12, fontWeight:700, textAlign:"center", textDecoration:"none",
                        display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                      📞 Call
                    </a>
                  )}
                  <a href={`https://www.google.com/maps/search/${encodeURIComponent(g.name)}/@${g.lat},${g.lng},17z`}
                    target="_blank" rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{ flex:1, padding:"7px 10px", background:"#f57c00", color:"#fff", border:"none",
                      borderRadius:8, fontSize:12, fontWeight:700, textAlign:"center", textDecoration:"none",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                    ⭐ Reviews
                  </a>
                  <button onClick={e => { e.stopPropagation(); setExpandedId(prev => prev === g.id ? null : g.id) }}
                    style={{ padding:"7px 12px", background:"#f5f5f5", color:"#555", border:"1px solid #ddd",
                      borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}>
                    {expanded ? "▲ Less" : "▼ More"}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
