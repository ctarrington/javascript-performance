import {useEffect, useRef, useState} from "react";

import {GeoJSON} from "ol/format";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import {OSM} from "ol/source";
import CircleStyle from "ol/style/Circle";
import {Stroke, Style} from "ol/style";
import {fromLonLat} from "ol/proj";

const worker = new Worker(new URL("./getClustersWorker.ts", import.meta.url), {
    type: "module",
});


const styleFunction = function () {
    return new Style({
        image: new CircleStyle({
            radius: 5,
            fill: undefined,
            stroke: new Stroke({color: 'red', width: 1})
        })
    });
};

export default function SimpleMap() {
    const [tick, setTick] = useState(0);
    const map = useRef<Map>(undefined);
    const lastRefresh = useRef(0);
    const clusterVectorLayer = useRef<VectorLayer<VectorSource>>(undefined);

    useEffect(() => {
            worker.onmessage = (evt) => {
                const {content, message} = evt.data;
                if (content.expansionZoom) {
                    //map.current?.flyTo(content.center, content.expansionZoom);
                } else {
                    if (clusterVectorLayer.current) {
                        map.current?.removeLayer(clusterVectorLayer.current);
                        clusterVectorLayer.current = undefined;
                    }

                    const features = content.map((feature) => {
                        const convertedFeature = {...feature};
                        convertedFeature.geometry.coordinates = fromLonLat(feature.geometry.coordinates);
                        return convertedFeature;
                    })

                    const geoJsonObject = {
                        type: "FeatureCollection",
                        crs: {type: "name", properties: {name: "EPSG:3857"}},
                        features,
                    };

                    const vectorSource = new VectorSource({
                        features: new GeoJSON().readFeatures(geoJsonObject),
                    });

                    clusterVectorLayer.current = new VectorLayer({
                        source: vectorSource,
                        style: styleFunction,
                    });

                    map.current?.addLayer(clusterVectorLayer.current);

                }

                if (message === "refreshed") {
                    lastRefresh.current = Date.now();
                }
            }
            ;
        }, []
    )
    ;

    useEffect(() => {
        map.current = new Map({
            target: 'map',
            layers: [
                new TileLayer({source: new OSM(),})
            ],
            view: new View({
                center: [0, 0],
                zoom: 2,
            })
        });

        return () => {
            map.current?.setTarget(undefined);
            map.current?.getLayers().clear();
            map.current?.getOverlays().clear();
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
        if (map.current === undefined) {
            return;
        }

        if (Date.now() - lastRefresh.current < 10_000) {
            return;
        }

        const bounds = map.current.getView().getViewStateAndExtent().extent;
        worker.postMessage({
            command: "refreshClusters",
            bbox: [
                bounds[0],
                bounds[1],
                bounds[2],
                bounds[3],
            ],
            zoom: map.current.getView().getZoom(),
        });
    }, [tick]);

    return (
        <div className="SimpleMap">
            <div id="map"></div>
        </div>
    )
}