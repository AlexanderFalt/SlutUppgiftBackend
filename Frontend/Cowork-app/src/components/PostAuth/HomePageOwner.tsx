import { 
    Paper,
    Card,
    CardHeader,
    CardContent,
    Box,
    Typography,
    Button,
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment,
    Grow,
    TextField,
    Select,
    MenuItem
} from "@mui/material";
import { useState, useEffect } from "react";
import Grid from '@mui/material/Grid2';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
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
    const [roomFieldVisablity, setRoomFieldVisablity] = useState(false);
    const temporary = "Wework"; // Temporarly name the company.
    const [rooms, setRooms] = useState<AvailableRoomsObject[]>([]);
    const [roomData, setRoomData] = useState<AvailableRoomsObject>({
        address: "",
        name: temporary,
        roomNumber: "",
        roomOpens: "",
        roomCloses: "",
        capacity: 0,
        type: "",
      });

    const fetchRooms = () => {
            axios.get('/api/room')
            .then((response) => {
                // Assuming your API returns an array of rooms that match AvailableRoomsObject
                console.log(response.data);
                setRooms(response.data);
            })
            .catch((error) => {
                console.error("Error fetching rooms:", error);
            });
    }

    useEffect(() => {
        fetchRooms();
    }, []);

    const createListing = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (roomData.type === "") { /* OBS! : Make this part a little prettier */
            console.log(`ERR: Can't send the type was never defined.`)
            return
        }
        if (roomData.capacity === 0) {
            console.log(`ERR: A room can't have capacity of zero people.`)
            return
        }
        if (roomData.address === "") {
            console.log(`ERR: Address need's to be defined.`)
            return
        }
        if (roomData.roomNumber === "") {
            console.log(`ERR: Need to say what the room is called.`)
            return
        }
        if (roomData.roomOpens === "") {
            console.log(`ERR: Need to write when the room opens.`)
            return
        }
        if (roomData.roomCloses === "") {
            console.log(`ERR: Need to say when the room closes.`)
            return
        }
        axios.post('/api/room', roomData)
            .then((response) => {
                console.log(response)
                fetchRooms()
            })
            .catch((err) => {
                console.log(err)
            })
    }

    const removeListing = (id : string) => {
        if (id !== undefined) {
            axios.delete(`api/room/${id}`)
            .then((response) => {
                console.log(response)
                fetchRooms()
            })
            .catch((error) => {
                console.error(error)
            })
        }
    }

    const showRoomForm = () => {
        setRoomFieldVisablity(!roomFieldVisablity)
    }

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
                <Box sx={{ height: (roomFieldVisablity ? "50vh" : "20vh"), width: { sm:"100vw", md: "60vw"}}}>
                    
                    <Typography variant="h3" color={'primary'} sx={{fontSize: "clamp(1.65rem, 2.5vw, 3rem)", fontWeight: "500", width: {xs: "100vw", md: "50vw"}, padding: "0 0.5vh"}} gutterBottom>
                        Your listed workspaces
                    </Typography>
                    
                    <FormControl fullWidth sx={{ borderRadius: 8, textAlign: "center"}}>
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
                    
                    <Button variant="contained" onClick={() => showRoomForm()} fullWidth sx={{height: "4.5vh", borderRadius: 8}}>
                        Create a new listing
                    </Button>
                    
                    <Grow in={roomFieldVisablity}  timeout={{ enter: 500, exit: 0 }} mountOnEnter unmountOnExit>
                        <Box sx={{ height: "30vh", marginTop: "2vh" }}>
                        <Card
                            sx={{
                            width: "100%",
                            height: "100%",
                            boxShadow: "none",
                            borderRadius: 8,
                            padding: "0.5%"
                            }}
                        >
                            <Paper
                            elevation={4}
                            sx={{
                                height: "100%",
                                width: "100%",
                                border: "1px solid silver",
                                borderRadius: 8,
                                padding: "1%"
                            }}
                            >
                                <CardHeader title={temporary} />
                                <form onSubmit={createListing}>
                                    <CardContent sx={{display: "flex", justifyContent: "center"}}>
                                        <Box  sx={{width: "100%", height: "85.5%"}}>
                                            <Box sx={{display: "flex", alignItems: "center"}}>
                                                <Typography variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(1rem, 2.5vw, 1.25rem)"}}>Opening time:</Typography>
                                                <TextField variant="standard" value={roomData.roomOpens} type="time" sx={{width: "30%"}} slotProps={{input: { style: { marginLeft: '4px', fontSize: "clamp(1rem, 2.5vw, 1.25rem)" }, }, }}
                                                    onChange={(e) => {
                                                        setRoomData((prev) => ({
                                                        ...prev, 
                                                        roomOpens: e.target.value, 
                                                        }))}
                                                    }/>
                                            </Box>
                                            <Box sx={{display: "flex", alignItems: "center"}}>
                                                <Typography variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(1rem, 2.5vw, 1.25rem)"}}>Closing time:</Typography>
                                                <TextField variant="standard" value={roomData.roomCloses} type="time" sx={{width: "30%"}} slotProps={{input: { style: { marginLeft: '4px', fontSize: "clamp(1rem, 2.5vw, 1.25rem)" }, }, }}
                                                    onChange={(e) =>
                                                        setRoomData((prev) => ({
                                                        ...prev,
                                                        roomCloses: e.target.value, 
                                                        }))
                                                    }/>
                                            </Box>
                                            <Box sx={{display: "flex", alignItems: "center"}}>
                                                <Typography variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(1rem, 2.5vw, 1.25rem)"}}>Capacity:</Typography>
                                                <TextField variant="standard" type="number" value={roomData.capacity} slotProps={{input: { style: { marginLeft: '4px', fontSize: "clamp(1rem, 2.5vw, 1.25rem)" }, }, }}
                                                    onChange={(e) =>
                                                        setRoomData((prev) => ({
                                                        ...prev,
                                                        capacity: Number(e.target.value), 
                                                        }))
                                                    }/>
                                            </Box>
                                        </Box>
                                        <Box sx={{width: "100%", height: "82.5%"}}>
                                            <Box sx={{display: "flex", alignItems: "center"}}>
                                                <Typography  variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(1rem, 2.5vw, 1.25rem)"}}>Room name or number:</Typography>
                                                <TextField variant="standard" value={roomData.roomNumber} slotProps={{input: { style: { marginLeft: '4px', fontSize: "clamp(1rem, 2.5vw, 1.25rem)" }, }, }}
                                                    onChange={(e) =>
                                                        setRoomData((prev) => ({
                                                        ...prev,
                                                        roomNumber: e.target.value, 
                                                        }))
                                                    }/>
                                            </Box>
                                            <Box sx={{display: "flex", alignItems: "center"}}>
                                                <Typography  variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(1rem, 2.5vw, 1.25rem)"}}>Type of workspace:</Typography>
                                                <Select value={roomData.type} variant="standard" sx={{width: "30%", fontSize: "clamp(1rem, 2.5vw, 1.25rem)", marginLeft: '6px'}}
                                                    onChange={(e) => 
                                                        setRoomData((prev) => ({
                                                            ...prev,
                                                            type: e.target.value as "" | "workspace" | "conference",
                                                        }))
                                                    }
                                                    >
                                                    <MenuItem value={""}>
                                                        <em>None</em>
                                                    </MenuItem>
                                                    <MenuItem value={"workspace"}>Workspace</MenuItem>
                                                    <MenuItem value={"conference"}>Conference</MenuItem>
                                                </Select>
                                            </Box>
                                            <Box sx={{display: "flex", alignItems: "center"}}>
                                                <Typography  variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(1rem, 2.5vw, 1.25rem)"}}>Location:</Typography>
                                                <TextField variant="standard" value={roomData.address} slotProps={{input: { style: { marginLeft: '4px', fontSize: "clamp(1rem, 2.5vw, 1.25rem)" }, }, }}
                                                    onChange={(e) =>
                                                        setRoomData((prev) => ({
                                                        ...prev,
                                                        address: e.target.value, 
                                                        }))
                                                    }/>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                    <Button variant="outlined" type="submit" sx={{width:"99%", height: "19.5%", borderRadius: 6}}>
                                        Create listing
                                    </Button>
                                </form>
                            </Paper>
                        </Card>
                        </Box>
                    </Grow>
                </Box>
                {Array.isArray(rooms) && rooms.map((event : AvailableRoomsObject, index : number) => (
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
                                    <Button variant="outlined" onClick={() => event._id && removeListing(event._id)} color="error" sx={{width:"32%", height: "100%", borderRadius: 6, margin: 0}}>
                                        <DeleteOutlineIcon/>
                                        Remove listing
                                    </Button>
                                    <Button variant="contained" color="secondary" sx={{width:"32%", height: "100%", borderRadius: 6, margin: 0}}>
                                        Update listing
                                    </Button>
                                    <Paper elevation={6} sx={{borderRadius: 6, height: "100%", width: "32%", border: "1px solid silver", display: "flex", justifyContent: "center", alignItems: "center" }}>
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