import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import L, { GeoJSON, Map } from "leaflet";
import "leaflet.markercluster";

const worker = new Worker(new URL("./getClustersWorker.ts", import.meta.url), {
  type: "module",
});

export default function SimpleMap() {
  const [tick, setTick] = useState(0);
  const map = useRef<Map>(undefined);
  const markers = useRef<GeoJSON>(undefined);
  const lastRefresh = useRef(0);

  useEffect(() => {
    worker.onmessage = (evt) => {
      const { content, message } = evt.data;
      if (content.expansionZoom) {
        map.current?.flyTo(content.center, content.expansionZoom);
      } else {
        markers.current?.clearLayers();
        markers.current?.addData(content);
      }

      if (message === "refreshed") {
        lastRefresh.current = Date.now();
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(Date.now());
    }, 1_000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    map.current = L.map("map").setView([20.87, 10.475], 2);
    markers.current = L.geoJSON(null, {
      pointToLayer: createClusterIcon,
    }).addTo(map.current);

    markers.current.on("click", (e) => {
      if (e.layer.feature.properties.cluster_id) {
        worker.postMessage({
          clusterId: e.layer.feature.properties.cluster_id,
          center: e.latlng,
        });
      }
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map.current);

    map.current.on("moveend", () => {
      if (map.current === undefined) {
        return;
      }

      const bounds = map.current.getBounds();
      worker.postMessage({
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

    if (Date.now() - lastRefresh.current < 10_000) {
      return;
    }

    const bounds = map.current.getBounds();
    worker.postMessage({
      command: "refreshClusters",
      bbox: [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ],
      zoom: map.current.getZoom(),
    });
  }, [tick]);

  return <div id="map" style={{ height: "100vh" }}></div>;
}

function createClusterIcon(feature, latlng: [number, number]) {
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
