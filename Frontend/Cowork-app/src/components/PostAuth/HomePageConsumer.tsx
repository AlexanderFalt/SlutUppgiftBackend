import { 
    Paper,
    Card,
    CardHeader,
    CardContent,
    Box,
    Typography,
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment,
    Button
} from "@mui/material";
import { useState, useEffect } from "react";
import Grid from '@mui/material/Grid2';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

type AvailableRoomsObject = {
    _id?: string,
    address: string,
    name: string,
    roomNumber: string,
    roomOpens: string,
    roomCloses: string,
    capacity: number,
    type: "workspace" | "conference" | "",
}

export default function HomePage() {
    const [rooms, setRooms] = useState<AvailableRoomsObject[]>([]);
    const [fullRooms, setFullRooms] = useState<AvailableRoomsObject[]>([]);
    const [amountOfResults, setAmountOfResults] = useState<number>(0); 
    // const temporary : string = "TemporaryUser01";
    
    const fetchRooms = () => {
            axios.get('/api/room')
            .then((response) => {
                console.log(response.data);
                setRooms(response.data);
                setFullRooms(response.data);
            })
            .catch((error) => {
                console.error("Error fetching rooms:", error);
            });
    }

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value;
    
        if (query.trim() === "") {
          setRooms(fullRooms);
          setAmountOfResults(0);
        } else {
          const filteredRooms = fullRooms.filter(room =>
            room.address.toLowerCase().includes(query.toLowerCase()) ||
            room.roomNumber.toLowerCase().includes(query.toLowerCase()) ||
            room.name.toLowerCase().includes(query.toLowerCase())
          );
          setRooms(filteredRooms);
          setAmountOfResults(filteredRooms.length);
        }
    };

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
                <Box sx={{ height: "13.5vh" , width: { sm:"100vw", md: "60vw"}}}>
                    <Typography variant="h3" color={'primary'} sx={{fontSize: "clamp(1.65rem, 2.5vw, 3rem)", fontWeight: "500", width: {xs: "100vw", md: "50vw"}, padding: "0 0.5vh"}} gutterBottom>
                        Available rooms
                    </Typography>    
                    <FormControl fullWidth sx={{ borderRadius: 8, textAlign: "center"}} onChange={handleSearchChange}>
                        <InputLabel htmlFor="outlined-adornment">Search</InputLabel>
                        <OutlinedInput
                        sx={{
                            borderRadius: 8,
                            '& .MuiOutlinedInput-notchedOutline': {
                            borderRadius: 8,
                            }
                        }}
                        id="outlined-adornment-password"
                        endAdornment={
                            <InputAdornment position="start">
                                <SearchIcon fontSize="medium"/>
                            </InputAdornment>
                        }
                        />
                    </FormControl>
                </Box>
                <Typography variant="body2" sx={{ marginLeft: "2%", fontSize: "clamp(1rem, 2.5vw, 1.15rem)", color: (amountOfResults ? "gray" : "white"), width: "60vw"}}>
                    Your search gave back {amountOfResults} results.
                </Typography>
                {rooms.map((event : AvailableRoomsObject, index : number) => (
                    <Grid key={index} sx={{height: "30vh", width: { sm:"100vw", md: "60vw"}, borderRadius: 8}}>
                        <Card sx={{width: "100%", height: "100%", boxShadow: "none", borderRadius: 8, padding: "0.5%"}}>
                            <Paper elevation={4} sx={{height: "100%", width: "100%", border: "1px solid silver", borderRadius: 8, padding: "1%"}}>
                                <CardHeader title={event.name} subheader={event.address}/>
                                <CardContent sx={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                                    <Box  sx={{width: "100%", height: "82.5%"}}>
                                        <Typography  variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(1rem, 2.5vw, 1.25rem)"}}>Opening time: <Box component={'span'} sx={{fontWeight: "500"}}>{event.roomOpens}</Box></Typography>
                                        <Typography  variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(1rem, 2.5vw, 1.25rem)"}}>Closeing time: <Box component={'span'} sx={{fontWeight: "500"}}>{event.roomCloses}</Box></Typography>
                                        <Typography  variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(1rem, 2.5vw, 1.25rem)"}}>Capacity: <Box component={'span'} sx={{fontWeight: "500"}}>{event.capacity}</Box></Typography>
                                    </Box>
                                    <Box sx={{width: "100%", height: "82.5%"}}>
                                        <Typography  variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(1rem, 2.5vw, 1.25rem)"}}>Room name or number: <Box component={'span'} sx={{fontWeight: "500"}}> {event.roomNumber}</Box></Typography>
                                        <Typography  variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(1rem, 2.5vw, 1.25rem)"}}>Type of workspace: <Box component={'span'} sx={{fontWeight: "500"}}>{event.type}</Box></Typography>
                                    </Box>
                                </CardContent>
                                <Box sx={{height: "17.5%", display: "flex", justifyContent: "space-evenly"}}>
                                    <Button variant="contained" color="secondary" sx={{width:"48%", height: "100%", borderRadius: 6, margin: 0}}>
                                        Book room
                                    </Button>
                                    <Paper elevation={6} sx={{borderRadius: 6, height: "100%", width: "48%", border: "1px solid silver", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <Typography color="secondary" variant="h5">
                                            <Box component="span" sx={{fontWeight: 600}}>1</Box> / 8
                                        </Typography>
                                        <PersonIcon fontSize="large" color="secondary" sx={{position: "absolute", right: "23%"}}/>
                                    </Paper>
                                </Box>
                            </Paper>
                        </Card>
                    </Grid>
                ))}               
        </Grid>
    )
}