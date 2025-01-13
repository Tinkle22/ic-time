import { StyleSheet, Text, View, Button, FlatList, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const LecturerDashboard = () => {
  const { logout, user } = useAuth();
  const [timetable, setTimetable] = useState([]);

  // Fetch timetables assigned to the lecturer
  const fetchTimetable = async () => {
    try {
      const timetableCollection = collection(db, 'timetables');
      const q = query(timetableCollection, where('lecturerName', '==', user.email));
      const timetableSnapshot = await getDocs(q);
      const timetableList = timetableSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTimetable(timetableList);
      
      if (timetableList.length === 0) {
        Alert.alert('Info', 'No timetables found for your account');
      }
    } catch (error) {
      console.error('Error fetching timetables:', error);
      Alert.alert('Error', 'Failed to load timetables. Please try again later.');
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lecturer Dashboard</Text>
      <FlatList
        data={timetable}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.timetableItem}>
            <Text>{item.courseName} - {item.classTime}</Text>
          </View>
        )}
      />
      <Button title="Logout" onPress={logout} />
    </View>
  );
};

export default LecturerDashboard;

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
  timetableItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
}); 