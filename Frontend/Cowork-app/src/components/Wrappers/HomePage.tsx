import HomePageConsumer from '../PostAuth/HomePageConsumer.tsx';
import HomePageOwner from '../PostAuth/HomePageOwner.tsx';
import NavBarAuth from '../PostAuth/NavBarAuth.tsx';

export default function HomePage() {
    const role : string = "user";

    const showHompage = () => {
        if(role === "user") {
            return <HomePageConsumer/>
        } else if(role === "owner") {
            return <HomePageOwner/>
        }
    }
    
    return (
        <>
            <NavBarAuth/>
            {showHompage()}
        </>
    )
}