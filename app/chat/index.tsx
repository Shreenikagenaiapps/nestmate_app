// File: app/chat/index.tsx
import { useRouter } from 'expo-router';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity } from 'react-native';
import { auth, db } from '../firebaseConfig';

export default function ChatIndexScreen() {
  const [loading, setLoading] = useState(true);
  const [chatThreads, setChatThreads] = useState<any[]>([]);
  const router = useRouter();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const fetchChats = async () => {
      const listingQuery = query(
        collection(db, 'listings'),
        where('userId', '==', currentUser.uid)
      );

      onSnapshot(listingQuery, async (listingSnap) => {
        const listings = listingSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const listingIds = listings.map((l) => l.id);

        if (listingIds.length === 0) {
          setChatThreads([]);
          setLoading(false);
          return;
        }

        const chatQuery = query(
          collection(db, 'chats'),
          where('listingId', 'in', listingIds)
        );

        onSnapshot(chatQuery, async (chatSnap) => {
          const threads = await Promise.all(
            chatSnap.docs.map(async (chatDoc) => {
              const chat = chatDoc.data();
              const listingDoc = await getDoc(doc(db, 'listings', chat.listingId));
              return {
                id: chatDoc.id,
                ...chat,
                listingTitle: listingDoc.exists() ? listingDoc.data().title : 'Unknown Listing',
              };
            })
          );
          setChatThreads(threads);
          setLoading(false);
        });
      });
    };

    fetchChats();
  }, [currentUser]);

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;
  if (chatThreads.length === 0)
    return <Text style={{ padding: 20 }}>No chats for your listings yet.</Text>;

  return (
    <FlatList
      data={chatThreads}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => router.push(`/chat/${item.listingId}`)}
          style={{
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#ccc',
            backgroundColor: '#f9f9f9',
          }}
        >
          <Text style={{ fontWeight: 'bold' }}>{item.listingTitle}</Text>
          <Text style={{ color: '#666' }}>Chat ID: {item.id}</Text>
        </TouchableOpacity>
      )}
    />
  );
}
