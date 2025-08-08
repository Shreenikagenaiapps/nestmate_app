import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Listing } from '../utils/types';

type Props = {
  initialData?: Listing;
  onSubmit: (data: Listing) => void;
};

export default function ListingForm({ initialData, onSubmit }: Props) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [size, setSize] = useState(initialData?.size?.toString() || '');
  const [bedrooms, setBedrooms] = useState(initialData?.bedrooms?.toString() || '');
  const [bathrooms, setBathrooms] = useState(initialData?.bathrooms?.toString() || '');
  const [category, setCategory] = useState(initialData?.category || 'House');
  const [image] = useState(initialData?.image || 'https://placekitten.com/400/300');

  // Dynamic fields
  const [availableFrom, setAvailableFrom] = useState(initialData?.availableFrom || '');
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [model, setModel] = useState(initialData?.model || '');
  const [fuelType, setFuelType] = useState(initialData?.fuelType || '');
  const [seats, setSeats] = useState(initialData?.seats?.toString() || '');
  const [condition, setCondition] = useState(initialData?.condition || '');
  const [warranty, setWarranty] = useState(initialData?.warranty || '');

  const handleSubmit = () => {
    onSubmit({
      title,
      price: Number(price),
      description,
      image,
      location,
      category,
      size: size ? parseInt(size) : undefined,
      bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
      bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
      availableFrom,
      brand,
      model,
      fuelType,
      seats: seats ? parseInt(seats) : undefined,
      condition,
      warranty,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput placeholder="Price" value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input} multiline />
      <TextInput placeholder="Location" value={location} onChangeText={setLocation} style={styles.input} />
      <TextInput placeholder="Size (sq ft)" value={size} onChangeText={setSize} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Bedrooms" value={bedrooms} onChangeText={setBedrooms} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="Bathrooms" value={bathrooms} onChangeText={setBathrooms} keyboardType="numeric" style={styles.input} />

      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Category</Text>
        <Picker selectedValue={category} onValueChange={(value) => setCategory(value)} style={styles.picker}>
          <Picker.Item label="House" value="House" />
          <Picker.Item label="Car" value="Car" />
          <Picker.Item label="Electronics" value="Electronics" />
          <Picker.Item label="Toys" value="Toys" />
          <Picker.Item label="Equipment" value="Equipment" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
      </View>

      {/* Category-specific fields */}
      {category === 'House' && (
        <TextInput
          placeholder="Available From (e.g., 2025-08-10)"
          value={availableFrom}
          onChangeText={setAvailableFrom}
          style={styles.input}
        />
      )}

      {category === 'Car' && (
        <>
          <TextInput placeholder="Fuel Type" value={fuelType} onChangeText={setFuelType} style={styles.input} />
          <TextInput placeholder="Seats" value={seats} onChangeText={setSeats} keyboardType="numeric" style={styles.input} />
        </>
      )}

      {category === 'Electronics' && (
        <>
          <TextInput placeholder="Brand" value={brand} onChangeText={setBrand} style={styles.input} />
          <TextInput placeholder="Model" value={model} onChangeText={setModel} style={styles.input} />
          <TextInput placeholder="Condition (New/Used)" value={condition} onChangeText={setCondition} style={styles.input} />
          <TextInput placeholder="Warranty (e.g., 6 months)" value={warranty} onChangeText={setWarranty} style={styles.input} />
        </>
      )}

      <Button title="Save Listing" onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, padding: 16 },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  pickerLabel: {
    marginBottom: 4,
    fontWeight: 'bold',
    fontSize: 16,
  },
  picker: {
    height: 50,
    width: '100%',
  },
});
