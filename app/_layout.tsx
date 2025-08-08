import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        animation: 'slide_from_right',
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Nest Mate' }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="add" options={{ title: 'Add Listing' }} />

      {/* Listings */}
      <Stack.Screen name="listing/[id]" options={{ title: 'Edit Listing' }} />

      {/* Chat */}
      <Stack.Screen name="chat/[listingId]" options={{ title: 'Chat' }} />
      <Stack.Screen name="chat/index" options={{ title: 'My Chats' }} />

      {/* Profile Section */}
      <Stack.Screen name="profile/index" options={{ title: 'My Profile' }} />
      <Stack.Screen name="profile/edit" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="profile/myListings" options={{ title: 'My Listings' }} />
      <Stack.Screen name="profile/myBookings" options={{ title: 'My Bookings' }} />

      {/* Apartment Routes (optional) */}
      <Stack.Screen name="apartment/[id]" options={{ title: 'Item details' }} />
      <Stack.Screen name="apartment/listing" options={{ title: 'Item details' }} />
    </Stack>
  );
}
