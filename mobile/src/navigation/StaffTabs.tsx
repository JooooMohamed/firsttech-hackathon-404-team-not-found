import React, {useCallback} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StaffHomeScreen} from '../screens/staff/StaffHomeScreen';
import {StaffStatsScreen} from '../screens/staff/StaffStatsScreen';
import {StaffSettingsScreen} from '../screens/staff/StaffSettingsScreen';
import {EarnScreen} from '../screens/staff/EarnScreen';
import {RedeemValidationScreen} from '../screens/staff/RedeemValidationScreen';
import {StaffManagementScreen} from '../screens/merchant/StaffManagementScreen';
import {MerchantEditScreen} from '../screens/staff/MerchantEditScreen';
import {COLORS, FONT_SIZE} from '../constants';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const screenOpts = {
  headerStyle: {backgroundColor: COLORS.background},
  headerTintColor: COLORS.text,
  headerTitleStyle: {fontWeight: '700' as const},
  headerShadowVisible: false,
};

// ─── Home sub-stack (actions + sub-screens) ───────────
const HomeStack = () => (
  <Stack.Navigator screenOptions={screenOpts}>
    <Stack.Screen
      name="StaffHomeMain"
      component={StaffHomeScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="StaffEarn"
      component={EarnScreen}
      options={{title: 'Issue Points'}}
    />
    <Stack.Screen
      name="StaffRedeem"
      component={RedeemValidationScreen}
      options={{title: 'Validate Redemption'}}
    />
    <Stack.Screen
      name="StaffManagement"
      component={StaffManagementScreen}
      options={{title: 'Manage Staff'}}
    />
    <Stack.Screen
      name="MerchantEdit"
      component={MerchantEditScreen}
      options={{title: 'Edit Merchant'}}
    />
  </Stack.Navigator>
);

// ─── Stats sub-stack ──────────────────────────────────
const StatsStack = () => (
  <Stack.Navigator screenOptions={screenOpts}>
    <Stack.Screen
      name="StaffStatsMain"
      component={StaffStatsScreen}
      options={{headerShown: false}}
    />
  </Stack.Navigator>
);

// ─── Settings sub-stack ───────────────────────────────
const SettingsStack = () => (
  <Stack.Navigator screenOptions={screenOpts}>
    <Stack.Screen
      name="StaffSettingsMain"
      component={StaffSettingsScreen}
      options={{headerShown: false}}
    />
  </Stack.Navigator>
);

const TabIcon: React.FC<{icon: string; label: string; focused: boolean}> = ({
  icon,
  label,
  focused,
}) => (
  <View style={tabStyles.iconWrap}>
    <Text style={[tabStyles.icon, focused && tabStyles.iconFocused]}>
      {icon}
    </Text>
    <Text style={[tabStyles.label, focused && tabStyles.labelFocused]}>
      {label}
    </Text>
  </View>
);

export const StaffTabs: React.FC = () => {
  const HomeIcon = useCallback(
    ({focused}: {focused: boolean}) => (
      <TabIcon icon="🏠" label="Home" focused={focused} />
    ),
    [],
  );
  const StatsIcon = useCallback(
    ({focused}: {focused: boolean}) => (
      <TabIcon icon="📊" label="Stats" focused={focused} />
    ),
    [],
  );
  const SettingsIcon = useCallback(
    ({focused}: {focused: boolean}) => (
      <TabIcon icon="⚙️" label="Settings" focused={focused} />
    ),
    [],
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: tabStyles.bar,
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{tabBarIcon: HomeIcon}}
      />
      <Tab.Screen
        name="StatsTab"
        component={StatsStack}
        options={{tabBarIcon: StatsIcon}}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{tabBarIcon: SettingsIcon}}
      />
    </Tab.Navigator>
  );
};

const tabStyles = StyleSheet.create({
  bar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 0,
    height: 80,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
    opacity: 0.5,
  },
  iconFocused: {
    opacity: 1,
  },
  label: {
    fontSize: FONT_SIZE.xs - 2,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  labelFocused: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
