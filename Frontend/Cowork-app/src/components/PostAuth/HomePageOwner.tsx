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
import CloseIcon from '@mui/icons-material/Close';
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
    const [rooms, setRooms] = useState<AvailableRoomsObject[]>([]);
    const [fullRooms, setFullRooms] = useState<AvailableRoomsObject[]>([]);
    const [roleRaise, setRoleRaise] = useState<boolean>(false);
    const [username, setUsername] = useState<string>("");
    const [roomData, setRoomData] = useState<AvailableRoomsObject>({
        address: "",
        name: "",
        roomNumber: "",
        roomOpens: "",
        roomCloses: "",
        capacity: 0,
        type: "",
      });
    const fetchRooms = () => {
            axios.get('/api/room', { withCredentials: true })
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
        const fetchUserRole = async () => {
            try {
                const response = await axios.get("/api/user-role", { withCredentials: true });
                console.log(response.data.roleRaise + " " + response.data.username);
                setRoleRaise(response.data.roleRaise);
                setUsername(response.data.username);
            } catch (error) {
                console.error("Failed to fetch user role", error);
            }
        };
    
        fetchUserRole();
    }, []);
    
    useEffect(() => {
        if (roleRaise === true) {
            fetchRooms();
        }
    }, [roleRaise]);

    useEffect(() => {
        if (username) {
            setRoomData((prevRoomData) => ({
                ...prevRoomData,
                name: username,
            }));
        }
    }, [username]);

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
        console.log(roomData)
        setRoomFieldVisablity(!roomFieldVisablity)
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

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value;
    
        if (query.trim() === "") {
          setRooms(fullRooms);
        } else {
          const filteredRooms = fullRooms.filter(room =>
            room.address.toLowerCase().includes(query.toLowerCase()) ||
            room.roomNumber.toLowerCase().includes(query.toLowerCase())
          );
          setRooms(filteredRooms);
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
                <Box sx={{ height: (roomFieldVisablity ? "50vh" : "20vh"), width: { sm:"100vw", md: "60vw"}}}>
                    
                    <Typography variant="h3" color={'primary'} sx={{fontSize: "clamp(1.65rem, 2.5vw, 3rem)", fontWeight: "500", width: {xs: "100vw", md: "50vw"}, padding: "0 0.5vh"}} gutterBottom>
                        Your listed workspaces
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
                    
                    <Button variant="contained" onClick={() => showRoomForm()} fullWidth sx={{height: "4.5vh", borderRadius: 8}}>
                        Create a new listing
                    </Button>
                    
                    <Grow in={roomFieldVisablity}  timeout={{ enter: 500, exit: 0 }} mountOnEnter unmountOnExit>
                        <Box sx={{ marginTop: "2vh" }}>
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
                                <Box sx={{width: "100%", display: "flex"}}>
                                    <Box sx={{width: {md:"95%", sm: "90%"}, display: "flex", alignItems: "center"}}>
                                        <CardHeader title={username}/>
                                    </Box>
                                    <Box sx={{width: {md:"5%", sm: "10%"}, display: "flex", alignItems: "center", cursor: "pointer"}}>
                                        <CloseIcon fontSize={'large'} onClick={() => showRoomForm()} sx={{
                                            borderRadius: 2,
                                            transition: "all 0.35s",
                                            "&:hover" : { backgroundColor: "#e0e0e0" },
                                            }}
                                            />
                                    </Box>
                                </Box>
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
                                    <Button variant="outlined" type="submit" sx={{width:"99%", height: "19.5%", borderRadius: 6, padding: 2}}>
                                        Create listing
                                    </Button>
                                </form>
                            </Paper>
                        </Card>
                        </Box>
                    </Grow>
                </Box>
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
                                    <Button variant="outlined" onClick={() => event._id && removeListing(event._id)} color="error" sx={{width:"48%", height: "100%", borderRadius: 6, margin: 0}}>
                                        <DeleteOutlineIcon/>
                                        Remove listing
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