import { forwardRef } from "react";
import { Box, Paper, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";

type Roles = {
  userRole: "Owner" | "User" | "Admin";
};

const SmallNav = forwardRef<HTMLDivElement, Roles>(({ userRole }, ref) => {
  const navigate = useNavigate();

  type menuItem = {
    title: string;
    path: string;
  };

  let roleBasedItems: menuItem[] = [];

  const handleLogout = () => {
    try {
      axios.post("/logout", {}, { withCredentials: true });
      navigate("/sign-in");
      console.log("Succesfully logged out.");
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
      { title: "Account management", path: "/home-page" },
      { title: "Manager applications", path: "/home-page" },
      { title: "Available rooms", path: "/home-page" },
    ];
  }

  return (
    <Box
      ref={ref}
      sx={{
        position: "absolute",
        height: "86.5vh",
        minWidth: "100px",
        maxWidth: "500px",
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
              sx={{
                fontSize: "0.95rem",
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
      </Paper>
    </Box>
  );
});


SmallNav.displayName = "SmallNav";

export default SmallNav;