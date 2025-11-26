import {createViewer} from "./createViewer.ts";
import {useEffect, useRef} from "react";
import {Viewer} from "cesium";

export default function SimpleMap() {
    const mapRef = useRef(null);
    const viewerRef = useRef<Viewer>(null);

    useEffect(() => {
        if (mapRef.current) {
            viewerRef.current = createViewer(mapRef.current);
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
