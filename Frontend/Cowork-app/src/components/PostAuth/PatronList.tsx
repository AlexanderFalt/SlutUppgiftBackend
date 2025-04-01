import { Box, CircularProgress, Avatar, AvatarGroup } from '@mui/material';
import { useState, useEffect } from 'react';

type BookingAvatar = {
  username: string;
};

export default function PatronList({ eventId }: { eventId: string }) {
  const [bookingAvatar, setBookingAvatar] = useState<BookingAvatar[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoomBookings() {
      setLoading(true);
      setError(null);
      try {
        const data = await ReturnTheBookings(eventId);
        setBookingAvatar(data);
      } catch (err) {
        console.error(err);
        setBookingAvatar([]);
        setError('Could not fetch bookings');
      } finally {
        setLoading(false);
      }
    }
    fetchRoomBookings();
  }, [eventId]);

  if (loading) {
    return (
      <Box
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <CircularProgress color="secondary" size={16} />
      </Box>
    );
  }

  if (error) {
    return null;
  }

  if (bookingAvatar.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <AvatarGroup
        max={3}
        slotProps={{
          additionalAvatar: {
            sx: {
              height: 32,
              width: 32,
              fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)'
            }
          }
        }}
      >
        {bookingAvatar.map((user) => (
          <Avatar
            key={user.username}
            src={user.username}
            sx={{
              width: 32,
              height: 32,
              bgcolor: '#B57EDC',
              border: '1px solid silver',
              fontWeight: 400
            }}
          >
            {user.username[0].toUpperCase()}
          </Avatar>
        ))}
      </AvatarGroup>
    </Box>
  );
}

async function ReturnTheBookings(roomId: string): Promise<BookingAvatar[]> {
  const response = await fetch(`/api/bookings/getBookings/${roomId}`);
  const data = await response.json();
  return data.bookings;
}