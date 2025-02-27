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
    TextField
} from "@mui/material";
import { useState } from "react";
import Grid from '@mui/material/Grid2';
import SearchIcon from '@mui/icons-material/Search';

export default function HomePage() {
    
    type AvailableRoomsObject = {
        adress: string,
        company: string,
        roomNumber: number,
        roomOpens: string,
        roomCloses: string,
        bookingStatus: boolean,
        capacity: number,
        typeOfWorkspace: string,
    }

    const [rooms, setRooms] = useState<AvailableRoomsObject[]>([
        {
            adress: "Södrakungsvägen 8",
            company: "WeWorks",
            roomNumber: 1,
            roomOpens: "8:00", 
            roomCloses: "17:30",
            bookingStatus: true,
            capacity: 5,
            typeOfWorkspace: "Konferencerum",
        },
        {
            adress: "Norrtäljevägen 15",
            company: "SuperWorkers",
            roomNumber: 2,
            roomOpens: "7:00", 
            roomCloses: "18:00",
            bookingStatus: false,
            capacity: 8,
            typeOfWorkspace: "Arbetsplats",
        },
        {
            adress: "Östermalmgatan 3",
            company: "Workify",
            roomNumber: 3,
            roomOpens: "8:00", 
            roomCloses: "20:00",
            bookingStatus: false,
            capacity: 10,
            typeOfWorkspace: "Konferencerum",
        },
        {
            adress: "Drottninggatan 47",
            company: "Weworks",
            roomNumber: 4,
            roomOpens: "8:00", 
            roomCloses: "17:30",
            bookingStatus: false,
            capacity: 6,
            typeOfWorkspace: "Arbetsplats",
        },
        {
            adress: "Göttavägen 17",
            company: "Weworks",
            roomNumber: 5,
            roomOpens: "8:00", 
            roomCloses: "17:30",
            bookingStatus: false,
            capacity: 8,
            typeOfWorkspace: "Konferencerum",
        },
    ])

    const changeBookingStatusToTrue = (room: AvailableRoomsObject) => {
        setRooms((prevRooms : AvailableRoomsObject[]) =>
          prevRooms.map((r) => 
            r.adress === room.adress 
              ? { ...r, bookingStatus: true } 
              : r
          )
        );
    };

    const changeBookingStatusToFalse = (room: AvailableRoomsObject) => {
        setRooms((prevRooms : AvailableRoomsObject[]) =>
          prevRooms.map((r) => 
            r.adress === room.adress 
              ? { ...r, bookingStatus: false } 
              : r
          )
        );
    };

    return(
        <Grid container spacing={5} sx={{
            marginTop: "10vh",
            paddingTop: "5vh",
            width: "100%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            flexDirection: "column",
            }}>
                <Box sx={{ height: "20vh", width: { sm:"100vw", md: "60vw"}, margin: "0 0 4vh 0"}}>
                    <Typography variant="h3" color={'primary'} sx={{fontSize: "clamp(1.65rem, 2.5vw, 3rem)", fontWeight: "500", width: {xs: "100vw", md: "50vw"}, padding: "0 0.5vh"}} gutterBottom>
                        Find your workspace.
                    </Typography>
                    <FormControl fullWidth sx={{ borderRadius: 8, textAlign: "center", marginBottom: "2vh"}}>
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
                    <Box sx={{display: "flex", width: "100%"}}>
                        <Typography variant="h6" sx={{width: "49%", padding: "0 1.75vh"}}>Start date: </Typography>
                        <Typography variant="h6" sx={{width: "49%", padding: "0 1.75vh"}}>End date: </Typography>
                    </Box>
                    <Box sx={{display: "flex", width: "100%"}}>
                        <TextField type='date' variant="outlined" fullWidth
                            sx={{
                                borderRadius: 8,
                                '& .MuiOutlinedInput-notchedOutline': {
                                borderRadius: 8,
                                }
                            }}
                            >

                        </TextField>
                        <TextField type='date' variant="outlined" fullWidth
                            sx={{
                                borderRadius: 8,
                                '& .MuiOutlinedInput-notchedOutline': {
                                borderRadius: 8,
                                }
                            }}
                            >

                        </TextField>
                    </Box>
                </Box>
                {rooms.map((event : AvailableRoomsObject, index : number) => (
                    <Grid key={index} sx={{height: "30vh", width: { sm:"100vw", md: "60vw"}, borderRadius: 8}}>
                        <Card sx={{width: "100%", height: "100%", boxShadow: "none", borderRadius: 8, padding: "0.5%"}}>
                            <Paper elevation={4} sx={{height: "100%", width: "100%", border: "1px solid silver", borderRadius: 8, padding: "1%"}}>
                                <CardHeader title={event.company} subheader={event.adress}/>
                                <CardContent sx={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                                    <Box  sx={{width: "100%", height: "82.5%"}}>
                                        <Typography  variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(1rem, 2.5vw, 1.25rem)"}}>Opening time: <Box component={'span'} sx={{fontWeight: "500"}}>{event.roomOpens}</Box></Typography>
                                        <Typography  variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(1rem, 2.5vw, 1.25rem)"}}>Closeing time: <Box component={'span'} sx={{fontWeight: "500"}}>{event.roomCloses}</Box></Typography>
                                        <Typography  variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(1rem, 2.5vw, 1.25rem)"}}>Capacity: <Box component={'span'} sx={{fontWeight: "500"}}>{event.capacity}</Box></Typography>
                                    </Box>
                                    <Box sx={{width: "100%", height: "82.5%"}}>
                                        <Typography  variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(1rem, 2.5vw, 1.25rem)"}}>Room name or number: <Box component={'span'} sx={{fontWeight: "500"}}> {event.roomNumber}</Box></Typography>
                                        <Typography  variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(1rem, 2.5vw, 1.25rem)"}}>Type of workspace: <Box component={'span'} sx={{fontWeight: "500"}}>{event.typeOfWorkspace}</Box></Typography>
                                    </Box>
                                </CardContent>
                                <Box sx={{height: "17.5%"}}>
                                    {event.bookingStatus ? 
                                        (
                                            <Box sx={{display: "flex", height: "100%"}}>
                                                <Button variant="outlined" sx={{width:"50%", height: "100%", borderTopRightRadius: 0, borderBottomRightRadius: 0, borderTopLeftRadius: 16, borderBottomLeftRadius: 16}}>
                                                    Update booking
                                                </Button>
                                                <Button variant="contained" onClick={() => changeBookingStatusToFalse(event)} sx={{width:"49.8%", height: "100%", borderTopRightRadius: 16, borderBottomRightRadius: 16, borderTopLeftRadius: 0, borderBottomLeftRadius: 0}}>
                                                    Delete booking
                                                </Button>
                                            </Box>
                                        ) :
                                        (
                                            <Button variant="outlined" onClick={() => changeBookingStatusToTrue(event)} sx={{width:"99%", height: "100%", borderRadius: 6}}>
                                                Book room
                                            </Button>
                                        )
                                    }
                                </Box>
                            </Paper>
                        </Card>
                    </Grid>
                ))}               
        </Grid>
    )
}