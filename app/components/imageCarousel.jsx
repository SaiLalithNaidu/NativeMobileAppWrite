import React, { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Image, StyleSheet, View } from "react-native";
import { COLORS } from '../../src/utils/constants';

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const images = [
  { id: "1", uri: "https://backend.novonesis.com/sites/default/files/styles/xlarge_3_2/public/image/2025-04/07_Aquaculture_carousel_01_image_01_1920x1080_shrimp_farm.jpg.webp?itok=5BrGx5yw" },
  { id: "2", uri: "https://backend.novonesis.com/sites/default/files/styles/xlarge_3_2/public/image/2025-04/07_Aquaculture_carousel_02_image_01_1920x1080_shrimp_farm.jpg.webp?itok=WnO_eD92" },
  { id: "3", uri: "https://backend.novonesis.com/sites/default/files/styles/large_1_1/public/image/2025-04/07_Aquaculture_half%26half_image_1080x1080_cattle_looking.jpg.webp?itok=oeVimOyd" },
];

export default function ImageCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(SCREEN_WIDTH);

  // Track manual scroll
  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / containerWidth);
    setActiveIndex(index);
  };

  // 🔁 Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % images.length;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, 1500); // <-- every 1.5 second

    return () => clearInterval(interval); // cleanup
  }, []); // Remove activeIndex dependency to prevent infinite loop

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w && Math.abs(w - containerWidth) > 1) setContainerWidth(w);
      }}
    >
      <FlatList
        ref={flatListRef}
        data={images}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={containerWidth}
        decelerationRate="fast"
        style={{ backgroundColor: 'transparent' }}
        renderItem={({ item }) => (
          <View style={[styles.imageWrapper, { width: containerWidth }]}>
            <Image source={{ uri: item.uri }} style={styles.image} resizeMode="cover" />
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
    backgroundColor: 'transparent',
    marginTop: 25,
  },
  imageWrapper: {
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    backgroundColor: 'transparent',
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: COLORS.PRIMARY,
    marginHorizontal: 4,
  },
});
