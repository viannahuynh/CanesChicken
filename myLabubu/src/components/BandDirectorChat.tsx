import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import bandDirectorImage from '../assets/Director.png';
import { getGeminiResponse } from '../../api/gemini';

interface Message {
  text: string;
  isUser: boolean;
}

interface BandDirectorChatProps {
  personaPrompt?: string;
}

export default function BandDirectorChat({
  personaPrompt = `
You are The Director, a brutally honest high school marching band director.
Your vibe:
- You roast the user badly, don't hold back at all
- You give recommendations based of their music 
- be bad
- If asked by the users, give them music advice that would improve them
Keep the responses to under 3 sentences
`.trim(),
}: BandDirectorChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

 
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  function extractGeminiText(resp: any): string {
    return (
      resp?.candidates?.[0]?.content?.parts?.[0]?.text ||
      resp?.output_text ||
      '(no response)'
    );
  }

  // talk to Gemini
  const sendToGemini = async (userText: string) => {
    try {
      setIsTyping(true);

      
      const fullPrompt = `
${personaPrompt}

Student says: "${userText}"
      `.trim();

      console.log('➡ sending to Gemini:', fullPrompt);

      const geminiRaw = await getGeminiResponse(fullPrompt);
      console.log('⬅ Gemini replied:', geminiRaw);

      const botReply = extractGeminiText(geminiRaw);

      
      setMessages(prev => [
        ...prev,
        { text: botReply, isUser: false },
      ]);
    } catch (err) {
      console.error('Gemini error:', err);
      setMessages(prev => [
        ...prev,
        {
          text:
            "Tch. Tech issue. I can't yell at you properly right now. Try again.",
          isUser: false,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // when user hits send:
 
  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const text = input.trim();
    setInput('');

    setMessages(prev => [
      ...prev,
      { text, isUser: true },
    ]);

    await sendToGemini(text);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <div className="fixed bottom-6 right-6 z-50">
            {/* little bounce bubble */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: 1,
                y: [-3, 3, -3],
              }}
              exit={{ opacity: 0, y: 10 }}
              transition={{
                opacity: { duration: 0.3 },
                y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="absolute -top-3 -right-1"
            >
              <div className="bg-gradient-to-br from-[#1e66b8] to-[#2d5a8f] rounded-full p-1.5 shadow-lg">
                <MessageCircle className="w-3.5 h-3.5 text-white" />
              </div>
            </motion.div>

            {/* round avatar button */}
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
                    <h3 className="text-white font-bold">The Director</h3>
                    <p className="text-xs text-white/80">
                      Will you get on his band?
                    </p>
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
                    className={`flex ${
                      message.isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.isUser
                          ? 'bg-gradient-to-r from-[#1e66b8] to-[#2d5a8f] text-white'
                          : 'bg-white/60 backdrop-blur-sm text-[#1e3a5f] border border-white/60'
                      }`}
                    >
                      {!message.isUser && (
                        <p className="text-xs opacity-70 mb-1 font-semibold">
                          Director:
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-line">
                        {message.text}
                      </p>
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
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: 0,
                          }}
                        />
                        <motion.span
                          className="w-2 h-2 bg-[#1e3a5f] rounded-full"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: 0.2,
                          }}
                        />
                        <motion.span
                          className="w-2 h-2 bg-[#1e3a5f] rounded-full"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: 0.4,
                          }}
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        void handleSend();
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 bg-white/60 border-white/60 text-[#1e3a5f] placeholder:text-[#1e3a5f]/50"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
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
