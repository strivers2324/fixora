import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const blueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface JobLocationMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  spLatitude?: number;
  spLongitude?: number;
  isInfoHidden?: boolean;
}

export default function JobLocationMap({
  latitude,
  longitude,
  address,
  spLatitude,
  spLongitude,
  isInfoHidden,
}: JobLocationMapProps) {
  let finalSpLat = spLatitude;
  let finalSpLng = spLongitude;

  if (spLatitude && spLongitude && spLatitude === latitude && spLongitude === longitude) {
    finalSpLat = spLatitude + 0.00009;
    finalSpLng = spLongitude + 0.00009;
  }

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer center={[latitude, longitude]} zoom={15} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[latitude, longitude]} icon={blueIcon}>
          <Popup>
            <b>Customer Location</b>
            <br />
            {isInfoHidden ? "Exact address is hidden for 30 minutes" : address}
          </Popup>
        </Marker>

        {finalSpLat && finalSpLng && (
          <Marker position={[finalSpLat, finalSpLng]} icon={redIcon}>
            <Popup>
              <b>Your Location</b>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
