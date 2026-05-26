import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SplashScreen from 'react-native-splash-screen';
import {useAuth} from '../context/AuthContext';
import {LoadingScreen} from '../components/common/LoadingState';
import {ROLES} from '../utils/constants';

// Auth
import LoginScreen from '../screens/auth/LoginScreen';

// Dashboards
import EmployeeDashboard from '../screens/employee/EmployeeDashboard';
import ManagerDashboard from '../screens/manager/ManagerDashboard';
import AdminDashboard from '../screens/admin/AdminDashboard';

// Leave
import ApplyLeaveScreen from '../screens/leave/ApplyLeaveScreen';
import MyLeavesScreen from '../screens/leave/MyLeavesScreen';
import LeaveBalanceScreen from '../screens/leave/LeaveBalanceScreen';
import LeaveDetailScreen from '../screens/leave/LeaveDetailScreen';

// Manager
import PendingApprovalsScreen from '../screens/manager/PendingApprovalsScreen';

// Admin
import EmployeeListScreen from '../screens/admin/EmployeeListScreen';
import EmployeeDetailScreen from '../screens/admin/EmployeeDetailScreen';
import AddEmployeeScreen from '../screens/admin/AddEmployeeScreen';
import DepartmentsScreen from '../screens/admin/DepartmentsScreen';

// Shared
import HolidaysScreen from '../screens/shared/HolidaysScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import AnalyticsScreen from '../screens/shared/AnalyticsScreen';

const Stack = createNativeStackNavigator();

const RootNavigator: React.FC = () => {
  const {user, loading} = useAuth();

  // Dismiss splash once auth state is resolved
  useEffect(() => {
    if (!loading) {
      try {
        SplashScreen.hide();
      } catch {}
    }
  }, [loading]);

  if (loading) return <LoadingScreen message="Starting LeaveApp..." />;

  const DashboardComponent =
    user?.role === ROLES.ADMIN    ? AdminDashboard :
    user?.role === ROLES.MANAGER  ? ManagerDashboard :
    EmployeeDashboard;

  if (!user) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{headerShown: false, animation: 'slide_from_right'}}
        initialRouteName="Dashboard">

        {/* Home */}
        <Stack.Screen name="Dashboard" component={DashboardComponent} />

        {/* Leave */}
        <Stack.Screen name="ApplyLeave" component={ApplyLeaveScreen} />
        <Stack.Screen name="MyLeaves" component={MyLeavesScreen} />
        <Stack.Screen name="LeaveBalance" component={LeaveBalanceScreen} />
        <Stack.Screen name="LeaveDetail" component={LeaveDetailScreen} />

        {/* Manager */}
        <Stack.Screen name="PendingApprovals" component={PendingApprovalsScreen} />

        {/* Admin */}
        <Stack.Screen name="EmployeeList" component={EmployeeListScreen} />
        <Stack.Screen name="EmployeeDetail" component={EmployeeDetailScreen} />
        <Stack.Screen name="AddEmployee" component={AddEmployeeScreen} />
        <Stack.Screen name="Departments" component={DepartmentsScreen} />

        {/* Shared */}
        <Stack.Screen name="Holidays" component={HolidaysScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Analytics" component={AnalyticsScreen} />
        <Stack.Screen name="TeamList" component={EmployeeListScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
