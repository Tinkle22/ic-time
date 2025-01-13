import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const { logout, user } = useAuth();
  const [timetable, setTimetable] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Monday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const fetchTimetable = async () => {
    try {
      const timetableCollection = collection(db, 'timetables');
      const timetableSnapshot = await getDocs(timetableCollection);
      const timetableList = timetableSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTimetable(timetableList);

      if (timetableList.length === 0) {
        Alert.alert('Info', 'No classes scheduled');
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      Alert.alert('Error', 'Failed to load timetable. Please try again later.');
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const filterTimetableByDay = (day) => {
    return timetable.filter(item => {
      const classDay = item.classTime?.toLowerCase().includes(day.toLowerCase());
      return classDay;
    });
  };

  const renderTimeSlot = ({ item }) => (
    <View style={styles.classCard}>
      <Text style={styles.courseTitle}>{item.courseName}</Text>
      <View style={styles.classDetails}>
        <Text style={styles.timeText}>{item.classTime}</Text>
        <Text style={styles.lecturerText}>Lecturer: {item.lecturerName}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Student Timetable</Text>
        <Text style={styles.subtitle}>{user.email}</Text>
      </View>

      <View style={styles.daysContainer}>
        {days.map((day) => (
          <TouchableOpacity
            key={day}
            style={[styles.dayTab, selectedDay === day && styles.selectedDayTab]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={[styles.dayText, selectedDay === day && styles.selectedDayText]}>
              {day.slice(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filterTimetableByDay(selectedDay)}
        keyExtractor={(item) => item.id}
        renderItem={renderTimeSlot}
        contentContainerStyle={styles.timetableContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No classes scheduled for {selectedDay}</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default StudentDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  daysContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 5,
    marginBottom: 20,
    elevation: 2,
  },
  dayTab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedDayTab: {
    backgroundColor: '#2E7D32',
  },
  dayText: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  selectedDayText: {
    color: '#fff',
  },
  timetableContainer: {
    paddingBottom: 20,
  },
  classCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  classDetails: {
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 4,
  },
  lecturerText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  logoutButton: {
    backgroundColor: '#c62828',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});