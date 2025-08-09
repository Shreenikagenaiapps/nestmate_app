// app/chat/[chatId].tsx
import { useLocalSearchParams } from 'expo-router';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
} from 'firebase/firestore';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { auth, db } from '../firebaseConfig';

type Message = {
  id: string;
  text: string;
  senderId: string;
  createdAt: any;
  read?: boolean;
};

export default function ChatThreadScreen() {
  const { chatId: routeChatId } = useLocalSearchParams<{ chatId: string }>();
  const chatId = String(routeChatId || '');

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [buyerId, ownerId, listingId] = useMemo(() => {
    const parts = chatId.split('_');
    return [parts[0] || '', parts[1] || '', parts[2] || ''];
  }, [chatId]);

  const [names, setNames] = useState<Record<string, string>>({});
  const currentUser = auth.currentUser;
  const msgsUnsubRef = useRef<(() => void) | null>(null);

  // Create chat doc if missing (NO listingId field stored)
  const ensureChatDoc = async () => {
    if (!chatId || !buyerId || !ownerId) return;
    const chatRef = doc(db, 'chats', chatId);
    const snap = await getDoc(chatRef);
    if (!snap.exists()) {
      await setDoc(chatRef, {
        ownerId,
        buyerId,
        participants: [buyerId, ownerId],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  };

  // Prefetch display names for header/bubbles
  const cacheUserName = async (uid: string) => {
    try {
      if (!uid || names[uid]) return;
      const u = await getDoc(doc(db, 'users', uid));
      const data = u.exists() ? (u.data() as any) : null;
      const label =
        (data && (data.name || data.email)) ||
        (auth.currentUser?.uid === uid ? 'You' : uid.slice(0, 6));
      setNames((prev) => ({ ...prev, [uid]: label }));
    } catch {
      setNames((prev) => ({ ...prev, [uid]: uid.slice(0, 6) }));
    }
  };

  useEffect(() => {
    // guard: must have valid chatId
    if (!chatId) return;

    let cancelled = false;

    const init = async () => {
      await ensureChatDoc();

      // preload names
      cacheUserName(buyerId);
      cacheUserName(ownerId);

      // subscribe to this thread only
      if (msgsUnsubRef.current) {
        msgsUnsubRef.current();
        msgsUnsubRef.current = null;
      }
      const msgsRef = collection(db, `chats/${chatId}/messages`);
      const qMsgs = query(msgsRef, orderBy('createdAt', 'asc'));
      const unsub = onSnapshot(qMsgs, (snap) => {
        if (cancelled) return;
        const list: Message[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Message, 'id'>),
        }));
        setMessages(list);

        // mark unread from others as read
        const me = auth.currentUser?.uid;
        if (!me) return;
        list.forEach(async (m) => {
          if (!m.read && m.senderId !== me) {
            try {
              await updateDoc(doc(db, `chats/${chatId}/messages/${m.id}`), { read: true });
            } catch {}
          }
        });
      });
      msgsUnsubRef.current = unsub;
    };

    init();

    return () => {
      if (msgsUnsubRef.current) {
        msgsUnsubRef.current();
        msgsUnsubRef.current = null;
      }
    };
  }, [chatId, buyerId, ownerId]);

  const handleSend = async () => {
    if (!input.trim() || !currentUser || !chatId) return;

    await addDoc(collection(db, `chats/${chatId}/messages`), {
      text: input.trim(),
      senderId: currentUser.uid,
      createdAt: serverTimestamp(),
      read: false,
    });

    try {
      await updateDoc(doc(db, 'chats', chatId), { updatedAt: serverTimestamp() });
    } catch {}

    setInput('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={80}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const mine = item.senderId === currentUser?.uid;
          const label = mine ? 'You' : (names[item.senderId] || item.senderId.slice(0, 6));
          return (
            <View style={{ paddingHorizontal: 10, marginTop: 8 }}>
              {/* name label for clarity */}
              <Text style={{ fontSize: 12, color: '#777', marginBottom: 2 }}>
                {label}
              </Text>
              <View
                style={{
                  alignSelf: mine ? 'flex-end' : 'flex-start',
                  backgroundColor: mine ? '#2196F3' : '#ddd',
                  borderRadius: 16,
                  padding: 10,
                  maxWidth: '80%',
                }}
              >
                <Text style={{ color: mine ? '#fff' : '#000' }}>{item.text}</Text>
              </View>
            </View>
          );
        }}
        contentContainerStyle={{ paddingVertical: 12 }}
      />

      <View style={{ flexDirection: 'row', padding: 10, borderTopWidth: 1, borderColor: '#ddd' }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message"
          style={{ flex: 1, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8 }}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity onPress={handleSend} style={{ marginLeft: 8, justifyContent: 'center' }}>
          <Text style={{ color: '#2196F3', fontWeight: 'bold' }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
