import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');
const BALL_SIZE = 90; // Large enough for a cat's paw

export default function BolGame() {
  // Animation Values
  const position = useRef(new Animated.ValueXY({ 
    x: width / 2 - BALL_SIZE / 2, 
    y: height / 2 - BALL_SIZE / 2 
  })).current;
  const scale = useRef(new Animated.Value(1)).current;
  
  // State
  const [score, setScore] = useState(0);
  const [color, setColor] = useState('#FFD700'); // Start with Yellow (Cats see yellow well)

  // Function to move the ball to a random position
  const moveBall = () => {
    // Keep ball within screen bounds
    const randomX = Math.random() * (width - BALL_SIZE);
    const randomY = Math.random() * (height - BALL_SIZE - 100) + 50; 

    Animated.parallel([
      Animated.spring(position, {
        toValue: { x: randomX, y: randomY },
        friction: 4, // Bouncy movement triggers prey drive
        tension: 20,
        useNativeDriver: true,
      }),
      // Micro-interaction: The Squish effect on movement
      Animated.sequence([
        Animated.timing(scale, { toValue: 0.7, duration: 100, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true })
      ])
    ]).start();
  };

  // Handle the cat's paw tap
  const handleCatch = () => {
    setScore(prev => prev + 1);

    // Micro-interaction: Shift to a new cat-friendly color
    const catColors = ['#0000FF', '#FFD700', '#00FFFF', '#32CD32', '#FFFFFF'];
    setColor(catColors[Math.floor(Math.random() * catColors.length)]);

    moveBall();
  };

  // Auto-move to keep the cat interested if they stop playing
  useEffect(() => {
    const interval = setInterval(() => {
      moveBall();
    }, 2500); 
    
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      
      {/* Optional: Score for the human to track */}
      <Text style={styles.scoreText}>Cat Score: {score}</Text>
      
      <Animated.View
        style={[
          styles.ball,
          { backgroundColor: color },
          {
            transform: [
              { translateX: position.x },
              { translateY: position.y },
              { scale: scale }
            ]
          }
        ]}
      >
        <TouchableWithoutFeedback onPress={handleCatch}>
          <View style={styles.touchArea} />
        </TouchableWithoutFeedback>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Pitch black for maximum contrast
  },
  scoreText: {
    color: '#333', // Dimmed so it doesn't distract the cat
    fontSize: 24,
    marginTop: 50,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  ball: {
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    position: 'absolute',
    // Glow effect to catch attention
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10, // For Android shadow
  },
  touchArea: {
    width: '100%',
    height: '100%',
  }
});