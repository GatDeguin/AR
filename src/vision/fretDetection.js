export async function loadOpenCV(){if(window.cv) return window.cv;return new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/opencv.js@4.10.0/opencv.js";s.async=true;
s.onload=()=>{if(window.cv&&window.cv.ready)window.cv.onRuntimeInitialized=()=>res(window.cv);else res(window.cv);};s.onerror=rej;document.body.appendChild(s);});}
export function detectFrets(src,opts={cannyThreshold1:50,cannyThreshold2:150,houghThreshold:50}){
  const cv=window.cv; if(!cv) throw new Error("OpenCV.js no cargado");
  const canvas=document.createElement("canvas");canvas.width=src.videoWidth||src.width;canvas.height=src.videoHeight||src.height;
  canvas.getContext("2d").drawImage(src,0,0,canvas.width,canvas.height);
  const mat=cv.imread(canvas),g=cv.Mat(),b=cv.Mat(),e=cv.Mat(),lines=new cv.Mat();
  cv.cvtColor(mat,g,cv.COLOR_RGBA2GRAY);
  cv.GaussianBlur(g,b,new cv.Size(5,5),0);
  cv.Canny(b,e,opts.cannyThreshold1,opts.cannyThreshold2);
  cv.HoughLinesP(e,lines,1,Math.PI/180,opts.houghThreshold,50,10);
  const fl=[];
  for(let i=0;i<lines.rows;i++){const d=lines.data32S.subarray(i*4,i*4+4);const angle=Math.atan2(d[3]-d[1],d[2]-d[0])*(180/Math.PI);
    if(Math.abs(angle)<10) fl.push({x1:d[0],y1:d[1],x2:d[2],y2:d[3]});
  }
  fl.sort((a,b)=>a.y1-b.y1);
  const clusters=[];
  fl.forEach(l=>{const ex=clusters.find(c=>Math.abs(c.y-l.y1)<15);if(ex){ex.lines.push(l);ex.y=(ex.y*(ex.lines.length-1)+l.y1)/ex.lines.length;}else clusters.push({y:l.y1,lines:[l]});});
  const avg=clusters.map(c=>{const sum=c.lines.reduce((a,l)=>({x1:a.x1+l.x1,y1:a.y1+l.y1,x2:a.x2+l.x2,y2:a.y2+l.y2}),{x1:0,y1:0,x2:0,y2:0});
    const n=c.lines.length;return{x1:sum.x1/n|0,y1:sum.y1/n|0,x2:sum.x2/n|0,y2:sum.y2/n|0};});
  mat.delete();g.delete();b.delete();e.delete();lines.delete();
  return avg;
}
