# Slutuppgift för Backend utveckling i Node.JS: Coworkify

En simple platform där:

- **Users** kan registerera sig och boka rum.  
- **Owners** kan ansöka, bli godkända och sedan lista/ta hand om rum.  
- **Admins** kan godkäna användare och hantera systemet.  

## Tech Stack

**Frontend** kan hittas på: https://coworkifytwo.vercel.app/

## Tech Stack

- **Frontend:** React and Material UI
- **Backend:** Node.js med Express.js.  
- **Databas:** MongoDB
- **Autentisering:** JWT och bcrypt.  
- **Caching:** Redis för att optimera hantering av ofta efterfrågade data.  
- **Realtidskommunikation:** WebSocket (via socket.io).  
- **Deployment:** Heroku för API:n och Vercel för React appen.  

## API Routes

### /api/users

| Route                 | Method | Auth  | Description                             |
|-----------------------|--------|-------|-----------------------------------------|
| `/api/users/register` | POST   | No    | Skapar konto och returnerar JWT         |
| `/api/users/login`    | POST   | No    | Loggar in och returnerar JWT            |
| `/api/users/logout`   | POST   | Yes   | Loggar ut och tar bort JWT              |
| `/api/users/getRole`  | GET    | Yes   | Hämtar information om användaren        |

### /api/room

| Route           | Method | Auth               | Description           |
|-----------------|--------|--------------------|-----------------------|
| `/api/room`     | POST   | User, Owner, Admin | Skapar ett rum        |
| `/api/room`     | GET    | User, Owner, Admin | Hämtar alla rum       |
| `/api/room/:id` | DELETE | Owner, Admin       | Tar bort ett rum      |
| `/api/room/:id` | PUT    | Owner, Admin       | Uppdaterar ett rum    |

### /api/bookings

| Route                            | Method | Auth | Description                                                         |
|----------------------------------|--------|------|---------------------------------------------------------------------|
| `/api/bookings`                  | POST   | Yes  | Skapar en bokning                                                   |
| `/api/bookings`                  | GET    | Yes  | Hämtar användarens bokningar eller alla för ägare/admin             |
| `/api/bookings/:id`              | PUT    | Yes  | Uppdaterar bokning (skaparen eller admin)                           |
| `/api/bookings/:id`              | DELETE | Yes  | Tar bort bokning (skaparen eller admin)                             |
| `/api/bookings/getBookings/:id`  | GET    | Yes  | Hämtar alla bokningar för ett specifikt rum                         |

### /api/admin

| Route                           | Method | Auth  | Description                         |
|---------------------------------|--------|-------|-------------------------------------|
| `/api/admin`                    | GET    | Admin | Hämtar alla användare               |
| `/api/admin/:id`                | DELETE | Admin | Tar bort en användare               |
| `/api/admin/role-raise`         | GET    | Admin | Hämtar väntande rollförfrågningar   |
| `/api/admin/role-raise/:id`     | PUT    | Admin | Uppdaterar en rollförfrågan         |