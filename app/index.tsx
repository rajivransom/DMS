import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Index = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"phone" | "otp">("phone"); // ✅ track screen state

  const handleGenerateOtp = async () => {
    if (phone.length < 10) {
      Alert.alert("Invalid Number", "Please enter a valid 10-digit number");
      return;
    }
    try {
      setLoading(true);

      const response = await fetch(
        "https://apis.allsoft.co/api/documentManagement/generateOTP",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mobile_number: phone }),
        }
      );

      const data = await response.json();
      setLoading(false);

      if (response.ok && data.status) {
        Alert.alert("OTP Sent", `OTP sent to +91 ${phone}`);
        setStep("otp"); // ✅ switch to OTP input
      } else {
        Alert.alert("Error", data.data || "Failed to generate OTP");
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      Alert.alert("Error", "Something went wrong while sending OTP");
    }
  };
 

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter a valid 6-digit OTP");
      return;
    }
    try {
      setLoading(true);

      const response = await fetch(
        "https://apis.allsoft.co/api/documentManagement//validateOTP",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mobile_number:phone,
            otp: otp,
          }),
        }
      );

      const data = await response.json();
     
      setLoading(false);

      if (response.ok && data.status) {
        const token = data.data.token;
        Alert.alert("Success", "OTP verified successfully ✅");
        await AsyncStorage.setItem("authToken", token);
        // you can navigate or save session here
        router.push("/fileUpload" as any);
      } else {
        Alert.alert("Error", data.data || "Invalid OTP");
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      Alert.alert("Error", "Something went wrong while verifying OTP");
    }
  };

  return (
    <View style={styles.container}>
      {step === "phone" ? (
        <>
          <Text style={styles.title}>Generate OTP</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Mobile Number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={()=> router.push("/fileUploads" as any)}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Sending..." : "Send OTP"}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Verify OTP</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit OTP"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleVerifyOtp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Verifying..." : "Verify OTP"}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f9fc",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 40,
    color: "#333",
  },
  input: {
    width: "100%",
    height: 55,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#fff",
    color: "#000",
  },
  button: {
    width: "100%",
    height: 55,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
