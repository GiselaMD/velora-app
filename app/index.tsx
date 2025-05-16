// app/index.tsx
import { router } from "expo-router";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Modal,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { Camera, useCameraDevice, useCameraPermission, useFrameProcessor } from 'react-native-vision-camera';
import { useRunOnJS } from 'react-native-worklets-core';
import { simplestProcessor } from '../plugins/frameProcessor';


const quotes = [
  {
    id: "1",
    quote: "Optimize your position for power and comfort.",
  },
  {
    id: "2",
    quote: "Prevent injuries with personalized fit guidance.",
  },
  {
    id: "3",
    quote: "Get pro-level fitting right from home.",
  },
];

const { width } = Dimensions.get("window");

export default function EntryScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [frameInfo, setFrameInfo] = useState(null);
  const [logs, setLogs] = useState([]);
  
  // Camera setup
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  
  // Request camera permission when needed
  useEffect(() => {
    if (showCamera && !hasPermission) {
      requestPermission();
    }
  }, [showCamera, hasPermission, requestPermission]);
  
  // Create JS functions to update state from worklets
  const addLog = (message) => {
    console.log(message);
    setLogs(prev => [message, ...prev.slice(0, 9)]);
  };
  
  const updateFrameInfo = (info) => {
    setFrameInfo(info);
  };
  
  // Create worklet-compatible versions
  const addLogJS = useRunOnJS(addLog, []);
  const updateFrameInfoJS = useRunOnJS(updateFrameInfo, []);
  
  // Frame processor
 const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    
    try {
      addLogJS(`Processing frame: ${frame.width}x${frame.height}`);
      
      // Call the simplest plugin
      const info = simplestProcessor(frame);
      
      if (info) {
        addLogJS(`Plugin returned frame info`);
        updateFrameInfoJS(info);
      } else {
        addLogJS('Plugin returned null');
      }
    } catch (error) {
      addLogJS(`Error: ${String(error)}`);
    }
  }, []);

  const renderQuote = ({ item }) => (
    <View className="w-full items-center px-6" style={{ width }}>
      <Text className="text-center text-xl text-white opacity-90">
        {item.quote}
      </Text>
    </View>
  );

  // Camera Modal Content
  const renderCameraModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={showCamera}
      onRequestClose={() => setShowCamera(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        {!hasPermission ? (
          <View style={styles.permissionContainer}>
            <Text style={styles.text}>Camera access required</Text>
            <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
              <Text style={styles.buttonText}>Grant Access</Text>
            </TouchableOpacity>
          </View>
        ) : !device ? (
          <View style={styles.permissionContainer}>
            <Text style={styles.text}>No camera device found</Text>
          </View>
        ) : (
          <>
            <Camera
              style={styles.camera}
              device={device}
              isActive={true}
              frameProcessor={frameProcessor}
            />

            {/* Frame Info */}
            {frameInfo && (
              <View style={styles.infoContainer}>
                <Text style={styles.title}>Frame Info from Plugin:</Text>
                <Text style={styles.infoText}>Width: {frameInfo.width}</Text>
                <Text style={styles.infoText}>Height: {frameInfo.height}</Text>
                <Text style={styles.infoText}>Timestamp: {frameInfo.timestamp}</Text>
              </View>
            )}

            {/* Debug Logs */}
            <View style={styles.logContainer}>
              <Text style={styles.title}>Logs:</Text>
              {logs.map((log, index) => (
                <Text key={index} style={styles.logText}>{log}</Text>
              ))}
            </View>
          </>
        )}
        
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setShowCamera(false)}
        >
          <Text style={styles.closeButtonText}>Close Camera</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );

  return (
    <View className="flex-1">
      <ImageBackground
        source={require("../assets/images/home-bg.png")}
        className="flex-1"
      >
        <View className="w-full max-w-[400px] flex-1 items-center justify-between py-20">
          {/* Logo */}
          <View className="items-center">
            <Image
              className="mb-4 mt-10 h-60 w-60"
              source={require("../assets/images/velora-tp-logo.png")}
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
          <View className="my-6 h-20">
            <FlatList
              ref={flatListRef}
              data={quotes}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={renderQuote}
              onScroll={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                setActiveIndex(index);
              }}
            />
          </View>

          {/* Pagination Dots */}
          <View className="my-4 flex-row">
            {quotes.map((_, i) => (
              <View
                key={i}
                className={`mx-1 h-2 w-2 rounded-full ${
                  i === activeIndex ? "bg-white" : "bg-white opacity-50"
                }`}
              />
            ))}
          </View>

          {/* Camera Test Button */}
          <TouchableOpacity
            className="mt-4 mb-2 w-full max-w-[300px] items-center rounded-full bg-white/80 px-8 py-2"
            onPress={() => setShowCamera(true)}
          >
            <Text className="text-base font-semibold text-[#312e81]">
              Test Camera Plugin
            </Text>
          </TouchableOpacity>

          {/* CTA Button */}
          <TouchableOpacity
            className="mt-2 w-full max-w-[300px] items-center rounded-full bg-white px-8 py-4"
            onPress={() => router.navigate("bike-type")}
          >
            <Text className="text-xl font-semibold text-[#312e81]">
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
      
      {/* Camera Modal */}
      {renderCameraModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
  },
  text: {
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#6D28D9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 10,
  },
  logContainer: {
    position: 'absolute',
    top: 150,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 10,
    maxHeight: 200,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 5,
  },
  logText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 4,
  },
  closeButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#6D28D9',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});