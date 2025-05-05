import { ThemeProvider } from '@emotion/react';
import theme from './themes';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './components/Wrappers/HomePage.tsx';
import SignUp from './components/Wrappers/RegisterWrapper.tsx';
import SignIn from './components/Wrappers/SignInWrapper.tsx';
import SettingsWrapper from './components/Wrappers/SettingsPage.tsx';
import SignUpOwner from './components/Wrappers/RegisterOwnerWrapper.tsx';
import BookingsPage from './components/Wrappers/BookingsPage.tsx';
import MangaeAccountWrapper from './components/Wrappers/ManageAccountWrapper.tsx';
import ManagerApplicationWrapper from './components/Wrappers/ManagerApplicationWrapper.tsx';
import { SocketProvider } from './Realtime/SocketContext.tsx';
import { useEffect } from 'react';
import { socket } from './Realtime/socket.ts';

function App() {
  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      console.log('Connected to Socket');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket');
    });

    socket.on('roomIDJoinAck', (userId) => {
      console.log(`Socket ${socket.id} joined room ${userId}`)
    })

    socket.on('sendDataBooking', (payload) => {
      console.log("Booking data received on client:", payload);
    });

    socket.on('sendBookingUpdate', (payload) => {
      console.log("Booking data received on client:", payload);
    });

    socket.on('sendBookingDelete', (payload) => {
      console.log("Booking data received on client:", payload);
    });

    socket.on('createdRoom', (payload) => {
      console.log("Data received on client:", payload);
    });

    socket.on('updateRoom', (payload) => {
      console.log("Data received on client:", payload);
    });

    socket.on('removedRoom', (payload) => {
      console.log("Data received on client:", payload);
    });

    socket.on('raiseUserRole', (payload) => {
      console.log("Data received on client:", payload);
    })

    socket.on('removedUser', (payload) => {
      console.log("Data received on client:", payload);
    })

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('roomIDJoinAck');
      socket.off('sendDataBooking');
    };
  }, []);
  return (
    <>
      <BrowserRouter>
        <ThemeProvider theme={theme}> 
          <SocketProvider>
            <Routes>
              <Route path='/' element={<SignUp/>}/>
              <Route path='/register-owner' element={<SignUpOwner/>} />
              <Route path='/sign-in' element={<SignIn/>}/>
              <Route path='/home-page' element={<HomePage/>}/>
              <Route path='/settings' element={<SettingsWrapper/>} />
              <Route path='/ManageAccount' element={<MangaeAccountWrapper/>} />
              <Route path='/bookings' element={<BookingsPage/>} />
              <Route path='/ManagerApplication' element={<ManagerApplicationWrapper/>} />
            </Routes>
          </SocketProvider>
        </ThemeProvider>
      </BrowserRouter>
    </>
  )
}

export default App
