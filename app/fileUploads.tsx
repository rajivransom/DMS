import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

type FileType = {
  uri: string;
  name: string;
  type: string;
};
type DocumentPickerResult={
  uri:any,
  name:any,
  type:any
}
type DocumentPickerSuccessResult={
  uri:any,
  name:any,
  type:any
}

type TagType = {
  id: string;
  label: string;
};

export default function FileUploads() {
  // Date picker
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Major Dropdown
  const [majorOpen, setMajorOpen] = useState(false);
  const [majorValue, setMajorValue] = useState<string | null>(null);
  const [majorItems, setMajorItems] = useState([
    { label: "Personal", value: "Personal" },
    { label: "Professional", value: "Professional" },
  ]);
  const authToken="";

  // Minor Dropdown
  const [minorOpen, setMinorOpen] = useState(false);
  const [minorValue, setMinorValue] = useState<string | null>(null);
  const [minorItems, setMinorItems] = useState<{ label: string; value: string }[]>([]);

  // Tags
  const [tags, setTags] = useState<TagType[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Remarks
  const [remarks, setRemarks] = useState("");

  // Files
  const [files, setFiles] = useState<FileType[]>([]);

  // Fetch pre-existing tags from API
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch("https://apis.allsoft.co/api/documentManagement/documentTags", {
          method: "POST",
          headers: { token: authToken, "Content-Type": "application/json" },
          body: JSON.stringify({ term: "" }),
        });
        const data = await res.json();
        console.log(data)
        if (data.status) {
          setTags(data.data);
        }
      } catch (err) {
        console.error("Error fetching tags:", err);
      }
    };
    fetchTags();
  }, []);

  // Dynamic minor dropdown based on major selection
  useEffect(() => {
    if (majorValue === "Personal") {
      setMinorItems([
        { label: "John", value: "John" },
        { label: "Tom", value: "Tom" },
        { label: "Emily", value: "Emily" },
      ]);
      setMinorValue(null);
    } else if (majorValue === "Professional") {
      setMinorItems([
        { label: "Accounts", value: "Accounts" },
        { label: "HR", value: "HR" },
        { label: "IT", value: "IT" },
        { label: "Finance", value: "Finance" },
      ]);
      setMinorValue(null);
    } else {
      setMinorItems([]);
      setMinorValue(null);
    }
  }, [majorValue]);

  // Add a new tag (also allow custom)
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;

    const existing = tags.find((t) => t.label === trimmed);
    const newTag: TagType = existing ?? { id: trimmed, label: trimmed };

    // If new, add to tags list
    if (!existing) {
      setTags((prev) => [...prev, newTag]);
    }

    // Add to selected tags if not already
    if (!selectedTags.some((t) => t.label === newTag.label)) {
      setSelectedTags((prev) => [...prev, newTag]);
    }
    setTagInput("");
  };

  // Pick document/file
  const handlePickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: false, // Prevents creating a copy and saves space
        multiple: false, // Optional: if you only want to pick a single file
      });
      // Check if the result is a success before proceeding
      if (res.canceled) return;
      if (res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        const newFile: FileType = {
          uri: file.uri,
          name: file.name,
          type: file.mimeType ?? "application/octet-stream",
        };
        setFiles((prev) => [...prev, newFile]);
      }
    } catch (err) {
      console.error("DocumentPicker error:", err);
    }
  };

  // Take photo
  const handleTakePhoto = async () => {
    try {
      const res = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });

      if (res.canceled) return;

      const newFile: FileType = {
        uri: res.assets[0].uri,
        name: res.assets[0].uri.split("/").pop() ?? `photo_${Date.now()}.jpg`,
        type: "image/jpeg",
      };
      setFiles((prev) => [...prev, newFile]);
    } catch (err) {
      console.error("ImagePicker error:", err);
    }
  };

  // Submit form
  const handleSubmit = async () => {
    if (!majorValue || !minorValue) {
      Alert.alert("Error", "Please select category and subcategory");
      return;
    }
    if (!files.length) {
      Alert.alert("Error", "Please upload at least one file");
      return;
    }

    try {
      const formData = new FormData();
  
      // 1. Append each text field individually
      formData.append("major_head", majorValue as string);
      formData.append("minor_head", minorValue as string);
      formData.append("document_date", date.toISOString());
      formData.append("document_remarks", remarks);
      formData.append("user_id", "nitin");
  
      // 2. Append the tags array. The backend may expect this in a specific format.
      // This is the most common way to send an array of objects.
      selectedTags.forEach((tag, index) => {
        formData.append(`tags[${index}][tag_name]`, tag.label);
      });
  
      // 3. Append the files. This part of your code is likely correct.
      files.forEach((file) => {
        formData.append("file", {
          uri: file.uri,
          type: file.type,
          name: file.name,
        } as any);
      });
  
      // 4. Send the request
      const res = await fetch(
        "https://apis.allsoft.co/api/documentManagement/saveDocumentEntry",
        {
          method: "POST",
          headers: {
            token: authToken,
            // IMPORTANT: Do NOT manually set Content-Type.
            // Fetch will handle it automatically for FormData.
          },
          body: formData,
        }
      );
  
      const result = await res.json();
      if (result.status) {
        Alert.alert("Success", "Files uploaded successfully! 🎉");
        // ... reset state
      } else {
        Alert.alert("Error", result.data || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Error", "Something went wrong during upload");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Document</Text>

      {/* Date Picker */}
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text>{date.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, selectedDate) => {
            setShowDatePicker(Platform.OS === "ios");
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      {/* Major Dropdown */}
      <View style={{ zIndex: 2000 }}>
        <DropDownPicker
          open={majorOpen}
          value={majorValue}
          items={majorItems}
          setOpen={setMajorOpen}
          setValue={setMajorValue}
          setItems={setMajorItems}
          placeholder="Select Major Category"
          style={{ marginBottom: majorOpen ? 120 : 16 }}
        />
      </View>

      {/* Minor Dropdown */}
      <View style={{ zIndex: 1000 }}>
        <DropDownPicker
          open={minorOpen}
          value={minorValue}
          items={minorItems}
          setOpen={setMinorOpen}
          setValue={setMinorValue}
          setItems={setMinorItems}
          placeholder="Select Minor Category"
          disabled={!majorValue}
        />
      </View>

      {/* Tag Input */}
      <View style={{ marginVertical: 10 }}>
        <TextInput
          style={styles.input}
          placeholder="Add tag"
          value={tagInput}
          onChangeText={setTagInput}
          onSubmitEditing={handleAddTag}
        />
        <FlatList
          data={selectedTags}
          keyExtractor={(item) => item.id}
          horizontal
          renderItem={({ item }) => (
            <View style={styles.tag}>
              <Text style={{ color: "#fff" }}>{item.label}</Text>
            </View>
          )}
        />
      </View>

      {/* Remarks */}
      <TextInput style={styles.input} placeholder="Remarks" value={remarks} onChangeText={setRemarks} />

      {/* File Buttons */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 10 }}>
        <Button title="Pick File" onPress={handlePickFile} />
        <Button title="Take Photo" onPress={handleTakePhoto} />
      </View>

      {/* Selected Files */}
      <FlatList
        data={files}
        keyExtractor={(item) => item.uri}
        renderItem={({ item }) => <Text style={{ marginVertical: 2 }}>{item.name}</Text>}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Upload</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f7f9fc" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 20, color: "#333" },
  input: {
    width: "100%",
    height: 55,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    justifyContent: "center",
    backgroundColor: "#fff",
    color: "#000",
    marginBottom: 10,
  },
  button: {
    width: "100%",
    height: 55,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginVertical: 20,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  tag: {
    backgroundColor: "#007bff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 5,
    marginBottom: 5,
  },
});
