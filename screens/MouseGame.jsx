import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  ImageBackground,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// --- Constants & Configuration ---
const MOUSE_BODY_WIDTH = 40;
const MOUSE_BODY_HEIGHT = 60;
const SAFE_BOUNDS = {
  minX: 30,
  maxX: width - MOUSE_BODY_WIDTH - 30,
  minY: 100,
  maxY: height - MOUSE_BODY_HEIGHT - 60,
};

const DEFAULT_SETTINGS = {
  speed: 1.5,
  soundEnabled: true,
  tailEnabled: true,
  darkMode: true,
};

// Squeak sound pool (Public domain URLs for out-of-the-box functionality)
const SQUEAK_SOUNDS = [
  'https://actions.google.com/sounds/v1/animals/mouse_squeak.ogg',
  'https://actions.google.com/sounds/v1/animals/mouse_squeak_short.ogg',
];

export default function App() {
  // --- State Management ---
  const [score, setScore] = useState(0);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Interactive Effects State
  const [pawPrints, setPawPrints] = useState([]);
  const [particles, setParticles] = useState([]);

  // --- Animation Values ---
  const xAnim = useRef(new Animated.Value(width / 2)).current;
  const yAnim = useRef(new Animated.Value(height / 2)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const squashAnimX = useRef(new Animated.Value(1)).current;
  const squashAnimY = useRef(new Animated.Value(1)).current;
  
  // Idle/Detail Animations
  const tailWiggle = useRef(new Animated.Value(0)).current;
  const breathAnim = useRef(new Animated.Value(1)).current;
  const earTwitch = useRef(new Animated.Value(0)).current;
  const eyeBlink = useRef(new Animated.Value(1)).current;

  // Track current position to calculate distances/angles safely without teleporting
  const currentPos = useRef({ x: width / 2, y: height / 2 });
  const currentAngle = useRef(0);

  // --- Initialization ---
  useEffect(() => {
    loadSettings();
    xAnim.addListener(({ value }) => (currentPos.current.x = value));
    yAnim.addListener(({ value }) => (currentPos.current.y = value));
    
    // Start ambient animations
    startAmbientAnimations();

    return () => {
      xAnim.removeAllListeners();
      yAnim.removeAllListeners();
    };
  }, []);

  // Watch for pause/resume
  useEffect(() => {
    if (!isPaused && !showSettings) {
      moveMouse();
    }
  }, [isPaused, showSettings]);

  // Play random squeaks occasionally
  useEffect(() => {
    let squeakInterval;
    if (!isPaused && settings.soundEnabled) {
      squeakInterval = setInterval(() => {
        if (Math.random() > 0.6) playSqueak();
      }, 4000);
    }
    return () => clearInterval(squeakInterval);
  }, [isPaused, settings.soundEnabled]);


  // --- Audio Logic ---
  const playSqueak = async () => {
    if (!settings.soundEnabled) return;
    try {
      const soundUrl = SQUEAK_SOUNDS[Math.floor(Math.random() * SQUEAK_SOUNDS.length)];
      const { sound } = await Audio.Sound.createAsync(
        { uri: soundUrl },
        { volume: 0.3 + Math.random() * 0.7 } // Slight volume variation
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) sound.unloadAsync();
      });
    } catch (error) {
      console.log('Audio playback error', error);
    }
  };


  // --- Ambient Animations (Breathing, Blinking, Tail, Ears) ---
  const startAmbientAnimations = () => {
    // Breathing
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(breathAnim, { toValue: 1, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) })
      ])
    ).start();

    // Eye Blink
    Animated.loop(
      Animated.sequence([
        Animated.delay(3000 + Math.random() * 2000),
        Animated.timing(eyeBlink, { toValue: 0, duration: 50, useNativeDriver: true }),
        Animated.timing(eyeBlink, { toValue: 1, duration: 50, useNativeDriver: true }),
      ])
    ).start();

    // Ear Twitch
    Animated.loop(
      Animated.sequence([
        Animated.delay(4000 + Math.random() * 3000),
        Animated.timing(earTwitch, { toValue: -0.2, duration: 100, useNativeDriver: true }),
        Animated.timing(earTwitch, { toValue: 0.2, duration: 100, useNativeDriver: true }),
        Animated.timing(earTwitch, { toValue: 0, duration: 100, useNativeDriver: true }),
      ])
    ).start();
  };


  // --- Core Movement Logic ---
  const getRandomPoint = () => ({
    x: Math.random() * (SAFE_BOUNDS.maxX - SAFE_BOUNDS.minX) + SAFE_BOUNDS.minX,
    y: Math.random() * (SAFE_BOUNDS.maxY - SAFE_BOUNDS.minY) + SAFE_BOUNDS.minY,
  });

  const getShortestAngle = (current, target) => {
    let diff = ((target - current + Math.PI) % (Math.PI * 2)) - Math.PI;
    return diff < -Math.PI ? diff + Math.PI * 2 : diff;
  };

  const moveMouse = useCallback((isEscape = false) => {
    if (isPaused || showSettings) return;

    const nextPoint = getRandomPoint();
    const dx = nextPoint.x - currentPos.current.x;
    const dy = nextPoint.y - currentPos.current.y;
    
    // Calculate required rotation (adding Math.PI/2 because mouse visually points up)
    const targetAngle = Math.atan2(dy, dx) + Math.PI / 2;
    const shortestDiff = getShortestAngle(currentAngle.current, targetAngle);
    const finalAngle = currentAngle.current + shortestDiff;
    currentAngle.current = finalAngle;

    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Randomize speed for unpredictable cat-friendly movement
    const randomSpeedMultiplier = isEscape ? 3 : (0.5 + Math.random() * 1.5);
    const baseDuration = (distance / 150) * 1000;
    const duration = Math.max(300, baseDuration / (settings.speed * randomSpeedMultiplier));

    // Tail Wiggle specific to movement
    if (settings.tailEnabled) {
      tailWiggle.stopAnimation();
      Animated.loop(
        Animated.sequence([
          Animated.timing(tailWiggle, { toValue: 0.5, duration: 100, useNativeDriver: true }),
          Animated.timing(tailWiggle, { toValue: -0.5, duration: 100, useNativeDriver: true }),
        ])
      ).start();
    }

    // Sequence: Rotate first, then move, then pause randomly
    Animated.sequence([
      Animated.timing(rotateAnim, {
        toValue: finalAngle,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad)
      }),
      Animated.timing(xAnim, {
        toValue: nextPoint.x,
        duration,
        useNativeDriver: true,
        easing: isEscape ? Easing.out(Easing.exp) : Easing.inOut(Easing.quad) // Natural accel/decel
      }),
      Animated.timing(yAnim, {
        toValue: nextPoint.y,
        duration: 0, // X and Y animate together. We use parallel below to sync them.
        useNativeDriver: true,
      })
    ]).stop(); // Clear previous sequence

    // Real execution syncing X and Y
    Animated.sequence([
      Animated.timing(rotateAnim, {
        toValue: finalAngle,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad)
      }),
      Animated.parallel([
        Animated.timing(xAnim, { toValue: nextPoint.x, duration, useNativeDriver: true, easing: isEscape ? Easing.out(Easing.exp) : Easing.inOut(Easing.quad) }),
        Animated.timing(yAnim, { toValue: nextPoint.y, duration, useNativeDriver: true, easing: isEscape ? Easing.out(Easing.exp) : Easing.inOut(Easing.quad) })
      ]),
      Animated.delay(isEscape ? 0 : Math.random() * 1000) // Random pause
    ]).start(({ finished }) => {
      if (finished) {
        tailWiggle.stopAnimation();
        Animated.spring(tailWiggle, { toValue: 0, useNativeDriver: true }).start();
        moveMouse(); // Loop endlessly
      }
    });
  }, [isPaused, showSettings, settings]);


  // --- Interaction Logic ---
  const handleTap = () => {
    // Stop current actions immediately
    xAnim.stopAnimation();
    yAnim.stopAnimation();
    rotateAnim.stopAnimation();
    
    setScore(s => s + 1);
    playSqueak();

    // Visual Effects (Paw Print & Particles)
    createPawPrint(currentPos.current.x, currentPos.current.y);
    createParticles(currentPos.current.x, currentPos.current.y);

    // Squash & Stretch Animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(squashAnimX, { toValue: 1.3, duration: 100, useNativeDriver: true }),
        Animated.timing(squashAnimY, { toValue: 0.7, duration: 100, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(squashAnimX, { toValue: 0.8, duration: 150, useNativeDriver: true }),
        Animated.timing(squashAnimY, { toValue: 1.2, duration: 150, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(squashAnimX, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(squashAnimY, { toValue: 1, duration: 100, useNativeDriver: true }),
      ])
    ]).start();

    // Trigger rapid escape
    moveMouse(true);
  };

  const createPawPrint = (x, y) => {
    const id = Date.now().toString();
    setPawPrints(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setPawPrints(prev => prev.filter(p => p.id !== id));
    }, 1500);
  };

  const createParticles = (x, y) => {
    const newParticles = Array.from({ length: 6 }).map((_, i) => ({
      id: `${Date.now()}_${i}`,
      x, y,
      angle: (i * 60) * (Math.PI / 180)
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(n => n.id === p.id)));
    }, 800);
  };


  // --- Settings & Storage ---
  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('@cat_settings');
      if (saved) setSettings(JSON.parse(saved));
    } catch (e) { }
  };

  const saveSettings = async (newSettings) => {
    setSettings(newSettings);
    try {
      await AsyncStorage.setItem('@cat_settings', JSON.stringify(newSettings));
    } catch (e) { }
  };

  const resetSettings = () => saveSettings(DEFAULT_SETTINGS);


  // --- Dynamic Styles based on Dark Mode ---
  const theme = {
    bg: settings.darkMode ? '#000000' : '#E5E5E5',
    mouse: settings.darkMode ? '#FFFFFF' : '#333333',
    ear: settings.darkMode ? '#FF3B30' : '#FF6B6B',
    nose: settings.darkMode ? '#FF2D55' : '#FF8DA1',
    tail: settings.darkMode ? '#FFFFFF' : '#333333',
    text: settings.darkMode ? '#FFFFFF' : '#000000',
    card: settings.darkMode ? 'rgba(30,30,30, 0.85)' : 'rgba(255,255,255, 0.9)',
    shadow: settings.darkMode ? '#FFFFFF' : '#000000',
  };


  // --- Interpolations ---
  const rotateString = rotateAnim.interpolate({
    inputRange: [0, Math.PI * 2],
    outputRange: ['0rad', `${Math.PI * 2}rad`]
  });

  const tailRotation = tailWiggle.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-30deg', '30deg']
  });

  const earRotationLeft = earTwitch.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-15deg', '15deg']
  });

  const earRotationRight = earTwitch.interpolate({
    inputRange: [-1, 1],
    outputRange: ['15deg', '-15deg']
  });


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ImageBackground  source={require('../assets/images/bg1.jpeg')} style={styles.imageb} resizeMode="cover">
      
      {/* --- Gameplay Area --- */}
      <TouchableWithoutFeedback onPress={() => { /* Missed tap */ }}>
        <View style={StyleSheet.absoluteFill}>
          
          {/* Paw Prints */}
          {pawPrints.map(paw => (
            <AnimatedPawPrint key={paw.id} x={paw.x} y={paw.y} color={theme.shadow} />
          ))}

          {/* Particles */}
          {particles.map(p => (
            <AnimatedParticle key={p.id} x={p.x} y={p.y} angle={p.angle} color={theme.ear} />
          ))}

          {/* The Mouse Component */}
          <Animated.View
            style={[
              styles.mouseWrapper,
              {
                transform: [
                  { translateX: xAnim },
                  { translateY: yAnim },
                  { rotate: rotateString },
                  { scaleX: squashAnimX },
                  { scaleY: squashAnimY },
                  { scale: breathAnim }, // Breathing effect
                ],
                // Add soft glow in dark mode for contrast
                shadowColor: theme.shadow,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: settings.darkMode ? 0.5 : 0.2,
                shadowRadius: 10,
              }
            ]}
          >
            <TouchableWithoutFeedback onPress={handleTap}>
              <View style={styles.mouseHitbox}>
                
                {/* Tail Container (Double height for bottom-anchor rotation) */}
                <Animated.View style={[styles.tailAnchor, { transform: [{ rotate: tailRotation }] }]}>
                  <View style={[styles.tail, { backgroundColor: theme.tail }]} />
                </Animated.View>

                {/* Ears */}
                <Animated.View style={[styles.ear, styles.earLeft, { backgroundColor: theme.ear, transform: [{ rotate: earRotationLeft }] }]} />
                <Animated.View style={[styles.ear, styles.earRight, { backgroundColor: theme.ear, transform: [{ rotate: earRotationRight }] }]} />

                {/* Main Body */}
                <View style={[styles.mouseBody, { backgroundColor: theme.mouse }]} />

                {/* Eyes */}
                <Animated.View style={[styles.eye, styles.eyeLeft, { transform: [{ scaleY: eyeBlink }] }]} />
                <Animated.View style={[styles.eye, styles.eyeRight, { transform: [{ scaleY: eyeBlink }] }]} />

                {/* Nose */}
                <View style={[styles.nose, { backgroundColor: theme.nose }]} />

              </View>
            </TouchableWithoutFeedback>
          </Animated.View>

        </View>
      </TouchableWithoutFeedback>

      {/* --- UI Overlay --- theme.card*/ }
      <View style={styles.header}>
        <View style={[styles.glassCard, { backgroundColor:"#6B4EEA" }]}>  
          <Text style={[styles.scoreText, { color: theme.text }]}>Score: {score}</Text>
        </View>
        
        <View style={styles.controls}>
          <Pressable 
            style={[styles.iconBtn, styles.glassCard, { backgroundColor: theme.card }]} 
            onPress={() => setIsPaused(!isPaused)}
          >
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: '900' }}>
              {isPaused ? '▶' : '||'}
            </Text>
          </Pressable>
          {/* <Pressable 
            style={[styles.iconBtn, styles.glassCard, { backgroundColor: theme.card, marginLeft: 10 }]} 
            onPress={() => setShowSettings(true)}
          >
            <Text style={{ color: theme.text, fontSize: 18 }}>⚙️</Text>
          </Pressable> */}
        </View>
      </View>

      {/* --- Settings Modal --- */}
      <Modal visible={showSettings} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Settings</Text>

            <View style={styles.settingRow}>
              <Text style={{ color: theme.text, fontSize: 16 }}>Speed ({settings.speed.toFixed(1)}x)</Text>
              {/* Native Slider substitute for single file constraint */}
              <View style={styles.pseudoSlider}>
                {[0.5, 1.0, 1.5, 2.0, 2.5].map(val => (
                  <Pressable 
                    key={val} 
                    style={[styles.sliderTick, settings.speed === val && { backgroundColor: theme.ear }]} 
                    onPress={() => saveSettings({ ...settings, speed: val })}
                  />
                ))}
              </View>
            </View>

            <View style={styles.settingRow}>
              <Text style={{ color: theme.text, fontSize: 16 }}>Sound Effects</Text>
              <Switch 
                value={settings.soundEnabled} 
                onValueChange={(v) => saveSettings({ ...settings, soundEnabled: v })}
                trackColor={{ true: theme.ear, false: '#777' }}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={{ color: theme.text, fontSize: 16 }}>Tail Animation</Text>
              <Switch 
                value={settings.tailEnabled} 
                onValueChange={(v) => saveSettings({ ...settings, tailEnabled: v })}
                trackColor={{ true: theme.ear, false: '#777' }}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={{ color: theme.text, fontSize: 16 }}>Cat Dark Mode</Text>
              <Switch 
                value={settings.darkMode} 
                onValueChange={(v) => saveSettings({ ...settings, darkMode: v })}
                trackColor={{ true: theme.ear, false: '#777' }}
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable onPress={resetSettings} style={styles.resetBtn}>
                <Text style={{ color: '#FF3B30', fontWeight: 'bold' }}>Reset</Text>
              </Pressable>
              
              <Pressable onPress={() => setShowSettings(false)} style={[styles.doneBtn, { backgroundColor: theme.text }]}>
                <Text style={{ color: theme.bg, fontWeight: 'bold', paddingHorizontal: 20, paddingVertical: 10 }}>Done</Text>
              </Pressable>
            </View>

          </View>
        </View>
      </Modal>
