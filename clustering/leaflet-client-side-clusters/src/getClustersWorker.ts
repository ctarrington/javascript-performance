import { createSymetricData, type LatLonArray } from "./dataFactory.ts";
import Supercluster from "supercluster";
import * as turf from "@turf/turf";
import type { AnyProps, PointFeature } from "supercluster";
import { geometry } from "@turf/turf";

const latLonArray: LatLonArray = createSymetricData(
  1_000_000,
  10,
  -70,
  70,
  -120,
  120,
);

let superCluster: Supercluster;
const startTime = performance.now();

self.onmessage = (event: MessageEvent<any>) => {
  const deltaSeconds = (performance.now() - startTime) / 1000;
  if (event.data.command === "refreshClusters") {
    const features: PointFeature<AnyProps>[] = latLonArray.map((latLon) => {
      const lon = latLon[1] + deltaSeconds * 0.1;
      const adjustedLon = lon > 180 ? -180 : lon;
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [adjustedLon, latLon[0]],
        },
        properties: {},
      };
    });
    superCluster = new Supercluster({
      log: false,
      radius: 60,
      extent: 256,
      maxZoom: 7,
    }).load(features);

    const clusters = superCluster.getClusters(event.data.bbox, event.data.zoom);
    decorateClustersWithHulls(clusters);

    self.postMessage({
      message: "refreshed",
      content: clusters,
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
    const clusters = superCluster.getClusters(event.data.bbox, event.data.zoom);
    decorateClustersWithHulls(clusters);
    self.postMessage({
      message: "moved",
      content: clusters,
    });
    console.log("QQQ gcw updateClusters");
  }
};

function decorateClustersWithHulls(clusters) {
  clusters.forEach(
    (cluster: { id: number; properties: { hull: number[][] } }) => {
      if (!cluster.id) {
        return;
      }
      const leaves = superCluster.getLeaves(cluster.id, Infinity);
      const pointsCollection = turf.featureCollection(
        leaves.map((leaf) => turf.point(leaf.geometry.coordinates)),
      );

      const hull = turf.convex(pointsCollection);
      const hullPoints = hull?.geometry.coordinates;
      if (!hullPoints || hullPoints.length === 0) {
        return;
      }

      const latLonPoints = hullPoints[0].map((lonLatPoint) => {
        const [lon, lat] = lonLatPoint;
        return [lat, lon];
      });

      cluster.properties.hull = latLonPoints;
    },
  );
}
