import { useEffect, useRef, useState } from 'react';
import { Dimensions, ImageBackground, Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Cat settings!
const FISH_SIZE = 100; // Giant fish so paws can hit it
const BASE_SPEED = 1; // Adjust to make the fish faster/slower

export default function App() {
  const [fishPos, setFishPos] = useState({ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 });
  const [score, setScore] = useState(0);

  // Use refs for velocity so we don't restart the interval on every speed change
  const velocity = useRef({ dx: BASE_SPEED, dy: BASE_SPEED });

  useEffect(() => {
    const gameLoop = setInterval(() => {
      setFishPos((prev) => {
        let newX = prev.x + velocity.current.dx;
        let newY = prev.y + velocity.current.dy;

        // Bounce off the left/right walls
        if (newX <= 0 || newX >= SCREEN_WIDTH - FISH_SIZE) {
          velocity.current.dx *= -1; // Reverse X direction
          newX = newX <= 0 ? 0 : SCREEN_WIDTH - FISH_SIZE; // Keep inside bounds
        }

        // Bounce off the top/bottom walls
        if (newY <= 0 || newY >= SCREEN_HEIGHT - FISH_SIZE) {
          velocity.current.dy *= -1; // Reverse Y direction
          newY = newY <= 0 ? 0 : SCREEN_HEIGHT - FISH_SIZE; // Keep inside bounds
        }

        return { x: newX, y: newY };
      });
    }, 16); // ~60 FPS for smooth motion

    return () => clearInterval(gameLoop);
  }, []);

  const catchFish = () => {
    // Human gets a point!
    setScore((s) => s + 1);

    // Teleport the fish to a random new location
    setFishPos({
      x: Math.random() * (SCREEN_WIDTH - FISH_SIZE),
      y: Math.random() * (SCREEN_HEIGHT - FISH_SIZE),
    });

    // Give it a random new direction and slightly random speed
    velocity.current = {
      dx: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 5 + BASE_SPEED),
      dy: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 5 + BASE_SPEED),
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={require('../assets/images/f.jpg')} style={styles.imageb} resizeMode="cover">    
      {/* Dimmed score for the human watching */}
      <Text style={styles.scoreText}>Score: {score}</Text>

      {/* The Target */}
      <Pressable 
        style={[styles.fishContainer, { left: fishPos.x, top: fishPos.y }]} 
        onPress={catchFish}
      >
        <Text style={styles.fish}>🐠</Text>
      </Pressable>
      </ImageBackground>  
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Pitch black so the cat focuses on the fish
    overflow: 'hidden',
  },
  scoreText: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333', // Kept dark so it doesn't distract the cat
    zIndex: 1,
  },
  fishContainer: {
    position: 'absolute',
    width: FISH_SIZE,
    height: FISH_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  fish: {
    fontSize: FISH_SIZE * 0.8, // Scale emoji to fit container
  },
  imageb: {
        flex: 1,
        justifyContent: 'center',
    },
});