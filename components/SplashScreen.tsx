
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { AppContext } from '../contexts/AppContext';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { appInfo, t } = useContext(AppContext);
  const [isInteracted, setIsInteracted] = useState(false);

  // Function to generate a professional opening sound using the Web Audio API
  const playOpeningSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!audioContext) return;

      // Create two oscillators for a richer, chime-like sound
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Set frequencies for a pleasant interval (e.g., C5 and G5)
      oscillator1.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator2.frequency.setValueAtTime(783.99, audioContext.currentTime); // G5
      oscillator1.type = 'sine';
      oscillator2.type = 'sine';

      // Connect oscillators to gain node, and gain node to the speakers
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Control the volume envelope to create a gentle fade-in and fade-out
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.05); // Quick fade in
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 1.2); // Long fade out

      // Start and stop the sound
      oscillator1.start(audioContext.currentTime);
      oscillator2.start(audioContext.currentTime);
      oscillator1.stop(audioContext.currentTime + 1.2);
      oscillator2.stop(audioContext.currentTime + 1.2);
    } catch (error) {
      console.error("Could not play opening sound:", error);
    }
  }, []);

  // This handler is called on click or key press to ensure sound plays
  // in response to user interaction, respecting browser policies.
  const handleInteraction = useCallback(() => {
    if (isInteracted) return;
    setIsInteracted(true);
    playOpeningSound();
    // Delay the screen transition slightly to allow the sound to begin playing
    setTimeout(onFinish, 200);
  }, [isInteracted, onFinish, playOpeningSound]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleInteraction();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleInteraction]);

  return (
    <div
      onClick={handleInteraction}
      className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white cursor-pointer overflow-hidden"
    >
      <div className="text-center">
        <h1 className="text-6xl font-serif font-bold text-primary-400 mb-2 opacity-0 animate-fade-in-scale" style={{ animationDelay: '0.2s' }}>
          {appInfo.name}
        </h1>
        <p className="text-xl text-gray-300 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          {appInfo.version}
        </p>
      </div>

      <div className="absolute bottom-20 text-center text-gray-300 text-lg opacity-0 animate-fade-in-up" style={{ animationDelay: '1s' }}>
        <p className="animate-pulse">{t('splash.clickToBegin')}</p>
      </div>

      <div className="absolute bottom-8 text-center text-gray-400 text-sm opacity-0 animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
        <p>{t('splash.createdBy', { name: appInfo.creator.name })}</p>
        <p>{t('splash.copyright', { copyright: appInfo.copyright })}</p>
      </div>
    </div>
  );
};

export default SplashScreen;
