import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";

export default function AnalysisResults() {
  const { bodyAngles } = useLocalSearchParams();

  //   const bodyAngles = route.params?.bodyAngles || {
  //     kneeAngle: 32,
  //     hipAngle: 45,
  //     backAngle: 28,
  //   };

  const getKneeAngleAdvice = (angle) => {
    if (angle < 25)
      return "Your knee angle is too acute. Raise your saddle height for better power transfer.";
    if (angle > 35)
      return "Your knee angle is too obtuse. Lower your saddle height slightly for optimal pedaling.";
    return "Your knee angle is within the optimal range for efficient pedaling.";
  };

  const getHipAngleAdvice = (angle) => {
    if (angle < 40)
      return "Your hip angle is too closed. Consider moving your saddle back or handlebars forward.";
    if (angle > 50)
      return "Your hip angle is too open. Try moving your saddle forward or handlebars back slightly.";
    return "Your hip angle is in a good range for comfort and power.";
  };

  const getBackAngleAdvice = (angle) => {
    if (angle < 20)
      return "Your back is too flat. Adjust your handlebar height or reach for a more comfortable position.";
    if (angle > 45)
      return "Your back is too upright. Lower your handlebars or increase reach for better aerodynamics.";
    return "Your back angle is good for a balance of comfort and aerodynamics.";
  };

  const fitIssues = [
    {
      mistake: "Saddle too high",
      symptoms: "Hip rocking, knee pain (back of knee), overreaching",
    },
    {
      mistake: "Saddle too low",
      symptoms: "Anterior knee pain, inefficient pedaling",
    },
    {
      mistake: "Bars too low",
      symptoms: "Neck, back, wrist pain",
    },
    {
      mistake: "Bars too far",
      symptoms: "Shoulder/neck tension, numb hands",
    },
    {
      mistake: "Wrong frame size",
      symptoms: "Constant discomfort, hard to dial in fit",
    },
  ];

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
            source={require("../assets/images/bike-position.png")}
            className="resize-contain h-72 w-full"
          />
        </View>

        {/* Adjustments Needed Section */}
        <View className="px-4 py-6">
          <Text className="mb-4 text-2xl font-bold text-gray-900">
            Adjustments Needed
          </Text>

          {/* Saddle Height Adjustment */}
          <View className="mb-3 flex-row items-center justify-between rounded-xl bg-white p-4">
            <View className="flex-row items-center">
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Text className="text-2xl text-purple-600">↑</Text>
              </View>
              <View>
                <Text className="text-xl font-semibold text-gray-900">
                  Raise Saddle Height
                </Text>
                <Text className="text-gray-600">
                  Current position is too low
                </Text>
              </View>
            </View>
            <Text className="text-xl font-semibold text-purple-600">+2cm</Text>
          </View>

          {/* Handlebar Height Adjustment */}
          <View className="mb-3 flex-row items-center justify-between rounded-xl bg-white p-4">
            <View className="flex-row items-center">
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Text className="text-2xl text-purple-600">↓</Text>
              </View>
              <View>
                <Text className="text-xl font-semibold text-gray-900">
                  Adjust Handlebar Height
                </Text>
                <Text className="text-gray-600">
                  Lower for better aerodynamics
                </Text>
              </View>
            </View>
            <Text className="text-xl font-semibold text-purple-600">-1cm</Text>
          </View>

          {/* Handlebar Reach - Optimal */}
          <View className="mb-3 flex-row items-center justify-between rounded-xl bg-white p-4">
            <View className="flex-row items-center">
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Text className="text-xl text-green-600">✓</Text>
              </View>
              <View>
                <Text className="text-xl font-semibold text-gray-900">
                  Handlebar Reach
                </Text>
                <Text className="text-gray-600">
                  Current position is optimal
                </Text>
              </View>
            </View>
          </View>
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
              {getKneeAngleAdvice(bodyAngles.kneeAngle)}
            </Text>
          </View>

          <View className="mb-6 rounded-xl bg-purple-50 p-4">
            <Text className="text-base text-purple-800">
              {getHipAngleAdvice(bodyAngles.hipAngle)}
            </Text>
          </View>

          <View className="mb-6 rounded-xl bg-purple-50 p-4">
            <Text className="text-base text-purple-800">
              {getBackAngleAdvice(bodyAngles.backAngle)}
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
          {fitIssues.map((issue, index) => (
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
