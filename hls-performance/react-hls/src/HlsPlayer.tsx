import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface Props {
  source: string;
}

export function HlsPlayer({ source }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [width, setWidth] = useState(300);

  useEffect(() => {
    const hls = new Hls({
      debug: true,
    });

    if (videoRef.current && Hls.isSupported()) {
      hls.loadSource(source);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.ERROR, (err) => {
        console.log(err);
      });
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        videoRef.current?.play();
      });
    } else {
      console.log("HLS not supported");
    }
  }, [videoRef]);

  const bumpWidth = useCallback(() => {
    const newWidth = width < 800 ? width + 100 : 300;
    setWidth(newWidth);
  }, [setWidth, width]);

  const bumpSymbol = width < 800 ? "+" : "↺";
  return (
    <div className="player small">
      <video width={width} ref={videoRef} controls={true} />
      <button onClick={bumpWidth}>{bumpSymbol}</button>
    </div>
  );
}
