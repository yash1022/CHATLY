import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import api from '../API/axiosConfig';
import { useOnlineUsers } from '../CONTEXT/OnlineUsersContext';
import { useAuth } from '../CONTEXT/AuthProvider';
import {
  encryptMessage,
  generateAesKey,
  decryptMessage,
  exportAesKeyToBase64,
  importAesKeyFromBase64
} from '../UTILS/CRYPTO/aes';
import {
  decryptAesKey,
  encryptAesKey,
  importPrivateKeyFromPem,
  importPublicKeyFromPem
} from '../UTILS/CRYPTO/rsa';

const BASE64_REGEX = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/;

const isBase64String = (value) => {
  if (typeof value !== 'string') {
    return false;
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed.length % 4 !== 0) {
    return false;
  }
  return BASE64_REGEX.test(trimmed);
};


function ReceiptIcon({ isRead }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-4 h-4 ${isRead ? 'text-emerald-500' : 'text-slate-400'}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={isRead ? 'Message seen' : 'Message sent'}
    >
      {isRead ? (
        <>
          <path d="M3 12l4 4L15 8" />
          <path d="M9 12l4 4L21 8" />
        </>
      ) : (
        <path d="M5 13l4 4L19 7" />
      )}
    </svg>
  );
}

function TypingIndicator({ displayName }) {
  const label = displayName ? `${displayName} is typing` : 'Typing...';
  return (
    <div
      role="status"
      aria-live="polite"
      className="inline-flex items-center gap-3 rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-2 text-xs font-medium text-slate-400 shadow-sm"
    >
      <span className="text-slate-300 font-semibold">{label}</span>
      <div className="flex gap-1">
        <span className="h-2 w-2 rounded-full bg-blue-400/80 animate-bounce" style={{ animationDelay: '0s' }} />
        <span className="h-2 w-2 rounded-full bg-blue-400/80 animate-bounce" style={{ animationDelay: '0.15s' }} />
        <span className="h-2 w-2 rounded-full bg-blue-400/80 animate-bounce" style={{ animationDelay: '0.3s' }} />
      </div>
    </div>
  );
}


