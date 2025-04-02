import {
    AppBar,
    Typography,
    IconButton,
    Avatar,
    Box,
    Grow,
} from '@mui/material';
import { useState, useEffect } from 'react';
import axios from 'axios';
import MenuIcon from '@mui/icons-material/Menu';
// Navbars
//import SmallNav from './SmallNav.tsx';
import FullNav from './FullNav.tsx';

export default function NavBar() {
    const [showMenu, setShowMenu] = useState(true);
    const [role, setRole] = useState<"User" | "Owner" | "Admin">("User");
    const [username, setUsername] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await axios.get("/api/users/getRole", { withCredentials: true });
                console.log(response.data.role + " " + response.data.username)
                setRole(response.data.role);
                setUsername(response.data.username);
            } catch (error) {
                console.error("Failed to fetch user role", error);
            }
        };
        fetchUserRole();
    }, []);

    const showRole = () => {
        if (role === "Owner") {
            return "Manager"
        }
        if (role === "User") {
            return "Patron"
        }
        if (role === "Admin") {
            return "Admin"
        }
        return "Error"
    }

    const handleMenuClick = () => {
        setShowMenu(!showMenu);
    }

    
    return(
        <AppBar position={'fixed'} color={'secondary'} sx={{padding: "1%", display: "flex", flexDirection: "row", alignItems: "center"}}>
            <Box sx={{display: "flex", alignItems:"center", justifyContent: "center", width: {md: "2.5%", lg: "5%"}}}>
                <IconButton onClick={() => handleMenuClick()}>
                    <MenuIcon fontSize='large' sx={{color: "white"}}/>
                </IconButton>
            </Box>
            <Grow in={showMenu} timeout={{ enter: 500, exit: 0 }} mountOnEnter unmountOnExit>
                <FullNav userRole={role} />
            </Grow>
            <Typography variant='h2' sx={{fontWeight: "700", width:"60%", paddingLeft: {sm: "0", md: "1%"}}}>
                Coworkify
            </Typography>
            <Box sx={{display: "flex", width: {sm: "35%", md: "35%", lg: "37.5%", justifyContent: "right", alignItems: "center"}}}>
                <Box sx={{marginRight: "2%"}}>
                    <Typography variant='body1' sx={{textAlign: "right", display: {sm: "none", md: "none", lg: "block"}, fontSize:"1.25rem"}}>{username}</Typography>
                    <Typography variant='body1' sx={{textAlign: "right", display: {sm: "none", md: "none", lg: "block"}, color: "silver"}}>{showRole()}</Typography>
                </Box>
                <Avatar sx={{ width: 56, height: 56, bgcolor: '#B57EDC' }}>{username && username[0]}</Avatar>
            </Box>
        </AppBar>
    )
}