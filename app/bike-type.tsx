import { router } from 'expo-router';
import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';

import { BikeType } from '../types';

// Bike data
const bikeTypes = [
  {
    id: 'road' as BikeType,
    title: 'Road Bike',
    description: 'Perfect for speed and endurance',
    imageSrc: require('../assets/images/road-bike.png'),
    icon: '🚴',
  },
  {
    id: 'time-trial' as BikeType,
    title: 'Time Trial Bike',
    description: 'Engineered for maximum speed',
    imageSrc: require('../assets/images/tt-bike.png'),
    icon: '🕶️',
  },
  {
    id: 'mountain' as BikeType,
    title: 'Mountain Bike',
    description: 'Built for trails and adventure',
    imageSrc: require('../assets/images/mountain-bike.png'),
    icon: '🚵',
  },
];

export default function BikeTypeScreen() {
  const [selectedBike, setSelectedBike] = React.useState<string | null>(null);

  // LocalPoseEstimationModule.hello();

  // Handle selecting a bike type
  const handleSelectBike = (id: string) => {
    setSelectedBike(id);
  };

  // Enable or disable the CTA based on whether a bike is selected
  const isCTAEnabled = selectedBike !== null;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4">
        {/* Title Section */}
        <View className="my-6">
          <Text className="mb-2 text-3xl font-bold text-gray-900">Select your bike type</Text>
          <Text className="text-lg text-gray-600">Choose the type of bike you want to analyse your fit</Text>
        </View>

        {/* Bike Options */}
        {bikeTypes.map((bike) => (
          <TouchableOpacity
            key={bike.id}
            className={`mb-4 rounded-3xl border-2 ${selectedBike === bike.id ? 'border-purple-600' : 'border-gray-100'} bg-white p-5 shadow-sm`}
            activeOpacity={0.7}
            onPress={() => handleSelectBike(bike.id)}>
            <View className="flex-row items-start justify-between">
              <View>
                <Text className="text-xl font-bold text-gray-900">{bike.title}</Text>
                <Text className="mt-1 text-gray-500">{bike.description}</Text>
              </View>
              <View className="h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Text className="text-xl">{bike.icon}</Text>
              </View>
            </View>

            {/* Bike Image */}
            <View className="mt-4 items-center justify-center">
              <Image source={bike.imageSrc} className="resize-contain h-52 w-full" />
            </View>
          </TouchableOpacity>
        ))}

        {/* Bottom Spacing */}
        <View className="h-20" />
      </ScrollView>

      {/* Fixed Button at Bottom */}
      <View className="bg-gray-50 px-4 pb-8 pt-4">
        <TouchableOpacity
          className={`items-center rounded-xl ${isCTAEnabled ? 'bg-purple-600' : 'bg-gray-400'} py-4`}
          activeOpacity={0.8}
          onPress={() =>
            isCTAEnabled &&
            router.push({
              pathname: 'fit-assessment',
              params: { bikeType: selectedBike },
            })
          }>
          <Text className="text-lg font-semibold text-white">Start Fit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
