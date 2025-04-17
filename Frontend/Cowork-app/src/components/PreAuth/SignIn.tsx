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
    Link,
    Grow
} from "@mui/material";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from "axios";
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../Realtime/useSocket";

export default function SignIn() {
    const [ showPassword, setShowPassword ] = useState(false)
    const [ password, setPassword ] = useState<string>("");
    const [ username, setUsername] = useState<string>("");
    const [ error, setError ] = useState<string>(""); 
    const [ errorBool, setErrorBool ] = useState(false);

    const socket = useSocket();
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent) => {
        if (password === undefined) {
            setErrorBool(true);
            setError("Password feild left empty")
        }
        if (username === undefined) {
            setErrorBool(true);
            setError("Username feild left empty")
        }
        event.preventDefault();
        setError("");
    
        try {
            const response = await axios.post(
                "/api/users/login",
                { username, password },
                { withCredentials: true }
            );
            console.log("Login successful", response.data);
            if (response.status === 200 && response.data.userId) {
                socket.emit('roomIDJoin', response.data.userId);
                navigate("/home-page");
            } else {
                setError("Unexpected response from server.");
                setErrorBool(true);
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 404) {
                    setError("Could not find the user. Check if it's the correct username and password.");
                    setErrorBool(true);
                    return;
                }
                if (err.response?.status === 418) {
                    setError("Your application has not yet been confirmed.");
                    setErrorBool(true);
                    return;
                }
            }
    
            setError("Login failed");
            setErrorBool(true);
        }
    }

    const handleMouseDownPassword = (event : React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event : React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    return(
        <Box sx={{height: "90vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"}}>
            <Typography variant="h3" color={'primary'} sx={{fontSize: "clamp(1.65rem, 2.5vw, 3rem)", fontWeight: "600", width: {xs: "100vw", md: "50vw"}, padding: "0 2.5vh"}} gutterBottom>
                    Sign In
            </Typography>
            <Paper elevation={6} sx={{
                height: "30vh", 
                border: "1px solid silver", 
                width: {xs: "100vw", md: "50vw"}, 
                borderRadius: 8, 
                padding: "5vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
            }}>
                <TextField 
                    variant="outlined" 
                    fullWidth 
                    placeholder="Username or company name" 
                    label='Username or company name' 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)} 
                    value={username}
                    required
                />
                <FormControl variant="outlined" fullWidth sx={{margin: "0.5%"}}>
                    <InputLabel 
                        htmlFor="outlined-adornment-password" 
                        required
                    >
                        Password
                    </InputLabel>
                    <OutlinedInput
                        id="outlined-adornment-password"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} 
                        type={showPassword ? 'text' : 'password'}
                        endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                            aria-label={
                                showPassword ? 'hide the password' : 'display the password'
                            }
                            onClick={() => setShowPassword((show) => !show)}
                            onMouseDown={handleMouseDownPassword}
                            onMouseUp={handleMouseUpPassword}
                            edge="end"
                            >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    }/>
                </FormControl>
                <Box sx={{ width: "100%", height: "20%", margin: "1% 0"}}>
                    <Grow in={errorBool}  timeout={{ enter: 500, exit: 0 }} mountOnEnter unmountOnExit>
                        <Box sx={{border: "1px solid red", width: "100%", height: "3vh", borderRadius: 2, display: "flex", justifyContent: "center", alignItems: "center", marginRight: "0.5%"}}>
                            <Typography sx={{color: "red"}}>{error}</Typography>    
                        </Box>
                    </Grow>
                </Box>
                <Box sx={{display: "flex", width: "100%"}}>
                    <Button variant="outlined" onClick={handleSubmit} fullWidth>Sign In</Button>
                    <Button variant="text"  LinkComponent={Link} href={'/'} fullWidth>
                        Don't have an account?
                    </Button>
                </Box>
            </Paper>
        </Box>
    )
} 