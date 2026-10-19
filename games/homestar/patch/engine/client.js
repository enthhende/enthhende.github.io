/* UI-independent worker lifecycle API for a future GitHub Pages front end. */
(function(root){
  'use strict';
  class PatcherClient {
    constructor(workerSource) {this.workerSource=workerSource;this.sequence=0;this.active=null;}
    cancel() {
      if(!this.active) return;
      const {worker,url,reject}=this.active;this.active=null;
      worker.terminate();URL.revokeObjectURL(url);reject(new DOMException('취소했습니다.','AbortError'));
    }
    apply({source,base64,manifest,onProgress=()=>{}}) {
      this.cancel();const id=++this.sequence;
      return new Promise((resolve,reject)=>{
        const url=URL.createObjectURL(new Blob([this.workerSource],{type:'text/javascript'}));
        let worker;
        try {worker=new Worker(url);} catch(error){URL.revokeObjectURL(url);reject(error);return;}
        this.active={id,worker,url,reject};
        const finish=(error,result)=>{
          if(this.active?.id!==id) return;
          this.active=null;worker.terminate();URL.revokeObjectURL(url);
          if(error) reject(error);else resolve(result);
        };
        worker.onmessage=({data})=>{
          if(this.active?.id!==id||data.id!==id) return;
          if(data.type==='progress') onProgress(data.progress);
          else if(data.type==='done') finish(null,data);
          else if(data.type==='error') finish(new Error(data.message));
        };
        worker.onerror=event=>{event.preventDefault();finish(new Error('적용 작업을 실행하지 못했습니다. '+event.message));};
        worker.onmessageerror=()=>finish(new Error('적용 결과를 받을 수 없습니다.'));
        try {worker.postMessage({id,source,base64,manifest});} catch(error){finish(error);}
      });
    }
  }
  root.HomestarPatcherClient=PatcherClient;
})(globalThis);
