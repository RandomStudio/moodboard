import { useEffect, useRef, useState } from 'react'
import './App.css'

export const ASSET_URL = 'https://random-moodboard.s3.eu-west-3.amazonaws.com';

interface CustomHTMLVideoElement extends HTMLVideoElement {
  activeFrame: number;
}

const supportsVideoCallback = 'requestVideoFrameCallback' in HTMLVideoElement.prototype;

let seenFrames = localStorage.getItem('seenFrames') ? JSON.parse(localStorage.getItem('seenFrames')!) : [];

function App() {
  const videoRef = useRef<CustomHTMLVideoElement>(null);

  const stopSignalRef = useRef(false);
  const [activeFrame, setActiveFrame] = useState<number>(0);
  const [frames, setFrames] = useState<string[]>([]);
  const handleFrame = () => {
    if (!videoRef.current || stopSignalRef.current) {
      window.setTimeout(() => {
        stopSignalRef.current = false;
      }, 50)
      return;
    }
    videoRef.current?.requestVideoFrameCallback(handleFrame)
    const nextFrame = videoRef.current.activeFrame + 1;
    videoRef.current.activeFrame = nextFrame;
    if (seenFrames.includes(nextFrame)) {
      handleFrame();
      return;
    }
    videoRef.current.currentTime = nextFrame / 29.97;
    setActiveFrame(nextFrame);
  }

  const handleStart = () => {
    if (!videoRef.current) {
      return;
    }
    videoRef.current.activeFrame = videoRef.current.activeFrame ?? 0;
    stopSignalRef.current = false;
    handleFrame()
  }

  const hideFrame = (frame: number) => {
    seenFrames = [...seenFrames, frame];
    localStorage.setItem('seenFrames', JSON.stringify(seenFrames));
  }

const saveFrame = async (frameIndex: number) => {
  if (!videoRef.current || seenFrames.includes(frameIndex)) {
    return;
  }
  const a = document.createElement('a');
  a.style.display = 'none';

  const img = new Image()
  img.crossOrigin = 'anonymous';
  img.src = `${ASSET_URL}/${frames[frameIndex]}`;
  img.decoding = 'async';
  await img.decode();

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }
  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
  const dataURL = canvas.toDataURL('image/png');

  const filename = frames[frameIndex];
  a.href = dataURL;
  a.download = filename;
  a.click();
  hideFrame(frameIndex);
}

const handleStop = () => {
  stopSignalRef.current = true;
  saveFrame(activeFrame)
}

useEffect(() => {
  fetch(`${ASSET_URL}/files.log`).then((res) => res.text()).then((data) => {
    const lines = data.replaceAll('file ', '').replaceAll("'", '').split('\n');
    setFrames(lines)
  });
}, []);

const date = new Date();
const dateAsString = `${date.getFullYear()}${date.getMonth()}${date.getDate()}`;

  return (
    <div className="App">
      {supportsVideoCallback ? (
        <video crossOrigin='anonymous' src={`${ASSET_URL}/preview.mp4?${dateAsString}`} ref={videoRef} onMouseLeave={handleStop} onMouseDown={handleStart} onMouseUp={handleStop} />
      ): <p><a href="https://caniuse.com/mdn-api_htmlvideoelement_requestvideoframecallback" target="_blank">Video callback not supported in Firefox. You hate to see it.</a></p>}
    </div>
  )
}

export default App
