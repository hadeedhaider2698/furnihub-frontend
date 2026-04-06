import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useChatStore } from '../../store/chatStore.js';
import { useAuthStore } from '../../store/authStore.js';
import { Send, User as UserIcon, Store, Search, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Loader } from '../../components/ui/Loader.jsx';
import api from '../../services/api.js';

export default function Messages() {
  const [searchParams] = useSearchParams();
  const vendorIdFromQuery = searchParams.get('vendorId');
  const productIdFromQuery = searchParams.get('productId');
  const productTitleFromQuery = searchParams.get('productTitle');
  
  const { user } = useAuthStore();
  const { 
    conversations, 
    messages, 
    activeChat, 
    fetchConversations, 
    fetchMessages, 
    sendMessage, 
    setActiveChat, 
    isLoading 
  } = useChatStore();

  const [newMessage, setNewMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tempReceiver, setTempReceiver] = useState(null);
  const [loadingVendor, setLoadingVendor] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const initChats = async () => {
      // First fetch all known conversations
      await fetchConversations();
      
      const currentConversations = useChatStore.getState().conversations;
      
      if (vendorIdFromQuery) {
        setLoadingVendor(true);
        // 1. Check if we already have a conversation with this person
        const existingChat = currentConversations.find(c => 
          c.participants.some(p => p?._id?.toString() === vendorIdFromQuery.toString())
        );
        
        if (existingChat) {
          // Join existing conversation
          setActiveChat(existingChat._id);
          setIsSidebarOpen(false); // On mobile, show the chat pane immediately
          setLoadingVendor(false);
        } else {
          // 2. New chat: Pre-fill message and fetch vendor identity
          if (productTitleFromQuery) {
            setNewMessage(`Hi, I'm interested in: ${decodeURIComponent(productTitleFromQuery)}`);
          }
          
          try {
            const { data } = await api.get(`/vendor/user/${vendorIdFromQuery}`);
            if (data?.data?.vendor) {
              setTempReceiver({
                _id: vendorIdFromQuery,
                name: data.data.vendor.shopName,
                shopName: data.data.vendor.shopName,
                avatar: data.data.vendor.shopLogo,
                role: 'vendor'
              });
              setActiveChat(null);
              setIsSidebarOpen(false);
            }
          } catch (err) {
            console.error('Failed to resolve vendor identity', err);
            toast.error('Could not find vendor details.');
          } finally {
            setLoadingVendor(false);
          }
        }
      }
    };
    initChats();
  }, [fetchConversations, vendorIdFromQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = (chatId) => {
    setActiveChat(chatId);
    setIsSidebarOpen(false); // Mobile view focus
    setTempReceiver(null); // Clear temp state once a real chat is picked
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const chat = conversations.find(c => c._id === activeChat);
    const otherMember = chat 
      ? chat.participants.find(p => p?._id?.toString() !== user?._id?.toString()) 
      : null;
    
    // Recipient is either the existing member or the vendor from query
    const receiverId = otherMember ? otherMember._id : (tempReceiver?._id || vendorIdFromQuery);

    if (!receiverId || receiverId.toString() === user?._id?.toString()) {
      toast.error('Invalid recipient.');
      return;
    }

    try {
      const returnedChatId = await sendMessage(
        receiverId, 
        newMessage.trim(), 
        activeChat, 
        !activeChat ? productIdFromQuery : null
      );
      
      setNewMessage('');
      if (!activeChat) {
        setActiveChat(returnedChatId);
        setTempReceiver(null);
      }
    } catch (error) {
      console.error('Failed to send message', error);
      toast.error('Message failed to send.');
    }
  };

  const activeChatData = conversations.find(c => c._id == activeChat);
  const otherParticipant = activeChatData 
    ? (activeChatData.participants.find(p => p?._id?.toString() !== user?._id?.toString()) || activeChatData.participants[0])
    : tempReceiver;

  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-120px)] flex gap-6 overflow-hidden">
      {/* Sidebar: Chat List */}
      <aside className={`${isSidebarOpen ? 'flex' : 'hidden md:flex'} w-full md:w-80 flex-col border border-border rounded-2xl bg-surface overflow-hidden shadow-warm`}>
        <header className="p-4 border-b border-border bg-surface-2 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-primary">Messages</h2>
          <div className="p-2 bg-surface rounded-full shadow-sm">
            <Store size={18} className="text-accent" />
          </div>
        </header>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
            <Input placeholder="Search conversations..." className="pl-10 bg-surface-2 border-none rounded-full" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {isLoading && conversations.length === 0 ? (
            <div className="flex justify-center p-8">
              <Loader />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-text-secondary italic text-sm">
              No conversations found.
            </div>
          ) : (
            conversations.map((chat) => {
              const other = chat.participants.find(p => p?._id?.toString() !== user?._id?.toString());
              const isSelected = activeChat === chat._id;
              return (
                <button
                  key={chat._id}
                  onClick={() => handleSelectConversation(chat._id)}
                  className={`w-full p-4 flex items-center gap-3 border-b border-border hover:bg-surface-2 transition-colors text-left ${isSelected ? 'bg-primary/5 ring-1 ring-inset ring-primary' : ''}`}
                >
                  <img 
                    src={other?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${other?.name || other?._id}`} 
                    className="w-12 h-12 rounded-full border border-border object-cover bg-surface-2"
                    alt=""
                  />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-primary truncate">
                        {other?.shopName || other?.name || other?.email || 'Unknown User'}
                      </span>
                      <span className="text-[10px] text-text-secondary flex-shrink-0">{new Date(chat.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-text-secondary truncate flex-1 mr-2">
                        {chat.lastMessage?.content || 'Started a conversation'}
                      </p>
                      {chat.unreadCount?.[user._id] > 0 && (
                        <span className="flex-shrink-0 bg-accent text-[9px] text-white font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                          {chat.unreadCount[user._id]}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Main: Active Chat */}
      <main className={`${!isSidebarOpen || activeChat || tempReceiver ? 'flex' : 'hidden md:flex'} flex-1 flex-col border border-border rounded-2xl bg-surface overflow-hidden shadow-warm`}>
        {loadingVendor ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <Loader />
            <p className="mt-4 text-sm text-text-secondary">Securing your connection with the vendor...</p>
          </div>
        ) : activeChat || tempReceiver ? (
          <>
            <header className="p-4 border-b border-border bg-surface-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="md:hidden p-2 hover:bg-surface rounded-full"
                >
                  <ArrowLeft size={18} />
                </button>
                <img 
                  src={otherParticipant?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherParticipant?.name || otherParticipant?._id}`} 
                  className="w-10 h-10 rounded-full border border-border object-cover bg-surface"
                  alt=""
                />
                <div>
                  <h3 className="font-bold text-primary">
                    {otherParticipant?.shopName || otherParticipant?.name || otherParticipant?.email || 'Unknown User'}
                  </h3>
                  <p className="text-[10px] text-text-secondary uppercase tracking-tighter">{otherParticipant?.role || 'User'}</p>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-2/30 no-scrollbar">
              {activeChat ? (
                messages.map((msg) => (
                  <div 
                    key={msg._id} 
                    className={`flex ${msg.sender?._id?.toString() === user?._id?.toString() ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${msg.sender?._id?.toString() === user?._id?.toString() ? 'bg-primary text-white rounded-tr-none' : 'bg-surface border border-border text-primary rounded-tl-none'}`}>
                      <p>{msg.content}</p>
                      <span className={`text-[10px] mt-1 block ${msg.sender?._id?.toString() === user?._id?.toString() ? 'text-white/70' : 'text-text-secondary'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-text-secondary text-sm italic py-10">
                   <div className="mb-4 p-4 bg-primary/5 rounded-full">
                     <MessageCircle size={32} className="text-primary opacity-20" />
                   </div>
                   Start your conversation with {otherParticipant?.shopName || otherParticipant?.name}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-border bg-surface">
              <div className="flex gap-2">
                <Input 
                  placeholder="Type a message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-surface-2 border-none rounded-full px-6"
                />
                <Button type="submit" disabled={!newMessage.trim()} className="rounded-full w-12 h-12 p-0 flex items-center justify-center">
                  <Send size={18} />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-surface-2/30">
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-6 shadow-sm border border-border">
              <Search size={24} className="text-text-secondary opacity-40" />
            </div>
            <h3 className="font-serif text-xl font-bold text-primary mb-2">Select a Conversation</h3>
            <p className="text-text-secondary max-w-xs text-sm leading-relaxed">
              Pick a conversation from the list to start chatting with Vendors or our Support Team.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

// Fixed Lucide icon import
import { MessageCircle } from 'lucide-react';
