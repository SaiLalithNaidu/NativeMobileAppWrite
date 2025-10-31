import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AlertCard({
  type = "success", // "success" or "error"
  title,
  message,
  buttonText,
  onPress,
}) {
  const isSuccess = type === "success";
  const color = isSuccess ? "#007bff" : "#ff4d4f";

  return (
    <View style={styles.shadowWrapper}>
      <View style={styles.card}>
        {/* Icon Circle */}
        <View style={[styles.iconCircle, { backgroundColor: color + "20" }]}>
          <FontAwesome5
            name={isSuccess ? "check" : "times"}
            size={30}
            color={color}
          />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color }]}>{title}</Text>

        {/* Message */}
        <Text style={styles.message}>{message}</Text>

        {/* Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: color }]}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    padding: 20,
  },
  card: {
    width: 250,
    borderRadius: 16,
    backgroundColor: "#fff",
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 18,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
