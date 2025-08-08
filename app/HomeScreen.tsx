// Updated HomeScreen with 'Booked' status greying logic

import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from './firebaseConfig';
import { Listing } from './utils/types';

const categories = [
  { key: 'House', label: 'House', icon: '🏠' },
  { key: 'Electronics', label: 'Electronics', icon: '💻' },
  { key: 'Car', label: 'Car', icon: '🚗' },
  { key: 'Toy', label: 'Toy', icon: '🧸' },
  { key: 'Equipment', label: 'Equipment', icon: '🔧' },
  { key: 'Other', label: 'Other', icon: '📦' },
];

export default function HomeScreen() {
  const [items, setItems] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [apartmentId, setApartmentId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserEmail(user.email || '');
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const aptId = userDoc.data().apartmentId;
          setApartmentId(aptId);

          const q = query(
            collection(db, 'listings'),
            where('apartmentId', '==', aptId)
          );
          const unsubListings = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Listing[];
            setItems(data);
          });

          return unsubListings;
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error: any) {
      Alert.alert('Logout Failed', error.message);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory
      ? item.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const renderItem = ({ item }: { item: Listing }) => (
    <TouchableOpacity
      style={[
        styles.card,
        item.status === 'Booked' && { opacity: 0.5 },
      ]}
      disabled={item.status === 'Booked'}
      onPress={() => router.push(`/apartment/${item.id}`)}
    >
      <Image
        source={{ uri: item.image }}
        style={{ height: 150, width: '100%' }}
        resizeMode="cover"
      />
      <View style={{ padding: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.title}</Text>
        <Text>{item.location}</Text>
        <Text style={{ color: '#2196F3', marginTop: 4 }}>₹{item.price}</Text>
        {item.status === 'Booked' && (
          <Text style={{ color: 'red', fontWeight: 'bold', marginTop: 4 }}>Booked</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, paddingTop: 30 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, marginBottom: 12 }}>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <Text style={{ color: '#2196F3', fontWeight: 'bold' }}>👤 Profile</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Search by title or location"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.input}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollCategoryRow}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            onPress={() => setSelectedCategory(selectedCategory === cat.key ? '' : cat.key)}
            style={[styles.categoryChip, selectedCategory === cat.key && styles.categoryChipSelected]}
          >
            <Text
              style={[
                styles.chipText,
                { color: selectedCategory === cat.key ? '#fff' : '#000' },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {cat.icon} {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id ?? `${item.title}-${Math.random()}`}
        contentContainerStyle={styles.contentContainer}
      />

      <TouchableOpacity
        onPress={() => router.push('/add')}
        style={styles.fab as any}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Add</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden' as 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  fab: {
    position: 'absolute' as 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 30,
  },
  categoryChip: {
    backgroundColor: '#eee',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    height: 36,
    minWidth: 90,
    maxWidth: 100,
  },
  categoryChipSelected: {
    backgroundColor: '#2196F3',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    paddingTop: 8,
  },
  scrollCategoryRow: {
    paddingHorizontal: 16,
    marginBottom: 12,
    minHeight: 48,
  },
});
