import Checkbox from "expo-checkbox";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";

import type { BikeType } from "../../bike-selection/types/bike.types";
import { bikeAssessmentImages } from "../constants/bikeImages";
import { SETUP_INSTRUCTIONS } from "../constants/optimalRanges";

export default function SetupInstructions() {
  const { bikeType } = useLocalSearchParams<{ bikeType: BikeType }>();
  const bikeImage = bikeAssessmentImages[bikeType];
  const [isChecked, setChecked] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4">
        {/* Bike Position Illustration */}
        <View className="mb-6 rounded-3xl border border-gray-100 bg-white p-4">
          <Image source={bikeImage} className="resize-contain h-64 w-full" />
        </View>

        {/* Position Setup */}
        <Text className="mb-4 text-2xl font-bold text-gray-900">
          Position Setup
        </Text>

        {/* Checklist Items */}
        <View className="mb-6 space-y-4">
          {SETUP_INSTRUCTIONS.map((item, index) => (
            <View key={index} className="flex-row">
              <View className="mr-3 mt-0.5 h-6 w-6 items-center justify-center rounded-full bg-purple-600">
                <Text className="text-white">✓</Text>
              </View>
              <Text className="flex-1 text-base text-gray-800">{item}</Text>
            </View>
          ))}
        </View>

        {/* Pro Tips */}
        <View className="mb-4 rounded-xl bg-purple-100 p-4">
          <View className="mb-1 flex-row items-center">
            <Text className="mr-2 text-lg font-semibold text-purple-800">
              🚲
            </Text>
            <Text className="text-lg font-semibold text-purple-800">
              Pro Tip
            </Text>
          </View>
          <Text className="text-purple-800">
            Make sure you're in a well-lit area and wearing fitted clothing for
            accurate measurements.
          </Text>
        </View>

        <View className="mb-8">
          <Text className="text-gray-700">
            When you have everything set to start the fitting, check the box
            below. By going to the next step you'll get a countdown to start
            recording your position.
          </Text>
        </View>

        <View className="mb-8 flex-row">
          <Checkbox
            className="mr-2"
            value={isChecked}
            onValueChange={setChecked}
            color={isChecked ? "#4630EB" : undefined}
          />
          <Text className="text-gray-700">I am all set</Text>
        </View>
      </ScrollView>

      {/* Fixed Button at Bottom */}
      <View className="bg-gray-50 px-4 pb-8 pt-4">
        <TouchableOpacity
          className={`flex-row items-center justify-center ${
            isChecked ? "bg-purple-600" : "bg-gray-400"
          } rounded-xl py-4`}
          activeOpacity={0.8}
          onPress={() => router.navigate("analysis-results")}
          disabled={!isChecked}
        >
          <Text className="mr-2 text-lg font-semibold text-white">
            Start Fit
          </Text>
          <Text className="text-lg text-white">→</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}