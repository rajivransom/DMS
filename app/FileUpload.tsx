import { StyleSheet, Text, View,Button } from 'react-native'
import React,{useState} from 'react'
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';

const FileUpload = () => {
const [showPicker, setShowPicker] = useState(false);

  
const [date, setDate] = useState(new Date());
const [majorOpen, setMajorOpen] = useState(false);
const [minorOpen, setMinorOpen] = useState(false);
const [majorValue, setMajorValue] = useState<string | null>(null);
const [minorValue, setMinorValue] = useState<string | null>(null);

const personalOptions = [
  { label: 'John', value: 'John' },
  { label: 'Tom', value: 'Tom' },
  { label: 'Emily', value: 'Emily' },
];
const professionalOptions = [
  { label: 'Accounts', value: 'Accounts' },
  { label: 'HR', value: 'HR' },
  { label: 'IT', value: 'IT' },
  { label: 'Finance', value: 'Finance' },
];

const minorOptions = majorValue === 'Personal' ? personalOptions : professionalOptions;
const onChange = (event: any, selectedDate?: Date) => {
    
    if (selectedDate) setDate(selectedDate);
  };
  return (
    <View style={{backgroundColor:"white"}}>
    <Button  title="Select Date"  onPress={() => setShowPicker(true)} />

    {showPicker && (
      <DateTimePicker
        value={date}
        mode="date"
        display="default"
        onChange={onChange}
      />
    )}
    <View style={{ zIndex: 3000, marginBottom: 20 }}>
  <DropDownPicker
    open={majorOpen}
    value={majorValue}
    items={[
      { label: 'Personal', value: 'Personal' },
      { label: 'Professional', value: 'Professional' },
    ]}
    setOpen={setMajorOpen}
    setValue={setMajorValue}
    placeholder="Select Major Category"
  />
</View>

<View style={{ zIndex: 2000, marginBottom: 20 }}>
  <DropDownPicker
    open={minorOpen}
    value={minorValue}
    items={minorOptions}
    setOpen={setMinorOpen}
    setValue={setMinorValue}
    placeholder="Select Minor Category"
  />
</View>
 

  </View>
  )
}

export default FileUpload

const styles = StyleSheet.create({})