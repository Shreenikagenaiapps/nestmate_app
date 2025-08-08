import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { auth, db } from '../firebaseConfig';

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [apartments, setApartments] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const router = useRouter();

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
          setUserData({ id: user.uid, ...userSnap.data() });
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

  const handleUpdate = async () => {
    if (!userData?.name || !userData?.apartmentId) {
      Alert.alert('Please fill all fields.');
      return;
    }

    try {
      const userRef = doc(db, 'users', userData.id);
      await updateDoc(userRef, {
        name: userData.name,
        apartmentId: userData.apartmentId,
      });

      Alert.alert('Success', 'Profile updated.');
      setEditing(false);
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 50 }} />;
  }

  if (!userData) {
    return <Text style={styles.text}>User not found</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>My Profile</Text>

      {/* Email (read-only) */}
      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={[styles.input, { backgroundColor: '#eee' }]}
        value={userData.email}
        editable={false}
      />

      {/* Name (editable) */}
      <Text style={styles.label}>Name:</Text>
      <TextInput
        style={styles.input}
        value={userData.name || ''}
        onChangeText={(text) => setUserData({ ...userData, name: text })}
        editable={editing}
        placeholder="Enter name"
      />

      {/* Apartment Picker */}
      <Text style={styles.label}>Apartment:</Text>
      {editing ? (
        <Picker
          selectedValue={userData.apartmentId}
          onValueChange={(value) =>
            setUserData({ ...userData, apartmentId: value })
          }
          style={styles.input}
        >
          <Picker.Item label="Select Apartment" value="" />
          {apartments.map((apt) => (
            <Picker.Item key={apt.value} label={apt.label} value={apt.value} />
          ))}
        </Picker>
      ) : (
        <Text style={styles.input}>
          {apartments.find((apt) => apt.value === userData.apartmentId)?.label || 'Not selected'}
        </Text>
      )}

      {/* Edit/Save Buttons */}
      <View style={styles.buttonContainer}>
        {editing ? (
          <>
            <Button title="Save" onPress={handleUpdate} />
            <Button title="Cancel" onPress={() => setEditing(false)} />
          </>
        ) : (
          <Button title="Edit Profile" onPress={() => setEditing(true)} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: '600',
  },
  label: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    borderRadius: 6,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 10,
  },
  text: {
    fontSize: 16,
    padding: 20,
    textAlign: 'center',
  },
});
