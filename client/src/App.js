import {Routes, Route} from 'react-router-dom';
import './App.css';
import  Landing from './Pages/Lobby'
import RoomPage from './Pages/RoomPage'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Landing/>}/>
        <Route path='/room/:roomID' element={<RoomPage/>}/>
      </Routes>
    </div>
  );
}

export default App;
