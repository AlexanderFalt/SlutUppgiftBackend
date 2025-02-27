import { 
    Box, 
    Paper,
    Typography,
    TextField,
    Button,
    InputAdornment,
    FormControl,
    InputLabel,
    OutlinedInput,
    IconButton,
    Link
} from "@mui/material";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useState } from 'react';

export default function SignUp() {
    const [ showPasswordOne, setShowPasswordOne ] = useState(false)
    const [ showPasswordTwo, setShowPasswordTwo ] = useState(false)

    const handleMouseDownPassword = (event : React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event : React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    return(
        <Box sx={{height: "90vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"}}>
            <Typography variant="h3" color={'primary'} sx={{fontSize: "clamp(1.65rem, 2.5vw, 3rem)", fontWeight: "600", width: {xs: "100vw", md: "50vw"}, padding: "0 2.5vh"}} gutterBottom>
                Sign up
            </Typography>
            <Paper elevation={6} sx={{
                height: "60vh", 
                border: "1px solid silver", 
                width: {xs: "100vw", md: "50vw"}, 
                borderRadius: 8, 
                padding: "5vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
            }}>
                <TextField variant="outlined" fullWidth placeholder="Username" label='Username' required/>
                <TextField variant="outlined" fullWidth placeholder="Full name" label='Full name'/>
                <TextField variant="outlined" fullWidth placeholder="Email adress" label='Email adress' required/>
                <FormControl variant="outlined" fullWidth sx={{margin: "0.5%"}}>
                    <InputLabel htmlFor="outlined-adornment-password" required>Password</InputLabel>
                    <OutlinedInput
                        id="outlined-adornment-password"
                        type={showPasswordOne ? 'text' : 'password'}
                        endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                            aria-label={
                                showPasswordOne ? 'hide the password' : 'display the password'
                            }
                            onClick={() => setShowPasswordOne((show) => !show)}
                            onMouseDown={handleMouseDownPassword}
                            onMouseUp={handleMouseUpPassword}
                            edge="end"
                            >
                            {showPasswordOne ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    }/>
                </FormControl>
                <FormControl fullWidth sx={{margin: "0.5%"}}>
                    <InputLabel htmlFor="outlined-adornment-password" required>Reafirm Password</InputLabel>
                    <OutlinedInput
                        id="outlined-adornment-password"
                        type={showPasswordTwo ? 'text' : 'password'}
                        endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                            aria-label={
                                showPasswordTwo ? 'hide the password' : 'display the password'
                            }
                            onClick={() => setShowPasswordTwo((show) => !show)}
                            onMouseDown={handleMouseDownPassword}
                            onMouseUp={handleMouseUpPassword}
                            edge="end"
                            >
                            {showPasswordTwo ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    }/>
                </FormControl>

                <Box sx={{display: "flex", width: "100%"}}>
                    <Button variant="outlined" LinkComponent={Link} href={'/home-page'} fullWidth>Sign up</Button>
                    <Button variant="text" LinkComponent={Link} href={'/sign-in'} fullWidth>
                        Already have an account?
                    </Button>
                </Box>
            </Paper>
        </Box>
    )
} 