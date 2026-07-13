import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import {
    Image,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function PaywallScreen({ navigation }) {
  // Mock go-back function if navigation prop isn't passed
  const handleGoBack = () => {
    router.back("/");
  };

  const handleSubscribe = () => {
    console.log("Subscribe for $4.99 pressed");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header / Go Back Icon */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleGoBack} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {/* <Ionicons name="star" size={60} color="#FFD700" /> */}
          <Image source={require('../assets/images/icon.png')} style={styles.icon} resizeMode='cover' />
        </View>
        
        <Text style={styles.title}>Unlock Premium</Text>
        <Text style={styles.subtitle}>
          Get unlimited access to all features, remove ads, and support development.
        </Text>

        {/* $4.99 Subscription Card */}
        <TouchableOpacity style={styles.subscriptionCard} activeOpacity={0.9}>
          <View style={styles.planInfo}>
            <Text style={styles.planTitle}>Monthly Pro</Text>
            <Text style={styles.planDescription}>Billed monthly</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>$4.99</Text>
            <Text style={styles.duration}>/mo</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Call to Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.subscribeButton} 
          onPress={handleSubscribe}
          activeOpacity={0.8}
        >
          <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
        </TouchableOpacity>
        
        <Text style={styles.legalText}>
          Auto-renewable. Cancel anytime in your device settings.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    // Add padding top for Android SafeAreaView support
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#fff',
    // padding: 20,
    borderRadius: 100,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  subscriptionCard: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#007AFF', // Highlighting it as the selected/only option
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#888',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  duration: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  subscribeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    borderRadius: 100,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  subscribeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  legalText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  icon: {
    width: 140,
    height: 140,
    borderRadius: 50,
  },
});