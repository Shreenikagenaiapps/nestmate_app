import { Feather, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../firebaseConfig';

export default function ProfileScreen() {
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [apartments, setApartments] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/login');
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setProfile({ id: user.uid, ...userSnap.data() });
        }

        const snapshot = await getDocs(collection(db, 'apartments'));
        const options = snapshot.docs.map((doc) => ({
          label: doc.data().name || doc.id,
          value: doc.id,
        }));
        setApartments(options);

        setLoading(false);
      } catch (error) {
        console.error('Error loading profile:', error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    router.replace('/login');
  };

  const handleSave = async () => {
    if (!profile?.name || !profile?.apartmentId) {
      Alert.alert('Please fill all required fields.');
      return;
    }

    try {
      const userRef = doc(db, 'users', profile.id);
      await updateDoc(userRef, {
        name: profile.name,
        phone: profile.phone ?? '',
        apartmentId: profile.apartmentId,
      });

      Alert.alert('✅ Profile updated');
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('❌ Failed to update');
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Profile</Text>

      {/* 👤 Info Section */}
      {profile && !editing && (
        <View style={styles.infoBox}>
          <Text style={styles.label}>
            <Feather name="user" size={16} /> Name: {profile.name ?? '—'}
          </Text>
          <Text style={styles.label}>
            <MaterialIcons name="email" size={16} /> Email: {auth.currentUser?.email ?? '—'}
          </Text>
          <Text style={styles.label}>
            <Feather name="phone" size={16} /> Phone: {profile.phone ?? '—'}
          </Text>
          <Text style={styles.label}>
            🏢 Apartment:{' '}
            {apartments.find((apt) => apt.value === profile.apartmentId)?.label || '—'}
          </Text>
        </View>
      )}

      {/* ✏️ Edit Form */}
      {profile && editing && (
        <View style={styles.editBox}>
          <TextInput
            placeholder="Name"
            value={profile.name}
            onChangeText={(text) => setProfile({ ...profile, name: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Phone"
            value={profile.phone ?? ''}
            onChangeText={(text) => setProfile({ ...profile, phone: text })}
            style={styles.input}
            keyboardType="phone-pad"
          />
          <Picker
            selectedValue={profile.apartmentId}
            onValueChange={(value) =>
              setProfile({ ...profile, apartmentId: value })
            }
            style={styles.input}
          >
            <Picker.Item label="Select Apartment" value="" />
            {apartments.map((apt) => (
              <Picker.Item key={apt.value} label={apt.label} value={apt.value} />
            ))}
          </Picker>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Feather name="check" size={18} />
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#eee' }]}
              onPress={() => setEditing(false)}
            >
              <Feather name="x" size={18} />
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 📍 Action Buttons */}
      {!editing && (
        <>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={() => setEditing(true)}>
              <Feather name="edit" size={18} />
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/profile/myListings')}
            >
              <Feather name="list" size={18} />
              <Text style={styles.buttonText}>My Listings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/profile/myBookings')}
            >
              <Feather name="calendar" size={18} />
              <Text style={styles.buttonText}>My Bookings</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={logout}
            style={[styles.button, { backgroundColor: '#fdd' }]}
          >
            <Feather name="log-out" size={18} color="red" />
            <Text style={[styles.buttonText, { color: 'red' }]}>Logout</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  infoBox: {
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
  },
  editBox: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#e0f2ff',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
