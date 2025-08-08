import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Listing } from '../utils/types';

type Props = {
  listing: Listing;
};

const ListingCard = ({ listing }: Props) => {
  const router = useRouter();

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/listing/[id]',
          params: { id: listing.id ?? '' },
        })
      }
    >
      <View style={styles.card}>
        <Image
          source={{ uri: listing.image }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
          <Text style={styles.location} numberOfLines={1}>{listing.location}</Text>
          <Text style={styles.price}>₹ {listing.price}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    marginTop: 6,
    fontSize: 16,
    color: '#2196F3',
    fontWeight: 'bold',
  },
});

export default ListingCard;
