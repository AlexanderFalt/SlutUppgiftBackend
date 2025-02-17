import { createTheme } from '@mui/material';

const theme = createTheme({
     palette: {
          primary: {
              main: '#872984',
          },
          secondary: {
              main: '#69247C',
          },
     },
     typography: {
        fontFamily: "Montserrat",
        
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    margin: "0.5%",
                    borderRadius: 8,
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    margin: "0.5%",
                    [`& fieldset`]: {
                        borderRadius: 8,
                    },
                }
            }
        },
        MuiFormControl: {
            styleOverrides: {
                root: {
                    margin: "0.5%",
                    [`& fieldset`]: {
                        borderRadius: 8,
                    },
                }
            }
        }
    }
})

export default theme;