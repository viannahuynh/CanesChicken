import React from 'react';
import { Music, Brain, Gamepad2, Sparkles, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface HomePageProps {
  onNavigate: (tab: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const features = [
    {
      icon: Music,
      title: 'Record & Transcribe',
      description: 'Play your violin and watch your performance transform into beautiful sheet music in real-time.',
      color: 'black',
    },
    {
      icon: Brain,
      title: 'Smart Chord Suggestions',
      description: 'Get AI-powered chord recommendations that complement your melody and enhance your musical understanding.',
      color: 'gray',
    },
    {
      icon: Gamepad2,
      title: 'Competitive Game Mode',
      description: 'Challenge friends to match performances with accuracy scoring. Make practice fun and engaging!',
      color: 'red',
    },
  ];

  const benefits = [
    {
      icon: Sparkles,
      title: 'Instant Visualization',
      description: 'See your music come to life with key signatures, tempo, and note-perfect sheet music.',
    },
    {
      icon: TrendingUp,
      title: 'Improve Your Skills',
      description: 'Learn harmony, understand your playing style, and track your progress over time.',
    },
    {
      icon: Users,
      title: 'Social Practice',
      description: 'Turn solo practice into a social experience with competitive gameplay.',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12 relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-5 text-9xl select-none">
          <span>𝄞</span>
        </div>
        <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm shadow-lg hover:bg-red-600 transition-all duration-300">
          <Sparkles className="w-4 h-4" />
          AI-Powered Music Transcription
        </div>
        <h2 className="text-black max-w-3xl mx-auto relative">
          Transform Your Violin Playing Into Beautiful Sheet Music
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          ViolinAI combines cutting-edge audio processing with an intuitive interface to help musicians 
          of all levels visualize, understand, and improve their playing.
        </p>
        <div className="flex gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={() => onNavigate('studio')}
            className="bg-black hover:bg-red-600 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            Start Recording
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => onNavigate('game')}
            className="border-2 border-black hover:bg-black hover:text-white transition-all duration-300 hover:shadow-lg"
          >
            Play Game Mode
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card 
            key={index} 
            className={`border-2 border-black/10 hover:border-black hover:shadow-2xl transition-all duration-300 group bg-white/80 backdrop-blur-sm ${
              feature.color === 'red' ? 'hover:border-red-600' : ''
            }`}
          >
            <CardHeader>
              <div className={`w-12 h-12 ${
                feature.color === 'black' ? 'bg-black group-hover:bg-red-600' :
                feature.color === 'red' ? 'bg-red-600 group-hover:bg-black' :
                'bg-gray-800 group-hover:bg-black'
              } rounded-lg flex items-center justify-center mb-4 transition-all duration-300 shadow-lg`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-black">{feature.title}</CardTitle>
              <CardDescription className="text-gray-600">{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-black/10 relative overflow-hidden">
        <h3 className="text-black text-center mb-8 relative">How It Works</h3>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: '1', title: 'Record', description: 'Play a short melody on your violin', icon: '🎻' },
            { step: '2', title: 'Process', description: 'AI analyzes pitch, timing, and key', icon: '⚡' },
            { step: '3', title: 'Visualize', description: 'See your music as sheet notation', icon: '📝' },
            { step: '4', title: 'Enhance', description: 'Get chord suggestions and practice', icon: '✨' },
          ].map((step, index) => (
            <div key={index} className="text-center space-y-3 relative group">
              <div className="w-12 h-12 bg-black group-hover:bg-red-600 text-white rounded-full flex items-center justify-center mx-auto transition-all duration-300 shadow-lg group-hover:scale-110">
                {step.step}
              </div>
              <div className="text-2xl">{step.icon}</div>
              <h4 className="text-black">{step.title}</h4>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="grid md:grid-cols-3 gap-6">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex gap-4 group">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-black group-hover:bg-red-600 rounded-lg flex items-center justify-center transition-all duration-300 shadow-md">
                <benefit.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h4 className="text-black mb-1">{benefit.title}</h4>
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Decorative Music Notes */}
      <div className="text-center text-6xl text-gray-200 select-none py-8">
        <span className="inline-block animate-pulse">♪</span>
        <span className="inline-block mx-4 text-red-600/30">♫</span>
        <span className="inline-block animate-pulse">♬</span>
      </div>
    </div>
  );
}
