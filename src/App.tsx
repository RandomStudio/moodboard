import { useEffect, useRef, useState } from 'react'
import './App.css'

interface CustomHTMLVideoElement extends HTMLVideoElement {
  activeFrame: number;
}

function App() {
const videoRef = useRef<CustomHTMLVideoElement>(null);

const stopSignalRef = useRef(false);
const [activeFrame, setActiveFrame] = useState<number>(0);
const [savedFrames, setSavedFrames] = useState<number[]>([]);
const handleFrame = () => {
  if (!videoRef.current || stopSignalRef.current) {
    stopSignalRef.current = false;
    return;
  }
  videoRef.current?.requestVideoFrameCallback(handleFrame)
  const nextFrame = videoRef.current.activeFrame + 1;
  videoRef.current.activeFrame = nextFrame;
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

const handleStop = () => {
  stopSignalRef.current = true
  setSavedFrames([...savedFrames, activeFrame]);
}

useEffect(() => {
  if (savedFrames.length === 0) {
    return;
  }
  const a = document.createElement('a');
  a.style.display = 'none';
  const filename = `frame${savedFrames.at(-1)}.png`;
  a.href = `/output/${filename}`;
  console.log(a.href)
  a.download = filename;
  document.body.appendChild(a);
  a.click();
}, [savedFrames]);

  return (
    <div className="App">
      <video src="/output/out.mp4" ref={videoRef} onMouseDown={handleStart} onMouseUp={handleStop} />
    </div>
  )
}

export default App
