import { useState, useRef } from "react";
import { FlatList, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export function useOnboarding() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<{ id: string; quote: string }> | null>(null);

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  return {
    activeIndex,
    flatListRef,
    handleScroll,
    screenWidth: width,
  };
}