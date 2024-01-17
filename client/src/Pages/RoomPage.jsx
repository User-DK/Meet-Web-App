import React, { useEffect, useCallback, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../service/Peer";
import "./Style.css"

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketIdUser, setremoteSocketIdUser] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();


  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email- ${email} joined room`);
    setremoteSocketIdUser(id);
  });


  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketIdUser, offer });
    setMyStream(stream);
  }, [remoteSocketIdUser, socket]);


  const handleIncomingCall = useCallback(async ({ from, offer }) => {
    setremoteSocketIdUser(from);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    const answer = await peer.giveAnswer(offer);
    socket.emit("call:accepted", { to: from, answer });
  }, []);


  const sendStream = useCallback(() =>{
    for  (const track of myStream.getTracks()){
      peer.peer.addTrack(track, myStream);
    }
  },[myStream]);


  const handleAcceptCall = useCallback(async ({ from, answer }) => {
    peer.setLocalDescription(answer);
    sendStream();
  }, [sendStream]);


  const handleNegoNeeded = useCallback(async()=>{
    const offer = await peer.getOffer();
      socket.emit('peer:nego:needed',{offer,to: remoteSocketIdUser})
  },[socket, remoteSocketIdUser])


//useeffect for negotiation
  useEffect(() => {
    peer.peer.addEventListener('negotiationneeded', handleNegoNeeded);
    return () => {
    peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded);
    }
  },[handleNegoNeeded])

  const handleNegoNeededIncomming = useCallback(async({from,offer})=>{
    const answer = await peer.giveAnswer(offer);
    socket.emit('peer:nego:done',{to: from,answer});
  },[socket])


  const handleNegoNeededFinal = useCallback(async({answer})=>{
    await peer.setLocalDescription(answer);
  },[])


  //useEffect for peer
  useEffect(() => {
    peer.peer.addEventListener('track',async (event) => {
      const remoteStream = event.streams;
      setRemoteStream(remoteStream[0]);
    })
  }, []);



  // use effect for sockets
  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleAcceptCall);
    socket.on("peer:nego:needed", handleNegoNeededIncomming);
    socket.on("peer:nego:final", handleNegoNeededFinal);


    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleAcceptCall);
      socket.off("peer:nego:needed", handleNegoNeededIncomming);
      socket.off("peer:nego:final", handleNegoNeededFinal);
    };
  }, [socket, handleUserJoined, handleIncomingCall, handleAcceptCall, handleNegoNeededIncomming]);


    const myStreamStyle = {
      border:'2px black',
      borderRadius : '5px',
      margin: '5px',
      position: 'fixed',
      right: '0px',
      bottom: '0px'
    }
  

    const remoteStreamStyle = {
      border:'2px black',
      borderRadius : '5px',
      margin: '1px',
      alignContent: 'center'
    }
  

  return (
    <div>
      <h1>Meet</h1>
      <h4>{remoteSocketIdUser ? "Connected" : "No one in the room"}</h4>
      {myStream && <button onClick={sendStream}>Send Stream</button>}<br/>
      {remoteSocketIdUser && <button onClick={handleCallUser}>Call</button>}
      {remoteStream && (
        <>
        <div >
        <ReactPlayer className="remoteStream"
        width="100%"
        height = "5%"
          playing
          muted
          style={remoteStreamStyle}
          url={remoteStream}
        /></div>
        </>
      )}
      
      {myStream && (
        <>
        <div > 
        <ReactPlayer className="myStream"
          width="36%"
          height = "27%"
          playing
          muted
          style={myStreamStyle}
          url={myStream}
        /></div>
        </>
      )}
      
    </div>
  );
};

export default RoomPage;
