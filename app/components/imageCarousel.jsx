import React, { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Image, StyleSheet, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const images = [
  { id: "1", uri: "https://backend.novonesis.com/sites/default/files/styles/xlarge_3_2/public/image/2025-04/07_Aquaculture_carousel_01_image_01_1920x1080_shrimp_farm.jpg.webp?itok=5BrGx5yw" },
  { id: "2", uri: "https://backend.novonesis.com/sites/default/files/styles/xlarge_3_2/public/image/2025-04/07_Aquaculture_carousel_02_image_01_1920x1080_shrimp_farm.jpg.webp?itok=WnO_eD92" },
  { id: "3", uri: "https://backend.novonesis.com/sites/default/files/styles/large_1_1/public/image/2025-04/07_Aquaculture_half%26half_image_1080x1080_cattle_looking.jpg.webp?itok=oeVimOyd" },
];

export default function ImageCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  // Track manual scroll
  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  // 🔁 Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % images.length;
      setActiveIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 1500); // <-- every 1.5 second

    return () => clearInterval(interval); // cleanup
  }, [activeIndex]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={images}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={SCREEN_WIDTH}
        decelerationRate="fast"
        renderItem={({ item }) => (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: item.uri }} style={styles.image} />
          </View>
        )}
      />

      {/* Dots indicator */}
      <View style={styles.dotsContainer}>
        {images.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, { opacity: i === activeIndex ? 1 : 0.3 }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "90%",
    height: 150,
    resizeMode: "cover",
    borderRadius: 10,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: "#333",
    marginHorizontal: 4,
  },
});
