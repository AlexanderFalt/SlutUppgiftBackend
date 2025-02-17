import { ThemeProvider } from '@emotion/react';
import theme from './themes';
import SignIn from './components/PreAuth/SignIn';
import NavBar from './components/PreAuth/NavBar';


function App() {
  return (
    <>
      <ThemeProvider theme={theme}> 
        <NavBar/>
        <SignIn/>
      </ThemeProvider>
    </>
  )
}

export default App
