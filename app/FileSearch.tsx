import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
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

type TagType = { id: string; label: string };
type DocumentType = {
  id: string;
  name: string;
  major_head: string;
  minor_head: string;
  document_date: string;
};

export default function FileSearch() {
 

  const [majorOpen, setMajorOpen] = useState(false);
  const [majorValue, setMajorValue] = useState<string | null>(null);
  const [majorItems, setMajorItems] = useState([
    { label: "Personal", value: "Personal" },
    { label: "Professional", value: "Professional" },
  ]);

  const [minorOpen, setMinorOpen] = useState(false);
  const [minorValue, setMinorValue] = useState<string | null>(null);
  const [minorItems, setMinorItems] = useState<{ label: string; value: string }[]>([]);

  const [tags, setTags] = useState<TagType[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
   const [authToken, setAuthToken] = useState<string | null>(null);

  const [results, setResults] = useState<DocumentType[]>([]);
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) setAuthToken(token);
        else console.warn("No auth token found in storage");
      } catch (err) {
        console.error("Error fetching token from storage:", err);
      }
    };
    loadToken();
  }, []);

  // Minor dropdown based on major
  useEffect(() => {
    if (majorValue === "Personal") {
      setMinorItems([
        { label: "John", value: "John" },
        { label: "Tom", value: "Tom" },
        { label: "Emily", value: "Emily" },
      ]);
    } else if (majorValue === "Professional") {
      setMinorItems([
        { label: "Accounts", value: "Accounts" },
        { label: "HR", value: "HR" },
        { label: "IT", value: "IT" },
        { label: "Finance", value: "Finance" },
      ]);
    } else {
      setMinorItems([]);
    }
    setMinorValue(null);
  }, [majorValue]);

  // Add tag
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    const existing = tags.find((t) => t.label === trimmed);
    const newTag: TagType = existing ?? { id: trimmed, label: trimmed };
    if (!existing) setTags((prev) => [...prev, newTag]);
    if (!selectedTags.some((t) => t.label === newTag.label)) setSelectedTags((prev) => [...prev, newTag]);
    setTagInput("");
  };

  // Search function
  const handleSearch = async () => {
    try {
      const body = {
        major_head: majorValue ?? "",
        minor_head: minorValue ?? "",
        from_date: fromDate ? fromDate.toISOString() : "",
        to_date: toDate ? toDate.toISOString() : "",
        tags: selectedTags.map((t) => ({ tag_name: t.label })),
        uploaded_by: "",
        start: 0,
        length: 50,
        filterId: "",
        search: { value: "" },
      };

      const res = await fetch("https://apis.allsoft.co/api/documentManagement/searchDocumentEntry", {
        method: "POST",
        headers: {  ...(authToken ? { token: authToken } : {}), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.status) setResults(data.data);
      else setResults([]);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Documents</Text>

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
      <TextInput
        style={styles.input}
        placeholder="Add tag"
        value={tagInput}
        onChangeText={setTagInput}
        onSubmitEditing={handleAddTag}
      />

      <FlatList
        data={selectedTags}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.tag}>
            <Text style={{ color: "#fff" }}>{item.label}</Text>
          </View>
        )}
      />

      {/* Date pickers */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TouchableOpacity style={styles.input} onPress={() => setShowFromDatePicker(true)}>
          <Text>{fromDate ? fromDate.toDateString() : "From Date"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.input} onPress={() => setShowToDatePicker(true)}>
          <Text>{toDate ? toDate.toDateString() : "To Date"}</Text>
        </TouchableOpacity>
      </View>

      {showFromDatePicker && (
        <DateTimePicker
          value={fromDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, selectedDate) => {
            setShowFromDatePicker(Platform.OS === "ios");
            if (selectedDate) setFromDate(selectedDate);
          }}
        />
      )}

      {showToDatePicker && (
        <DateTimePicker
          value={toDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, selectedDate) => {
            setShowToDatePicker(Platform.OS === "ios");
            if (selectedDate) setToDate(selectedDate);
          }}
        />
      )}

      {/* Search Button */}
      <Button title="Search" onPress={handleSearch} />

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 20 }}
        renderItem={({ item }) => (
          <View style={styles.resultItem}>
            <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
            <Text>
              {item.major_head} / {item.minor_head}
            </Text>
            <Text>Date: {new Date(item.document_date).toDateString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f7f9fc" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 20 },
  input: {
    width: "48%",
    height: 55,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 10,
    justifyContent: "center",
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  tag: {
    backgroundColor: "#007bff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 5,
    marginBottom: 5,
  },
  resultItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
});
