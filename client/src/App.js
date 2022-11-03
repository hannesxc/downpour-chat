import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Login from './components/Login/Login'
import Chat from './components/Chat/Chat'
import { SocketProvider } from './contexts/socketContext'
import { MainProvider } from './contexts/mainContext'
import DefaultPage from './components/Broken/DefaultPage'
import './App.css'
import { ToastContainer } from 'react-toastify'

function App() {
  return (
    <>
      <ToastContainer style={{ width: "380px" }}/>
      <MainProvider>
        <SocketProvider>
            <Router>
              <Routes>
                <Route exact path='/' element={<Login />} />
                <Route path='/chat' element={<Chat />} />
                <Route path='*' element={<DefaultPage />} />
              </Routes>
            </Router>
        </SocketProvider>
      </MainProvider>
    </>
  );
}

export default App;