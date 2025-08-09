// // app/chat/[listingId].tsx
// import { useLocalSearchParams } from 'expo-router';
// import {
//   addDoc,
//   collection,
//   doc,
//   getDoc,
//   onSnapshot,
//   orderBy,
//   query,
//   serverTimestamp,
//   setDoc,
//   updateDoc,
//   where,
// } from 'firebase/firestore';
// import { useEffect, useRef, useState } from 'react';
// import {
//   FlatList,
//   KeyboardAvoidingView,
//   Platform,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { auth, db } from '../firebaseConfig';

// type Message = {
//   id: string;
//   text: string;
//   senderId: string;
//   createdAt: any;
// };

// type OwnerThread = {
//   id: string;       // chatId
//   buyerId: string;  // first segment of chatId
// };

// export default function ChatScreen() {
//   const { listingId } = useLocalSearchParams<{ listingId: string }>();

//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState('');
//   const [chatId, setChatId] = useState('');           // active chat for non-owner
//   const [isOwner, setIsOwner] = useState(false);
//   const [ownerId, setOwnerId] = useState('');

//   // owner-only
//   const [threads, setThreads] = useState<OwnerThread[]>([]);
//   const [selectedChatId, setSelectedChatId] = useState<string>(''); // owner’s active chat
//   const [buyerNames, setBuyerNames] = useState<Record<string,string>>({});

//   const currentUser = auth.currentUser;
//   const msgsUnsubRef = useRef<undefined | (() => void)>();

//   // util: extract buyerId from chatId "buyer_owner_listing"
//   const buyerFromChatId = (cid: string) => {
//     const parts = cid.split('_');
//     return parts[0] || '';
//   };

//   // subscribe to messages for a given chat (and clean up previous)
//   const subscribeToChatMessages = (cid: string) => {
//     if (msgsUnsubRef.current) {
//       msgsUnsubRef.current();
//       msgsUnsubRef.current = undefined;
//     }
//     const msgsRef = collection(db, `chats/${cid}/messages`);
//     const qMsgs = query(msgsRef, orderBy('createdAt', 'asc'));
//     const unsub = onSnapshot(qMsgs, (snap) => {
//       const list: Message[] = snap.docs.map((d) => ({
//         id: d.id,
//         ...(d.data() as Omit<Message, 'id'>),
//       }));
//       setMessages(list);
//     });
//     msgsUnsubRef.current = unsub;
//   };

//   useEffect(() => {
//     let unsubThreads: undefined | (() => void);

//     const init = async () => {
//       if (!listingId || !currentUser) return;

//       // 1) Resolve owner
//       const listingRef = doc(db, 'listings', String(listingId));
//       const listingSnap = await getDoc(listingRef);
//       if (!listingSnap.exists()) return;

//       const listing = listingSnap.data() as any;
//       const owner = listing.ownerId || listing.userId;
//       setOwnerId(owner);

//       const me = currentUser.uid;
//       const iAmOwner = me === owner;
//       setIsOwner(iAmOwner);

//       if (iAmOwner) {
//         // =========== OWNER FLOW ===========
//         // Live list of chats for this listing
//         const chatsQ = query(
//           collection(db, 'chats'),
//           where('listingId', '==', String(listingId))
//         );
//         unsubThreads = onSnapshot(chatsQ, (snap) => {
//           const t: OwnerThread[] = snap.docs.map((d) => {
//             const id = d.id;
//             return { id, buyerId: buyerFromChatId(id) };
//           });
//           setThreads(t);

//           // auto-select first thread if none selected
//           if (!selectedChatId && t.length > 0) {
//             const first = t[0].id;
//             setSelectedChatId(first);
//             subscribeToChatMessages(first);
//           }

//           // prefetch buyer names (optional)
//           t.forEach(async (th) => {
//             if (!buyerNames[th.buyerId]) {
//               try {
//                 const u = await getDoc(doc(db, 'users', th.buyerId));
//                 const data = u.exists() ? (u.data() as any) : null;
//                 const label = (data && (data.name || data.email)) || th.buyerId;
//                 setBuyerNames((prev) => (prev[th.buyerId] ? prev : { ...prev, [th.buyerId]: label }));
//               } catch {}
//             }
//           });
//         });
//       } else {
//         // =========== NON-OWNER FLOW ===========
//         const generatedChatId = `${me}_${owner}_${listingId}`;
//         setChatId(generatedChatId);

