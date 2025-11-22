import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import L, {Map} from "leaflet";
import "leaflet.markercluster";

import {createSymetricData, LatLonArray} from "./dataFactory.ts";

const markerOptions = {
  radius: 5,
  fillColor: "orange",
  color: "#000",
  weight: 1,
  opacity: 1,
  fillOpacity: 0.8,
};

export default function SimpleMap() {
  const [tick, setTick] = useState(0);
  const data = useRef<LatLonArray>(createSymetricData(10000, 10, 0, 40, -170, -100));
  const map = useRef<Map>(undefined);
  const clusterLayer = useRef<any>(undefined);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!data.current) {
        return;
      }

      data.current.forEach((latLon: [number, number]) => {
        latLon[0] += 0.1;
      });

      setTick(Date.now());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    map.current = L.map("map").setView([20.87, 10.475], 2);

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
    clusterLayer.current = L.markerClusterGroup();
    if (map.current && data.current.length > 0) {
      const markers = data.current.map((latLon) => L.circleMarker(latLon, markerOptions));
      clusterLayer.current.addLayers(markers);
      map.current.addLayer(clusterLayer.current);
    }

    return () => {
      if (clusterLayer.current) {
        clusterLayer.current.remove();
      }
    };
  }, [tick]);

  return <div id="map" style={{ height: "100vh" }}></div>;
}
