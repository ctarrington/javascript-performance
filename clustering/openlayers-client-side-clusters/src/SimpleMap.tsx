import {useEffect, useRef, useState} from "react";

import {GeoJSON} from "ol/format";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import {OSM} from "ol/source";
import CircleStyle from "ol/style/Circle";
import {Text, Stroke, Style} from "ol/style";
import {fromLonLat, toLonLat} from "ol/proj";
import type {PointFeature} from "supercluster";
import Select from 'ol/interaction/Select';
import {click} from 'ol/events/condition';

const worker = new Worker(new URL("./getClustersWorker.ts", import.meta.url), {
    type: "module",
});


const styleFunction = function (feature) {
    const radius = feature.get('point_count_abbreviated') ? 20 : 5;
    return new Style({
        image: new CircleStyle({
            radius: radius,
            fill: undefined,
            stroke: new Stroke({color: 'red', width: 1})
        }),
        text: new Text({
            text: feature.get('point_count_abbreviated') ?? '',
        }),
    });
};

const extractBoundsAndZoom = (view: View) => {
    const currentResolution = view.getResolution();
    if (currentResolution === undefined) {
        return undefined;
    }

    const superClusterZoom = Math.floor(view.getZoomForResolution(currentResolution) as number);
    const bounds = view.getViewStateAndExtent().extent;
    const convertedSW = toLonLat([bounds[0], bounds[1]]);
    const convertedNE = toLonLat([bounds[2], bounds[3]]);

    return {
        bbox: [
            convertedSW[0],
            convertedSW[1],
            convertedNE[0],
            convertedNE[1],
        ],
        zoom: superClusterZoom,
    };
}

export default function SimpleMap() {
    const [tick, setTick] = useState(0);
    const map = useRef<Map>(undefined);
    const lastRefresh = useRef(0);
    const clusterVectorLayer = useRef<VectorLayer<VectorSource>>(undefined);

    useEffect(() => {
        worker.onmessage = (evt) => {
            const {content, message} = evt.data;
            if (content.expansionZoom) {
                map.current?.getView().setCenter(fromLonLat(content.center));
                map.current?.getView().setZoom(content.expansionZoom);
            } else {
                if (clusterVectorLayer.current) {
                    map.current?.removeLayer(clusterVectorLayer.current);
                    clusterVectorLayer.current = undefined;
                }

                const features = content.map((feature: PointFeature<GeoJSON>) => {
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

                const clusterSelect = new Select({
                    layers: [clusterVectorLayer.current],
                    condition: click,
                });

                map.current?.addInteraction(clusterSelect);

                clusterSelect.on('select', (e) => {
                    const selectedFeatures = e.target.getFeatures();
                    if (selectedFeatures.getLength() > 0) {
                        const feature = selectedFeatures.item(0);
                        const clusterId = feature.get('cluster_id');
                        const center = toLonLat(feature.getGeometry().getCoordinates());
                        if (clusterId !== undefined) {
                            worker.postMessage({clusterId, center});
                        }
                    }
                });

                if (message === "refreshed") {
                    lastRefresh.current = Date.now();
                }
            }
        }
    }, []);

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

        map.current.on('moveend', () => {
            if (map.current === undefined) {
                return;
            }

            const {bbox, zoom} = extractBoundsAndZoom(map.current.getView()) ?? {};
            if (bbox === undefined || zoom === undefined) {
                return;
            }

            worker.postMessage({
                command: "update",
                bbox,
                zoom,
            });
        })

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

        const {bbox, zoom} = extractBoundsAndZoom(map.current.getView()) ?? {};
        if (bbox === undefined || zoom === undefined) {
            return;
        }

        worker.postMessage({
            command: "refreshClusters",
            bbox,
            zoom,
        });
    }, [tick]);

    return (
        <div className="SimpleMap">
            <div id="map"></div>
        </div>
    )
}