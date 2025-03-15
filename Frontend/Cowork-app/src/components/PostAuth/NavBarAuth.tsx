import {
    AppBar,
    Typography,
    IconButton,
    Avatar,
    Paper,
    Box,
    Grow,
    Button
} from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';

export default function NavBar() {
    const [showMenu, setShowMenu] = useState(false);

    // Temporary
    const username : string = "TemporaryUser01"
    const name : string = "Alexander Söderström";
    const role : string = "user"

    type menuItem = {
        title: string,
        path: string,
    }

    const roleBasedItems : menuItem[] = [
        {
            title: "Available rooms",
            path: "/home-page",
        },
        {
            title: "My Bookings",
            path: "/home-page",
        },
    ]

    const getRole = (role : string) => {
        if (role === "user") {
            return "Patron"
        }
        if (role === "owner") {
            return "Manager"
        } else {
            return "Admin"
        }
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
            <Grow in={showMenu}  timeout={{ enter: 500, exit: 0 }} mountOnEnter unmountOnExit>
                <Box sx={{ position:"absolute", height: "87.5vh", width: "17.5vw", top: "115%", padding: "1%"}}>
                    <Paper elevation={6} sx={{width: "100%", height: "100%", borderRadius: 6, border: "1px solid silver", padding: "2%"}}>
                        <Box sx={{display: "flex", flexDirection: "column", height: "90%"}}>
                            {roleBasedItems.map((event, index) => (
                                <Button key={index} variant='text' color='secondary' component={Link} to={event.path} sx={{
                                    fontSize: "clamp(1.1rem, 2.5vw, 1.25rem)", 
                                    borderRadius: 6, 
                                    marginBottom: "2%", 
                                    textTransform: "none", 
                                    justifyContent: "left", 
                                    paddingLeft: "6%",
                                    "&:hover": {
                                        backgroundColor: "silver",
                                    },    
                                }}>
                                    {event.title}
                                </Button>
                            ))}
                        </Box>
                        <Box sx={{height: "10%", display: "flex", justifyContent: "center", alignItems: "center", borderTop: "1px solid #69247C",}}>
                        <Button variant='text' color='secondary' component={Link} to={"/settings"} sx={{
                            fontSize: "clamp(1.1rem, 2.5vw, 1.25rem)",
                            width: "14.5vw",
                            borderRadius: 6,
                            marginBottom: "2%", 
                            textTransform: "none",
                            "&:hover": {
                                backgroundColor: "silver",
                            },
                            }}>
                                <SettingsIcon sx={{position:"absolute", left: "5%"}}/>Settings
                        </Button>
                        </Box>
                    </Paper>    
                </Box>
            </Grow>
            <Typography variant='h2' sx={{fontWeight: "700", width:"60%", paddingLeft: {sm: "0", md: "1%"}}}>
                Coworkify
            </Typography>
            <Box sx={{display: "flex", width: {sm: "35%", md: "35%", lg: "37.5%", justifyContent: "right", alignItems: "center"}}}>
                <Box sx={{marginRight: "2%"}}>
                    <Typography variant='body1' sx={{textAlign: "right", display: {sm: "none", md: "none", lg: "block"}, fontSize:"1.35rem"}}>{username}</Typography>
                    <Typography variant='body1' sx={{textAlign: "right", display: {sm: "none", md: "none", lg: "block"}, color: "silver"}}>{getRole(role)}</Typography>
                </Box>
                <Avatar sx={{ width: 56, height: 56, bgcolor: '#B57EDC' }}>{name ? name[0] : username[0]}</Avatar>
            </Box>
        </AppBar>
    )
}