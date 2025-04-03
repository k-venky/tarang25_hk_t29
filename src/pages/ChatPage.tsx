
import React, { useState, useRef, useEffect } from 'react';
import { Send, Info, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { generateChatResponse, generateAudioFromText } from '@/services/ChatService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: number | string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  audioUrl?: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    text: "Hi there! I'm your mental health assistant. How are you feeling today?",
    sender: 'bot',
    timestamp: new Date(),
  },
];

const QUICK_REPLIES = [
  "I'm feeling anxious",
  "I need some coping strategies",
  "Tell me about stress management",
  "I'm having trouble sleeping"
];

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Load chat history from database
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          const formattedMessages: Message[] = data.map(msg => ({
            id: msg.id,
            text: msg.content,
            sender: msg.role === 'user' ? 'user' : 'assistant',
            timestamp: new Date(msg.created_at),
          }));
          
          setMessages([...INITIAL_MESSAGES, ...formattedMessages]);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        toast({
          title: 'Error',
          description: 'Failed to load chat history',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadChatHistory();
  }, [user, toast]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveMessageToDatabase = async (message: Omit<Message, 'id'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          role: message.sender === 'user' ? 'user' : 'assistant',
          content: message.text,
          created_at: message.timestamp.toISOString(),
        })
        .select();
        
      if (error) throw error;
      return data[0].id;
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  };

  const sendMessage = async (text: string = input) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMessage: Omit<Message, 'id'> = {
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    
    const userMessageId = await saveMessageToDatabase(userMessage);
    
    setMessages((prev) => [...prev, { ...userMessage, id: userMessageId || Date.now() }]);
    setInput('');
    
    // Simulate bot typing
    setIsTyping(true);
    
    try {
      // Get response from Mistral API
      const responseText = await generateChatResponse(text);
      
      // Generate audio if enabled
      let audioUrl = '';
      if (isAudioEnabled) {
        audioUrl = await generateAudioFromText(responseText);
      }
      
      const botMessage: Omit<Message, 'id'> = {
        text: responseText,
        sender: 'assistant',
        timestamp: new Date(),
        audioUrl
      };
      
      const botMessageId = await saveMessageToDatabase(botMessage);
      
      setMessages((prev) => [...prev, { ...botMessage, id: botMessageId || Date.now() }]);
      
      // Automatically play audio if enabled
      if (isAudioEnabled && audioUrl) {
        playAudio(audioUrl);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  const playAudio = (url: string) => {
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play();
      setIsAudioPlaying(true);
      
      audioRef.current.onended = () => {
        setIsAudioPlaying(false);
      };
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (isAudioEnabled && isAudioPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-13rem)]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-poppins font-semibold text-sage">Chat Support</h1>
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleAudio} 
            className="mr-2"
            aria-label={isAudioEnabled ? "Disable voice" : "Enable voice"}
          >
            {isAudioEnabled ? <Volume2 className="h-5 w-5 text-sage" /> : <VolumeX className="h-5 w-5 text-muted-foreground" />}
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="h-5 w-5 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">I'm an AI assistant here to support you. For emergencies, please use the crisis button.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="bg-white dark:bg-charcoal dark:bg-opacity-60 rounded-xl shadow-soft p-4 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`chat-bubble ${message.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}`}>
                <p className="mb-1">{message.text}</p>
                <div className="flex justify-between items-center">
                  <p className="text-xs opacity-70">{formatTime(message.timestamp)}</p>
                  {message.sender === 'assistant' && message.audioUrl && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-1 h-auto" 
                      onClick={() => playAudio(message.audioUrl!)}
                    >
                      <Volume2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="chat-bubble chat-bubble-bot">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>

        {/* Quick replies */}
        {messages.length < 3 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {QUICK_REPLIES.map((reply) => (
              <Button
                key={reply}
                variant="outline"
                size="sm"
                className="text-xs bg-lavender/10 border-lavender/30 text-lavender/90 hover:bg-lavender/20"
                onClick={() => sendMessage(reply)}
              >
                {reply}
              </Button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
          />
          <Button onClick={() => sendMessage()} className="bg-sage hover:bg-sage/90">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default ChatPage;
