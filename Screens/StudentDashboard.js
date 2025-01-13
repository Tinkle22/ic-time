import { StyleSheet, Text, View, Button } from 'react-native';
import React from 'react';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Student Dashboard</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
};

export default StudentDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
}); 