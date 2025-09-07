import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Session from '../SessionScreens';

const Stack = createStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Session" 
          component={Session} 
          options={{ title: 'Breath Session' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
