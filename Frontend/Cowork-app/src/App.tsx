import { ThemeProvider } from '@emotion/react';
import theme from './themes';
import SignIn from './components/PreAuth/SignIn';
import NavBar from './components/PreAuth/NavBar';
import Footer from './components/PreAuth/Footer'


function App() {
  return (
    <>
      <ThemeProvider theme={theme}> 
        <NavBar/>
        <SignIn/>
        <Footer/>
      </ThemeProvider>
    </>
  )
}

export default App
