import { StyleSheet, View, Text } from "react-native";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to Mai Aisha Academy SMS</Text>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "blue",
    fontSize: 20,
    fontWeight: "bold",
  },
});