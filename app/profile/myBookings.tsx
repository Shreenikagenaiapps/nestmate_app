import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { auth, db } from '../firebaseConfig';

export default function MyBookings() {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      if (auth.currentUser) {
        const q = query(collection(db, 'bookings'), where('userId', '==', auth.currentUser.uid));
        const snap = await getDocs(q);

        const data = await Promise.all(
          snap.docs.map(async (docSnap) => {
            const data = docSnap.data();
            const listingSnap = await getDoc(doc(db, 'listings', data.listingId));
            return {
              id: docSnap.id,
              ...data,
              listing: listingSnap.exists() ? listingSnap.data() : null,
            };
          })
        );

        setBookings(data);
      }
    };
    fetch();
  }, []);

  return (
    <View style={{ padding: 16 }}>
      <Text style={styles.title}>My Bookings</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => item.listing && (
          <View style={styles.card}>
            <Image source={{ uri: item.listing.image }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.listing.title}</Text>
              <Text>From: {item.from}</Text>
              <Text>To: {item.to}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  card: { flexDirection: 'row', marginBottom: 16, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', elevation: 2 },
  image: { width: 100, height: 100 },
  info: { padding: 10, flex: 1, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: 'bold' },
});
