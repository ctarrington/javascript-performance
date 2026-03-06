import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import L, { GeoJSON, LatLng, Map } from "leaflet";
import "leaflet.markercluster";
import type { Feature } from "geojson";

export default function SimpleMap() {
  const map = useRef<Map>(undefined);
  const markers = useRef<GeoJSON>(undefined);

  useEffect(() => {
    map.current = L.map("map").setView([20.87, 10.475], 2);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map.current);
  }, []);

  return <div id="map" style={{ height: "100vh" }}></div>;
}

function createClusterIcon(feature: Feature, latlng: LatLng) {
  if (!feature.properties?.cluster) return L.marker(latlng);

  const count = feature.properties.point_count;
  const size = count < 100 ? "small" : count < 1000 ? "medium" : "large";
  const icon = L.divIcon({
    html: `<div><span>${feature.properties.point_count_abbreviated}</span></div>`,
    className: `marker-cluster marker-cluster-${size}`,
    iconSize: L.point(40, 40),
  });

  return L.marker(latlng, { icon });
}
