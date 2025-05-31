import { router } from "expo-router";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";

import { onboardingQuotes } from "../constants/slides";
import { useOnboarding } from "../hooks/useOnboarding";

export default function WelcomeScreen() {
  const { activeIndex, flatListRef, handleScroll, screenWidth } = useOnboarding();

  const renderQuote = ({ item }: { item: { id: string; quote: string } }) => (
    <View className="w-full items-center px-6" style={{ width: screenWidth }}>
      <Text className="text-center text-xl text-white opacity-90">
        {item.quote}
      </Text>
    </View>
  );

  return (
    <View className="flex-1">
      <ImageBackground
        source={require("../../../../assets/images/home-bg.png")}
        className="flex-1"
      >
        <View className="w-full max-w-[400px] flex-1 items-center justify-between py-20">
          {/* Logo */}
          <View className="items-center">
            <Image
              className="mb-4 mt-10 h-60 w-60"
              source={require("../../../../assets/images/velora-tp-logo.png")}
            />
          </View>

          {/* Main content */}
          <View className="items-center">
            <Text className="mb-4 text-center text-4xl font-bold text-white">
              Smart bike fitting
            </Text>
            <Text className="text-center text-2xl text-white opacity-90">
              anytime, anywhere
            </Text>
          </View>

          {/* Swipeable Quotes */}
          <View className="my-6 h-40">
            <FlatList
              ref={flatListRef}
              data={onboardingQuotes}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={renderQuote}
              onScroll={handleScroll}
            />

            {/* Pagination Dots */}
            <View className="my-4 flex-row justify-center">
              {onboardingQuotes.map((_, i) => (
                <View
                  key={i}
                  className={`mx-1 h-2 w-2 rounded-full ${
                    i === activeIndex ? "bg-white" : "bg-white opacity-50"
                  }`}
                />
              ))}
            </View>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            className="mt-6 w-full max-w-[300px] items-center rounded-full bg-white px-8 py-4"
            onPress={() => router.navigate("bike-type")}
          >
            <Text className="text-xl font-semibold text-[#312e81]">
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}