</ImageBackground>
    </SafeAreaView>
  );
}

// --- Micro-components for Effects ---

const AnimatedPawPrint = ({ x, y, color }) => {
  const opacity = useRef(new Animated.Value(0.6)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 1500, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      Animated.timing(scale, { toValue: 1.2, duration: 1500, useNativeDriver: true, easing: Easing.out(Easing.quad) })
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.pawPrint, { left: x, top: y, opacity, transform: [{ scale }], shadowColor: color, shadowOpacity: 0.8, shadowRadius: 5 }]}>
      <Text style={{ fontSize: 30, color: color === '#FFFFFF' ? 'white' : 'black' }}>🐾</Text>
    </Animated.View>
  );
};

const AnimatedParticle = ({ x, y, angle, color }) => {
  const distance = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(distance, { toValue: 60, duration: 600, useNativeDriver: true, easing: Easing.out(Easing.exp) }),
      Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();
  }, []);

  const translateX = distance.interpolate({ inputRange: [0, 60], outputRange: [0, Math.cos(angle) * 60] });
  const translateY = distance.interpolate({ inputRange: [0, 60], outputRange: [0, Math.sin(angle) * 60] });

  return (
    <Animated.View style={[styles.particle, { backgroundColor: color, left: x + 15, top: y + 25, opacity, transform: [{ translateX }, { translateY }] }]} />
  );
};


