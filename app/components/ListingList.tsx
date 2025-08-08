import { FlatList, View } from 'react-native';
import ListingCard from '../components/ListingCard';

type Props = {
  isUserOnly?: boolean;
};

const listings = [
  {
    id: '1',
    title: 'Luxury Apartment',
    image: 'https://source.unsplash.com/600x400/?apartment',
    price: 12000,
    location: 'Mumbai',
    userId: '123',
    description: 'A beautiful luxury apartment with 3 bedrooms and a sea view.',
    category: 'houses',
  },
  {
    id: '2',
    title: 'Cozy Cottage',
    image: 'https://source.unsplash.com/600x400/?cottage',
    price: 8000,
    location: 'Pune',
    userId: '456',
    description: 'A small cozy cottage perfect for weekend getaways.',
    category: 'houses',
  },
];

const ListingList = ({ isUserOnly }: Props) => {
  const filtered = isUserOnly
    ? listings.filter((item) => item.userId === '123')
    : listings;

  return (
    <View className="px-4 pt-4">
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ListingCard listing={item} />}
      />
    </View>
  );
};

export default ListingList;