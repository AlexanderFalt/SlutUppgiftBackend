import { 
    CircularProgress 
} from "@mui/material";
import { useEffect, useState } from "react";
import api from '../../axiosInstance.ts';
import HomePageConsumer from "../PostAuth/HomePageConsumer.tsx";
import HomePageOwner from "../PostAuth/HomePageOwner.tsx";
import HomePageAdmin from '../PostAuth/HomePageAdmin.tsx';
import NavBarAuth from "../PostAuth/NavBarAuth.tsx";

export default function HomePage() {
    const API = import.meta.env.VITE_API_URL;
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await api.get(`${API}/api/users/getRole`);
                setRole(response.data.role);
            } catch (error) {
                console.error("Failed to fetch user role", error);
            }
        };
            fetchUserRole();
    }, [API]);

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