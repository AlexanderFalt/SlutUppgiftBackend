import { forwardRef } from "react";
import { Box, Paper, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import { socket } from "../../Realtime/socket";

type Roles = {
  userRole: "Owner" | "User" | "Admin";
};

const FullNav = forwardRef<HTMLDivElement, Roles>(({ userRole }, ref) => {
  const navigate = useNavigate();

  type menuItem = {
    title: string;
    path: string;
  };

  let roleBasedItems: menuItem[] = [];
  const API = import.meta.env.VITE_API_URL;

  const handleLogout = async() => {
    try {
      socket.disconnect()
      const response = await axios.post(`${API}/api/users/logout`, {});
      if(response.status === 200 ) {  
        navigate("/sign-in");
        console.log("Succesfully logged out.");
      }
    } catch (e) {
      console.log(e);
    }
  };

  if (userRole === "User") {
    roleBasedItems = [
      { title: "Available rooms", path: "/home-page" },
      { title: "My Bookings", path: "/bookings" },
    ];
  } else if (userRole === "Owner") {
    roleBasedItems = [
      { title: "My rooms", path: "/home-page" },
      { title: "Bookings", path: "/bookings" },
    ];
  } else if (userRole === "Admin") {
    roleBasedItems = [
      { title: "Manager applications", path: "/ManagerApplication" },
      { title: "Account management", path: "/ManageAccount" },
      { title: "Available rooms", path: "/home-page" },
      { title: "Bookings", path: "/bookings" },
    ];
  }

  return (
    <Box
      ref={ref}
      sx={{
        position: "absolute",
        height: "87.5vh",
        width: "17.5vw",
        top: "115%",
        padding: "1%",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          height: "100%",
          borderRadius: 6,
          border: "1px solid silver",
          padding: "2%",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "87.5%" }}>
          {roleBasedItems.map((event, index) => (
            <Button
              key={index}
              variant="text"
              color="secondary"
              component={Link}
              to={event.path}
              sx={{
                fontSize: "clamp(0.95rem, 2.5vw, 1rem)",
                borderRadius: 6,
                marginBottom: "2%",
                textTransform: "none",
                justifyContent: "left",
                paddingLeft: "6%",
                "&:hover": {
                  backgroundColor: "silver",
                },
              }}
            >
              {event.title}
            </Button>
          ))}
        </Box>
        <Box
          sx={{
            height: "12.5%",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Button
            variant="text"
            color="secondary"
            component={Link}
            to={"/settings"}
            sx={{
              fontSize: "clamp(0.95rem, 2.5vw, 1rem)",
              width: "14.5vw",
              borderRadius: 6,
              marginBottom: "2%",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "silver",
              },
            }}
          >
            <SettingsIcon sx={{ position: "absolute", left: "5%" }} />
            Settings
          </Button>
          <Button
            variant="text"
            color="secondary"
            onClick={handleLogout}
            sx={{
              fontSize: "clamp(0.95rem, 2.5vw, 1rem)",
              width: "14.5vw",
              borderRadius: 6,
              marginBottom: "2%",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "silver",
              },
            }}
          >
            <LogoutIcon sx={{ position: "absolute", left: "5%" }} />
            Logout
          </Button>
        </Box>
      </Paper>
    </Box>
  );
});

FullNav.displayName = "FullNav";

export default FullNav;