/* Appended to engine.js inside an offline Blob worker. */
'use strict';
self.onmessage=async ({data})=>{
  const {id,source,base64,manifest}=data;
  try {
    const binary=atob(base64),patch=new Uint8Array(binary.length);
    for(let i=0;i<binary.length;i++) patch[i]=binary.charCodeAt(i);
    const result=await HomestarPatch.apply({source,patch,manifest,onProgress:progress=>self.postMessage({id,type:'progress',progress})});
    self.postMessage({id,type:'done',...result});
  } catch(error) {self.postMessage({id,type:'error',message:error.message});}
};
