import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Vibration,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const BEETLE_SIZE = 80;
const NUM_BEETLES = 5;

export default function App() {
  const [score, setScore] = useState(0);
  
  // Animation value for the score text pulsing effect
  const scoreScale = useRef(new Animated.Value(1)).current;

  // Added 'scale' and 'rotation' to each beetle's state
  const beetles = useRef(
    Array.from({ length: NUM_BEETLES }).map((_, index) => ({
      id: index,
      position: new Animated.ValueXY({ 
        x: Math.random() * (width - BEETLE_SIZE), 
        y: Math.random() * (height - BEETLE_SIZE) 
      }),
      scale: new Animated.Value(1),
      rotation: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    beetles.forEach(beetle => {
      moveBeetle(beetle);
      startWiggle(beetle);
    });
    
    return () => {
      beetles.forEach(beetle => {
        beetle.position.stopAnimation();
        beetle.rotation.stopAnimation();
        beetle.scale.stopAnimation();
      });
    };
  }, []);

  const startWiggle = (beetle) => {
    // Micro-interaction: Continuous organic wiggling
    Animated.loop(
      Animated.sequence([
        Animated.timing(beetle.rotation, {
          toValue: 1,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(beetle.rotation, {
          toValue: -1,
          duration: 60,
          useNativeDriver: true,
        })
      ])
    ).start();
  };

  const moveBeetle = (beetle) => {
    const randomX = Math.random() * (width - BEETLE_SIZE);
    const randomY = Math.random() * (height - BEETLE_SIZE);
    const randomDuration = 400 + Math.random() * 900;

    Animated.timing(beetle.position, {
      toValue: { x: randomX, y: randomY },
      duration: randomDuration,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true, 
    }).start(({ finished }) => {
      if (finished) {
        moveBeetle(beetle);
      }
    });
  };

  const catchBeetle = (beetle) => {
    // 1. Stop movement
    beetle.position.stopAnimation();
    
    // 2. Micro-interaction: Haptic vibration 
    Vibration.vibrate(40);
    
    // 3. Update Score & animate the score text
    setScore(prev => prev + 1);
    Animated.sequence([
      Animated.timing(scoreScale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.timing(scoreScale, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start();

    // 4. Effect: "Squish" and fade out the bug
    Animated.timing(beetle.scale, {
      toValue: 0,
      duration: 150,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true
    }).start(() => {
      // 5. Teleport while invisible
      const spawnX = Math.random() * (width - BEETLE_SIZE);
      const spawnY = Math.random() * (height - BEETLE_SIZE);
      beetle.position.setValue({ x: spawnX, y: spawnY });
      
      // 6. Scale back up ("Respawn")
      Animated.timing(beetle.scale, {
        toValue: 1,
        duration: 5000,
        easing: Easing.bounce, // Little pop effect on respawn
        useNativeDriver: true
      }).start();

      // 7. Resume movement
      moveBeetle(beetle);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={true} />
      
      {/* Animated Score Text */}
      <Animated.Text style={[
        styles.scoreText, 
        { transform: [{ scale: scoreScale }] }
      ]}>
        Bugs Caught: {score}
      </Animated.Text>

      {beetles.map((beetle) => {
        // Interpolate the rotation value into degrees
        const spin = beetle.rotation.interpolate({
          inputRange: [-1, 1],
          outputRange: ['-15deg', '15deg']
        });

        return (
          <Animated.View 
            key={beetle.id}
            style={[
              styles.beetleContainer,
              {
                transform: [
                  { translateX: beetle.position.x },
                  { translateY: beetle.position.y },
                  { scale: beetle.scale },
                  { rotate: spin }
                ]
              }
            ]}
          >
            <TouchableWithoutFeedback onPress={() => catchBeetle(beetle)}>
              <View style={styles.hitbox}>
                <Text style={styles.beetle}>🪲</Text>
              </View>
            </TouchableWithoutFeedback>
          </Animated.View>
        );
      })}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    overflow: 'hidden',
  },
  scoreText: {
    color: '#f1f1f1', 
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 40,
    textAlign: 'center',
    zIndex: 10,
  },
  beetleContainer: {
    position: 'absolute',
    width: BEETLE_SIZE,
    height: BEETLE_SIZE,
  },
  hitbox: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  beetle: {
    fontSize: 55, 
  }
});