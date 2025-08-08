// app/listing/[id].tsx
import { Stack, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { Listing } from '../utils/types';

export default function ListingDetails() {
  const { id } = useLocalSearchParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const snap = await getDoc(doc(db, 'listings', id as string));
        if (snap.exists()) {
          setListing({ id: snap.id, ...snap.data() } as Listing);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching listing:', err);
        setLoading(false);
      }
    };

    if (id) fetchListing();
  }, [id]);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 50 }} />;
  }

  if (!listing) {
    return <Text style={{ padding: 20 }}>Listing not found.</Text>;
  }

  const isOwner = currentUser?.uid === listing.ownerId;
  const isBooked = listing.status === 'Booked';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: 'Listing Details' }} />

      {listing.image && (
        <Image source={{ uri: listing.image }} style={styles.image} />
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.location}>{listing.location}</Text>
        <Text style={styles.price}>₹ {listing.price}</Text>

        {/* Status */}
        <View style={[styles.statusBadge, { backgroundColor: isBooked ? '#ef5350' : '#4caf50' }]}>
          <Text style={styles.statusText}>{isBooked ? 'Booked' : 'Available'}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.description}>{listing.description}</Text>
          {listing.availableFrom && (
            <Text style={styles.label}>Available From: <Text style={styles.value}>{listing.availableFrom}</Text></Text>
          )}
        </View>

        {!isOwner && !isBooked && (
          <TouchableOpacity style={styles.chatButton}>
            <Text style={styles.chatText}>Chat About This Listing</Text>
          </TouchableOpacity>
        )}

        {isBooked && !isOwner && (
          <Text style={styles.bookedNote}>This listing is already booked.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 100,
    backgroundColor: '#f8f8f8',
  },
  image: {
    width: '100%',
    height: 220,
    backgroundColor: '#ddd',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    marginTop: -20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    color: '#4caf50',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 6,
  },
  description: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#555',
  },
  value: {
    fontWeight: '600',
    color: '#000',
  },
  chatButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  chatText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  bookedNote: {
    marginTop: 10,
    color: 'red',
    fontStyle: 'italic',
  },
});
