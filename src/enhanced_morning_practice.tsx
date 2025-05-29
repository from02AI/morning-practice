/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

// Define Exercise type
interface Exercise {
  name: string;
  description: string;
}

// List of exercises to shuffle
const exercises: Exercise[] = [
  { name: "Cat-Cow Pose", description: "On hands and knees, alternate arching (cow) and rounding (cat) your spine." },
  { name: "High-Stepping/Marching in Place", description: "Lift knees high towards your chest with each step." },
  { name: "Leg Swings (Forward and Back)", description: "Stand on one leg, gently swing the other leg forward and backward. Use support if needed. Switch legs." },
  { name: "Bird Dog", description: "On hands and knees, extend your opposite arm straight forward and opposite leg straight back, keeping your core engaged and back flat. Alternate sides." },
  { name: "Plank", description: "Hold a straight line from head to heels, on forearms or hands. Engage your core." },
  { name: "Glute Bridges", description: "Lie on your back, knees bent, feet flat. Lift your hips off the floor, squeezing glutes." },
  { name: "Wall Push-Ups", description: "Stand facing a wall, place hands on the wall. Lean towards the wall by bending elbows, keeping body straight, then push back." },
  { name: "Mini Squats (or Chair Squats)", description: "Lower hips slightly as if about to sit (mini squat), or fully stand up from a chair and sit back down." },
  { name: "Lunges (Stationary or Alternating)", description: "Step one foot forward, lower hips until both knees are bent at about 90 degrees. Keep front knee over ankle. Alternate legs." },
  { name: "Heel Raises", description: "Stand, slowly rise onto the balls of your feet, lifting heels high, then slowly lower." },
  { name: "Low-Impact Jumping Jacks (Modified)", description: "Step one leg out to the side while raising arms overhead; return. Repeat on the other side (no jump)." },
  { name: "Standing Oblique Crunches", description: "Stand with feet hip-width apart, hands gently behind head. Crunch to one side, bringing elbow towards hip. Alternate sides." },
  { name: "Single Leg Balance", description: "Stand on one leg, trying to maintain balance. Switch legs after 15 seconds or hold for the full 30 if comfortable. Use support if needed." },
  { name: "Fire Hydrants", description: "On hands and knees, keep one knee bent at 90 degrees and lift it out to the side, hip height. Lower and repeat. Switch sides." },
  { name: "Seesaw Forearm Plank", description: "In a forearm plank, gently rock your body forward (nose over fingertips) and backward." },
  { name: "Tabletop Oblique Crunch", description: "From hands and knees, extend one leg back. Then, bring that knee towards the opposite elbow, crunching your side. Extend back. Switch sides." },
  { name: "Windshield Wipers (Seated or Lying)", description: "Seated: Sit with knees bent, feet flat. Lean back slightly on hands. Gently sway knees from side to side. Lying: Lie on back, knees bent, feet flat. Let knees fall to one side, then the other." },
  { name: "Modified Side Plank Reach", description: "Start in a modified side plank (on your knee and forearm). Reach your top arm underneath your body, then open it up towards the ceiling. Switch sides." },
  { name: "Dead Bug", description: "Lie on your back with arms extended towards the ceiling and knees bent at 90 degrees (shins parallel to floor). Slowly lower your opposite arm and leg towards the floor, keeping your lower back pressed into the mat. Return to start and alternate." },
  { name: "Wall Sit", description: "Lean against a wall and slide down until your knees are at a 90-degree angle, as if sitting in a chair. Hold." },
  { name: "Step-Ups", description: "Step up with one foot, then the other. Step down. Alternate lead foot. If no step, mimic the motion." },
  { name: "Superman", description: "Lie on your stomach with arms and legs extended. Simultaneously lift your arms, chest, and legs off the floor, keeping your neck in line with your spine. Hold briefly and lower." }
];

// App stages
const STAGES = {
  START: 'start',
  WARM_UP: 'warm_up',
  EXERCISE: 'exercise',
  COOL_DOWN: 'cool_down',
  COMPLETE: 'complete'
};

