// app/styles/homeStyles.ts
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
  },
  details: {
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  price: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#7fb694ff',
  },
  location: {
    color: '#555',
    marginTop: 4,
  },
  meta: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  searchBar: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
  },
    label: {
    fontWeight: '600',
    color: '#666',
  },
  buttonRow: {
  flexDirection: 'row',
  gap: 10,
  marginTop: 10,
  },
  actionButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#fff',
  },
});
