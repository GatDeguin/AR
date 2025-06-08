import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Button } from "./components/ui/button.jsx";
import { loadOpenCV, detectFrets } from "./vision/fretDetection.js";
import { usePoseCalibration } from "./hooks/usePoseCalibration.js";
import { createScaleOverlay } from "./overlays/scaleOverlay.js";
import { createChordOverlay } from "./overlays/chordOverlay.js";
import { createPracticeOverlay } from "./overlays/practiceOverlay.js";
const STANDARD_TUNING=[40,45,50,55,59,64],MAJOR_PATTERN=[0,2,4,5,7,9,11],KEYS=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],CHORDS={major:[0,4,7],minor:[0,3,7]};
function noteNameToMidi(n){return 60+KEYS.indexOf(n);}
export default function App(){
  const cR=useRef(),vR=useRef(),gR=useRef(),oR=useRef();
  const [mode,setMode]=useState("scales"),[curK,setCurK]=useState("C"),[chK,setChK]=useState("C"),[chT,setChT]=useState("major"),[bpm,setBpm]=useState(60),[xrOK,setXrOK]=useState(false);
  const {poseMatrix4,calibrated,retry,error}=usePoseCalibration(vR);
  useEffect(()=>{
    if(vR.current)navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}}).then(s=>{vR.current.srcObject=s;vR.current.play();});
  },[]);
  useEffect(()=>{navigator.xr&&navigator.xr.isSessionSupported("immersive-ar").then(setXrOK);},[]);
  useEffect(()=>{
    if(!xrOK)return;
    const rd=new THREE.WebGLRenderer({canvas:cR.current,alpha:true,antialias:true});
    rd.xr.enabled=true;const s=new THREE.Scene(),cam=new THREE.PerspectiveCamera(70,window.innerWidth/window.innerHeight,0.01,20);
    s.add(new THREE.HemisphereLight(0xffffff,0xbbbbff,1));const g=new THREE.Group();s.add(g);gR.current=g;
    function drawFrets(f){while(g.children.length)g.remove(g.children[0]);const m=new THREE.LineBasicMaterial({color:0xffa500});
    f.forEach((_,i)=>g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.15,0,-.01*i),new THREE.Vector3(0.15,0,-.01*i)]),m)));
    if(oR.current)g.add(oR.current.group);}  
    rd.setAnimationLoop(()=>rd.render(s,cam));
    navigator.xr.requestSession("immersive-ar",{requiredFeatures:["hit-test"]}).then(sess=>rd.xr.setSession(sess));
    let stop=false;(async()=>{
      await loadOpenCV();const intv=setInterval(()=>{
        if(stop||!vR.current)return;try{drawFrets(detectFrets(vR.current));}catch{}
      },1500);return()=>clearInterval(intv);
    })();
    return()=>{stop=true;rd.dispose();};
  },[xrOK]);
  useEffect(()=>{
    if(calibrated&&poseMatrix4&&gR.current){
      gR.current.matrix.fromArray(poseMatrix4);gR.current.matrixAutoUpdate=false;
    }
  },[calibrated,poseMatrix4]);
  useEffect(()=>{
    if(!calibrated||!gR.current)return;
    if(oR.current){gR.current.remove(oR.current.group);oR.current.dispose&&oR.current.dispose();oR.current=null;}
    if(mode==="scales"){
      oR.current=createScaleOverlay({scene:gR.current,tuning:STANDARD_TUNING,key:noteNameToMidi(curK),scalePattern:MAJOR_PATTERN,fretCount:15});
    }else if(mode==="chords"){
      oR.current=createChordOverlay({scene:gR.current,tuning:STANDARD_TUNING,key:noteNameToMidi(chK),chordPattern:CHORDS[chT],fretCount:15});
    }else if(mode==="practice"){
      oR.current=createPracticeOverlay({scene:gR.current,bpm:bpm});
    }
  },[mode,curK,chK,chT,bpm,calibrated]);
  const ModeButton=({id,label,icon})=> 
    <Button className={`flex-1 ${mode===id?"bg-indigo-600 text-white":"bg-gray-100"}`} onClick={()=>setMode(id)}>{icon} {label}</Button>;
  if(!xrOK) return <div className="h-screen flex items-center justify-center bg-black text-white"><p>No soporta WebXR AR.</p></div>;
  return <div className="relative h-screen w-screen overflow-hidden">
    <video ref={vR} className="hidden" playsInline />
    <canvas ref={cR} className="absolute inset-0 w-full h-full" />
    {!calibrated && <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur rounded-xl px-4 py-2 text-sm text-white">
      {error ? <>Error calibrando: {error} <button onClick={retry} className="underline ml-2">Reintentar</button></> : "Calibrando… enfoca todo el mástil"}
    </div>}
    {mode==="scales"&&calibrated&&<select value={curK} onChange={e=>setCurK(e.target.value)} className="absolute top-4 right-4 bg-white/80 rounded-lg px-2 py-1 text-sm">
      {KEYS.map(k=><option key={k} value={k}>{k}</option>)}
    </select>}
    {mode==="chords"&&calibrated&&<div className="absolute top-4 right-4 flex gap-2 bg-white/80 rounded-lg px-2 py-1 text-sm">
      <select value={chK} onChange={e=>setChK(e.target.value)} className="bg-transparent">
        {KEYS.map(k=><option key={k} value={k}>{k}</option>)}
      </select>
      <select value={chT} onChange={e=>setChT(e.target.value)} className="bg-transparent">
        <option value="major">Maj</option>
        <option value="minor">Min</option>
      </select>
    </div>}
    {mode==="practice"&&calibrated&&<div className="absolute top-4 right-4 flex items-center gap-2 bg-white/80 rounded-lg px-2 py-1 text-sm">
      <label htmlFor="bpm">BPM</label>
      <input id="bpm" type="number" min="30" max="200" value={bpm} onChange={e=>setBpm(parseInt(e.target.value)||60)} className="w-16 rounded bg-white text-black px-1" />
    </div>}
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 w-11/12 max-w-md">
      <ModeButton id="scales" label="Escalas" icon="🎼" />
      <ModeButton id="chords" label="Acordes" icon="🎸" />
      <ModeButton id="practice" label="Practice" icon="⏱" />
    </div>
  </div>;
}