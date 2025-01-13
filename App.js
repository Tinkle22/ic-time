import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './Screens/Login';
import SignUp from './Screens/SignUp';
import StudentDashboard from './Screens/StudentDashboard';
import LecturerDashboard from './Screens/LecturerDashboard';
import AdminDashboard from './Screens/AdminDashboard';

const Stack = createNativeStackNavigator();

function Navigation() {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="SignUp" component={SignUp} />
        </>
      ) : (
        <>
          {user.role === 'student' && (
            <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
          )}
          {user.role === 'lecturer' && (
            <Stack.Screen name="LecturerDashboard" component={LecturerDashboard} />
          )}
          {user.role === 'admin' && (
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
          )}
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </AuthProvider>
  );
}
