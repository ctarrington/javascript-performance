import {createViewer} from "./createViewer.ts";
import {useEffect, useRef} from "react";
import {Color, GeoJsonDataSource, Viewer} from "cesium";
import {asGeoJson, createSymetricData} from "./dataFactory.ts";

export default function SimpleMap() {
    const mapRef = useRef(null);
    const viewerRef = useRef<Viewer>(null);

    useEffect(() => {
        if (mapRef.current) {
            viewerRef.current = createViewer(mapRef.current);
            const geoJson = asGeoJson(createSymetricData(400, 12, 20, 50, -80, 0));
            GeoJsonDataSource.load(geoJson, {
                strokeWidth: 5,
                markerSymbol: 'circle',
            }).then(function (dataSource) {
                dataSource.clustering.enabled = true;
                viewerRef.current?.dataSources.add(dataSource);
            }).catch(function (error) {
                console.error('Error loading GeoJSON:', error);
            });
        }

        return () => {
            mapRef.current = null;
            if (viewerRef.current) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }
        }
    }, []);

    return (
        <div className="SimpleMap" ref={mapRef}></div>
    )
}
