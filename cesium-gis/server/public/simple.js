Cesium.Ion.defaultAccessToken = cesiumToken;
const viewer = new Cesium.Viewer('cesiumContainer');

const svgArrowLiteral = `
<svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
    <path d="M 5 5 L 25 5 L 25 25 L 5 25 L 5 5" stroke="white" stroke-width="2" fill="white"/>
</svg>
`;

const shapeURL = 'data:image/svg+xml,'+encodeURIComponent(svgArrowLiteral);

const idToBillboardBindingMap = {};

const createBillboard = (track) => {
    const context = {
        cartesianPosition: Cesium.Cartesian3.fromDegrees(track.lon, track.lat, 0),
        id: track.id
    };

    const billboard = new Cesium.BillboardGraphics({
        alignedAxis: Cesium.Cartesian3.UNIT_Z,
        pixelOffset : new Cesium.Cartesian2(0, 0),
        image : shapeURL,
        color: Cesium.Color.RED,
        width: 5,
        height: 5,
        eyeOffset: new Cesium.Cartesian3(0, 0, 0),
    });

    context.entity = new Cesium.Entity({
        position: new Cesium.CallbackProperty(()=>{
            return context.cartesianPosition;
            },
            false
        ),
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

const trackCountSpan = document.getElementById('trackCountSpan');

const socket = io.connect('http://localhost:3001');
socket.on('tracks', function (tracks) {
    trackCountSpan.innerText = tracks.length;
    tracks.forEach(track => {
        if (idToBillboardBindingMap[track.id]) {
            idToBillboardBindingMap[track.id].update(track);
        } else {
            createBillboard(track);
        }
    });
});