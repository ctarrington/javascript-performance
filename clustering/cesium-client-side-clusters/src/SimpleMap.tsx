import {createViewer} from "./createViewer.ts";
import {useEffect, useRef, useState} from "react";
import {GeoJsonDataSource, Viewer, Math as CesiumMath} from "cesium";

const worker = new Worker(new URL("./getClustersWorker.ts", import.meta.url), {type: "module"});

export default function SimpleMap() {
    const [tick, setTick] = useState(0);
    const lastRefresh = useRef(0);

    const mapRef = useRef(null);
    const viewerRef = useRef<Viewer>(null);
    const geoJsonDataSourceRef = useRef<GeoJsonDataSource>(null);

    useEffect(() => {
        if (mapRef.current) {
            viewerRef.current = createViewer(mapRef.current);
            geoJsonDataSourceRef.current = new GeoJsonDataSource("clusters");
            viewerRef.current.dataSources.add(geoJsonDataSourceRef.current);

            worker.onmessage = (event: MessageEvent<any>) => {
                if (event.data.message === "refreshed" || event.data.message === "moved") {
                    console.log("QQQ sm received clusters", event.data.content);
                    const features = event.data.content;
                    const geoJson = {
                        type: "FeatureCollection",
                        features,
                    };
                    geoJsonDataSourceRef.current?.load(geoJson);
                } else if (event.data.message === "expansion") {
                    console.log("QQQ sm received expansion zoom", event.data.content.expansionZoom);
                }
            };
        }

        return () => {
            mapRef.current = null;
            if (viewerRef.current) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }
        }
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
        if (mapRef.current === null || viewerRef.current === null) {
            return;
        }

        if (Date.now() - lastRefresh.current < 10_000) {
            return;
        }

        const bounds = viewerRef.current.camera.computeViewRectangle();
        const bbox = bounds ? [
            CesiumMath.toDegrees(bounds.west),
            CesiumMath.toDegrees(bounds.south),
            CesiumMath.toDegrees(bounds.east),
            CesiumMath.toDegrees(bounds.north),
        ] : [-179.9, -89.9, 179.9, 89.9];
        worker.postMessage({
            command: "refreshClusters",
            bbox,
            zoom: 3,
        });
    }, [tick]);

    return (
        <div className="SimpleMap" ref={mapRef}></div>
    )
}
