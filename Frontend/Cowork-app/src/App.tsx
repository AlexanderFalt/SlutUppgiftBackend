import { ThemeProvider } from '@emotion/react';
import theme from './themes';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
//Wrapper components
import HomePage from './components/Wrappers/HomePage.tsx';
import SignUp from './components/Wrappers/RegisterWrapper.tsx';
import SignIn from './components/Wrappers/SignInWrapper.tsx';
import SettingsWrapper from './components/Wrappers/SettingsPage.tsx';
import SignUpOwner from './components/Wrappers/RegisterOwnerWrapper.tsx'
import BookingsPage from './components/Wrappers/BookingsPage.tsx';

function App() {
  return (
    <>
      <BrowserRouter>
        <ThemeProvider theme={theme}> 
          <Routes>
            <Route path='/' element={<SignUp/>}/>
            <Route path='/register-owner' element={<SignUpOwner/>} />
            <Route path='/sign-in' element={<SignIn/>}/>
            <Route path='/home-page' element={<HomePage/>}/>
            <Route path='/settings' element={<SettingsWrapper/>} />
            <Route path='/bookings' element={<BookingsPage/>} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </>
  )
}

export default App
