import { loadOpenCV } from "./fretDetection.js";
function estimateCameraMatrix(cv,w,h){const f=0.9*Math.max(w,h);return cv.matFromArray(3,3,cv.CV_32F,[f,0,w/2,0,f,h/2,0,0,1]);}
function composeMatrix4(cv,r,t){const R=new cv.Mat();cv.Rodrigues(r,R);const m=new Float32Array(16);
m[0]=R.data64F[0];m[1]=R.data64F[3];m[2]=R.data64F[6];m[3]=0;
m[4]=R.data64F[1];m[5]=R.data64F[4];m[6]=R.data64F[7];m[7]=0;
m[8]=R.data64F[2];m[9]=R.data64F[5];m[10]=R.data64F[8];m[11]=0;
m[12]=t.data64F[0];m[13]=t.data64F[1];m[14]=t.data64F[2];m[15]=1;
R.delete();return m;}
export async function calibratePose(pts,scaleReal,w,h){const cv=await loadOpenCV();
const obj=[0,0,0,scaleReal,0,0,scaleReal*0.4,0,0,scaleReal*0.75,0,0];
const img=[pts.nut.x,pts.nut.y,pts.bridge.x,pts.bridge.y,pts.fret5.x,pts.fret5.y,pts.fret12.x,pts.fret12.y];
const objP=cv.matFromArray(4,1,cv.CV_32FC3,obj),imgP=cv.matFromArray(4,1,cv.CV_32FC2,img);
const cam=estimateCameraMatrix(cv,w,h),dist=cv.Mat.zeros(1,5,cv.CV_32F),r=new cv.Mat(),t=new cv.Mat();
const success=cv.solvePnP(objP,imgP,cam,dist,r,t);
const mat=success?composeMatrix4(cv,r,t):null;objP.delete();imgP.delete();cam.delete();dist.delete();r.delete();t.delete();
return{pose:success?{matrix4:mat}:null,success};}
