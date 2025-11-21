import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import L, { GeoJSON, Map } from "leaflet";

const fetchData = async () => {
  const result = await fetch(
    "https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson",
  );
  return await result.json();
};

const pointToLayer = (feature: any, latlng: L.LatLng) => {
  const options = {
    radius: feature.properties.felt ? 3 : 1,
    fillColor: feature.properties.tsunami ? "blue" : "orange",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8,
  };
  return L.circleMarker(latlng, options);
};

export default function SimpleMap() {
  const [data, setData] = useState(null);
  const map = useRef<Map>(undefined);
  const dataLayer = useRef<GeoJSON>(undefined);

  console.log("data", data);

  useEffect(() => {
    fetchData().then((data) => setData(data));
  }, []);

  useEffect(() => {
    map.current = L.map("map").setView([20.87, 10.475], 8);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (data && map.current) {
      dataLayer.current = L.geoJSON(data, { pointToLayer }).addTo(map.current);
    }

    return () => {
      if (dataLayer.current) {
        dataLayer.current.remove();
      }
    };
  }, [data]);

  return <div id="map" style={{ height: "100vh" }}></div>;
}
