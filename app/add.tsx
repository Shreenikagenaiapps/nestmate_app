import { useRouter } from 'expo-router';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from './firebaseConfig';

const categories = ['House', 'Electronics', 'Car', 'Toy', 'Equipment', 'Other'];

export default function AddListing() {
  const router = useRouter();
  const user = auth.currentUser;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [location, setLocation] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [category, setCategory] = useState(categories[0]);

  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [size, setSize] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [seats, setSeats] = useState('');
  const [condition, setCondition] = useState('');
  const [warranty, setWarranty] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) return Alert.alert('Error', 'You must be logged in.');

    setLoading(true);

    let apartmentId = 'default';
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) apartmentId = userDoc.data().apartmentId || 'default';
    } catch {
      console.warn('⚠️ Failed to fetch apartmentId');
    }

    const listingData: any = {
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      image: image.trim(),
      location: location.trim(),
      availableFrom: availableFrom.trim(),
      category,
      apartmentId,
      createdAt: serverTimestamp(),
      ownerId: user.uid,
      userId: user.uid,
      status: 'Available',
    };

    if (category === 'House') {
      listingData.bedrooms = bedrooms;
      listingData.bathrooms = bathrooms;
      listingData.size = size;
    } else if (category === 'Electronics') {
      listingData.brand = brand;
      listingData.model = model;
      listingData.condition = condition;
      listingData.warranty = warranty;
    } else if (category === 'Car') {
      listingData.brand = brand;
      listingData.model = model;
      listingData.fuelType = fuelType;
      listingData.seats = seats;
    }

    try {
      await addDoc(collection(db, 'listings'), listingData);
      Alert.alert('✅ Success', 'Listing added!');
      router.push('/HomeScreen');
    } catch (err) {
      Alert.alert('❌ Error', 'Failed to add listing.');
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryFields = () => {
    switch (category) {
      case 'House':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>House Details</Text>
            <TextInput placeholder="Bedrooms" value={bedrooms} onChangeText={setBedrooms} style={styles.input} keyboardType="numeric" />
            <TextInput placeholder="Bathrooms" value={bathrooms} onChangeText={setBathrooms} style={styles.input} keyboardType="numeric" />
            <TextInput placeholder="Size (sqft)" value={size} onChangeText={setSize} style={styles.input} keyboardType="numeric" />
          </View>
        );
      case 'Electronics':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Electronics Details</Text>
            <TextInput placeholder="Brand" value={brand} onChangeText={setBrand} style={styles.input} />
            <TextInput placeholder="Model" value={model} onChangeText={setModel} style={styles.input} />
            <TextInput placeholder="Condition" value={condition} onChangeText={setCondition} style={styles.input} />
            <TextInput placeholder="Warranty" value={warranty} onChangeText={setWarranty} style={styles.input} />
          </View>
        );
      case 'Car':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Car Details</Text>
            <TextInput placeholder="Brand" value={brand} onChangeText={setBrand} style={styles.input} />
            <TextInput placeholder="Model" value={model} onChangeText={setModel} style={styles.input} />
            <TextInput placeholder="Fuel Type" value={fuelType} onChangeText={setFuelType} style={styles.input} />
            <TextInput placeholder="Seats" value={seats} onChangeText={setSeats} style={styles.input} keyboardType="numeric" />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.chipRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[styles.chip, category === cat && styles.chipSelected]}
            >
              <Text style={{ color: category === cat ? '#fff' : '#333' }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Basic Info</Text>
        <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
        <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input} />
        <TextInput placeholder="Price" value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.input} />
        <TextInput placeholder="Image URL" value={image} onChangeText={setImage} style={styles.input} />
        <TextInput placeholder="Location" value={location} onChangeText={setLocation} style={styles.input} />
      </View>

      {renderCategoryFields()}

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Availability</Text>
        <TextInput
          placeholder="Available From (e.g., 2025-08-12)"
          value={availableFrom}
          onChangeText={setAvailableFrom}
          style={styles.input}
        />
      </View>

      <View style={{ marginTop: 20 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#2196F3" />
        ) : (
          <Button title="Submit" onPress={handleSubmit} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    marginBottom: 8,
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#2196F3',
  },
});