//         // ensure parent chat exists (safe no-op if it does)
//         const chatRef = doc(db, 'chats', generatedChatId);
//         const chatSnap = await getDoc(chatRef);
//         if (!chatSnap.exists()) {
//           await setDoc(chatRef, {
//             listingId: String(listingId),
//             senderId: me,
//             receiverId: owner,
//             createdAt: serverTimestamp(),
//             // additive extras (won’t break your index screen)
//             participants: [me, owner],
//             updatedAt: serverTimestamp(),
//           });
//         } else {
//           try { await updateDoc(chatRef, { updatedAt: serverTimestamp() }); } catch {}
//         }

//         // subscribe to just this thread
//         subscribeToChatMessages(generatedChatId);
//       }
//     };

//     init();

//     return () => {
//       if (msgsUnsubRef.current) {
//         msgsUnsubRef.current();
//         msgsUnsubRef.current = undefined;
//       }
//       if (unsubThreads) unsubThreads();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [listingId]);

//   // when owner selects a different thread, switch the single subscription
//   useEffect(() => {
//     if (isOwner && selectedChatId) {
//       subscribeToChatMessages(selectedChatId);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isOwner, selectedChatId]);

//   const handleSend = async () => {
//     if (!input.trim() || !currentUser) return;

//     const activeChatId = isOwner ? selectedChatId : chatId;
//     if (!activeChatId) return;

//     await addDoc(collection(db, `chats/${activeChatId}/messages`), {
//       text: input.trim(),
//       senderId: currentUser.uid,
//       createdAt: serverTimestamp(),
//     });

//     try {
//       await updateDoc(doc(db, 'chats', activeChatId), { updatedAt: serverTimestamp() });
//     } catch {}

//     setInput('');
//   };

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//       style={{ flex: 1 }}
//       keyboardVerticalOffset={80}
//     >
//       {/* Owner: pick which buyer thread to view/reply */}
//       {isOwner && threads.length > 0 && (
//         <FlatList
//           horizontal
//           data={threads}
//           keyExtractor={(t) => t.id}
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={{ padding: 10, gap: 8 }}
//           renderItem={({ item }) => {
//             const selected = item.id === selectedChatId;
//             const label = buyerNames[item.buyerId] || item.buyerId;
//             return (
//               <TouchableOpacity
//                 onPress={() => setSelectedChatId(item.id)}
//                 style={{
//                   paddingVertical: 8,
//                   paddingHorizontal: 12,
//                   borderRadius: 16,
//                   backgroundColor: selected ? '#2196F3' : '#eee',
//                 }}
//               >
//                 <Text style={{ color: selected ? '#fff' : '#000' }}>{label}</Text>
//               </TouchableOpacity>
//             );
//           }}
//         />
//       )}

//       {/* Messages for the active thread only */}
//       <FlatList
//         data={messages}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <View
//             style={{
//               alignSelf: item.senderId === currentUser?.uid ? 'flex-end' : 'flex-start',
//               backgroundColor: item.senderId === currentUser?.uid ? '#2196F3' : '#ddd',
//               borderRadius: 16,
//               padding: 10,
//               marginVertical: 4,
//               marginHorizontal: 10,
//               maxWidth: '80%',
//             }}
//           >
//             <Text style={{ color: item.senderId === currentUser?.uid ? '#fff' : '#000' }}>
//               {item.text}
//             </Text>
//           </View>
//         )}
//         contentContainerStyle={{ paddingVertical: 12 }}
//       />

//       {/* Composer: enabled for non-owner; for owner only when a thread is selected */}
//       {((!isOwner && !!chatId) || (isOwner && !!selectedChatId)) && (
//         <View style={{ flexDirection: 'row', padding: 10, borderTopWidth: 1, borderColor: '#ddd' }}>
//           <TextInput
//             value={input}
//             onChangeText={setInput}
//             placeholder="Type a message"
//             style={{ flex: 1, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8 }}
//             onSubmitEditing={handleSend}
//             returnKeyType="send"
//           />
//           <TouchableOpacity onPress={handleSend} style={{ marginLeft: 8, justifyContent: 'center' }}>
//             <Text style={{ color: '#2196F3', fontWeight: 'bold' }}>Send</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Owner empty state */}
//       {isOwner && threads.length === 0 && (
//         <Text style={{ padding: 10, color: 'gray', textAlign: 'center' }}>
//           No chats for this listing yet.
//         </Text>
//       )}
//     </KeyboardAvoidingView>
//   );
// }
