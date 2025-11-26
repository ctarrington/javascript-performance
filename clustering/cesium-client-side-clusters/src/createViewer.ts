import {Viewer} from 'cesium';
import * as Cesium from 'cesium';

import {ACCESS_TOKEN} from './dontcheckin';

// Your access token can be found at: https://cesium.com/ion/tokens.
// In this project, we're using a token stored in a separate file that is not checked in.
Cesium.Ion.defaultAccessToken = ACCESS_TOKEN;

const options = {
    homeButton: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    navigationHelpButton: false,
    animation: false,
    infoBox: false,
    geocoder: false,
    scene3DOnly: true,
};

export const createViewer = (containerId: string) => {
    return new Viewer(containerId, options);

};