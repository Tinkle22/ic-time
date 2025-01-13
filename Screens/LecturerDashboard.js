import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const LecturerDashboard = () => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('classes');
  const [timetable, setTimetable] = useState([]);
  const [labs, setLabs] = useState([]);
  const [meetings, setMeetings] = useState([]);

  const fetchData = async () => {
    try {
      // Fetch timetables
      const timetableQuery = query(
        collection(db, 'timetables'),
        where('lecturerEmail', '==', user.email)
      );
      const timetableSnapshot = await getDocs(timetableQuery);
      setTimetable(timetableSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch labs
      const labsQuery = query(
        collection(db, 'labs'),
        where('lecturerEmail', '==', user.email)
      );
      const labsSnapshot = await getDocs(labsQuery);
      setLabs(labsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch meetings
      const meetingsQuery = query(
        collection(db, 'meetings'),
        where('lecturerEmail', '==', user.email)
      );
      const meetingsSnapshot = await getDocs(meetingsQuery);
      setMeetings(meetingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      if (timetableSnapshot.empty && labsSnapshot.empty && meetingsSnapshot.empty) {
        Alert.alert('Info', 'No schedules found for your account');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load schedules. Please try again later.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCurrentData = () => {
    switch (activeTab) {
      case 'classes':
        return timetable;
      case 'labs':
        return labs;
      case 'meetings':
        return meetings;
      default:
        return [];
    }
  };

  const renderItem = ({ item }) => {
    let mainContent, secondaryContent, additionalContent;

    switch (activeTab) {
      case 'classes':
        mainContent = item.courseName;
        secondaryContent = `Time: ${item.classTime}`;
        break;
      case 'labs':
        mainContent = item.courseName;
        secondaryContent = `Time: ${item.labTime}`;
        additionalContent = `Location: ${item.location}`;
        break;
      case 'meetings':
        mainContent = item.title;
        secondaryContent = `Time: ${item.meetingTime}`;
        additionalContent = item.description;
        break;
    }

    return (
      <View style={styles.listItem}>
        <Text style={styles.itemTitle}>{mainContent}</Text>
        <Text style={styles.itemTime}>{secondaryContent}</Text>
        {additionalContent && (
          <Text style={styles.itemAdditional}>{additionalContent}</Text>
        )}
        <View style={styles.itemFooter}>
          <Text style={styles.itemType}>{activeTab.slice(0, -1).toUpperCase()}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lecturer Dashboard</Text>
        <Text style={styles.subtitle}>{user.email}</Text>
      </View>
      
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

      <FlatList
        data={getCurrentData()}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {activeTab} scheduled</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LecturerDashboard;

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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 5,
    elevation: 2,
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#2E7D32',
  },
  tabText: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  listContainer: {
    paddingBottom: 20,
  },
  listItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  itemTime: {
    fontSize: 16,
    color: '#444',
    marginBottom: 4,
  },
  itemAdditional: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  itemFooter: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  itemType: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
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