import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('classes');
  const [timetable, setTimetable] = useState([]);
  const [labs, setLabs] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Monday');
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  // Form states
  const [formData, setFormData] = useState({
    courseName: '',
    lecturerEmail: '',
    lecturerName: '',
    classTime: '',
    date: '',
    location: '',
    description: ''
  });

  const fetchData = async () => {
    try {
      const timetableSnapshot = await getDocs(collection(db, 'timetables'));
      setTimetable(timetableSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      const labsSnapshot = await getDocs(collection(db, 'labs'));
      setLabs(labsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      const meetingsSnapshot = await getDocs(collection(db, 'meetings'));
      setMeetings(meetingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const validateTimeFormat = (time) => {
    // Check if time matches format "HH:MM AM/PM"
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i;
    return timeRegex.test(time);
  };

  const formatTime = (time) => {
    // Remove any extra spaces and ensure proper capitalization of AM/PM
    const formattedTime = time.trim().replace(/\s+/g, ' ');
    return formattedTime.replace(/am|pm/i, (match) => match.toUpperCase());
  };

  const handleAdd = async () => {
    if (!validateForm()) return;

    try {
      let collectionName = '';
      let data = {};

      // Format the time string
      const timeValue = formData.classTime;
      if (!validateTimeFormat(timeValue)) {
        Alert.alert('Error', 'Please enter time in format "HH:MM AM/PM" (e.g., "10:00 AM")');
        return;
      }

      const formattedTime = formatTime(timeValue);

      switch (activeTab) {
        case 'classes':
          collectionName = 'timetables';
          data = {
            courseName: formData.courseName,
            lecturerEmail: formData.lecturerEmail,
            lecturerName: formData.lecturerName,
            classTime: `${selectedDay} ${formattedTime}`,
            type: 'class'
          };
          break;
        case 'labs':
          collectionName = 'labs';
          data = {
            courseName: formData.courseName,
            lecturerEmail: formData.lecturerEmail,
            lecturerName: formData.lecturerName,
            labTime: `${selectedDay} ${formattedTime}`,
            location: formData.location,
            type: 'lab'
          };
          break;
        case 'meetings':
          collectionName = 'meetings';
          data = {
            title: formData.courseName,
            lecturerEmail: formData.lecturerEmail,
            lecturerName: formData.lecturerName,
            meetingTime: formattedTime,
            date: formData.date,
            description: formData.description,
            type: 'meeting'
          };
          break;
      }

      await addDoc(collection(db, collectionName), data);
      clearForm();
      fetchData();
      Alert.alert('Success', 'Added successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const validateForm = () => {
    const requiredFields = ['lecturerEmail', 'lecturerName', 'classTime'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        Alert.alert('Error', 'Please fill in all required fields');
        return false;
      }
    }
    return true;
  };

  const clearForm = () => {
    setFormData({
      courseName: '',
      lecturerEmail: '',
      lecturerName: '',
      classTime: '',
      date: '',
      location: '',
      description: ''
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      
      <View style={styles.tabContainer}>
        {['classes', 'labs', 'meetings'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.formContainer}>
        {(activeTab === 'classes' || activeTab === 'labs') && (
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
        )}

        <TextInput
          style={styles.input}
          placeholder={activeTab === 'meetings' ? "Meeting Title" : "Course Name"}
          value={formData.courseName}
          onChangeText={(text) => setFormData({...formData, courseName: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Lecturer Email"
          value={formData.lecturerEmail}
          onChangeText={(text) => setFormData({...formData, lecturerEmail: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Lecturer Name"
          value={formData.lecturerName}
          onChangeText={(text) => setFormData({...formData, lecturerName: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Time (e.g., 10:00 AM)"
          value={formData.classTime}
          onChangeText={(text) => setFormData({...formData, classTime: text})}
        />
        {activeTab === 'labs' && (
          <TextInput
            style={styles.input}
            placeholder="Location"
            value={formData.location}
            onChangeText={(text) => setFormData({...formData, location: text})}
          />
        )}
        {activeTab === 'meetings' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Date"
              value={formData.date}
              onChangeText={(text) => setFormData({...formData, date: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={formData.description}
              onChangeText={(text) => setFormData({...formData, description: text})}
              multiline
            />
          </>
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.buttonText}>Add {activeTab.slice(0, -1)}</Text>
        </TouchableOpacity>
      </ScrollView>

      <FlatList
        data={activeTab === 'classes' ? timetable : activeTab === 'labs' ? labs : meetings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.itemTitle}>{item.courseName || item.title}</Text>
            <Text style={styles.itemDetails}>
              {item.lecturerName} - {item.classTime || item.labTime || item.meetingTime}
            </Text>
            {item.location && <Text style={styles.itemLocation}>Location: {item.location}</Text>}
            {item.description && <Text style={styles.itemDescription}>{item.description}</Text>}
          </View>
        )}
      />

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  // ... existing styles ...
  daysContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 5,
    marginBottom: 15,
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
});