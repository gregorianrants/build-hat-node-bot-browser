import React from "react";
import { Buffer } from "buffer";
import toBuffer from 'blob-to-buffer'
import typedArrayConcat from "typed-array-concat";



function App() {
  const [ws,setWs]=React.useState()
  const [imageSrc,setImageSrc] = React.useState(null)

  React.useEffect(()=>{
    let ws = new WebSocket("ws://192.168.178.52:3000/");
    
    ws.addEventListener('open',()=>{
        console.log('we are opent')
        setWs(ws)
    })

    let count = 0
    const stop = new Uint16Array(Buffer.from('ffd9','hex').buffer)[0]
    let  buffer = new Uint16Array()
    // const handler = async (message)=>{
      
    //   //need to make sure the next two variables point to same data for performance reasons
    //   const sentBytesBuffer = await message.data.arrayBuffer().then(arrayBuffer=>Buffer.from(arrayBuffer))
    //   const sentBytes16 = await message.data.arrayBuffer().then(arrayBuffer=>new Uint16Array(arrayBuffer))
    //   let index = sentBytes16.indexOf(stop)*2
    //   //console.log('index',index)
      
     
    //   if(index<0){
    //     //console.log('not found')
    //     buffer = Buffer.concat([buffer,sentBytesBuffer])
    //   }else{

    //     const last = sentBytesBuffer.subarray(0,index+2)
    //     const viewLast = last.subarray(-10).toString('hex')
    //     const next = sentBytesBuffer.subarray(index+2)
    //     const nextView = next.subarray(0,10).toString('hex')
    //     console.log(nextView)

        
    //     let result = Buffer.concat([buffer,last]).toString('base64')
    //     const resultStartView = result.slice(0,10)
    //     const resultEndView = result.slice(-10,0)
    //     setImageSrc("data:image/jpeg;base64," + result)
    //     buffer = buffer.length === index+2 ? Buffer.from([]) : next
       
        
    //   }
    //   // count += 1;
    //   // if(count==1000){
    //   //   ws.removeEventListener('message',handler)
    //   // }
    // }

    const handler = async (message)=>{
      const sentBytes16 = await message.data.arrayBuffer().then(arrayBuffer=>new Uint16Array(arrayBuffer))
      let indexOfLast = sentBytes16.indexOf(stop)
      let indexOfNext = indexOfLast+1

      if(indexOfLast==-1){
        buffer = typedArrayConcat(Uint16Array, buffer,sentBytes16);
    }else{
        const last = sentBytes16.slice(0,indexOfNext)
        let result = Buffer.concat([Buffer.from(buffer.buffer),Buffer.from(last.buffer)])
        setImageSrc("data:image/jpeg;base64," + result.toString('base64'))
        let viewStart = result.subarray(0,10).toString('hex')
        let viewEnd = result.subarray(-10).toString('hex')
        let next = sentBytes16.slice(indexOfNext)
        let nextView = Buffer.from(next.buffer).toString('hex')
        buffer = indexOfNext >= sentBytes16.length ? new Uint16Array() : sentBytes16.slice(indexOfNext)
    }
  }

    ws.addEventListener('message',handler)
  },[])
  return (
    ws
    ?
    <div className="App">
       <img src={imageSrc} alt=""   width={'640px'} height={'480px'}/>
    </div>
    :
    <p>waiting to open....</p>
  );
}

export default App;
