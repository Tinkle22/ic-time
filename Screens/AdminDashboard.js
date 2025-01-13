import { StyleSheet, Text, View, Button, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [timetable, setTimetable] = useState([]);
  const [courseName, setCourseName] = useState('');
  const [lecturerName, setLecturerName] = useState('');
  const [lecturerEmail, setLecturerEmail] = useState('');
  const [classTime, setClassTime] = useState('');

  // Fetch timetables from Firestore
  const fetchTimetable = async () => {
    const timetableCollection = collection(db, 'timetables');
    const timetableSnapshot = await getDocs(timetableCollection);
    const timetableList = timetableSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTimetable(timetableList);
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  // Add a new timetable entry
  const handleAddTimetable = async () => {
    if (!courseName || !lecturerName || !classTime || !lecturerEmail) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await addDoc(collection(db, 'timetables'), {
        courseName,
        lecturerName,
        classTime,
      });
      setCourseName('');
      setLecturerName('');
      setClassTime('');
      fetchTimetable(); // Refresh the timetable list
      Alert.alert('Success', 'Timetable added successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <TextInput
        style={styles.input}
        placeholder="Course Name"
        value={courseName}
        onChangeText={setCourseName}
      />
      <TextInput
        style={styles.input}
        placeholder="Lecturer Email"
        value={lecturerEmail}
        onChangeText={setLecturerName}
      />
      <TextInput
        style={styles.input}
        placeholder="Lecturer Name"
        value={lecturerName}
        onChangeText={setLecturerName}
      />
      <TextInput
        style={styles.input}
        placeholder="Class Time"
        value={classTime}
        onChangeText={setClassTime}
      />
      <Button title="Add Timetable" onPress={handleAddTimetable} />
      <FlatList
        data={timetable}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.timetableItem}>
            <Text>{item.courseName} - {item.lecturerName} at {item.classTime}</Text>
          </View>
        )}
      />
      <Button title="Logout" onPress={logout} />
    </View>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  timetableItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
}); 