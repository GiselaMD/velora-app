import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";

import type { AngleData } from "../../pose-analysis/types/pose.types";
import { RecommendationEngine } from "../services/RecommendationEngine";
import { commonFitIssues } from "../utils/fitIssues";

export default function ResultsScreen() {
  const params = useLocalSearchParams<{ bodyAngles?: string }>();
  const bodyAngles: AngleData = params.bodyAngles
    ? JSON.parse(params.bodyAngles)
    : { kneeAngle: 0, hipAngle: 0, backAngle: 0 };

  const recommendations = RecommendationEngine.generateRecommendations(bodyAngles);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header with back button, logo and menu */}
        <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-4">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Text className="text-2xl text-gray-500">←</Text>
            </TouchableOpacity>

            <View className="flex-row items-center">
              <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-purple-600">
                <Text className="text-sm text-white">🚲</Text>
              </View>
              <Text className="text-lg font-bold text-purple-600">velora</Text>
            </View>
          </View>

          <TouchableOpacity>
            <Text className="text-2xl text-gray-500">⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Title Section */}
        <View className="bg-gray-50 px-4 py-6">
          <Text className="mb-2 text-3xl font-bold text-gray-900">
            Your Bike Fit Results
          </Text>
          <Text className="text-lg text-gray-600">
            Based on your body measurements
          </Text>
        </View>

        {/* Bike Illustration */}
        <View className="bg-white px-4 py-6">
          <Image
            source={require("../../../../assets/images/bike-position.png")}
            className="resize-contain h-72 w-full"
          />
        </View>

        {/* Adjustments Needed Section */}
        <View className="px-4 py-6">
          <Text className="mb-4 text-2xl font-bold text-gray-900">
            Adjustments Needed
          </Text>

          {recommendations.map((rec, index) => (
            <View key={index} className="mb-3 flex-row items-center justify-between rounded-xl bg-white p-4">
              <View className="flex-row items-center">
                <View className={`mr-4 h-12 w-12 items-center justify-center rounded-full ${
                  rec.type === 'optimal' ? 'bg-green-100' : 'bg-purple-100'
                }`}>
                  <Text className={`text-2xl ${
                    rec.type === 'optimal' ? 'text-green-600' : 'text-purple-600'
                  }`}>{rec.icon}</Text>
                </View>
                <View>
                  <Text className="text-xl font-semibold text-gray-900">
                    {rec.title}
                  </Text>
                  <Text className="text-gray-600">
                    {rec.description}
                  </Text>
                </View>
              </View>
              {rec.adjustment && (
                <Text className="text-xl font-semibold text-purple-600">{rec.adjustment}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Pro Tip */}
        <View className="mb-6 px-4">
          <View className="rounded-xl bg-purple-50 p-4">
            <View className="mb-2 flex-row items-center">
              <Text className="mr-2 text-lg font-semibold text-purple-600">
                💡
              </Text>
              <Text className="text-lg font-semibold text-purple-600">
                Pro Tip
              </Text>
            </View>
            <Text className="text-purple-800">
              Make these adjustments gradually over a week to allow your body to
              adapt to the new position.
            </Text>
          </View>
        </View>

        {/* Analysis Results Section */}
        <View className="px-4 py-4">
          <Text className="mb-4 text-2xl font-bold text-gray-900">
            Analysis Results
          </Text>

          {/* Knee Angle */}
          <View className="mb-3 flex-row items-center justify-between rounded-xl bg-white p-4">
            <Text className="text-xl font-semibold text-gray-900">
              Knee Angle
            </Text>
            <Text className="text-xl font-semibold text-purple-600">
              {bodyAngles.kneeAngle}°
            </Text>
          </View>

          {/* Hip Angle */}
          <View className="mb-3 flex-row items-center justify-between rounded-xl bg-white p-4">
            <Text className="text-xl font-semibold text-gray-900">
              Hip Angle
            </Text>
            <Text className="text-xl font-semibold text-purple-600">
              {bodyAngles.hipAngle}°
            </Text>
          </View>

          {/* Back Angle */}
          <View className="mb-3 flex-row items-center justify-between rounded-xl bg-white p-4">
            <Text className="text-xl font-semibold text-gray-900">
              Back Angle
            </Text>
            <Text className="text-xl font-semibold text-purple-600">
              {bodyAngles.backAngle}°
            </Text>
          </View>

          {/* Analysis Summary */}
          <View className="mb-6 rounded-xl bg-purple-50 p-4">
            <Text className="text-base text-purple-800">
              {RecommendationEngine.getKneeAngleAdvice(bodyAngles.kneeAngle)}
            </Text>
          </View>

          <View className="mb-6 rounded-xl bg-purple-50 p-4">
            <Text className="text-base text-purple-800">
              {RecommendationEngine.getHipAngleAdvice(bodyAngles.hipAngle)}
            </Text>
          </View>

          <View className="mb-6 rounded-xl bg-purple-50 p-4">
            <Text className="text-base text-purple-800">
              {RecommendationEngine.getBackAngleAdvice(bodyAngles.backAngle)}
            </Text>
          </View>
        </View>

        <View className="overflow-hidden rounded-lg">
          {/* Header */}
          <View className="flex-row bg-purple-600">
            <View className="flex-1 border-r border-purple-400 p-3">
              <Text className="font-semibold text-white">Mistake</Text>
            </View>
            <View className="flex-2 p-3">
              <Text className="font-semibold text-white">Symptoms</Text>
            </View>
          </View>

          {/* Table Rows */}
          {commonFitIssues.map((issue, index) => (
            <View
              key={index}
              className={`flex-row ${
                index % 2 === 0 ? "bg-gray-50" : "bg-white"
              }`}
            >
              <View className="flex-1 border-r border-gray-200 p-3">
                <Text className="text-gray-800">{issue.mistake}</Text>
              </View>
              <View className="flex-2 p-3">
                <Text className="text-gray-600">{issue.symptoms}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Bottom Spacing */}
        <View className="h-24" />
      </ScrollView>

      {/* Fixed Button at Bottom */}
      <View className="border-t border-gray-200 bg-gray-50 px-4 pb-8 pt-4">
        <TouchableOpacity
          className="items-center rounded-xl bg-purple-600 py-4"
          activeOpacity={0.8}
          onPress={() => router.navigate("camera-interface")}
        >
          <Text className="text-lg font-semibold text-white">
            Re-Analyze Fit
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}