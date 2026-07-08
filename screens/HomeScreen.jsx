import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from "expo-router";
import { Alert, Dimensions, Image, ImageBackground, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from "react-native-safe-area-context";

// 1. Define Layout Constants
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_HEIGHT = 450;
const SPACING = 20;
const FULL_ITEM_SIZE = ITEM_HEIGHT + SPACING * 2;

// 2. Updated Mock Data with Image URIs (Using high-quality placeholders)
const DATA = [
    { id: '1', imageurl: require('../assets/cardImages/mouse.png'), title: 'MouseGame' },
    { id: '2', imageurl: require('../assets/cardImages/fish.png'), title: 'FishGame' },
    { id: '3', imageurl: require('../assets/images/icon.png'), title: 'screen3' },
    { id: '4', imageurl: require('../assets/images/icon.png'), title: 'screen4' },
    { id: '5', imageurl: require('../assets/images/icon.png'), title: 'screen5' },
]
// const DATA = Array.from({ length: 15 }).map((_, index) => ({
//   id: index.toString(),
//   // Alternating placeholder categories for visual variety
//   imageUri: `https://picsum.photos/id/${index + 10}/600/900`, 
// }));

// 3. Individual Carousel Item Component
const CarouselItem = ({ item, index, scrollY, navigation }) => {
    const animatedStyle = useAnimatedStyle(() => {
        const inputRange = [
            (index - 1) * FULL_ITEM_SIZE,
            index * FULL_ITEM_SIZE,
            (index + 1) * FULL_ITEM_SIZE,
        ];

        const scale = interpolate(
            scrollY.value,
            inputRange,
            [0.85, 1, 0.85], // Upped slightly to 0.85 for better image presence
            Extrapolation.CLAMP
        );

        const opacity = interpolate(
            scrollY.value,
            inputRange,
            [0.6, 1, 0.6], // Upped to 0.6 so off-center images stay somewhat visible
            Extrapolation.CLAMP
        );

        return {
            opacity,
            transform: [{ scale }],
        };
    });

    return (
        <Animated.View style={[styles.itemWrapper, animatedStyle]}>
            <Pressable
                style={styles.card}
                onPress={() => router.push(item.title)}
            >
                {/* Notice we removed { uri: ... } because require() returns a direct source module */}
                <Image
                    source={item.imageurl}
                    style={styles.image}
                    resizeMode="cover"
                />
                <Image
                    source={require('../assets/images/playButton.png')}
                    style={styles.playButton}
                    resizeMode="cover"
                />
            </Pressable>
        </Animated.View>
    );
};

// 4. Main Carousel Component
export default function HomeScreen({ navigation }) {
    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground source={require('../assets/images/background.png')} style={styles.imageb} resizeMode="cover">
                <View style={styles.header}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Image source={require('../assets/images/i.png')} style={styles.logo} style={{ width: 40, height: 40 }} />
                        <Text style={styles.headerText}>PAW</Text>
                    </View>
                    <TouchableOpacity style={styles.premium} onPress={() => Alert.alert("🎉Free to Use")}>
                        <AntDesign name="crown" size={22} color="#ffff" />
                    </TouchableOpacity>
                </View>
                <Animated.FlatList
                    data={DATA}
                    keyExtractor={(item) => item.id}
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    snapToInterval={FULL_ITEM_SIZE}
                    decelerationRate="fast"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingVertical: (SCREEN_HEIGHT - FULL_ITEM_SIZE) / 4.5,
                    }}
                    renderItem={({ item, index }) => (
                        <CarouselItem item={item} index={index} scrollY={scrollY} navigation={navigation} />
                    )}
                />
            </ImageBackground>
        </SafeAreaView>
    );
}

// 5. Updated Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f1f1', // Light background for better contrast with cards
    },
    header: {
        width: '90%',
        marginLeft: '5%',
        marginTop: 15,
        height: 60,
        borderRadius: 50,
        backgroundColor: "#f1f1f1",//#6B4EEA
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 8,

    },
    headerText: {
        fontFamily: "sans-serif",
        // fontStyle: "italic",
        fontSize: 24,
        fontWeight: 900,
        color: "#000"
    },
    premium: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 18,
        backgroundColor: "#000"
    },
    itemWrapper: {
        height: FULL_ITEM_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '85%',
        height: ITEM_HEIGHT,
        borderRadius: 28,
        backgroundColor: '#1e1e1e', // Fallback color while image loads
        overflow: 'hidden', // CRITICAL: Keeps the image bound to the card's border radius
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 8,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    playButton: {
        width: 50,
        height: 50,
        borderRadius: 30,
        zIndex: 1,
        position: "absolute",
        bottom: 25,
        right: 25,
    },
    imageb: {
        flex: 1,
        justifyContent: 'center',
    },
});