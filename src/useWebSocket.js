import React from 'react';

const socketContext = React.createContext()

function useWebSocket(){
  const [open,setOpen] = React.useState(false)
  const [ws,setWs]=React.useState()
  


  React.useEffect(()=>{
    let ws = new WebSocket("ws://192.168.178.52:8001/");

    ws.onopen = (event) => {
     console.log('the socket is open')
};  


  },[])
}