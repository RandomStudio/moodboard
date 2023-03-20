import { useEffect, useRef, useState } from 'react'
import './App.css'

interface CustomHTMLVideoElement extends HTMLVideoElement {
  activeFrame: number;
}

const supportsVideoCallback = 'requestVideoFrameCallback' in HTMLVideoElement.prototype;

let seenFrames = localStorage.getItem('seenFrames') ? JSON.parse(localStorage.getItem('seenFrames')!) : [];

function App() {
const videoRef = useRef<CustomHTMLVideoElement>(null);

const stopSignalRef = useRef(false);
const [activeFrame, setActiveFrame] = useState<number>(0);
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
  videoRef.current.currentTime = nextFrame / 60;
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

const saveFrame = (frame: number) => {
  const a = document.createElement('a');
  a.style.display = 'none';
  const filename = `frame${frame}.png`;
  a.href = `/output/${filename}`;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
}

const hideFrame = (frame: number) => {
  seenFrames = [...seenFrames, frame];
  localStorage.setItem('seenFrames', JSON.stringify(seenFrames));
}

const handleStop = () => {
  stopSignalRef.current = true;
  saveFrame(activeFrame);
  hideFrame(activeFrame);
}

  return (
    <div className="App">
      {supportsVideoCallback ? (
        <video src="https://random-moodboard.s3.eu-west-3.amazonaws.com/output/preview.mp4" ref={videoRef} onMouseLeave={handleStop} onMouseDown={handleStart} onMouseUp={handleStop} />
      ): <p><a href="https://caniuse.com/mdn-api_htmlvideoelement_requestvideoframecallback" target="_blank">Video callback not supported in Firefox. You hate to see it.</a></p>}
    </div>
  )
}

export default App
