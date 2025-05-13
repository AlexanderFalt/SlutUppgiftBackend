import { 
    Box,
    Paper,
    Card,
    CardHeader,
    CardContent,
    Button,
    Typography,
    Grow,
    TextField
} from "@mui/material";
import PatronList from './PatronList.tsx';
import Grid from '@mui/material/Grid2'
import api from '../../axiosInstance.ts';
import { useState, useEffect, useCallback } from 'react';
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export default function Bookings() {
    type bookingFormat = {
        _id: string,
        userId: string,
        roomId: string,
        startTime: Date,
        endTime: Date,
        roomInfo: {
            _id: string,
            address: string,
            name: string,
            roomNumber: string,
            roomOpens: string,
            roomCloses: string,
            capacity: number,
            type: string
        }
        userInfo: {
            username: string,
            name: string,
        }
    }

    const today = dayjs().format("YYYY-MM-DD");
    const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");
    const [selectDate, setSelectDate] = useState<string>(today);
    const [bookings, setBookings] = useState<bookingFormat[]>([]);
    const [bookingInFocus, setBookingInFocus] = useState<{ [key: string]: boolean }>({});
    const [startTime, setStartTime] = useState<string>();
    const [endTime, setEndTime] = useState<string>();
    const API = import.meta.env.VITE_API_URL;
        
    const fetchBookings = useCallback(async () => {
        try {
            const response = await api.get(`${API}/api/bookings`);
            console.log(response.data)
            const formattedBookings = response.data.bookings.map((booking: bookingFormat) => ({
                ...booking,
                startTime: new Date(booking.startTime),  
                endTime: new Date(booking.endTime),
            }));
            
            setBookings(formattedBookings);
        } catch (error) {
            console.log(`Error that came up ${error}`);
        }
    }, [API]);

    const ChangeBookingFocus = (bookingId: string | undefined, cancel: boolean = false) => {
        if (!bookingId) return;
    
        const bookingToUpdate = bookings.find((booking) => booking._id === bookingId);
        
        if (bookingToUpdate) {
            setStartTime(dayjs(bookingToUpdate.startTime).format("HH:mm"));
            setEndTime(dayjs(bookingToUpdate.endTime).format("HH:mm"));
        }
    
        setBookingInFocus((prev) => ({
            ...prev,
            [bookingId]: cancel ? false : !prev[bookingId],
        }));
    };

    const updateBooking = async(id: string, endTime: string | undefined, startTime: string | undefined, selectDate: string | undefined) => {
        try {
            const payload = {
                endTime,
                startTime,
                selectDate
            }
            await api.put(`${API}/api/bookings/${id}`, payload);
            fetchBookings();
        } catch(error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]); 
    
    const removeBooking = async (id: string) => {
        try {
            await api.delete(`${API}/api/bookings/${id}`);
            fetchBookings();
        } catch (e) {
            console.error("Error deleting booking:", e);
            alert("There was an error deleting the booking. Please try again.");
        }
    };
    
    return (
        <Grid container sx={{
            marginTop: "10vh",
            paddingTop: "5vh",
            width: "100%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            flexDirection: "column",
        }}>
            <Box sx={{ width: { sm: "100vw", md: "60vw" }}}>
                {bookings && bookings.map((booking, index) => {
                    console.log(booking)
                    if (!booking._id) return null;
                    if (!booking.roomInfo) return null;
                    if (!booking.userInfo) return null;
                    const isFocused = bookingInFocus[booking._id] || false;
                    const localStartTime = dayjs.utc(booking.startTime).local().format("HH:mm");
                    const localEndTime = dayjs.utc(booking.endTime).local().format("HH:mm");
                    const date = dayjs.utc(booking.startTime).local().format("YYYY-MM-DD");

                    return (
                    <Grid key={index} sx={{width: "100%", marginBottom: "2%"}}>
                        <Paper elevation={6} sx={{width: "100%", height: "100%", borderRadius: 6, padding: "1.5%", border: "1px solid silver"}}>
                            <Card sx={{border: "1px solid transparent", marginBottom: "1%", boxShadow: "none"}}>
                                <CardHeader title={booking.roomInfo.name} subheader={booking.roomInfo.address}/>
                                <CardContent sx={{display: "flex"}}>
                                    <Box sx={{width: "50%"}}>
                                        <Typography variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(0.95rem, 2.5vw, 1rem)"}}> Your booking starts at: <Box component={'span'} sx={{fontWeight: "500"}}>{localStartTime}</Box></Typography>
                                        <Typography variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(0.95rem, 2.5vw, 1rem)"}}> Your booking ends at: <Box component={'span'} sx={{fontWeight: "500"}}>{localEndTime}</Box></Typography>
                                        <Typography variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(0.95rem, 2.5vw, 1rem)"}}> Your booking is at: <Box component={'span'} sx={{fontWeight: "500"}}>{date}</Box></Typography>
                                    </Box>
                                    <Box sx={{width: "50%"}}>
                                        <Typography variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(0.95rem, 2.5vw, 1rem)"}}> Opening times: <Box component={'span'} sx={{fontWeight: "500"}}>{booking.roomInfo.roomOpens} - {booking.roomInfo.roomCloses}</Box></Typography>
                                        <Typography variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(0.95rem, 2.5vw, 1rem)"}}> Room: <Box component={'span'} sx={{fontWeight: "500"}}>{booking.roomInfo.roomNumber}</Box></Typography>
                                        <Typography variant="body1" sx={{color: "#282828", fontWeight: "400", fontSize: "clamp(0.95rem, 2.5vw, 1rem)"}}> Name: <Box component={'span'} sx={{fontWeight: "500"}}>{booking.userInfo?.name ? booking.userInfo.name : booking.userInfo?.username ?? "Unknown user" }</Box></Typography>

                                    </Box>
                                </CardContent>
                            </Card>
                            <Box sx={{display: "flex"}}>
                                { isFocused ? (
                                    <Button variant="outlined" color="error" onClick={() => ChangeBookingFocus(booking._id, true)} sx={{width:"80%", height: "5vh", borderRadius: 6, margin: 0, marginLeft: "0.75%"}}> 
                                        Cancel booking update 
                                    </Button>
                                ) : (
                                    <>
                                        <Button variant="outlined" color="error" onClick={() => removeBooking(booking._id)} sx={{width:"40%", height: "5vh", borderRadius: 6, margin: 0, marginRight: "1.5%"}}>
                                            Cancel booking
                                        </Button>
                                        <Button variant="outlined" color="info" onClick={() => ChangeBookingFocus(booking._id)} sx={{width:"40%", height: "5vh", borderRadius: 6, margin: 0}}>
                                            Update booking
                                        </Button>
                                    </>
                                )
                                }
                                <Paper elevation={6} sx={{borderRadius: 6, height: "5vh", width: "16%", border: "1px solid silver", display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "1.5%" }}>
                                    <PatronList eventId={booking.roomId}/>
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
                                                inputLabel: {
                                                    shrink: true,
                                                  },
                                                  htmlInput: {
                                                      min: '00:00',
                                                      max: '24:00',
                                                      step: 60,
                                                  }
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
                                                inputLabel: {
                                                    shrink: true,
                                                  },
                                                  htmlInput: {
                                                      min: '00:00',
                                                      max: '24:00',
                                                      step: 60,
                                                  }
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
                                    <Button variant="contained" onClick={() => updateBooking(booking._id, endTime, startTime, selectDate)} sx={{width:"97%", height: "5vh", borderRadius: 6, margin: "1.5%"}}>
                                        Update booking
                                    </Button>
                                </Box>
                            </Grow>
                        </Paper>
                    </Grid>
                   )
                })}
            </Box>
        </Grid>
    );
}