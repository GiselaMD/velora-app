import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <View className="mx-3">
      {/* Content */}
      <Text className="my-3 text-center text-2xl font-bold text-gray-900">
        Page Not Found
      </Text>
      <Text className="mb-8 text-center text-base leading-6 text-gray-600">
        We couldn't find the page you're looking for. It might have been moved
        or doesn't exist.
      </Text>
      {/* Buttons */}
      <View className="w-full space-y-3">
        <TouchableOpacity
          className="items-center rounded-xl bg-purple-600 py-4"
          onPress={() => router.replace("/")}
        >
          <Text className="text-base font-bold text-white">Go to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="items-center rounded-xl bg-transparent py-4"
          onPress={() => router.back()}
        >
          <Text className="text-base font-bold text-purple-600">Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
