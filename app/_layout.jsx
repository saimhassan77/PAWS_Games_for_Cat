import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home"/>
      <Stack.Screen name="MouseGame" />
      <Stack.Screen name="FishGame" />
    </Stack>
  );
}