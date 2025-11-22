import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, User, Search } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser);
    }
  }, [selectedUser]);

  const loadData = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
    await loadConversations(user);
    setIsLoading(false);
  };

  const loadConversations = async (user) => {
    const sent = await base44.entities.Message.filter({ from_user: user.email });
    const received = await base44.entities.Message.filter({ to_user: user.email });
    
    const allMessages = [...sent, ...received];
    const uniqueUsers = [...new Set(
      allMessages.map(m => m.from_user === user.email ? m.to_user : m.from_user)
    )];
    
    const convos = await Promise.all(uniqueUsers.map(async (email) => {
      const userMessages = allMessages.filter(
        m => m.from_user === email || m.to_user === email
      );
      const unread = userMessages.filter(m => m.to_user === user.email && !m.read).length;
      const lastMessage = userMessages.sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      )[0];
      
      return {
        email,
        unread,
        lastMessage: lastMessage?.content || "",
        lastMessageDate: lastMessage?.created_date
      };
    }));
    
    convos.sort((a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate));
    setConversations(convos);
  };

  const loadMessages = async (email) => {
    const sent = await base44.entities.Message.filter({
      from_user: currentUser.email,
      to_user: email
    });
    const received = await base44.entities.Message.filter({
      from_user: email,
      to_user: currentUser.email
    });
    
    const allMessages = [...sent, ...received].sort(
      (a, b) => new Date(a.created_date) - new Date(b.created_date)
    );
    
    setMessages(allMessages);
    
    // Mark received messages as read
    const unreadIds = received.filter(m => !m.read).map(m => m.id);
    await Promise.all(unreadIds.map(id => 
      base44.entities.Message.update(id, { read: true })
    ));
    
    await loadConversations(currentUser);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    await base44.entities.Message.create({
      from_user: currentUser.email,
      to_user: selectedUser,
      content: newMessage
    });

    // Create notification
    await base44.entities.Notification.create({
      user_email: selectedUser,
      type: "message",
      content: `${currentUser.full_name || currentUser.email} sent you a message`,
      from_user: currentUser.email
    });

    setNewMessage("");
    await loadMessages(selectedUser);
  };

  const startNewConversation = () => {
    if (searchEmail && searchEmail !== currentUser.email) {
      setSelectedUser(searchEmail);
      setSearchEmail("");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0a1628] to-[#1b263b]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1b263b] to-[#0d1b2a] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Messages</h1>
        
        <div className="grid md:grid-cols-3 gap-4 h-[600px]">
          <Card className="border-cyan-900/50 bg-[#1b263b] p-4 overflow-y-auto">
            <div className="mb-4">
              <div className="flex gap-2">
                <Input
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Enter user email..."
                  className="bg-cyan-900/20 text-white border-cyan-700"
                  onKeyPress={(e) => e.key === 'Enter' && startNewConversation()}
                />
                <Button onClick={startNewConversation} size="icon" className="bg-cyan-600 hover:bg-cyan-700">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              {conversations.map((convo) => (
                <button
                  key={convo.email}
                  onClick={() => setSelectedUser(convo.email)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedUser === convo.email
                      ? 'bg-cyan-600'
                      : 'bg-cyan-900/20 hover:bg-cyan-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white truncate">{convo.email}</span>
                    {convo.unread > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {convo.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-cyan-300 truncate">{convo.lastMessage}</p>
                </button>
              ))}
              {conversations.length === 0 && (
                <p className="text-center text-cyan-400 py-8">
                  No conversations yet
                </p>
              )}
            </div>
          </Card>

          <Card className="md:col-span-2 border-cyan-900/50 bg-[#1b263b] flex flex-col">
            {selectedUser ? (
              <>
                <div className="border-b border-cyan-900/50 p-4">
                  <Link
                    to={`${createPageUrl("Profile")}?email=${encodeURIComponent(selectedUser)}`}
                    className="flex items-center gap-2 text-white hover:text-cyan-400"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-semibold">{selectedUser}</span>
                  </Link>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.from_user === currentUser.email ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.from_user === currentUser.email
                            ? 'bg-cyan-600 text-white'
                            : 'bg-cyan-900/40 text-cyan-100'
                        }`}
                      >
                        <p className="break-words">{msg.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {format(new Date(msg.created_date), "h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSend} className="border-t border-cyan-900/50 p-4">
                  <div className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="bg-cyan-900/20 text-white border-cyan-700"
                      rows={2}
                    />
                    <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-cyan-400">
                <div className="text-center">
                  <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation or start a new one</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}