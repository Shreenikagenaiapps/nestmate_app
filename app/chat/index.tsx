// app/chat/index.tsx
import { useRouter } from 'expo-router';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../firebaseConfig';

type Thread = {
  id: string;          // chatId = buyer_owner_listing
  buyerId: string;
  ownerId: string;
  listingId: string;
  listingTitle?: string;
  lastText?: string;
  lastAt?: any;
  hasUnread?: boolean; // for current user
};

export default function ChatIndexScreen() {
  const router = useRouter();
  const user = auth.currentUser;
  const uid = user?.uid;

  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState<Thread[]>([]);
  const unsubRefs = useRef<(() => void)[]>([]);
  const [nameCache, setNameCache] = useState<Record<string, string>>({});
  const [listingCache, setListingCache] = useState<Record<string, string>>({});

  // cache helpers
  const cacheListingTitle = async (listingId: string) => {
    if (!listingId || listingCache[listingId]) return;
    try {
      const l = await getDoc(doc(db, 'listings', listingId));
      if (l.exists()) {
        const title = (l.data() as any).title || 'Listing';
        setListingCache((prev) => ({ ...prev, [listingId]: title }));
      } else {
        setListingCache((prev) => ({ ...prev, [listingId]: 'Listing' }));
      }
    } catch {
      setListingCache((prev) => ({ ...prev, [listingId]: 'Listing' }));
    }
  };

  const cacheUserName = async (userId: string) => {
    if (!userId || nameCache[userId]) return;
    try {
      const u = await getDoc(doc(db, 'users', userId));
      const data = u.exists() ? (u.data() as any) : null;
      const label = (data && (data.name || data.email)) || userId.slice(0, 6);
      setNameCache((prev) => ({ ...prev, [userId]: label }));
    } catch {
      setNameCache((prev) => ({ ...prev, [userId]: userId.slice(0, 6) }));
    }
  };

  useEffect(() => {
    if (!uid) return;

    setLoading(true);
    // clear old listeners
    unsubRefs.current.forEach((u) => u());
    unsubRefs.current = [];

    // Listen to chats where I'm a participant (works for both owner & buyer)
    const qChats = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', uid)
    );

    const unsub = onSnapshot(qChats, async (snap) => {
      const list: Thread[] = [];
      for (const d of snap.docs) {
        const id = d.id;
        const parts = id.split('_');
        const buyerId = parts[0] || '';
        const ownerId = parts[1] || '';
        const listingId = parts[2] || '';

        // cache display info
        cacheListingTitle(listingId);
        cacheUserName(buyerId);
        cacheUserName(ownerId);

        const data = d.data() as any;

        // derive unread: last message with read:false not by me
        // (quick way: keep hasUnread on doc is possible; here we’ll compute lightweightly)
        let lastText: string | undefined;
        let lastAt: any;
        let hasUnread = false;

        // Prefer to read lastText/lastAt from doc if you store them on send (optional)
        // Otherwise we rely on updatedAt for sorting, and show no snippet until thread opened
        lastAt = data.updatedAt;
        lastText = data.lastText; // only if you start storing this later

        // Fallback unread flag (optional, set false here; message-level unread is handled in thread)
        hasUnread = false;

        list.push({
          id,
          buyerId,
          ownerId,
          listingId,
          lastText,
          lastAt,
          hasUnread,
        });
      }

      setThreads(list);
      setLoading(false);
    });

    unsubRefs.current.push(unsub);

    return () => {
      unsubRefs.current.forEach((u) => u());
      unsubRefs.current = [];
    };
  }, [uid]);

  const sorted = useMemo(() => {
    return [...threads].sort((a, b) => {
      const at = a.lastAt?.seconds || 0;
      const bt = b.lastAt?.seconds || 0;
      return bt - at;
    });
  }, [threads]);

  if (!uid) return <Text style={{ padding: 16 }}>Please log in to view chats.</Text>;
  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;
  if (sorted.length === 0) return <Text style={{ padding: 16 }}>No chats yet.</Text>;

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const counterpartId = uid === item.ownerId ? item.buyerId : item.ownerId;
        const counterpartName = nameCache[counterpartId] || counterpartId.slice(0, 6);
        const title = listingCache[item.listingId] || 'Listing';
        return (
          <TouchableOpacity
            onPress={() => router.push(`/chat/${item.id}`)}
            style={styles.item}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.chev}>›</Text>
            </View>
            <Text style={styles.sub}>
              With: {counterpartName}
              {item.lastText ? ` • ${item.lastText}` : ''}
            </Text>
            {item.hasUnread ? <Text style={styles.unreadDot}>●</Text> : null}
          </TouchableOpacity>
        );
      }}
      contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  title: { fontWeight: 'bold' },
  sub: { color: '#555', marginTop: 4 },
  chev: { color: '#999', fontSize: 18, fontWeight: 'bold' },
  unreadDot: { color: 'red', fontWeight: 'bold', marginTop: 6 },
});
