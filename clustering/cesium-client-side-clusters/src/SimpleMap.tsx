import {createViewer} from "./createViewer.ts";
import {useEffect, useRef, useState} from "react";
import {GeoJsonDataSource, Viewer, Math as CesiumMath, Property} from "cesium";

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

            viewerRef.current.camera.moveEnd.addEventListener(() => {
                if (viewerRef.current === null) {
                    return;
                }

                const {bbox, zoom} = calculateBoundsAndZoom(viewerRef.current);
                worker.postMessage({
                    command: "moved",
                    bbox,
                    zoom,
                });
            });

            worker.onmessage = (event: MessageEvent<any>) => {
                if (event.data.message === "refreshed" || event.data.message === "moved") {
                    lastRefresh.current = Date.now();
                    const features = event.data.content;
                    const geoJson = {
                        type: "FeatureCollection",
                        features,
                    };
                    geoJsonDataSourceRef.current?.load(geoJson);

                    const entities = geoJsonDataSourceRef.current?.entities.values;
                    entities?.forEach((entity) => {
                        if (entity.billboard) {
                            const svgString = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="red"/></svg>';
                            const svgDataUri = 'data:image/svg+xml;base64,' + btoa(svgString);
                            entity.billboard.image = svgDataUri;
                            entity.billboard.width = 24;
                            entity.billboard.height = 24;

                        }
                    });
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


        const {bbox, zoom} = calculateBoundsAndZoom(viewerRef.current);
        worker.postMessage({
            command: "refreshClusters",
            bbox,
            zoom,
        });
    }, [tick]);

    return (
        <div className="SimpleMap" ref={mapRef}></div>
    )
}

const widthToZoom = [
    [5, 8],
    [10, 7],
    [20, 6],
    [40, 5],
    [50, 4],
    [60, 3],
    [80, 2],
    [180, 1],
    [360, 0],
];

function findZoom(currentWidth: number) {
    for (let index = 0; index < widthToZoom.length; index++) {
        const [width, zoom] = widthToZoom[index];
        if (currentWidth < width) {
            return zoom;
        }
    }

    return 0;
}

function calculateBoundsAndZoom(viewer: Viewer) {

    const bounds = viewer.camera.computeViewRectangle();
    const bbox = bounds ? [
        CesiumMath.toDegrees(bounds.west),
        CesiumMath.toDegrees(bounds.south),
        CesiumMath.toDegrees(bounds.east),
        CesiumMath.toDegrees(bounds.north),
    ] : [-179.9, -89.9, 179.9, 89.9];

    const widthInDegrees = Math.abs(bbox[2] - bbox[0]);
    const zoom = findZoom(widthInDegrees);

    return {bbox, zoom};
}