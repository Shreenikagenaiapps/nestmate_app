// app/apartment/[id].tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { Listing } from '../utils/types';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [item, setItem] = useState<Listing | null>(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (id) {
      getDoc(doc(db, 'listings', String(id))).then((docSnap) => {
        if (docSnap.exists()) {
          setItem({ id: docSnap.id, ...docSnap.data() } as Listing);
        }
      });
    }
  }, [id]);

  if (!item) return <Text style={{ padding: 20 }}>Loading...</Text>;

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Image source={{ uri: item.image }} style={{ height: 200, borderRadius: 10, marginBottom: 16 }} />
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{item.title}</Text>
      <Text style={{ color: '#666', marginBottom: 10 }}>{item.location}</Text>
      <Text style={{ fontWeight: 'bold', color: '#85cfa6ff', marginBottom: 10 }}>₹{item.price}</Text>
      <Text style={{ marginBottom: 10 }}>{item.description}</Text>

      {/* Conditional Fields */}
      {item.availableFrom && <Text>Available From: {item.availableFrom}</Text>}
      {item.brand && <Text>Brand: {item.brand}</Text>}
      {item.model && <Text>Model: {item.model}</Text>}
      {item.fuelType && <Text>Fuel Type: {item.fuelType}</Text>}
      {item.seats && <Text>Seats: {item.seats}</Text>}

      {/* Chat Button */}
      {user && (
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/chat/[listingId]', params: { listingId: String(id) } })}
          style={{
            marginTop: 24,
            backgroundColor: '#2196F3',
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Chat About This Listing</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
