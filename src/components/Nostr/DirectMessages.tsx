
import React, { useState, useEffect, useRef } from "react";
import { useNostr } from "../../hooks/useNostr";
import { Event } from "nostr-tools";
import { Send, User, MessageSquare, ArrowLeft, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/components/ui/use-toast";

export const DirectMessages: React.FC = () => {
  const { keys, getDirectMessages, sendDirectMessage, getProfileEvents, profileData, refreshProfileData } = useNostr();
  const [activeContact, setActiveContact] = useState<string | null>(null);
  const [contacts, setContacts] = useState<string[]>([]);
  const [messages, setMessages] = useState<Event[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadContacts = async () => {
    setIsLoading(true);
    try {
      // Get all direct messages for the user
      const allMessages = await getDirectMessages();
      
      // Extract unique pubkeys from the messages (both sender and recipient)
      const contactSet = new Set<string>();
      
      allMessages.forEach(msg => {
        if (msg.pubkey !== keys?.publicKey) {
          contactSet.add(msg.pubkey);
        }
        
        const recipientTag = msg.tags.find(tag => tag[0] === 'p');
        if (recipientTag && recipientTag[1] !== keys?.publicKey) {
          contactSet.add(recipientTag[1]);
        }
      });
      
      const contactsList = Array.from(contactSet);
      setContacts(contactsList);
      
      // Load profiles for all contacts
      const pubkeysToFetch = contactsList.filter(pk => !profileData[pk]);
      if (pubkeysToFetch.length > 0) {
        await getProfileEvents(pubkeysToFetch);
        pubkeysToFetch.forEach(pk => refreshProfileData(pk));
      }
    } catch (error) {
      console.error("Failed to load contacts:", error);
      toast({
        title: "Error",
        description: "Failed to load your contacts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (pubkey: string) => {
    setLoadingMessages(true);
    try {
      const msgs = await getDirectMessages(pubkey);
      // Sort messages by timestamp
      const sortedMessages = msgs.sort((a, b) => a.created_at - b.created_at);
      setMessages(sortedMessages);
      
      // Make sure we have the profile data
      if (!profileData[pubkey]) {
        await refreshProfileData(pubkey);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeContact || !newMessage.trim() || !keys?.publicKey) return;
    
    try {
      const success = await sendDirectMessage(activeContact, newMessage);
      
      if (success) {
        // Refresh the messages
        setNewMessage("");
        loadMessages(activeContact);
      } else {
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const getDisplayName = (pubkey: string) => {
    const profile = profileData[pubkey];
    return profile?.display_name || profile?.name || pubkey.slice(0, 8) + '...';
  };

  // Load contacts on initial render
  useEffect(() => {
    loadContacts();
  }, []);

  // Scroll to bottom of messages when they change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load messages when active contact changes
  useEffect(() => {
    if (activeContact) {
      loadMessages(activeContact);
    }
  }, [activeContact]);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Direct Messages</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex h-[70vh]">
          {/* Contact list */}
          <div className={`w-full ${activeContact ? 'hidden md:block md:w-1/3' : 'w-full'} border-r border-gray-200`}>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-gestalt-purple" />
                Conversations
              </h2>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-gestalt-purple" />
              </div>
            ) : contacts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No conversations yet</p>
                <p className="text-sm mt-1">Your direct messages will appear here</p>
              </div>
            ) : (
              <div className="overflow-y-auto h-full pb-16">
                {contacts.map(contact => (
                  <button
                    key={contact}
                    onClick={() => setActiveContact(contact)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center border-b border-gray-100"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {profileData[contact]?.picture ? (
                        <img 
                          src={profileData[contact].picture} 
                          alt={getDisplayName(contact)} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium">{getDisplayName(contact)}</div>
                      <div className="text-xs text-gray-500">
                        {profileData[contact]?.nip05 || contact.slice(0, 12) + '...'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Messages */}
          <div className={`${activeContact ? 'w-full md:w-2/3' : 'hidden'} flex flex-col`}>
            {activeContact ? (
              <>
                <div className="p-4 border-b border-gray-200 flex items-center">
                  <button 
                    onClick={() => setActiveContact(null)}
                    className="md:hidden mr-2"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-500" />
                  </button>
                  
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {profileData[activeContact]?.picture ? (
                      <img 
                        src={profileData[activeContact].picture} 
                        alt={getDisplayName(activeContact)} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="font-medium">{getDisplayName(activeContact)}</div>
                    <div className="text-xs text-gray-500">
                      {profileData[activeContact]?.nip05 || activeContact.slice(0, 12) + '...'}
                    </div>
                  </div>
                </div>
                
                {loadingMessages ? (
                  <div className="flex-1 flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-gestalt-purple" />
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 mt-10">
                        <p>No messages yet</p>
                        <p className="text-sm mt-1">Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map(message => {
                        const isMine = message.pubkey === keys?.publicKey;
                        return (
                          <div 
                            key={message.id}
                            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`max-w-[75%] rounded-lg px-4 py-2 ${
                                isMine ? 'bg-gestalt-purple text-white' : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <div className="text-sm">{message.content}</div>
                              <div className={`text-xs mt-1 ${isMine ? 'text-gestalt-purple-100' : 'text-gray-500'}`}>
                                {formatDistanceToNow(new Date(message.created_at * 1000), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
                
                <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
                  <div className="flex">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 border border-gray-300 rounded-l-md p-2 focus:outline-none focus:ring-1 focus:ring-gestalt-purple focus:border-gestalt-purple"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-gestalt-purple text-white rounded-r-md px-4 py-2 flex items-center justify-center disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-4 text-gray-500">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
