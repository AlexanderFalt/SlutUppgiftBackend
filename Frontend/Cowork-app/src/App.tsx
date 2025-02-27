import { ThemeProvider } from '@emotion/react';
import theme from './themes';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
//Components
import SignUp from './components/PreAuth/SignUp';
import SignIn from './components/PreAuth/SignIn';
import NavBar from './components/PreAuth/NavBar';
import HomePage from './components/PostAuth/HomePageConsumer.tsx';

function App() {
  return (
    <>
      <BrowserRouter>
        <ThemeProvider theme={theme}> 
          <NavBar/>
          <Routes>
            <Route path='/' element={<SignUp/>}/>
            <Route path='/sign-in' element={<SignIn/>}/>
            <Route path='/home-page' element={<HomePage/>}/>
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </>
  )
}

export default App
