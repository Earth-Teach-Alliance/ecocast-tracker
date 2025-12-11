import React, { useState, useEffect, useRef } from "react";
import { agentSDK } from "@/agents";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Send, TrendingUp, Loader2, Plus, MessageSquare, ExternalLink, Smartphone } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import MessageBubble from "../components/agent/MessageBubble";

export default function TrendsAnalyst() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [availableLocations, setAvailableLocations] = useState([]);
  const messagesEndRef = useRef(null);
  const whatsappURL = agentSDK.getWhatsAppConnectURL('trends_analyst');

  useEffect(() => {
    loadConversations();
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const notes = await base44.entities.FieldNote.list();
      const locations = new Set();
      
      notes.forEach(note => {
        if (note.city) locations.add(note.city);
        if (note.state) locations.add(note.state);
        if (note.country) locations.add(note.country);
      });
      
      setAvailableLocations([...locations].sort().slice(0, 8));
    } catch (error) {
      console.error("Error loading locations:", error);
    }
  };

  useEffect(() => {
    if (activeConversation) {
      const unsubscribe = agentSDK.subscribeToConversation(activeConversation.id, (data) => {
        setMessages(data.messages || []);
        scrollToBottom();
      });
      return () => unsubscribe();
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    setIsLoading(true);
    const convos = await agentSDK.listConversations({ agent_name: "trends_analyst" });
    setConversations(convos);
    if (convos.length > 0) {
      selectConversation(convos[0]);
    }
    setIsLoading(false);
  };

  const selectConversation = async (conversation) => {
    setActiveConversation(conversation);
    const fullConvo = await agentSDK.getConversation(conversation.id);
    setMessages(fullConvo.messages || []);
  };

  const createNewConversation = async () => {
    const newConvo = await agentSDK.createConversation({
      agent_name: "trends_analyst",
      metadata: {
        name: `Analysis ${new Date().toLocaleDateString()}`,
        description: "Environmental trends analysis"
      }
    });
    setConversations([newConvo, ...conversations]);
    setActiveConversation(newConvo);
    setMessages([]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConversation || isSending) return;

    setIsSending(true);
    try {
      await agentSDK.addMessage(activeConversation, {
        role: "user",
        content: inputMessage
      });
      setInputMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setIsSending(false);
  };

  const suggestedQuestions = [
    "What are the environmental trends in my area?",
    "Analyze pollution patterns in coastal regions",
    "What wildlife changes have been observed recently?",
    "Predict future deforestation risks based on current data",
    "Compare water quality trends across different locations"
  ];


  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#1b263b] to-[#0d1b2a]">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white drop-shadow-lg">Human Impact Trends</h1>
                <p className="text-lg text-cyan-300">AI-powered insights from collected observations</p>
              </div>
            </div>
            <a
              href={whatsappURL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-lg shadow-green-500/30">

              <Smartphone className="w-4 h-4" />
              Connect WhatsApp
            </a>
          </div>

          <Card className="border-2 border-cyan-900/50 bg-gradient-to-r from-[#1b263b] to-[#0d1b2a] mb-6 shadow-xl shadow-cyan-500/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-2">What can this agent do?</h3>
                  <ul className="space-y-1 text-sm text-cyan-300">
                    <li>• Analyze environmental data patterns across regions</li>
                    <li>• Predict future environmental changes based on trends</li>
                    <li>• Compare impact categories and geographic areas</li>
                    <li>• Provide evidence-based conservation recommendations</li>
                    <li>• Identify areas needing more data collection</li>
                  </ul>
                </div>
                <a
                  href={whatsappURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="md:hidden flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors whitespace-nowrap">

                  <Smartphone className="w-4 h-4" />
                  WhatsApp
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="border-2 border-purple-100 shadow-lg">
              <CardHeader className="border-b border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-purple-900">Conversations</CardTitle>
                  <Button
                    size="sm"
                    onClick={createNewConversation}
                    className="bg-purple-600 hover:bg-purple-700">

                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-2">
                <ScrollArea className="h-[500px]">
                  {isLoading ?
                  <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    </div> :
                  conversations.length === 0 ?
                  <div className="text-center py-8 text-gray-500 text-sm">
                      No conversations yet
                    </div> :

                  <div className="space-y-2">
                      {conversations.map((conv) =>
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeConversation?.id === conv.id ?
                      "bg-purple-100 border-2 border-purple-300" :
                      "hover:bg-purple-50 border-2 border-transparent"}`
                      }>

                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 mt-1 text-purple-600" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900 truncate">
                                {conv.metadata?.name || "Analysis"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(conv.created_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </button>
                    )}
                    </div>
                  }
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="border-2 border-purple-100 shadow-lg">
              <CardHeader className="border-b border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                <CardTitle className="text-purple-900">
                  {activeConversation ? activeConversation.metadata?.name : "Select or create a conversation"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {!activeConversation ?
                <div className="flex flex-col items-center justify-center py-16 px-4">
                    <TrendingUp className="w-16 h-16 text-purple-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Analyzing Trends</h3>
                    <p className="text-gray-600 text-center mb-6">
                      Create a new conversation to get AI-powered insights from environmental data
                    </p>
                    <Button onClick={createNewConversation} className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="w-4 h-4 mr-2" />
                      New Analysis
                    </Button>
                  </div> :

                <>
                    <ScrollArea className="h-[500px] p-6">
                      {messages.length === 0 ?
                    <div className="space-y-4">
                          <div className="text-center text-gray-500 mb-6">
                            Ask me about environmental trends in any region
                          </div>
                          <div className="space-y-4">
                            {availableLocations.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-sm font-semibold text-gray-700">Analyze specific areas:</p>
                                <div className="flex flex-wrap gap-2">
                                  {availableLocations.map((location, idx) => (
                                    <button
                                      key={`loc-${idx}`}
                                      onClick={() => setInputMessage(`Analyze environmental trends in ${location}`)}
                                      className="px-3 py-1.5 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm font-medium transition-colors border border-purple-200"
                                    >
                                      {location}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-gray-700">General questions:</p>
                              {suggestedQuestions.map((question, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setInputMessage(question)}
                                  className="w-full text-left p-3 rounded-lg border-2 border-purple-100 hover:bg-purple-50 transition-colors text-sm text-gray-700"
                                >
                                  {question}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div> :

                    <div className="space-y-4">
                          {messages.map((message, idx) =>
                      <MessageBubble key={idx} message={message} />
                      )}
                        </div>
                    }
                      <div ref={messagesEndRef} />
                    </ScrollArea>

                    <div className="border-t border-purple-100 p-4 bg-white">
                      <form onSubmit={handleSendMessage} className="flex gap-3">
                        <Textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Ask about environmental trends in a specific region..."
                        className="resize-none"
                        rows={2}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }} />

                        <Button
                        type="submit"
                        disabled={!inputMessage.trim() || isSending}
                        className="bg-purple-600 hover:bg-purple-700 self-end">

                          {isSending ?
                        <Loader2 className="w-5 h-5 animate-spin" /> :

                        <Send className="w-5 h-5" />
                        }
                        </Button>
                      </form>
                    </div>
                  </>
                }
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>);

}