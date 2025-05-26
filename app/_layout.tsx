import { Stack } from "expo-router";

import Logo from "../assets/images/velora-vector.svg";

import "../styles/global.css";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#6D28D9",
        },
        headerTintColor: "#fff",
        headerBackButtonDisplayMode: "minimal",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerTitle: () => <Logo width={100} height={40} />, // SVG in header
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="bike-type" />
      <Stack.Screen name="fit-assessment" />
      <Stack.Screen name="camera-interface" />
      <Stack.Screen name="analysis-results" />
    </Stack>
  );
}