export default function MorningPracticeApp() {
  const [stage, setStage] = useState(STAGES.START);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [shuffledExercises, setShuffledExercises] = useState<Exercise[]>([]);
  const [totalExercises, setTotalExercises] = useState(10); // Can be adjusted
  const [isMuted, setIsMuted] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize AudioContext and SpeechSynthesis on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize SpeechSynthesis
      speechSynthesisRef.current = window.speechSynthesis;

      // Initialize AudioContext
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioContextRef.current = new AudioContextClass();
        } else {
          console.warn('AudioContext class not found. Sound effects will be disabled.');
        }
      } catch (e) {
        console.error('Web Audio API is not supported or failed to initialize:', e);
      }
    }

    return () => {
      // Cleanup SpeechSynthesis
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
      // Cleanup AudioContext
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(e => console.error("Error closing AudioContext:", e));
      }
      // Cleanup timer
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount and cleanup on unmount

  const playMeditationBell = useCallback(() => {
    if (!audioContextRef.current || isMuted || audioContextRef.current.state === 'closed') return;
    
    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 432; 
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 2);
  }, [isMuted]); // Depends on isMuted

  const speak = useCallback((text: string) => {
    if (isMuted || !speechSynthesisRef.current || typeof window === 'undefined') return;
    
    const speechSynthesis = speechSynthesisRef.current;
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) { // Ensure voices are loaded
        const femaleVoice = voices.find(voice => 
        (voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman') || 
        voice.name.toLowerCase().includes('girl')) && 
        voice.lang.startsWith(window.navigator.language.split('-')[0])
        );
        if (femaleVoice) {
        utterance.voice = femaleVoice;
        }
    }
    
    speechSynthesis.speak(utterance);
  }, [isMuted]); // Depends on isMuted

  const shuffleAndSetExercises = useCallback(() => {
    const shuffled = [...exercises];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledExercises(shuffled.slice(0, totalExercises));
  }, [totalExercises]);

  const startPractice = useCallback(() => {
    shuffleAndSetExercises();
    setStage(STAGES.WARM_UP);
    setTimeLeft(60); // 1 minute warm-up
    setIsTimerActive(true);
    speak("Warm up time. Perform slow stretching and easy movements from head to feet.");
  }, [shuffleAndSetExercises, speak]);

  const startExercise = useCallback(() => {
    if (shuffledExercises.length === 0 || exerciseIndex >= shuffledExercises.length) return;
    const currentExercise = shuffledExercises[exerciseIndex];
    
    const fullTextToSpeak = `${currentExercise.name}. ${currentExercise.description}`;
    
    if (!isMuted && speechSynthesisRef.current) {
      const utterance = new SpeechSynthesisUtterance(fullTextToSpeak);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      const voices = speechSynthesisRef.current.getVoices();
      if (voices.length > 0) {
          const femaleVoice = voices.find(voice => 
            (voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman') || 
            voice.name.toLowerCase().includes('girl')) && 
            voice.lang.startsWith(window.navigator.language.split('-')[0])
          );
          if (femaleVoice) {
            utterance.voice = femaleVoice;
          }
      }
      
      utterance.onend = () => {
        setTimeLeft(30); 
        setIsTimerActive(true);
      };
      
      speechSynthesisRef.current.cancel();
      speechSynthesisRef.current.speak(utterance);
    } else {
      setTimeLeft(30);
      setIsTimerActive(true);
    }
  }, [shuffledExercises, exerciseIndex, isMuted, speak, totalExercises]);


  const resetPractice = useCallback(() => {
    setStage(STAGES.START);
    setTimeLeft(0);
    setIsTimerActive(false);
    setExerciseIndex(0);
    setShuffledExercises([]);
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prevMuted => {
      const newMutedState = !prevMuted;
      if (speechSynthesisRef.current && newMutedState) {
        speechSynthesisRef.current.cancel();
      }
      return newMutedState;
    });
  }, []);

  // Timer and practice transitions
  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      if (intervalIdRef.current) { // Clear any existing interval before setting a new one
         clearInterval(intervalIdRef.current);
      }
      intervalIdRef.current = setInterval(() => {
        setTimeLeft(prevTimeLeft => {
          if (prevTimeLeft === 1) {
            playMeditationBell();
          }
          return prevTimeLeft - 1;
        });
      }, 1000);
    } else if (isTimerActive && timeLeft === 0) {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      setIsTimerActive(false); // Stop timer before transitioning

      if (stage === STAGES.WARM_UP) {
        setStage(STAGES.EXERCISE);
        speak("Warm-up complete. Ready for your first exercise.");
      } else if (stage === STAGES.EXERCISE) {
        if (exerciseIndex < totalExercises - 1) {
          playMeditationBell();
          setExerciseIndex(prevIndex => prevIndex + 1);
          speak("Exercise complete. Ready for next exercise.");
        } else {
          setStage(STAGES.COOL_DOWN);
          setTimeLeft(60); // 1 minute cool-down
          setIsTimerActive(true); // Reactivate timer for cool down
          playMeditationBell();
          speak("All exercises complete. Cool down time. Stay in child pose and take deep abdominal breaths.");
        }
      } else if (stage === STAGES.COOL_DOWN) {
        setStage(STAGES.COMPLETE);
        playMeditationBell();
        speak("Congratulations! Your practice is complete. Your body and mind thank you.");
      }
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        // No need to set to null here as it's handled in the main logic or initial mount cleanup
      }
    };
  }, [isTimerActive, timeLeft, stage, exerciseIndex, totalExercises, playMeditationBell, speak]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentExercise = (stage === STAGES.EXERCISE && shuffledExercises.length > exerciseIndex) ? 
    shuffledExercises[exerciseIndex] : null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4 font-sans">
      <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 py-6 px-6 text-white text-center relative">
          <h1 className="text-3xl font-bold">Morning Practice</h1>
          <p className="text-blue-100 mt-1">Start your day with mindful movement</p>
          <button 
            onClick={toggleMute}
            className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-25 hover:bg-opacity-40 transition-all focus:outline-none focus:ring-2 focus:ring-white"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l2 2" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            )}
          </button>
        </header>
        
        <main className="p-6 min-h-[500px] flex flex-col">
          {stage === STAGES.START && (
            <section className="text-center py-8 flex-grow flex flex-col justify-center items-center">
              <div className="text-6xl mb-6 text-purple-500">🌞</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ready to begin?</h2>
              <p className="text-gray-600 mb-8 max-w-xs">
                A {Math.floor(60/60)}-minute warm-up, {totalExercises} exercises (30s each), and a {Math.floor(60/60)}-minute cool-down.
              </p>
              <button 
                onClick={startPractice}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-8 rounded-full shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-300 text-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
              >
                Start Practice
              </button>
            </section>
          )}
          
          {(stage === STAGES.WARM_UP || stage === STAGES.COOL_DOWN) && (
            <section className="flex flex-col items-center text-center py-8 flex-grow justify-center">
              <div className="w-36 h-36 rounded-full border-[10px] border-purple-300 flex items-center justify-center mb-6">
                <span className="text-4xl font-bold text-purple-700">{formatTime(timeLeft)}</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">{stage === STAGES.WARM_UP ? "Warm Up" : "Cool Down"}</h2>
              <p className="text-gray-600 mb-8 text-lg max-w-sm">
                {stage === STAGES.WARM_UP 
                  ? "Slow stretching and easy movements from head to feet." 
                  : "Stay in child pose and take deep abdominal breaths."}
              </p>
              <button 
                  onClick={resetPractice}
                  className="bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-full hover:bg-gray-300 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Reset
                </button>
            </section>
          )}
          
          {stage === STAGES.EXERCISE && currentExercise && (
            <section className="flex flex-col items-center text-center py-6 flex-grow">
              <div className="w-32 h-32 rounded-full border-[10px] border-purple-300 flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-purple-700">
                  {isTimerActive ? formatTime(timeLeft) : "0:30"}
                </span>
              </div>
              
              <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold mb-4 text-sm">
                Exercise {exerciseIndex + 1} of {totalExercises}
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {currentExercise.name}
              </h2>
              
              <p className="text-gray-600 mb-6 text-sm leading-relaxed min-h-[40px] px-2">
                {currentExercise.description}
              </p>
              
              <div className="mt-auto w-full flex flex-col items-center space-y-3">
                {!isTimerActive && (
                  <div className="flex space-x-3 mb-3">
                    <button 
                      onClick={startExercise}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 px-10 rounded-full shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-300 text-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    >
                      Go
                    </button>
                    <button 
                      onClick={() => speak(`${currentExercise.name}. ${currentExercise.description}`)}
                      className="bg-blue-100 text-blue-700 font-medium p-3 rounded-full hover:bg-blue-200 transition duration-300 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                      disabled={isMuted}
                      aria-label="Listen to instructions"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M4.93 4.93l14.14 14.14M12 19c-3.866 0-7-3.134-7-7 0-1.451.448-2.795 1.226-3.893m4.914 4.914a2 2 0 11-2.828-2.828M12 5c3.866 0 7 3.134 7 7 0 .956-.21 1.858-.586 2.671" /></svg>
                    </button>
                  </div>
                )}
                <button 
                  onClick={resetPractice}
                  className="bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-full hover:bg-gray-300 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Reset
                </button>
              </div>
            </section>
          )}
          
          {stage === STAGES.COMPLETE && (
            <section className="text-center py-8 flex-grow flex flex-col justify-center items-center">
              <div className="text-6xl mb-6 text-purple-500">🎉</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                You did great!
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Your body and mind thank you. See you tomorrow 😄
              </p>
              <button 
                onClick={resetPractice}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-8 rounded-full shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-300 text-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
              >
                Practice Again
              </button>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
