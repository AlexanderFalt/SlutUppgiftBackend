import { ThemeProvider } from '@emotion/react';
import theme from './themes';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
//Wrapper components
import HomePage from './components/Wrappers/HomePage.tsx';
import SignUp from './components/Wrappers/RegisterWrapper.tsx';
import SignIn from './components/Wrappers/SignInWrapper.tsx';

function App() {
  return (
    <>
      <BrowserRouter>
        <ThemeProvider theme={theme}> 
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
