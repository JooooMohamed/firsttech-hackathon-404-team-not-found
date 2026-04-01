import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AdminDashboardScreen} from '../screens/admin/AdminDashboardScreen';
import {MerchantSetupScreen} from '../screens/admin/MerchantSetupScreen';
import {MerchantSettingsScreen} from '../screens/admin/MerchantSettingsScreen';
import {AdminTransactionsScreen} from '../screens/admin/AdminTransactionsScreen';
import {COLORS} from '../constants';

const Stack = createNativeStackNavigator();

export const AdminStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: COLORS.background},
        headerTintColor: COLORS.text,
        headerTitleStyle: {fontWeight: '700'},
        headerShadowVisible: false,
      }}>
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="MerchantSetup"
        component={MerchantSetupScreen}
        options={{title: 'Merchant Setup'}}
      />
      <Stack.Screen
        name="MerchantSettings"
        component={MerchantSettingsScreen}
        options={{title: 'Settings'}}
      />
      <Stack.Screen
        name="AdminTransactions"
        component={AdminTransactionsScreen}
        options={{title: 'Transactions'}}
      />
    </Stack.Navigator>
  );
};