// --- Stylesheets ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header UI
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  glassCard: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  controls: {
    flexDirection: 'row',
  },
  iconBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },

  // Mouse Geometry
  mouseWrapper: {
    position: 'absolute',
    width: MOUSE_BODY_WIDTH,
    height: MOUSE_BODY_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mouseHitbox: {
    width: MOUSE_BODY_WIDTH,
    height: MOUSE_BODY_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mouseBody: {
    width: MOUSE_BODY_WIDTH,
    height: MOUSE_BODY_HEIGHT,
    borderRadius: 25,
    position: 'absolute',
  },
  ear: {
    width: 18,
    height: 18,
    borderRadius: 9,
    position: 'absolute',
    top: 5,
    zIndex: 2,
  },
  earLeft: {
    left: -5,
  },
  earRight: {
    right: -5,
  },
  eye: {
    width: 4,
    height: 4,
    backgroundColor: '#000',
    borderRadius: 2,
    position: 'absolute',
    top: 15,
    zIndex: 3,
  },
  eyeLeft: {
    left: 10,
  },
  eyeRight: {
    right: 10,
  },
  nose: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: -2,
    zIndex: 4,
  },
  tailAnchor: {
    position: 'absolute',
    width: 6,
    height: 100, // Double the tail length to anchor rotation in the middle (base of tail)
    bottom: -50,
    alignItems: 'center',
  },
  tail: {
    position: 'absolute',
    bottom: 0,
    width: 4,
    height: 50,
    borderRadius: 2,
  },

  // Effects
  pawPrint: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Settings Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    padding: 25,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  pseudoSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sliderTick: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#555',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
  },
  resetBtn: {
    padding: 10,
  },
  doneBtn: {
    borderRadius: 12,
  },
  imageb: {
        flex: 1,
        justifyContent: 'center',
    },
});