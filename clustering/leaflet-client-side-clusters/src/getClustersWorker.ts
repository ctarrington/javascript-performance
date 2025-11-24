import { createSymetricData, type LatLonArray } from "./dataFactory.ts";
import Supercluster from "supercluster";
import type { AnyProps, PointFeature } from "supercluster";

const latLonArray: LatLonArray = createSymetricData(
  500_000,
  10,
  20,
  60,
  -150,
  -70,
);

let superCluster: Supercluster;
const startTime = performance.now();

self.onmessage = (event: MessageEvent<any>) => {
  const deltaSeconds = (performance.now() - startTime) / 1000;
  if (event.data.command === "refreshClusters") {
    const features: PointFeature<AnyProps>[] = latLonArray.map((latLon) => {
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [latLon[1] + deltaSeconds * 0.1, latLon[0]],
        },
        properties: {},
      };
    });
    superCluster = new Supercluster({
      log: false,
      radius: 60,
      extent: 256,
      maxZoom: 17,
    }).load(features);

    self.postMessage({
      message: "refreshed",
      content: superCluster.getClusters(event.data.bbox, event.data.zoom),
    });
    console.log("QQQ gcw refreshClusters");
  } else if (event.data.clusterId) {
    postMessage({
      message: "expansion",
      content: {
        expansionZoom: superCluster.getClusterExpansionZoom(
          event.data.clusterId,
        ),
        center: event.data.center,
      },
    });
  } else {
    self.postMessage({
      message: "moved",
      content: superCluster.getClusters(event.data.bbox, event.data.zoom),
    });
    console.log("QQQ gcw updateClusters");
  }
};
