import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LandingScreen, LoginScreen, RegisterScreen, ARDesignerScreen } from '../screens';
import DashboardNavigator from './DashboardNavigator';

export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  ARDesigner: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={DashboardNavigator} />
        <Stack.Screen name="ARDesigner" component={ARDesignerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
