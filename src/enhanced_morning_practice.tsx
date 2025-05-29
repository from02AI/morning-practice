import { useState, useEffect, useRef } from 'react';

// List of exercises to shuffle
const exercises = [
  {
    name: "Cat-Cow Pose",
    description: "On hands and knees, alternate arching (cow) and rounding (cat) your spine."
  },
  {
    name: "High-Stepping/Marching in Place",
    description: "Lift knees high towards your chest with each step."
  },
  {
    name: "Leg Swings (Forward and Back)",
    description: "Stand on one leg, gently swing the other leg forward and backward. Use support if needed. Switch legs."
  },
  {
    name: "Bird Dog",
    description: "On hands and knees, extend your opposite arm straight forward and opposite leg straight back, keeping your core engaged and back flat. Alternate sides."
  },
  {
    name: "Plank",
    description: "Hold a straight line from head to heels, on forearms or hands. Engage your core."
  },
  {
    name: "Glute Bridges",
    description: "Lie on your back, knees bent, feet flat. Lift your hips off the floor, squeezing glutes."
  },
  {
    name: "Wall Push-Ups",
    description: "Stand facing a wall, place hands on the wall. Lean towards the wall by bending elbows, keeping body straight, then push back."
  },
  {
    name: "Mini Squats (or Chair Squats)",
    description: "Lower hips slightly as if about to sit (mini squat), or fully stand up from a chair and sit back down."
  },
  {
    name: "Lunges (Stationary or Alternating)",
    description: "Step one foot forward, lower hips until both knees are bent at about 90 degrees. Keep front knee over ankle. Alternate legs."
  },
  {
    name: "Heel Raises",
    description: "Stand, slowly rise onto the balls of your feet, lifting heels high, then slowly lower."
  },
  {
    name: "Low-Impact Jumping Jacks (Modified)",
    description: "Step one leg out to the side while raising arms overhead; return. Repeat on the other side (no jump)."
  },
  {
    name: "Standing Oblique Crunches",
    description: "Stand with feet hip-width apart, hands gently behind head. Crunch to one side, bringing elbow towards hip. Alternate sides."
  },
  {
    name: "Single Leg Balance",
    description: "Stand on one leg, trying to maintain balance. Switch legs after 15 seconds or hold for the full 30 if comfortable. Use support if needed."
  },
  {
    name: "Fire Hydrants",
    description: "On hands and knees, keep one knee bent at 90 degrees and lift it out to the side, hip height. Lower and repeat. Switch sides."
  },
  {
    name: "Seesaw Forearm Plank",
    description: "In a forearm plank, gently rock your body forward (nose over fingertips) and backward."
  },
  {
    name: "Tabletop Oblique Crunch",
    description: "From hands and knees, extend one leg back. Then, bring that knee towards the opposite elbow, crunching your side. Extend back. Switch sides."
  },
  {
    name: "Windshield Wipers (Seated or Lying)",
    description: "Seated: Sit with knees bent, feet flat. Lean back slightly on hands. Gently sway knees from side to side. Lying: Lie on back, knees bent, feet flat. Let knees fall to one side, then the other."
  },
  {
    name: "Modified Side Plank Reach",
    description: "Start in a modified side plank (on your knee and forearm). Reach your top arm underneath your body, then open it up towards the ceiling. Switch sides."
  },
  {
    name: "Dead Bug",
    description: "Lie on your back with arms extended towards the ceiling and knees bent at 90 degrees (shins parallel to floor). Slowly lower your opposite arm and leg towards the floor, keeping your lower back pressed into the mat. Return to start and alternate."
  },
  {
    name: "Wall Sit",
    description: "Lean against a wall and slide down until your knees are at a 90-degree angle, as if sitting in a chair. Hold."
  },
  {
    name: "Step-Ups",
    description: "Step up with one foot, then the other. Step down. Alternate lead foot. If no step, mimic the motion."
  },
  {
    name: "Superman",
    description: "Lie on your stomach with arms and legs extended. Simultaneously lift your arms, chest, and legs off the floor, keeping your neck in line with your spine. Hold briefly and lower."
  }
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
  const [shuffledExercises, setShuffledExercises] = useState([]);
  const [totalExercises, setTotalExercises] = useState(10);
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef(null);
  const speechSynthesisRef = useRef(window.speechSynthesis);

  // Initialize audio context
  useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('Web Audio API is not supported in this browser');
    }
    
    // Cancel any ongoing speech when component unmounts
    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  // Play meditation bell sound
  const playMeditationBell = () => {
    if (!audioContextRef.current || isMuted) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 432; // A peaceful frequency
    
    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContextRef.current.currentTime + 0.1); // Reduced volume for "weak" gong
    gainNode.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 2);
    
    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + 2);
  };

  // Speak text using speech synthesis
  const speak = (text) => {
    if (isMuted || !speechSynthesisRef.current) return;
    
    // Cancel any ongoing speech
    speechSynthesisRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower rate for clarity
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    // Try to select a female voice if available
    const voices = speechSynthesisRef.current.getVoices();
    const femaleVoice = voices.find(voice => 
      (voice.name.includes('female') || voice.name.includes('woman') || 
       voice.name.includes('Girl') || voice.name.includes('Female')) && 
      voice.lang.includes(navigator.language.split('-')[0])
    );
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    speechSynthesisRef.current.speak(utterance);
  };

  // Fisher-Yates shuffle algorithm
  const shuffleExercises = () => {
    const shuffled = [...exercises];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // Take just the first 10
    return shuffled.slice(0, 10);
  };

  // Start the practice session
  const startPractice = () => {
    const shuffled = shuffleExercises();
    setShuffledExercises(shuffled);
    setStage(STAGES.WARM_UP);
    setTimeLeft(60); // 1 minute warm-up
    setIsTimerActive(true);
    speak("Warm up time. Perform slow stretching and easy movements from head to feet.");
  };

  // Start a specific exercise
  const startExercise = () => {
    const currentExercise = shuffledExercises[exerciseIndex];
    
    // Read instructions first, then start the timer when speech ends
    const utterance = new SpeechSynthesisUtterance(`${currentExercise.name}. ${currentExercise.description}`);
    utterance.rate = 0.9; // Slightly slower rate for clarity
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    // Try to select a female voice if available
    const voices = speechSynthesisRef.current.getVoices();
    const femaleVoice = voices.find(voice => 
      (voice.name.includes('female') || voice.name.includes('woman') || 
       voice.name.includes('Girl') || voice.name.includes('Female')) && 
      voice.lang.includes(navigator.language.split('-')[0])
    );
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    // Start timer after speech ends
    utterance.onend = () => {
      setTimeLeft(30); // 30 seconds per exercise
      setIsTimerActive(true);
    };
    
    if (!isMuted && speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel(); // Cancel any ongoing speech
      speechSynthesisRef.current.speak(utterance);
    } else {
      // If muted, just start the timer immediately
      setTimeLeft(30);
      setIsTimerActive(true);
    }
  };

  // Reset everything
  const resetPractice = () => {
    setStage(STAGES.START);
    setTimeLeft(0);
    setIsTimerActive(false);
    setExerciseIndex(0);
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel(); // Stop any ongoing speech
    }
  };

  // Toggle mute for all sounds
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (speechSynthesisRef.current && !isMuted) {
      speechSynthesisRef.current.cancel(); // Stop speech if muting
    }
  };

  // Handle timer and practice transitions
  useEffect(() => {
    let interval = null;
    
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        // Play a soft gong at the last second of each counter
        if (timeLeft === 1) {
          playMeditationBell();
        }
        
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isTimerActive && timeLeft === 0) {
      clearInterval(interval);
      
      // Transition to next stage
      if (stage === STAGES.WARM_UP) {
        setStage(STAGES.EXERCISE);
        setIsTimerActive(false); // Wait for "Go" button
        speak("Warm-up complete. Ready for your first exercise.");
      } else if (stage === STAGES.EXERCISE) {
        if (exerciseIndex < totalExercises - 1) {
          playMeditationBell();
          setExerciseIndex(exerciseIndex + 1);
          setIsTimerActive(false); // Wait for "Go" button
          speak("Exercise complete. Ready for next exercise.");
        } else {
          setStage(STAGES.COOL_DOWN);
          setTimeLeft(60); // 1 minute cool-down
          setIsTimerActive(true);
          playMeditationBell();
          speak("All exercises complete. Cool down time. Stay in child pose and take deep abdominal breaths.");
        }
      } else if (stage === STAGES.COOL_DOWN) {
        setStage(STAGES.COMPLETE);
        playMeditationBell();
        speak("Congratulations! Your practice is complete. Your body and mind thank you.");
      }
    }
    
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, exerciseIndex, stage, totalExercises, isMuted]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Current exercise
  const currentExercise = stage === STAGES.EXERCISE && shuffledExercises.length > 0 ? 
    shuffledExercises[exerciseIndex] : null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 py-6 px-6 text-white text-center relative">
          <h1 className="text-3xl font-bold">Morning Practice</h1>
          <p className="text-blue-100 mt-2">Start your day with mindful movement</p>
          
          {/* Mute button in top right */}
          <button 
            onClick={toggleMute}
            className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" />
                <path d="M12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" />
                <path d="M14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Main content */}
        <div className="p-6">
          {stage === STAGES.START && (
            // Start screen
            <div className="text-center py-8">
              <div className="text-5xl mb-6 text-purple-500">🌞</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ready to begin?</h2>
              <p className="text-gray-600 mb-8">
                Your practice includes a 1-minute warm-up, 10 exercises (30 seconds each),
                and a 1-minute cool-down.
              </p>
              <button 
                onClick={startPractice}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-6 rounded-full shadow-md hover:shadow-lg transition duration-300 text-lg"
              >
                Start Practice
              </button>
            </div>
          )}
          
          {stage === STAGES.WARM_UP && (
            // Warm-up screen
            <div className="flex flex-col items-center text-center py-8">
              <div className="w-32 h-32 rounded-full border-8 border-purple-200 flex items-center justify-center mb-6">
                <span className="text-3xl font-bold text-purple-600">{formatTime(timeLeft)}</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Warm Up</h2>
              <p className="text-gray-600 mb-8 text-lg">
                Warm up with slow stretching and easy movements from head to feet
              </p>
              <div className="flex space-x-4">
                <button 
                  onClick={resetPractice}
                  className="bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-full hover:bg-gray-300 transition duration-300"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
          
          {stage === STAGES.EXERCISE && (
            // Exercise screen
            <div className="flex flex-col items-center text-center py-6">
              {isTimerActive ? (
                <div className="w-28 h-28 rounded-full border-8 border-purple-200 flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-purple-600">{formatTime(timeLeft)}</span>
                </div>
              ) : (
                <div className="w-28 h-28 rounded-full border-8 border-purple-200 flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-purple-600">0:30</span>
                </div>
              )}
              
              <div className="bg-purple-50 p-2 rounded-full text-purple-600 font-medium mb-4">
                Exercise {exerciseIndex + 1} of {totalExercises}
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                {currentExercise?.name}
              </h2>
              
              <p className="text-gray-600 mb-6">
                {currentExercise?.description}
              </p>
              
              {!isTimerActive && (
                <div className="flex space-x-4 mb-4">
                  <button 
                    onClick={startExercise}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-8 rounded-full shadow-md hover:shadow-lg transition duration-300 text-lg"
                  >
                    Go
                  </button>
                  
                  {/* Listen button to hear instructions again */}
                  <button 
                    onClick={() => speak(`${currentExercise?.name}. ${currentExercise?.description}`)}
                    className="bg-blue-100 text-blue-700 font-medium py-3 px-4 rounded-full hover:bg-blue-200 transition duration-300 flex items-center"
                    disabled={isMuted}
                  >
                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                    Listen
                  </button>
                </div>
              )}
              
              <button 
                onClick={resetPractice}
                className="bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-full hover:bg-gray-300 transition duration-300"
              >
                Reset
              </button>
            </div>
          )}
          
          {stage === STAGES.COOL_DOWN && (
            // Cool-down screen
            <div className="flex flex-col items-center text-center py-8">
              <div className="w-32 h-32 rounded-full border-8 border-purple-200 flex items-center justify-center mb-6">
                <span className="text-3xl font-bold text-purple-600">{formatTime(timeLeft)}</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Cool Down</h2>
              <p className="text-gray-600 mb-8 text-lg">
                Stay in child pose and take deep abdominal breaths
              </p>
              <div className="flex space-x-4">
                <button 
                  onClick={resetPractice}
                  className="bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-full hover:bg-gray-300 transition duration-300"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
          
          {stage === STAGES.COMPLETE && (
            // Completion screen
            <div className="text-center py-8">
              <div className="text-5xl mb-6 text-purple-500">🎉</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                You did great!
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Your body and mind thank you. See you tomorrow 😄
              </p>
              <button 
                onClick={resetPractice}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-6 rounded-full shadow-md hover:shadow-lg transition duration-300 text-lg"
              >
                Practice Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}