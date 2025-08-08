// app/listing.tsx
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from './firebaseConfig';

export default function ListingScreen() {
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [apartmentId, setApartmentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserApartment = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        setApartmentId(userData.apartmentId);
      }
    };

    fetchUserApartment();
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      if (!apartmentId) return;

      const q = query(collection(db, 'listings'), where('apartmentId', '==', apartmentId));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setListings(items);
    };

    fetchListings();
  }, [apartmentId]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/listing/${item.id}`)}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <Text>{item.category}</Text>
      <Text>₹{item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Listings</Text>
      <FlatList
        data={listings}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  image: {
    height: 180,
    borderRadius: 6,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
