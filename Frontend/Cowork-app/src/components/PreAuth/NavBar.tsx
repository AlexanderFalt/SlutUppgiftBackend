import {
    AppBar,
    Typography
} from '@mui/material';

export default function NavBar() {
    return(
        <AppBar position={'static'} color={'secondary'} sx={{padding: "1%"}}>
            <Typography variant='h2' sx={{fontWeight: "700"}}>
                Coworkify
            </Typography>
        </AppBar>
    )
}