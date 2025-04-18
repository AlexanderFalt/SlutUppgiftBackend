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
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function SignUp() {
    const [ showPasswordOne, setShowPasswordOne ] = useState(false)
    const [ showPasswordTwo, setShowPasswordTwo ] = useState(false)
    
    const [ error, setError ] = useState<string>();
    const [ errorBool, setErrorBool ] = useState(false);

    const [ username, setUsername ] = useState<string>();
    const [ name, setFullName ] = useState<string>();
    const [ emailAddress, setEmail ] = useState<string>();
    const [ password, setPassword ] = useState<string>();
    const [ secondPassword, setSecondPassword ] = useState<string>();

    const navigate = useNavigate();
    const API = import.meta.env.VITE_API_URL;
    
    const handleSubmit = async (event: React.FormEvent) => {
        if (!emailAddress) {
            setErrorBool(true);
            setError("Email field left empty")
        }
        if (!username) {
            setErrorBool(true);
            setError("Username field left empty")
        }
        if (!name) {
            setErrorBool(true);
            setError("Username field left empty")
        }
        if (!password) {
            setErrorBool(true);
            setError("Password field left empty")
        }
        if (!secondPassword) {
            setErrorBool(true);
            setError("Place enter the password in the second field")
        }
        if (password !== secondPassword) {
            setErrorBool(true);
            setError("The passwords must match")   
        }
        event.preventDefault();
        setError("");



        const payload = {
            username,
            name: name ?? null,
            emailAddress,
            roleRaise: false,
            password,
            role: "Owner",
        };

        console.log(payload)

        try {
          const response = await axios.post(
            `${API}/api/users/register`,
            payload,
            { withCredentials: true }
          );
    
          console.log("Login successful", response.data);
          navigate("/sign-in")
        } catch (err: unknown) {
            if (err instanceof Error) {
                setErrorBool(true);
                setError(err.message);
            } else {
                setErrorBool(true);
                setError("Login failed");
            }
        }
    };

    const handleMouseDownPassword = (event : React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };
    const handleMouseUpPassword = (event : React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    return(
        <Box sx={{height: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"}}>
            <Typography variant="h3" color={'primary'} sx={{fontSize: "clamp(1.45rem, 2.5vw, 2.75rem)", fontWeight: "600", width: {xs: "100vw", md: "50vw"}, padding: "0 2.5vh"}} gutterBottom>
                Create an account to become an Manager.
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
                <TextField variant="outlined" fullWidth placeholder="Username" label='Company name' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)} value={username} required/>
                <TextField variant="outlined" fullWidth placeholder="Full name" label='Address' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)} value={name} required/>
                <TextField variant="outlined" fullWidth placeholder="Email adress" label='Email adress' required onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} value={emailAddress}/>
                <FormControl variant="outlined" fullWidth sx={{margin: "0.5%"}}>
                    <InputLabel htmlFor="outlined-adornment-password" required>Password</InputLabel>
                    <OutlinedInput
                        id="outlined-adornment-password"
                        type={showPasswordOne ? 'text' : 'password'}
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
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
                        value={secondPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSecondPassword(e.target.value)}
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


                <Box sx={{ width: "100%", height: "8%", margin: "1% 0%"}}>
                    <Grow in={errorBool}  timeout={{ enter: 500, exit: 0 }} mountOnEnter unmountOnExit>
                        <Typography sx={{width: "99%", height: "99%", padding: "1%", borderRadius: 6, backgroundColor: "#FF5C5C", color: "white"}}>{error}</Typography>
                    </Grow>
                </Box>

                <Box sx={{display: "flex", width: "100%"}}>
                    <Button variant="outlined" onClick={handleSubmit} fullWidth>Sign up</Button>
                    <Button variant="text" LinkComponent={Link} href={'/sign-in'} fullWidth>
                        Already have an account?
                    </Button>
                </Box>
                
                <Box sx={{display: "flex", width: "100%"}}>
                    <Button variant="text" LinkComponent={Link} href={'/'} fullWidth>
                        Want to sign up as an patron instead?
                    </Button>
                </Box>
            </Paper>
        </Box>
    )
} 