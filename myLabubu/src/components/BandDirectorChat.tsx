import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import bandDirectorImage from '../assets/Director.png';

interface Message {
  text: string;
  isUser: boolean;
}

const directorResponses = [
  "Is THAT the best you can do?! My grandmother plays better than that, and she's been dead for 15 years!",
  "Oh wonderful, another student who thinks they're the next Yo-Yo Ma. Newsflash: you're not.",
  "TEMPO! Do you even know what that word means?! You're dragging like a snail in molasses!",
  "I've heard better pitch from a broken kazoo. Again. From the top. NOW.",
  "You call that practice? I call it noise pollution. Try harder or get out of my band!",
  "Congratulations, you just massacred a perfectly good piece of music. Mozart is rolling in his grave.",
  "DYNAMICS! We have more than just LOUD and LOUDER! Read the sheet music!",
  "If you spent half as much time practicing as you do making excuses, you might actually be decent.",
  "That rhythm was so off, you created a new time signature. And not in a good way.",
  "Are you trying to give me a heart attack? Because that performance almost did.",
  "I don't ask for perfection. I demand it. Now show me you're worth my time!",
  "Your technique is sloppier than cafeteria spaghetti. Clean it up!",
  "Oh, you think you're done? We're just getting started. Five more times, with FEELING!",
  "I've trained professional musicians. You're not even amateur yet. Prove me wrong.",
  "That was... marginally less terrible than last time. Don't let it go to your head.",
];

const greetings = [
  "Well, well, well... another student who thinks they can just waltz into MY band? Show me what you've got!",
  "You better have a GOOD reason for interrupting my coffee break. What do you want?",
  "Ah, fresh meat. Tell me, can you actually PLAY an instrument, or are you just here to waste my time?",
];

export default function BandDirectorChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || messages.length === 0) {
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    if (lowerMessage.includes('help')) {
      return "Help?! HELP?! The only help you need is more PRACTICE! Now stop whining and play!";
    }
    
    if (lowerMessage.includes('good') || lowerMessage.includes('great')) {
      return "Good? GOOD?! Good is the enemy of GREAT! And you're not even close to either!";
    }
    
    if (lowerMessage.includes('sorry')) {
      return "Sorry doesn't fix wrong notes! Apologies don't improve your tone! PRACTICE does!";
    }
    
    if (lowerMessage.includes('tired')) {
      return "Tired?! Music doesn't care if you're tired! The audience doesn't care if you're tired! I certainly don't care if you're tired!";
    }
    
    return directorResponses[Math.floor(Math.random() * directorResponses.length)];
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getResponse(input);
      const directorMessage: Message = { text: response, isUser: false };
      setMessages(prev => [...prev, directorMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      setTimeout(() => {
        const greeting: Message = {
          text: greetings[Math.floor(Math.random() * greetings.length)],
          isUser: false,
        };
        setMessages([greeting]);
      }, 500);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <div className="fixed bottom-6 right-6 z-50">
            {/* Floating chat bubble */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: 1,
                y: [-3, 3, -3]
              }}
              exit={{ opacity: 0, y: 10 }}
              transition={{
                opacity: { duration: 0.3 },
                y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute -top-3 -right-1"
            >
              <div className="bg-gradient-to-br from-[#1e66b8] to-[#2d5a8f] rounded-full p-1.5 shadow-lg">
                <MessageCircle className="w-3.5 h-3.5 text-white" />
              </div>
            </motion.div>

            {/* Director button */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpen}
              className="w-20 h-20 rounded-full shadow-2xl overflow-hidden border-4 border-[#1e66b8]/60 bg-gradient-to-br from-[#1e66b8] to-[#2d5a8f] hover:shadow-[#1e66b8]/50 transition-shadow"
            >
              <img 
                src={bandDirectorImage} 
                alt="Band Director" 
                className="w-full h-full object-cover"
              />
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 w-96 z-50"
          >
            <Card className="border border-white/60 shadow-2xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#1e66b8] to-[#2d5a8f] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
                    <img 
                      src={bandDirectorImage} 
                      alt="Band Director" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-white" style={{ fontWeight: 700 }}>The Director</h3>
                    <p className="text-xs text-white/80">Will you get on his band?</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-3">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.isUser
                          ? 'bg-gradient-to-r from-[#1e66b8] to-[#2d5a8f] text-white'
                          : 'bg-white/60 backdrop-blur-sm text-[#1e3a5f] border border-white/60'
                      }`}
                    >
                      {!message.isUser && (
                        <p className="text-xs opacity-70 mb-1" style={{ fontWeight: 600 }}>Director:</p>
                      )}
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <motion.span
                          className="w-2 h-2 bg-[#1e3a5f] rounded-full"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        />
                        <motion.span
                          className="w-2 h-2 bg-[#1e3a5f] rounded-full"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.span
                          className="w-2 h-2 bg-[#1e3a5f] rounded-full"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/60 bg-white/40 backdrop-blur-sm">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1 bg-white/60 border-white/60 text-[#1e3a5f] placeholder:text-[#1e3a5f]/50"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="bg-gradient-to-r from-[#1e66b8] to-[#2d5a8f] hover:from-[#2d5a8f] hover:to-[#4a7ba7] text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
