import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import L, { GeoJSON, Layer, Map } from "leaflet";

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
  const [data, setData] = useState(null);
  const map = useRef<Map>(undefined);
  const dataLayer = useRef<GeoJSON>(undefined);
  const itemLayerMap = useRef<LayerMap>({});

  useEffect(() => {
    fetchData().then((data) => setData(data));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!data || !dataLayer.current || dataLayer.current === undefined) {
        return;
      }
      console.log("dataLayer", dataLayer.current);
      console.log("itemLayerMap", itemLayerMap.current);
      console.log("data", data);

      data.features.forEach((feature) => {
        const { id } = feature.properties;
        console.log("feature", id);
        const updatedData = { ...feature };
        updatedData.geometry.coordinates[0] =
          updatedData.geometry.coordinates[0] + 0.5;
        const oldItemLayer = itemLayerMap.current[id];
        if (oldItemLayer) {
          dataLayer.current?.removeLayer(oldItemLayer);
          dataLayer.current?.addData(updatedData);
        }
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [data]);

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
      dataLayer.current = L.geoJSON(data, {
        pointToLayer,
        onEachFeature: (feature, layer) => {
          itemLayerMap.current[feature.properties.id] = layer;
        },
      }).addTo(map.current);
    }

    return () => {
      if (dataLayer.current) {
        dataLayer.current.remove();
      }
    };
  }, [data]);

  return <div id="map" style={{ height: "100vh" }}></div>;
}
