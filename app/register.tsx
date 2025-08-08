// app/register.tsx
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Button, TextInput, View } from 'react-native';
import { auth, db } from './firebaseConfig';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apartmentId, setApartmentId] = useState('');
  const [apartmentOptions, setApartmentOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'apartments'));
        console.log('Apartment options:', apartmentOptions);
        const options = snapshot.docs.map((doc) => ({
          label: doc.data().name || doc.id,
          value: doc.id,
        }));
        setApartmentOptions(options);
      } catch (err) {
        Alert.alert('Failed to load apartments');
      }
    };

    fetchApartments();
  }, []);

  const handleRegister = async () => {
  if (!email || !password || !apartmentId) {
    Alert.alert('Please fill all fields');
    return;
  }

  try {
    console.log('🟡 Starting registration...');
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;
    console.log('✅ Firebase user created with UID:', uid);

    await setDoc(doc(db, 'users', uid), {
      uid,
      email,
      apartmentId,
      createdAt: new Date(),
    });
    console.log('✅ User document written to Firestore');

    router.replace('/');
  } catch (err: any) {
    console.log('❌ Error during register:', err.message);
    Alert.alert('Registration Failed', err.message);
  }
};


  return (
    <View style={{ padding: 16 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{ marginBottom: 12, borderWidth: 1, padding: 10 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginBottom: 12, borderWidth: 1, padding: 10 }}
      />

      <Picker
        selectedValue={apartmentId}
        onValueChange={(itemValue) => setApartmentId(itemValue)}
        style={{ marginBottom: 20, borderWidth: 1 }}
      >
        <Picker.Item label="Select Apartment" value="" />
        {apartmentOptions.map((apt) => (
          <Picker.Item key={apt.value} label={apt.label} value={apt.value} />
        ))}
      </Picker>

      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}
