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
    Button,
    Grow,
    TextField,
} from "@mui/material";
import { useState, useEffect } from "react";
import PatronList from './PatronList.tsx';
import Grid from '@mui/material/Grid2';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import dayjs from 'dayjs';

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
    const [userId, setUserId] = useState<string>();
    const [bookingInFocus, setBookingInFocus] = useState<{ [key: string]: boolean }>({});
    const [startTime, setStartTime] = useState<string>();
    const [endTime, setEndTime] = useState<string>();
    const today = dayjs().format("YYYY-MM-DD");
    const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");
    const [selectDate, setSelectDate] = useState<string>(today);


    const fetchRooms = () => {
            console.log("Fetching Rooms")
            axios.get('/api/room', { withCredentials: true })
            .then((response) => {
                setRooms(response.data);
                setFullRooms(response.data);
            })
            .catch((error) => {
                console.error("Error fetching rooms:", error);
            });
    }

    const ChangeBookingFocus = (roomId: string | undefined, cancel: boolean = false) => {
        if (!roomId) return;
    
        setBookingInFocus(prev => ({
            ...prev,
            [roomId]: cancel ? false : !prev[roomId] 
        }));
    };

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await axios.get("/api/users/getRole", { withCredentials: true });
                setUserId(response.data.userId)
            } catch (error) {
                console.error("Failed to fetch user role", error);
            }
        };
        fetchUserRole();
    }, []);

    const bookRoom = (roomId: string | undefined) => {
        console.log(`Booking the room.`)

        if(roomId === undefined){
            console.log("Could not find roomId")
            return
        }

        if(userId === undefined) {
            console.log('Could not find userId')
            return
        }

        if(startTime === undefined) {
            console.log('Please enter the time you intend to start your visit.')
            return
        }

        if(endTime === undefined) {
            console.log('Please enter the time you want to end your visit.')
            return
        }

        const payload = {
            userId: userId,
            roomId: roomId,
            startTime: startTime,
            endTime: endTime,
            date: selectDate
        }

        axios.post('/api/bookings', payload, { withCredentials: true })
            .then()
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
                    <Typography variant="h3" color={'primary'} sx={{fontSize: "clamp(1.35rem, 2.5vw, 2.5rem)", fontWeight: "500", width: {xs: "100vw", md: "50vw"}, padding: "0 0.5vh"}} gutterBottom>
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
                <Grow in={!!amountOfResults} >
                    <Typography variant="body2" sx={{ marginLeft: "2%", fontSize: "clamp(1rem, 2.5vw, 1.15rem)", color: (amountOfResults ? "gray" : "white"), width: "60vw"}}>
                        Your search gave back {amountOfResults} results.
                    </Typography>
                </Grow>
                {rooms.map((event : AvailableRoomsObject, index : number) => {
                    if (!event._id) return null;
                    const isFocused = bookingInFocus[event._id] || false;
                    return (
                    <Grid key={index} sx={{ width: { sm:"100vw", md: "60vw"}, borderRadius: 8}}>
                        <Card sx={{width: "100%", height: "100%", boxShadow: "none", borderRadius: 8, padding: "0.5%"}}>
                            <Paper elevation={4} sx={{height: "100%", width: "100%", border: "1px solid silver", borderRadius: 8, padding: "1%", paddingBottom: "2%"}}>
                                <CardHeader title={event.name} subheader={event.address}/>
                                <CardContent sx={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                                    <Box  sx={{width: "100%", height: "82.5%"}}>
                                        <Typography  variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(0.95rem, 2.5vw, 1rem)"}}>Opening time: <Box component={'span'} sx={{fontWeight: "500"}}>{event.roomOpens}</Box></Typography>
                                        <Typography  variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(0.95rem, 2.5vw, 1rem)"}}>Closeing time: <Box component={'span'} sx={{fontWeight: "500"}}>{event.roomCloses}</Box></Typography>
                                        <Typography  variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(0.95rem, 2.5vw, 1rem)"}}>Capacity: <Box component={'span'} sx={{fontWeight: "500"}}>{event.capacity}</Box></Typography>
                                    </Box>
                                    <Box sx={{width: "100%", height: "82.5%"}}>
                                        <Typography  variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(0.95rem, 2.5vw, 1rem)"}}>Room name or number: <Box component={'span'} sx={{fontWeight: "500"}}> {event.roomNumber}</Box></Typography>
                                        <Typography  variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(0.95rem, 2.5vw, 1rem)"}}>Type of workspace: <Box component={'span'} sx={{fontWeight: "500"}}>{event.type}</Box></Typography>
                                    </Box>
                                </CardContent>
                                <Box sx={{height: "17.5%", display: "flex", justifyContent: "space-evenly"}}>
                                    
                                    {isFocused ? 
                                        <Button variant="outlined" color="error" onClick={() => ChangeBookingFocus(event._id, true)} sx={{width:"48%", height: "5vh", borderRadius: 6, margin: 0}}>
                                            Cancel booking request
                                        </Button> :
                                        <Button variant="contained" color="secondary" onClick={() => ChangeBookingFocus(event._id)} sx={{width:"48%", height: "5vh", borderRadius: 6, margin: 0}}>
                                            Book room
                                        </Button>
                                    }
                                    <Paper elevation={6} sx={{borderRadius: 6, height: "5vh", width: "48%", border: "1px solid silver", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <Typography color="secondary" variant="h5">
                                            <PatronList eventId={event._id}/>
                                        </Typography>
                                    </Paper>
                                </Box>
                                <Grow in={isFocused} timeout={{ enter: 500, exit: 0 }} mountOnEnter unmountOnExit>
                                    <Box sx={{width: "97%", border: "1px solid silver", marginTop: "1%", marginLeft: "1.5%", borderRadius: 6, backgroundColor: "#F0F0F0"}}>
                                        <Box>
                                            <TextField
                                                variant="outlined"
                                                type="time"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                sx={{
                                                    width: "48%",
                                                    backgroundColor: "white",
                                                    margin: "1% 1%",
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: 6, 
                                                    },
                                                    "& .MuiOutlinedInput-notchedOutline": {
                                                        borderRadius: 6, 
                                                    },
                                                    "& input": { 
                                                        textAlign: "center", 
                                                        fontSize: "clamp(0.95rem, 2.5vw, 1rem)" 
                                                    },
                                                }}
                                                slotProps={{
                                                    input: { style: { textAlign: "center", marginLeft: "4px" } },
                                                }}
                                            />
                                            <TextField
                                                variant="outlined"
                                                type="time"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                                sx={{
                                                    width: "48%",
                                                    backgroundColor: "white",
                                                    margin: "1% 1%",
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: 6, 
                                                    },
                                                    "& .MuiOutlinedInput-notchedOutline": {
                                                        borderRadius: 6, 
                                                    },
                                                    "& input": { 
                                                        textAlign: "center", 
                                                        fontSize: "clamp(0.95rem, 2.5vw, 1rem)" 
                                                    },
                                                }}
                                                slotProps={{
                                                    input: { style: { textAlign: "center", marginLeft: "4px" } },
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{margin: "0% 1.5%", marginBottom: "2%", display: "flex", justifyContent: "space-evenly"}}>        
                                            <Box
                                                onClick={() => setSelectDate(today)}
                                                sx={{
                                                    borderRadius: 6,
                                                    height: "5vh",
                                                    width: "100%",
                                                    border: selectDate === today ? "1px solid #872984" : "1px solid silver",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    backgroundColor: "white",
                                                    color: selectDate === today ? "#872984" : "black",
                                                    textDecoration: selectDate === today ? "underline #872984" : "none",
                                                    cursor: "pointer",
                                                    transition: "0.3s",
                                                }}
                                            >
                                                <Typography variant="h5" sx={{ textAlign: "center", fontSize: "clamp(0.95rem, 2.5vw, 1rem)" }}>
                                                    Today
                                                </Typography>
                                            </Box>

                                            <Box
                                                onClick={() => setSelectDate(tomorrow)}
                                                sx={{
                                                    borderRadius: 6,
                                                    height: "5vh",
                                                    width: "100%",
                                                    border: selectDate === tomorrow ? "1px solid #872984" : "1px solid silver",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    margin: "0% 1.5%",
                                                    backgroundColor: "white",
                                                    color: selectDate === tomorrow ? "#872984" : "black",
                                                    textDecoration: selectDate === tomorrow ? "underline #872984" : "none",
                                                    cursor: "pointer",
                                                    transition: "0.3s",
                                                }}
                                            >
                                                <Typography variant="h5" sx={{ textAlign: "center", fontSize: "clamp(0.95rem, 2.5vw, 1rem)" }}>
                                                    Tomorrow
                                                </Typography>
                                            </Box>
                                        
                                            <TextField
                                                label="Custom Date"
                                                type="date"
                                                value={selectDate}
                                                onChange={(e) => setSelectDate(e.target.value)}
                                                InputLabelProps={{ shrink: true }}
                                                sx={{
                                                    backgroundColor: "white",
                                                    margin: "0%",
                                                    width: "100%",
                                                    cursor: "pointer",
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: 6,
                                                        height: "5vh",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    },
                                                    "& .MuiOutlinedInput-notchedOutline": {
                                                        borderRadius: 6,
                                                    },
                                                    "& .MuiInputBase-input": {
                                                        textAlign: "center",
                                                        fontSize: "clamp(0.95rem, 2.5vw, 1rem)",
                                                    },
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{
                                            borderRadius: 6,
                                            height: "5vh",
                                            width: "97%",
                                            border: "1px solid silver",
                                            display: "flex",
                                            margin: "0 1.5%",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            backgroundColor: "white", 
                                        }}>
                                            <Box sx={{width: "50%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center"}}>
                                                <Typography variant="h5" sx={{ textAlign: "center", fontSize: "clamp(0.95rem, 2.5vw, 1rem)" }}>
                                                    From {startTime} to {endTime}
                                                </Typography>
                                            </Box>
                                            <Box sx={{width: "50%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center"}}>
                                                <Typography variant="h5" sx={{ textAlign: "center", fontSize: "clamp(0.95rem, 2.5vw, 1rem)" }}>
                                                    The date: {selectDate}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Button variant="contained" onClick={() => bookRoom(event._id)} sx={{width:"97%", height: "5vh", borderRadius: 6, margin: "1.5%"}}>
                                            Submit booking
                                        </Button>
                                    </Box>
                                </Grow>
                            </Paper>
                        </Card>
                    </Grid>
                    )
                })}               
        </Grid>
    )
}