import {useEffect, useRef} from "react";
import Hls from "hls.js";

interface Props {
    source: string;
}

export function HlsPlayer({source}: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const hls = new Hls({
            "debug": true
        });

        if (videoRef.current && Hls.isSupported()) {
            hls.log = true;
            hls.loadSource(source);
            hls.attachMedia(videoRef.current)
            hls.on(Hls.Events.ERROR, (err) => {
                console.log(err)
           });
            hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                videoRef.current?.play();
            });
        } else {
            console.log('HLS not supported');
        }
    }, [videoRef]);
    return (
        <div>
        <h1>HLS Player Component</h1>
            <video ref={videoRef} controls={true} />
        </div>
    );
}