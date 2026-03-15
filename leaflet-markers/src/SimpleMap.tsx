import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import L, { GeoJSON, LatLng, Map } from "leaflet";
import "leaflet.markercluster";
import type { Feature } from "geojson";

import { createSymetricData, type LatLonArray } from "./dataFactory.ts";

const latLonArray: LatLonArray = createSymetricData(
  100,
  10,
  -70,
  70,
  -120,
  120,
);

const features = latLonArray.map((latLon) => {
  const lon = latLon[1];
  const adjustedLon = lon > 180 ? -180 : lon;
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [adjustedLon, latLon[0]],
    },
    properties: {},
  };
});

export default function SimpleMap() {
  const map = useRef<Map>(undefined);
  const markers = useRef<GeoJSON>(undefined);

  useEffect(() => {
    map.current = L.map("map").setView([20.87, 10.475], 2);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map.current);

    markers.current = L.geoJSON(null, {
      pointToLayer: createClusterIcon,
    }).addTo(map.current);

    markers.current.addData(features);
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  return <div id="map" style={{ height: "100vh" }}></div>;
}

function createClusterIcon(feature: Feature, latlng: LatLng) {
  const icon = L.divIcon({
    html: `<div><span>hi</div>`,
    className: `marker-cluster`,
    iconSize: L.point(40, 40),
  });

  const marker = L.marker(latlng, { icon });
  marker.on('mouseout', () => console.log('mouse out'));
  return marker;
}
