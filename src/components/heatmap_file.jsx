import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle } from 'react-leaflet';

function DiseaseMap() {
  const [hotspots, setHotspots] = useState([]);

  useEffect(() => {
    // 1. Fetch data from your Flask API
    fetch('http://127.0.0.1:5000/api/heatmap-data') 
      .then(response => response.json())
      .then(data => setHotspots(data)) // 2. Save it in 'hotspots'
      .catch(err => console.error("Could not fetch map data:", err));
  }, []);

  return (
    <MapContainer center={[18.5204, 73.8567]} zoom={10} style={{ height: "400px" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {/* 3. Loop through the actual data and draw circles */}
      {hotspots.map((spot, index) => (
        <Circle 
          key={index}
          center={[spot.lat, spot.lng]}
          radius={spot.intensity * 2000} // Bigger circle = more cases
          pathOptions={{ color: 'red', fillColor: 'red' }}
        />
      ))}
    </MapContainer>
  );
}
// Add this at the very end of heatmap_file.jsx
export default DiseaseMap;