import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SessionScreen from '../screens/SessionScreens';

const Stack = createStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Session" 
          component={SessionScreen} 
          options={{ title: 'Breath Session' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
