import React, { useState, useRef } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { auth } from "../../firebaseConfig";
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";

import * as SecureStore from 'expo-secure-store';
import { useRouter } from "expo-router";



export default function HomeScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);

  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);
  const storeToken = async (token: string) => {
    try {
      await SecureStore.setItemAsync('userToken', token);
      console.log('Token stored securely!');
    } catch (err) {
      console.log('Error storing token:', err);
    }
  };

  const sendOTP = async () => {
    try {
      const provider = new PhoneAuthProvider(auth);
      const id = await provider.verifyPhoneNumber(phoneNumber, recaptchaVerifier.current! );
      setVerificationId(id);
      Alert.alert("Success", "OTP sent!");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const verifyOTP = async () => {
    try {
      if (!verificationId) return;
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const userCredential=await signInWithCredential(auth, credential);
      const token = await userCredential.user.getIdToken();
      await storeToken(token);
      Alert.alert("Success", "Phone Auth Successful!");
      router.push("/FileUpload")
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={auth.app.options}
      />

      <TextInput
        placeholder="Phone number (+91...)"
        placeholderTextColor="#aaa"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={sendOTP}>
        <Text style={styles.buttonText}>Send OTP</Text>
      </TouchableOpacity>

      <TextInput
        placeholder="OTP"
        placeholderTextColor="#aaa"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={verifyOTP}>
        <Text style={styles.buttonText}>Verify OTP</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // dark background
    padding: 20,
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#1E1E1E",
    color: "#fff",
    marginBottom: 15,
    padding: 12,
    borderRadius: 10,
  },
  button: {
    backgroundColor: "#BB86FC",
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#121212",
    fontWeight: "bold",
    fontSize: 16,
  },
});
