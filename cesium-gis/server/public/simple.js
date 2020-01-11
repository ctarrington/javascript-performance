Cesium.Ion.defaultAccessToken = cesiumToken;
const viewer = new Cesium.Viewer('cesiumContainer');

const svgArrowLiteral = `
<svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
    <path d="M 15 25 L 15 5 L 8 12 M 15 5 L 22 12" stroke="white" stroke-width="2" fill="none"/>
</svg>
`;

const arrowURL = 'data:image/svg+xml,'+encodeURIComponent(svgArrowLiteral);

const idToBillboardBindingMap = {};

const createBillboard = (track) => {
    const context = {
        cartesianPosition: Cesium.Cartesian3.fromDegrees(track.lon, track.lat, 0),
        id: track.id
    };

    const billboard = new Cesium.BillboardGraphics({
        alignedAxis: Cesium.Cartesian3.UNIT_Z,
        pixelOffset : new Cesium.Cartesian2(0, 0),
        image : arrowURL,
        color: Cesium.Color.RED,
        width: 25,
        height: 25,
        eyeOffset: new Cesium.Cartesian3(0, 0, 0),
    });

    context.entity = new Cesium.Entity({
        position: new Cesium.CallbackProperty(()=>{return context.cartesianPosition;}, false),
        billboard,
    });

    viewer.entities.add(context.entity);

    const update = (data) => {
      context.cartesianPosition = Cesium.Cartesian3.fromDegrees(data.lon, data.lat);
    };

    idToBillboardBindingMap[track.id] = {
        update,
    };
};


const socket = io.connect('http://localhost:3001');
socket.on('tracks', function (tracks) {
    console.log(tracks);
    tracks.forEach(track => {
        if (idToBillboardBindingMap[track.id]) {
            idToBillboardBindingMap[track.id].update(track);
        } else {
            createBillboard(track);
        }
    });
});