import React, {useState, useCallback, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {useSocket} from '../context/SocketProvider';
import './Style.css'

const Landing = () => {

  const [email,setEmail] =useState("")
  const [room,setRoom] =useState("")

  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmit = useCallback((e)=>{
    e.preventDefault();
    socket.emit('room:join', {email, room})
  },[email, room ,socket]); //[] at the end is  dependency array


  const handleJoinRoom = useCallback((data) => {
    const {email,room} = data;
    navigate(`/room/${room}`);
  })

  //useEffect for getting data from backend

  useEffect (()=>{
    socket.on('room:join',handleJoinRoom,[socket])
    return () =>{
      socket.off('room:join',handleJoinRoom);
    }
  },[socket, handleJoinRoom])

  return (
    <div className="Join">
      <h1>Join Room</h1>
      <form onSubmit={handleSubmit}>
        <h3>
        <label htmlFor='email'>Email ID:
          <input type="email" id="email" value={email} onChange={(e)=>setEmail(e.target.value)} required></input>
        </label><br/>
        <label htmlFor='room'>Room No:
          <input type="number" id="room" value={room} onChange={(e)=>setRoom(e.target.value)} required></input>
        </label>
        <br/>
        <button >Join</button>
        </h3>
      </form>
    </div>
  )
}

export default Landing