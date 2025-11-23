import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import L, { GeoJSON, Map } from "leaflet";
import "leaflet.markercluster";

export default function SimpleMap() {
  const [tick, setTick] = useState(0);
  const worker = useRef(
    new Worker(new URL("./getClustersWorker.ts", import.meta.url), {
      type: "module",
    }),
  );
  const map = useRef<Map>(undefined);
  const markers = useRef<GeoJSON>(undefined);
  const clusterLayer = useRef<L.MarkerClusterGroup>(undefined);

  useEffect(() => {
    worker.current.onmessage = (evt) => {
      markers.current?.clearLayers();
      markers.current?.addData(evt.data);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(Date.now());
    }, 10_000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    map.current = L.map("map").setView([20.87, 10.475], 2);
    markers.current = L.geoJSON(null, {
      pointToLayer: createClusterIcon,
    }).addTo(map.current);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map.current);

    map.current.on("moveend", () => {
      if (map.current === undefined) {
        return;
      }

      const bounds = map.current.getBounds();
      worker.current.postMessage({
        command: "update",
        bbox: [
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth(),
        ],
        zoom: map.current.getZoom(),
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (map.current === undefined) {
      return;
    }
    const bounds = map.current.getBounds();
    worker.current.postMessage({
      command: "refreshClusters",
      bbox: [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ],
      zoom: map.current.getZoom(),
    });

    return () => {
      if (clusterLayer.current) {
        clusterLayer.current.remove();
      }
    };
  }, [tick]);

  return <div id="map" style={{ height: "100vh" }}></div>;
}

function createClusterIcon(feature, latlng) {
  if (!feature.properties.cluster) return L.marker(latlng);

  const count = feature.properties.point_count;
  const size = count < 100 ? "small" : count < 1000 ? "medium" : "large";
  const icon = L.divIcon({
    html: `<div><span>${feature.properties.point_count_abbreviated}</span></div>`,
    className: `marker-cluster marker-cluster-${size}`,
    iconSize: L.point(40, 40),
  });

  return L.marker(latlng, { icon });
}
