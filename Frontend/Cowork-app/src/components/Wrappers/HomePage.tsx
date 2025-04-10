import { 
    CircularProgress 
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import HomePageConsumer from "../PostAuth/HomePageConsumer.tsx";
import HomePageOwner from "../PostAuth/HomePageOwner.tsx";
import HomePageAdmin from '../PostAuth/HomePageAdmin.tsx';
import NavBarAuth from "../PostAuth/NavBarAuth.tsx";
import { useSocket } from '../../Realtime/useSocket.ts';

export default function HomePage() {

    const socket = useSocket();

    useEffect(() => {
      socket.on('connect', () => {
        console.log('✅ Socket connected:', socket.id);
      });
  
      socket.on('userLoggedIn', ({ userId, username }) => {
        console.log(`✅ Received userLoggedIn event: ${username} & ${userId}`);
      });
  
      socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
      });
  
      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('userLoggedIn');
      };
    }, [socket]);

    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await axios.get("/api/users/getRole", { withCredentials: true });
                setRole(response.data.role);
            } catch (error) {
                console.error("Failed to fetch user role", error);
            }
        };
            fetchUserRole();
    }, []);

    const showHomepage = () => {
        if (role === "User") {
            return <HomePageConsumer />;
        } else if (role === "Owner") {
            return <HomePageOwner />;
        } else if (role === "Admin") {
            return <HomePageAdmin/>
        } else {
            return <CircularProgress color="secondary" sx={{position: "absolute", left: "50%", top: "50%"}}/>
        }
    };

    return (
        <>
            <NavBarAuth />
            {showHomepage()}
        </>
    );
}