export default function ChatPage() {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [draftMessage, setDraftMessage] = useState('');
  const [fetchedUsers, setFetchedUsers] = useState([]);
  const [typing ,setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [isRead, setIsRead] = useState(false);
  const [isFirstMessage,setIsFirstMessage] = useState(true);
  
  const aesKeyStore = useRef(new Map());
  const typingTimeout = useRef(null);
                        
  const [messages,setMessages] = useState([]);
  const { onlineUserIds } = useOnlineUsers();
  const onlineUserSet = useMemo(() => new Set(onlineUserIds.map(String)), [onlineUserIds]);
  const {socket} = useAuth(); 
  const {user} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentUserId = useMemo(
    () => (user ? String(user.id ?? user._id) : null),
    [user]
  );

  const selectedUser = useMemo(
    () => fetchedUsers.find((user) => String(user?.id ?? user?._id) === selectedUserId),
    [selectedUserId, fetchedUsers]
  );

  const typingDisplayName = useMemo(() => {
    if (!typingUser || typingUser !== selectedUserId) {
      return null;
    }

    return selectedUser?.name || selectedUser?.username || 'Someone';
  }, [typingUser, selectedUserId, selectedUser]);

  const isSelectedOnline = selectedUserId ? onlineUserSet.has(selectedUserId) : false;


  useEffect(()=>{
    getUsers();

    

  },[]);  // FETCH USERS

  useEffect(() =>  {
    const preselectUser = location.state?.preselectUser;
    if (!preselectUser) {
      return;
    }

    const preselectId = String(preselectUser?.id ?? preselectUser?._id ?? '');
    if (!preselectId) {
      return;
    }

    if (String(preselectId) !== String(selectedUserId)) {
      setSelectedUserId(preselectId);
    }

    setFetchedUsers((prev) => {
      const exists = prev.some((entry) => String(entry?.id ?? entry?._id) === preselectId);
      if (exists) {
        return prev;
      }
      return [preselectUser, ...prev];
    });

    


  }, [location.state, selectedUserId]);     // PRESELECTED USER



    useEffect(()=>{
    if(!socket)
    {
      return;
    }

    const handleNewMessage = async ({payloadMessage})=>{


      console.log("NEW MESSAGE RECEIVED", payloadMessage);

      const otherUserId = String(payloadMessage.sender) === String(currentUserId) ? String(payloadMessage.reciever):(String(payloadMessage.sender));
      const storedAesKey = aesKeyStore.current.get(otherUserId);
      
      if(!storedAesKey)
      {
        console.error('No AES key for this chat');
        return;
      }
      const aesKey = await importAesKeyFromBase64(storedAesKey);
     
      
      const iv = payloadMessage.iv;
      const decryptedContent = await decryptMessage(aesKey , iv , payloadMessage.content);

      payloadMessage.content = decryptedContent;

       console.log("SUCCESSFULLY DECRYPTED THE MESSAGE-->",decryptedContent);


      if(String(payloadMessage.sender) === String(selectedUserId) || String(payloadMessage.reciever) === String(selectedUserId))
      {
        setMessages((prevMessages)=> [...prevMessages , payloadMessage] );
      }

      if(String(payloadMessage.sender)===String(selectedUserId))
      {
        const payload= {
          senderId : selectedUserId
        }
        socket.emit('read_messages', payload)
        
      }
    }
    
    socket.on('new_message',handleNewMessage)
    socket.on('messages_read',()=>{
    
    })

    return()=>{
      socket.off('new_message',handleNewMessage)
    }
  
  },[socket,selectedUserId])   // HANDLE NEW MESSAGE

 


  useEffect(()=>{
    if(!socket || !selectedUserId)
    {
      return;
    }

    socket.emit('mark_as_read',{
      senderId : selectedUserId
    })
  },[socket,selectedUserId])   // READ RECIPTS

  useEffect(()=>{
    if(!socket)
    {
      return;
    }

    const handleMessagesRead = ({recieverId})=>{

      setMessages((prev)=> 
      prev.map((msg)=>{
        if(String(msg.reciever) === String(recieverId))
        {
          return {...msg , isRead:true}
        }
        return msg;
      }))

    }

    socket.on('messages_read',handleMessagesRead)
    return()=>{
      socket.off('messages_read',handleMessagesRead)
    }
  },[socket]);       // READ RECIPTS

  useEffect(()=>{

    if(!socket)
    {
      return;
    }

    const handleSenderTyping = ({senderId , isTyping})=>{
      if(String(senderId) === String(selectedUserId))
      {
        setTypingUser(isTyping ? senderId : null);
      }


    }

    socket.on('sender_typing',handleSenderTyping)

    return ()=>{
      socket.off('sender_typing',handleSenderTyping);
    }

  },[socket,selectedUserId])    // TYPING INDICATOR

  useEffect(()=>{
    //GENERATE AES KEY WHEN A CHAT IS SELECTED

    if(!selectedUserId)
    {
      return;
    }

    const setupAesKey = async()=>{

      try
      {
       
        const response = await api.get(`/exchange/${selectedUserId}`)
        if(!response)
        {
          console.log("FAILED TO GET ANY RESPONSE");
        }

        console.log(response);

        const encryptedAesKey = response.data.encryptedAesKey;   //ERROR HERE
        const isUsed = response.data.isUsed;

        setIsFirstMessage(!isUsed);

        if(encryptedAesKey)
        {
          console.log(encryptedAesKey);
        }

       

     const privateKeyPem = window.localStorage.getItem('rsa_private_key');
if (!privateKeyPem) {
  console.error('No local private key. Re-register or restore backup.');
  return;
}
const privateKey = await importPrivateKeyFromPem(privateKeyPem);

        const aesKeyBase64 = await decryptAesKey(encryptedAesKey , privateKey);
        if(!aesKeyBase64)
        {
          console.log("CANNOT DECRYPT AESKEY")
          return;
        }

        aesKeyStore.current.set(selectedUserId, aesKeyBase64);
        console.log('AES key retrieved and stored for chat with user', selectedUserId);
        return;
        



      }
      catch
      {
        // NO KEY FOUND, GENERATE AND EXCHANGE NEW KEY
        console.log('No AES key found for chat with user', selectedUserId , 'Generating new key');
        const newAesKey = await generateAesKey();
        const exportedAesKey = await exportAesKeyToBase64(newAesKey);
        
        if(!selectedUser?.publicKey)
        {
          console.error('Selected user is missing a public key, cannot exchange AES key');
          return;
        }

        //ENCRYPTING KEY FOR RECIEVER

        const recieverPublicKey = await importPublicKeyFromPem(selectedUser.publicKey);
        const encryptedAesKeyForReciever = await encryptAesKey(exportedAesKey , recieverPublicKey);
       
        //ENCRYPTING KEY FOR SENDER

        if(!user.publicKey)
        {
          console.log("NO PUBLIC KEY FOUND FOR USER");  
        }

        const senderPublicKey = await importPublicKeyFromPem(user.publicKey)
        const encryptedAesKeyForSender = await encryptAesKey(exportedAesKey,senderPublicKey)


        await api.post('/exchange',{
          recieverId : selectedUserId,
          encryptedAesKeyForReciever,
          encryptedAesKeyForSender

        })

        aesKeyStore.current.set(selectedUserId, exportedAesKey);
        console.log('New AES key generated, exchanged and stored for chat with user', selectedUserId);

      
      }
    }

      const init = async ()=>{
        await setupAesKey();
        await fetchMessagesWithUser(selectedUserId);
      }

      init();
    
    setTypingUser(null);
  },[selectedUserId]);   // GENERATE AES KEY WHEN CHAT IS SELECTED




  

 async function getUsers(){

    // FETCH USERS FROM SERVER

    try
    {
      const response = await api.get('/feature/users');
      console.log('FETCHED USERS', response.data);
      const preselectUser = location.state?.preselectUser;
      if (!preselectUser) {
        setFetchedUsers(response.data);
        return;
      }

      const preselectId = String(preselectUser?.id ?? preselectUser?._id ?? '');
      if (!preselectId) {
        setFetchedUsers(response.data);
        return;
      }

      const exists = response.data.some((entry) => String(entry?.id ?? entry?._id) === preselectId);
      setFetchedUsers(exists ? response.data : [preselectUser, ...response.data]);
    }

    catch(err)
    {
      console.error('Error fetching users', err);
      return;
    }





  }

  async function fetchMessagesWithUser(selectedUserId){
    // FETCH MESSAGES FROM SERVER BETWEEN LOGGED IN USER AND selectedUserId

    try
    {
      const response = await api.get('/feature/messages', {
        params: { recieverId: selectedUserId }
      });

      console.log('FETCHED MESSAGES', response.data);

     // DECRYPT MESSAGES HERE BEFORE SETTING STATE

     const decryptedMessages = [];
     for(const msg of response.data)
     {
      try {
        if(!msg.iv || !msg.content)
        {
          decryptedMessages.push(msg);
          continue;
        }

        if(!isBase64String(msg.iv) || !isBase64String(msg.content))
        {
          decryptedMessages.push(msg);
          continue;
        }

        const otherUserId = String(msg.sender) === String(currentUserId)
          ? String(msg.reciever)
          : String(msg.sender);

          

        const storedKey = aesKeyStore.current.get(otherUserId);
        if(!storedKey)
        {
          console.error('No AES key for this chat!!!');
          decryptedMessages.push(msg);
          continue;
        }

        const aesKey = typeof storedKey === 'string'
          ? await importAesKeyFromBase64(storedKey)
          : storedKey;

        const decryptedContent = await decryptMessage(aesKey , msg.iv , msg.content);
        decryptedMessages.push({
          ...msg,
          content : decryptedContent
        });
      }
      catch(decryptErr)
      {
        console.error('Error decrypting message', decryptErr);
        decryptedMessages.push(msg);
      }
     }



      
      setMessages(decryptedMessages);


    }

    catch(err)
    {
      console.error('Error fetching messages', err);
      return;
    }

  }

  const handleSendMessage = async ()=>{
    // SEND MESSAGE TO SERVER

    if(!draftMessage || !selectedUserId)
    {
      return;
    }
    if(!socket){
      console.error('No socket connection');
      return;
    }

    const storedAesKey = aesKeyStore.current.get(selectedUserId);
    if(!storedAesKey)
    {
      console.error('No AES key for this chat');
      return;
    }

    const aesKey = typeof storedAesKey === 'string'
      ? await importAesKeyFromBase64(storedAesKey)
      : storedAesKey;

    const encryptedContent = await encryptMessage(aesKey , draftMessage.trim());

    const payload = {
      recieverId : selectedUserId,
      content: encryptedContent.ciphertext,
      iv: encryptedContent.iv,
     
    };
    


    try
    {
      if(isFirstMessage)
       {
         
         await addToContacts(selectedUserId);
         setIsFirstMessage(false);
         
       }
      socket.emit('send_message', payload);
      setDraftMessage('');
       
      socket.emit('typing_indicator',{
        recieverId : selectedUserId,
        isTyping : false
      })
      setTyping(false);
    }
    catch(err)
    {
      if(isFirstMessage)
      {
        await deleteFromContacts(selectedUserId);     //WILL BE HANDLED LATER
      }
      console.error('Error sending message', err);
      return; 
    }

    

  }

  const addToContacts = async(recieverId)=>{

    try
    {
      await api.post('feature/contacts/add',{
      contactId : recieverId
    })

    }
    catch(err)
    {
      console.error('ERROR ADDING TO CONTACTS',err);
      return;
    }
   
  }
  

  const handleDraftChange = (event)=>{
    setDraftMessage(event.target.value);

    if(!socket || !selectedUserId)
    {
      return;
    }

    if(!typing)
    {
      setTyping(true);

      const payload = {
        recieverId : selectedUserId,
        isTyping : true
      }
      

      socket.emit('typing_indicator', payload);
    }

    clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(()=>{
      setTyping(false);
      const payload = {
        recieverId : selectedUserId,
        isTyping : false
      }
      socket.emit('typing_indicator', payload);
    }, 1000);
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 px-4 pt-4">
      <div className="max-w-6xl mx-auto bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-2xl rounded-4xl overflow-hidden h-[calc(100vh-80px)]">
        <div className="flex flex-col lg:flex-row h-full min-h-0">
          {/* User List */}
          <aside className="w-full lg:w-1/3 bg-slate-900/80 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col min-h-0">
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Chats</p>
                  <h2 className="text-2xl font-bold text-slate-100">Conversations</h2>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/find-users')}
                    className="w-12 h-12 rounded-2xl bg-linear-to-r from-blue-500 to-purple-500 text-white text-2xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                    aria-label="Add people"
                    title="Add people"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="mt-5">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search people"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 py-3 pl-4 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-400 focus:outline-none"
                  />
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-3.85z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {fetchedUsers.map((user) => {
                const normalizedId = String(user?.id ?? user?._id);
                const isActive = normalizedId === selectedUserId;
                const isOnline = onlineUserSet.has(normalizedId);
                const displayName = user.name || user.username || 'Unknown';
                const initials = displayName
                  .trim()
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <button
                    key={normalizedId}
                    onClick={() => setSelectedUserId(normalizedId)}
                    className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-all ${
                      isActive
                        ? 'bg-slate-800/80 border-l-4 border-blue-500'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="relative">
                      {user.ppUrl ? (
                        <img
                          src={user.ppUrl}
                          alt={displayName}
                          className="w-12 h-12 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-100 flex items-center justify-center font-semibold">
                          {initials}
                        </div>
                      )}
                      <span
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                          isOnline ? 'bg-emerald-400' : 'bg-slate-300'
                        }`}
                        aria-label={isOnline ? 'Online' : 'Offline'}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-100">{displayName}</p>
                      </div>
                      <p className={`text-xs font-semibold ${isOnline ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Chat Window */}
          <section className="flex-1 flex flex-col bg-slate-900/80 min-h-0">
            {selectedUser ? (
              <>
                <header className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {selectedUser.ppUrl ? (
                      <img
                        src={selectedUser.ppUrl}
                        alt={selectedUser.name}
                        className="w-14 h-14 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-100 flex items-center justify-center font-semibold text-lg">
                        {(selectedUser.name || selectedUser.username || 'U').trim().slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-slate-100">{selectedUser.name}</h3>
                      <p className={`text-sm font-medium ${isSelectedOnline ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {isSelectedOnline ? 'Online now' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="w-12 h-12 rounded-2xl border border-slate-700 text-slate-400 hover:text-blue-400 hover:border-blue-400 transition-colors">
                      <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </button>
                    <button className="w-12 h-12 rounded-2xl border border-slate-700 text-slate-400 hover:text-blue-400 hover:border-blue-400 transition-colors">
                      <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A2 2 0 0122 9.618V14.5a2 2 0 01-2.447 1.894L15 14M4 6h8M4 10h8m-8 4h8" />
                      </svg>
                    </button>
                  </div>
                </header>

                <div className="flex-1 min-h-0 px-6 py-6 space-y-6 bg-linear-to-b from-slate-900/80 to-slate-950 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm font-semibold tracking-wide text-slate-400">
                      {`START YOUR CHAT WITH ${(
                        selectedUser?.name || selectedUser?.username || 'USER'
                      ).toUpperCase()}`}
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const senderId = String(message.sender);
                      const isMine = currentUserId ? senderId === currentUserId : false;
                      const bubbleText = message.content ?? message.message ?? '';
                      const timestamp = message.createdAt
                        ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '';
                      const isRead = Boolean(message.isRead);
                      return (
                        <div key={message._id ?? index} className="flex flex-col">
                          <div
                            className={`max-w-[75%] rounded-3xl px-5 py-3 text-sm leading-relaxed shadow-sm ${
                              isMine
                                ? 'self-end bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-br-sm'
                                : 'self-start bg-slate-900 text-slate-200 border border-slate-700 rounded-bl-sm'
                            }`}
                          >
                            {bubbleText}
                          </div>
                          {timestamp && (
                            <div
                              className={`mt-1 flex items-center gap-1 text-xs ${
                                isMine ? 'self-end text-slate-400' : 'self-start text-slate-400'
                              }`}
                            >
                              <span>{timestamp}</span>
                              {isMine && <ReceiptIcon isRead={isRead} />}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  {typingDisplayName && (
                    <div className="flex pt-1">
                      <TypingIndicator displayName={typingDisplayName} />
                    </div>
                  )}
                </div>

                <div className="px-6 py-5 border-t border-slate-800 bg-slate-900/90">
                  <div className="flex items-center gap-3">
                    <button className="w-12 h-12 rounded-2xl border border-slate-700 text-slate-400 hover:text-blue-400 hover:border-blue-400 transition-colors">
                      <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-6 4h6M5 7h14M5 7l2-2m0 2L5 9" />
                      </svg>
                    </button>
                    <div className="flex-1 flex items-center gap-3 rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 shadow-sm">
                      <input
                        type="text"
                        value={draftMessage}
                        onChange={(e) => handleDraftChange(e)}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none"
                      />
                      <button className="text-slate-400 hover:text-blue-400 transition-colors" title="Attach">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m0 0l3-3m-3 3l-3-3M5 12a7 7 0 1114 0 7 7 0 01-14 0z" />
                        </svg>
                      </button>
                    </div>
                    <button className="px-6 py-3 rounded-3xl text-white font-semibold bg-linear-to-r from-blue-500 to-purple-500 shadow-lg shadow-purple-200/60 hover:shadow-purple-300/80 transition-all"
                      onClick={handleSendMessage}>
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center text-slate-400 py-20">
                Select a conversation to get started.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
