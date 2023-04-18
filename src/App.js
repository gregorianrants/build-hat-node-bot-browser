import React from "react";
import { Buffer } from "buffer";
import toBuffer from 'blob-to-buffer'
import typedArrayConcat from "typed-array-concat";

function Uint16ArrayWithConcat(Uint16Array){
  Uint16Array.prototype.concat = function concat(arr_1,arr_2){
      typedArrayConcat(Uint16Array,arr_1,arr_2)
  }
  return Uint16Array
}


function App() {
  const [ws,setWs]=React.useState()
  const [imageSrc,setImageSrc] = React.useState(null)

  React.useEffect(()=>{
    let ws = new WebSocket("ws://192.168.178.52:3000/");
    
    ws.addEventListener('open',()=>{
        console.log('we are opent')
        setWs(ws)
    })
   
    function isIndexOutOfRange(index,array){
        return index>=array.length
    }
    const stop = new Uint16Array(Buffer.from('ffd9','hex').buffer)[0]
    let  buffer = new Uint16Array()
    const handler = async (message)=>{
      const sentBytes16 = await message.data.arrayBuffer().then(arrayBuffer=>new Uint16Array(arrayBuffer))
      let indexOfLastHalfWordOfPreviousFrame = sentBytes16.indexOf(stop)
      let indexOfFirstHalfWordOfNextFrame = indexOfLastHalfWordOfPreviousFrame+1

      if(indexOfLastHalfWordOfPreviousFrame==-1){
        buffer = typedArrayConcat(Uint16Array, buffer,sentBytes16);
    }else{
        const lastBytesOfFrame = sentBytes16.slice(0,indexOfFirstHalfWordOfNextFrame)
        let result = typedArrayConcat(Uint16Array, buffer,lastBytesOfFrame);
        result = Buffer.from(result.buffer)
        setImageSrc("data:image/jpeg;base64," + result.toString('base64'))
        buffer = isIndexOutOfRange(indexOfFirstHalfWordOfNextFrame,sentBytes16) ? new Uint16Array() : sentBytes16.slice(indexOfFirstHalfWordOfNextFrame)
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
