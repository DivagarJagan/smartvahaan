import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const MapView = () => {
  const position = [13.0827, 80.2707]; // Chennai (example)

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '12px' }}>
      <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
        
        {/* Free OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marker */}
        <Marker position={position}>
          <Popup>
            SmartVahaan: Vehicle Location
          </Popup>
        </Marker>

      </MapContainer>
    </div>
  );
};

export default MapView;