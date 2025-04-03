
import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, Volume2, Volume1, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';

const backgrounds = [
  { name: 'Forest', color: 'from-green-200 to-green-500/30' },
  { name: 'Ocean', color: 'from-blue-200 to-blue-500/30' },
  { name: 'Sunset', color: 'from-orange-200 to-purple-500/30' },
];

const BreathingPage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBg, setCurrentBg] = useState(backgrounds[0]);
  const [volume, setVolume] = useState(50);
  const [seconds, setSeconds] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [phaseText, setPhaseText] = useState('Inhale');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => {
          // Full breathing cycle is 12 seconds (4-2-6)
          const newSeconds = (prevSeconds + 1) % 12;
          
          // Update breath phase based on timing
          if (newSeconds === 0) {
            setBreathPhase('inhale');
            setPhaseText('Inhale');
          } else if (newSeconds === 4) {
            setBreathPhase('hold');
            setPhaseText('Hold');
          } else if (newSeconds === 6) {
            setBreathPhase('exhale');
            setPhaseText('Exhale');
          }
          
          return newSeconds;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const resetExercise = () => {
    setIsPlaying(false);
    setSeconds(0);
    setBreathPhase('inhale');
    setPhaseText('Inhale');
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-5 w-5" />;
    if (volume < 50) return <Volume1 className="h-5 w-5" />;
    return <Volume2 className="h-5 w-5" />;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-poppins font-semibold mb-6 text-sage">Breathing Exercises</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {backgrounds.map((bg) => (
          <Button
            key={bg.name}
            variant="outline"
            className={`h-20 bg-gradient-to-r ${bg.color} ${
              currentBg.name === bg.name ? 'ring-2 ring-sage' : ''
            }`}
            onClick={() => setCurrentBg(bg)}
          >
            {bg.name}
          </Button>
        ))}
      </div>
      
      <Card className={`bg-gradient-to-r ${currentBg.color} p-8 flex flex-col items-center justify-center min-h-[400px]`}>
        <CardContent className="flex flex-col items-center pt-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-poppins font-semibold mb-2">{phaseText}</h2>
            <p className="text-muted-foreground">
              {breathPhase === 'inhale' ? 'Breathe in deeply' : 
               breathPhase === 'hold' ? 'Hold your breath' : 
               'Slowly breathe out'}
            </p>
          </div>
          
          <div 
            className={`w-40 h-40 rounded-full bg-lavender/30 backdrop-blur-sm flex items-center justify-center mb-8 transition-all duration-300 ${
              breathPhase === 'inhale' ? 'scale-110 animate-breathing-circle' : 
              breathPhase === 'hold' ? 'scale-110' : 'scale-90'
            }`}
          >
            <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-3xl font-poppins">{breathPhase === 'inhale' ? '☁️' : breathPhase === 'hold' ? '✨' : '💨'}</span>
            </div>
          </div>
          
          <div className="flex gap-4 mb-6">
            <Button
              variant="outline" 
              size="icon"
              onClick={resetExercise}
              className="bg-white/30 backdrop-blur-sm hover:bg-white/40"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              variant="outline" 
              size="icon" 
              onClick={togglePlayPause}
              className="h-12 w-12 rounded-full bg-white/30 backdrop-blur-sm hover:bg-white/40"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
          </div>
          
          <div className="flex items-center gap-3 w-full max-w-xs">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-muted-foreground"
              onClick={() => setVolume(volume === 0 ? 50 : 0)}
            >
              {getVolumeIcon()}
            </Button>
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={(values) => setVolume(values[0])}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BreathingPage;
