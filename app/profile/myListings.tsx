import { useRouter } from 'expo-router';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../firebaseConfig';

export default function MyListings() {
  const [listings, setListings] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetch = async () => {
      if (auth.currentUser) {
        const q = query(
          collection(db, 'listings'),
          where('ownerId', '==', auth.currentUser.uid)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setListings(data);
      }
    };
    fetch();
  }, []);

  const toggleBooking = async (listingId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Available' ? 'Booked' : 'Available';

    try {
      await updateDoc(doc(db, 'listings', listingId), { status: newStatus });
      setListings((prev) =>
        prev.map((item) =>
          item.id === listingId ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (listingId: string) => {
    try {
      await deleteDoc(doc(db, 'listings', listingId));
      setListings((prev) => prev.filter((item) => item.id !== listingId));
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={styles.title}>My Listings</Text>

      {listings.length === 0 && (
        <Text style={{ color: 'gray', marginBottom: 16 }}>No listings found.</Text>
      )}

      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{
                uri: item.image || 'https://via.placeholder.com/100',
              }}
              style={styles.image}
            />
            <View style={styles.info}>
              <Text style={styles.name}>{item.title}</Text>
              <Text>₹{item.price}</Text>
              <Text>Status: {item.status}</Text>

              {/* ✅ Final 3-Button Row */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  onPress={() => router.push(`/listing/${item.id}`)}
                  style={[styles.actionButton, { backgroundColor: '#64b5f6' }]}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => toggleBooking(item.id, item.status)}
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor:
                        item.status === 'Booked' ? '#81e291' : '#fdd835',
                    },
                  ]}
                >
                  <Text style={styles.buttonText}>
                    {item.status === 'Booked' ? 'Available' : 'Booked'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDelete(item.id)}
                  style={[styles.actionButton, { backgroundColor: '#ef5350' }]}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    width: 100,
    height: 100,
  },
  info: {
    padding: 10,
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 13,
  },
});
