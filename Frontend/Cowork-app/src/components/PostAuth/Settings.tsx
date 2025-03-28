import { 
    Box,
    Paper, 
    Typography
} from "@mui/material";

export default function Settings() {
    return (
        <Box 
            sx={{
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                marginTop: "14vh"
            }}
        >
            <Paper 
                elevation={6} 
                sx={{ 
                    border: "1px solid silver", 
                    borderRadius: 6, 
                    height: "82.5vh", 
                    width: "40vw", 
                    padding: 3, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    textAlign: "center",

                }}
            >
                <Typography variant="h4">Settings</Typography>
            </Paper>
        </Box>
    );
}