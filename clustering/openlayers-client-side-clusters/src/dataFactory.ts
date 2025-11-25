export type LatLonArray = [number, number][];

export function createSymetricData(count: number, perCellCount: number, minLat: number, maxLat: number, minLon: number, maxLon: number): LatLonArray {
    const deltaLat = (maxLat - minLat);
    const deltaLon = (maxLon - minLon);
    const cells = count / perCellCount;
    const latStep = deltaLat / Math.sqrt(cells);
    const lonStep = deltaLon / Math.sqrt(cells);

    const data: [number, number][] = [];
    for (let lat = minLat; lat < maxLat; lat += latStep) {
        for (let lon = minLon; lon < maxLon; lon += lonStep) {
            for (let i = 0; i < perCellCount; i++) {
                const jitteredLat = lat + (Math.random() - 0.5) * latStep * 1.0;
                const jitteredLon = lon + (Math.random() - 0.5) * lonStep * 1.0;
                data.push([jitteredLat, jitteredLon]);
            }
        }
    }

    return data;
}