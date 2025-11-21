import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import L, { GeoJSON, Layer, Map } from "leaflet";
import {} from "leaflet.markercluster";

interface LayerMap {
  [key: string]: Layer;
}

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
  const [tick, setTick] = useState(Date.now());
  const data = useRef<any>(undefined);
  const map = useRef<Map>(undefined);
  const dataLayer = useRef<GeoJSON>(undefined);
  const clusterLayer = useRef<any>(undefined);
  const itemLayerMap = useRef<LayerMap>({});

  useEffect(() => {
    fetchData().then((rawData) => (data.current = rawData));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!data.current) {
        return;
      }

      data.current.features.forEach((feature) => {
        feature.geometry.coordinates[0] = feature.geometry.coordinates[0] + 0.1;
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
    if (data.current && map.current) {
      dataLayer.current = L.geoJSON(data.current, {
        pointToLayer,
        onEachFeature: (feature, layer) => {
          itemLayerMap.current[feature.properties.id] = layer;
        },
      }).addTo(clusterLayer.current);

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
