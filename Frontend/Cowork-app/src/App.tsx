import { ThemeProvider } from '@emotion/react';
import { BrowserRouter, Routes } from 'react-router-dom';
//Components
import theme from './themes';
import SignIn from './components/PreAuth/SignIn';
import NavBar from './components/PreAuth/NavBar';


function App() {
  return (
    <>
      <BrowserRouter>
        <ThemeProvider theme={theme}> 
          <Routes>
            <NavBar/>
            <SignIn/>
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </>
  )
}

export default App
