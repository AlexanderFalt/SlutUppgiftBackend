import { 
    Box,
    Typography,
    Paper,
    Card,
    CardHeader,
    CardContent,
    Button
 } from '@mui/material';
import Grid from '@mui/material/Grid2'
import axios from 'axios';
import { useEffect, useCallback, useState } from 'react';

export default function ManageAccount() {
    type UserType = {
        username: string,
        name: string,
        email: string,
        role: string,
        id: string,
    }
    const [users, setUsers] = useState<UserType[]>([]);
    const API = import.meta.env.VITE_API_URL;
    const fetchUsers = useCallback(async() => {
        try { 
            const response = await axios.get(`${API}/api/admin`, {withCredentials: true})
            console.log(`This was the data that was returned: ${JSON.stringify(response.data)}`)
            setUsers(response.data)
        } catch(e) {
            console.log(e)
        }
    }, [API])

    const deleteUser = async(id: string) => {
        try {
            await axios.delete(`/api/admin/${id}`, {withCredentials: true})
            console.log("Deleted user")
            fetchUsers();
        } catch(e) {
            console.log(e)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    return(
        <Grid container spacing={2} sx={{
            marginTop: "10vh",
            paddingTop: "5vh",
            width: "100%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            flexDirection: "column",
            }}>
                <Box sx={{ width: { sm:"100vw", md: "60vw"}}}>
                    <Typography variant="h3" color={'primary'} sx={{fontSize: "clamp(1.35rem, 2.5vw, 2.5rem)", fontWeight: "500", width: {xs: "100vw", md: "50vw"}, padding: "0 0.5vh"}} gutterBottom>
                        Account management
                    </Typography>
                    {users.map((user, index) => {
                        return(
                            <Grid key={index} sx={{width: "100%", marginBottom: "2%"}}>
                                <Paper elevation={6} sx={{width: "100%", height: "100%", borderRadius: 6, padding: "1.5%", border: "1px solid silver"}}>
                                    <Card sx={{border: "1px solid transparent", marginBottom: "1%", boxShadow: "none"}}>
                                        <CardHeader title={user.username} subheader={user.email}/>
                                    </Card>
                                    <CardContent sx={{display: "flex"}}>
                                        <Box sx={{width: "50%"}}>
                                            <Typography variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(0.95rem, 2.5vw, 1rem)"}}> Role: <Box component={'span'} sx={{fontWeight: "500"}}>{user.role}</Box></Typography>
                                        </Box>
                                        <Box sx={{width: "50%"}}>
                                            <Typography variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(0.95rem, 2.5vw, 1rem)"}}> User id: <Box component={'span'} sx={{fontWeight: "500"}}>{user.id}</Box></Typography>
                                        </Box>
                                    </CardContent>
                                    <Button variant="outlined" color="error" onClick={() => deleteUser(user.id)} sx={{width:"100%", height: "5vh", borderRadius: 6, margin: 0, marginRight: "1.5%", marginTop: "2%"}}>
                                        Delete user
                                    </Button>
                                </Paper>
                            </Grid>
                        )
                    })}
                </Box>
        </Grid>
    )
}