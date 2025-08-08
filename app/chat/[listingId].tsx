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
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
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
};

export default function ChatScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [ownerId, setOwnerId] = useState('');
  const [senderNames, setSenderNames] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');


  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!listingId || !currentUser) return;

    let unsubscribe: (() => void) | undefined;

    const initChat = async () => {
      const listingDoc = await getDoc(doc(db, 'listings', String(listingId)));
      if (!listingDoc.exists()) return;

      const listing = listingDoc.data();
      const owner = listing.userId || listing.ownerId || '';
      setOwnerId(owner);
      setStatus(listing.status || 'Available');
      const senderId = currentUser.uid;

      if (senderId === owner) {
        setIsOwner(true);

        const chatsQuery = query(
          collection(db, 'chats'),
          where('listingId', '==', listingId)
        );

        unsubscribe = onSnapshot(chatsQuery, (chatSnap) => {
          const allMsgs: Message[] = [];

          chatSnap.docs.forEach((chatDoc) => {
            const thisChatId = chatDoc.id;
            if (!chatId) setChatId(thisChatId);

            const msgsRef = collection(db, 'chats', thisChatId, 'messages');
            const msgsQuery = query(msgsRef, orderBy('createdAt', 'asc'));

            onSnapshot(msgsQuery, async (msgSnap) => {
              const msgList: Message[] = msgSnap.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Message, 'id'>),
              }));

              // Fetch sender names
              await Promise.all(
                msgList.map(async (msg) => {
                  if (!senderNames[msg.senderId]) {
                    const userSnap = await getDoc(doc(db, 'users', msg.senderId));
                    const userName = userSnap.exists()
                      ? userSnap.data().email
                      : 'Unknown User';
                    setSenderNames((prev) => ({ ...prev, [msg.senderId]: userName }));
                  }
                })
              );

              setMessages(msgList);
            });
          });
        });

        return;
      }

      // Non-owner logic
      const receiverId = owner;
      const generatedChatId = `${senderId}_${receiverId}_${listingId}`;
      setChatId(generatedChatId);

      const chatRef = doc(db, 'chats', generatedChatId);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          listingId,
          senderId,
          receiverId,
          createdAt: serverTimestamp(),
        });
      }

      const messagesRef = collection(db, 'chats', generatedChatId, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'asc'));
      unsubscribe = onSnapshot(q, async (snapshot) => {
        const msgList: Message[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Message, 'id'>),
        }));

        // Fetch sender names
        await Promise.all(
          msgList.map(async (msg) => {
            if (!senderNames[msg.senderId]) {
              const userSnap = await getDoc(doc(db, 'users', msg.senderId));
              const userName = userSnap.exists()
                ? userSnap.data().email
                : 'Unknown User';
              setSenderNames((prev) => ({ ...prev, [msg.senderId]: userName }));
            }
          })
        );

        setMessages(msgList);
      });
    };

    initChat();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [listingId]);

  const sendMessage = async () => {
    if (!chatId || !input.trim() || !currentUser) return;

    const message = {
      text: input,
      senderId: currentUser.uid,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, 'chats', chatId, 'messages'), message);
    setInput('');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        data={messages}
        renderItem={({ item }) => {
          const isCurrentUser = item.senderId === currentUser?.uid;
          const isOwnerSender = item.senderId === ownerId;
          const senderLabel = senderNames[item.senderId] || '...';
          return (
            <View
              style={{
                alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
                backgroundColor: isCurrentUser ? '#DCF8C6' : '#eee',
                padding: 10,
                borderRadius: 8,
                margin: 5,
                maxWidth: '80%',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 2 }}>
                {senderLabel}
                {isOwnerSender ? ' (Owner)' : ''}
              </Text>
              <Text>{item.text}</Text>
            </View>
          );
        }}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 10 }}
      />

      {chatId && (status !== 'Booked' || currentUser?.uid === ownerId) ? (
        <View style={{ flexDirection: 'row', padding: 10 }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message"
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 20,
              paddingHorizontal: 15,
              paddingVertical: 8,
            }}
          />
          <TouchableOpacity onPress={sendMessage} style={{ marginLeft: 10, alignSelf: 'center' }}>
            <Text style={{ color: '#2196F3', fontWeight: 'bold' }}>Send</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={{ padding: 10, color: 'gray', textAlign: 'center' }}>
          This listing is marked as <Text style={{ fontWeight: 'bold' }}>BOOKED</Text>. You cannot send messages.
        </Text>
      )}
    </KeyboardAvoidingView>
  );
}
