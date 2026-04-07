import React, {useCallback} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeScreen} from '../screens/wallet/HomeScreen';
import {MerchantDirectoryScreen} from '../screens/merchants/MerchantDirectoryScreen';
import {MerchantProfileScreen} from '../screens/merchants/MerchantProfileScreen';
import {EarnQRScreen} from '../screens/wallet/EarnQRScreen';
import {TransactionHistoryScreen} from '../screens/transactions/TransactionHistoryScreen';
import {SettingsScreen} from '../screens/settings/SettingsScreen';
import {LinkProgramScreen} from '../screens/programs/LinkProgramScreen';
import {MerchantOnboardingScreen} from '../screens/merchant/MerchantOnboardingScreen';
import {NotificationsScreen} from '../screens/notifications/NotificationsScreen';
import {OffersScreen} from '../screens/offers/OffersScreen';
import {RedeemScreen} from '../screens/wallet/RedeemScreen';
import {COLORS, FONT_SIZE} from '../constants';
import {useNotificationStore} from '../stores';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const screenOpts = {
  headerStyle: {backgroundColor: COLORS.background},
  headerTintColor: COLORS.text,
  headerTitleStyle: {fontWeight: '700' as const},
  headerShadowVisible: false,
};

// ─── Home sub-stack ───────────────────────────────────
const HomeStack = () => (
  <Stack.Navigator screenOptions={screenOpts}>
    <Stack.Screen
      name="HomeMain"
      component={HomeScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="LinkProgram"
      component={LinkProgramScreen}
      options={{title: 'Manage Programs'}}
    />
    <Stack.Screen
      name="EarnQR"
      component={EarnQRScreen}
      options={{title: 'My QR Code'}}
    />
    <Stack.Screen
      name="MerchantOnboarding"
      component={MerchantOnboardingScreen}
      options={{title: 'Register Business'}}
    />
    <Stack.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{title: 'Notifications'}}
    />
  </Stack.Navigator>
);

// ─── Merchants sub-stack ──────────────────────────────
const MerchantsStack = () => (
  <Stack.Navigator screenOptions={screenOpts}>
    <Stack.Screen
      name="MerchantDirectory"
      component={MerchantDirectoryScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="MerchantProfile"
      component={MerchantProfileScreen}
      options={{title: 'Merchant'}}
    />
    <Stack.Screen
      name="EarnQR"
      component={EarnQRScreen}
      options={{title: 'My QR Code'}}
    />
  </Stack.Navigator>
);

// ─── Activity sub-stack ───────────────────────────────
const ActivityStack = () => (
  <Stack.Navigator screenOptions={screenOpts}>
    <Stack.Screen
      name="TransactionHistory"
      component={TransactionHistoryScreen}
      options={{headerShown: false}}
    />
  </Stack.Navigator>
);

// ─── Offers sub-stack ─────────────────────────────────
const OffersStack = () => (
  <Stack.Navigator screenOptions={screenOpts}>
    <Stack.Screen
      name="OffersMain"
      component={OffersScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="MerchantProfile"
      component={MerchantProfileScreen}
      options={{title: 'Merchant'}}
    />
    <Stack.Screen
      name="EarnQR"
      component={EarnQRScreen}
      options={{title: 'My QR Code'}}
    />
    <Stack.Screen
      name="Redeem"
      component={RedeemScreen}
      options={{title: 'Redeem Points'}}
    />
  </Stack.Navigator>
);

// ─── Settings sub-stack ───────────────────────────────
const SettingsStack = () => (
  <Stack.Navigator screenOptions={screenOpts}>
    <Stack.Screen
      name="SettingsMain"
      component={SettingsScreen}
      options={{headerShown: false}}
    />
  </Stack.Navigator>
);

const TabIcon: React.FC<{
  icon: string;
  label: string;
  focused: boolean;
  badge?: number;
}> = ({icon, label, focused, badge}) => (
  <View style={tabStyles.iconWrap}>
    <Text style={[tabStyles.icon, focused && tabStyles.iconFocused]}>
      {icon}
    </Text>
    {(badge ?? 0) > 0 && (
      <View style={tabStyles.badge}>
        <Text style={tabStyles.badgeText}>{badge! > 9 ? '9+' : badge}</Text>
      </View>
    )}
    <Text style={[tabStyles.label, focused && tabStyles.labelFocused]}>
      {label}
    </Text>
  </View>
);

export const MemberTabs: React.FC = () => {
  const unreadCount = useNotificationStore(s => s.unreadCount);

  const HomeIcon = useCallback(
    ({focused}: {focused: boolean}) => (
      <TabIcon icon="🏠" label="Home" focused={focused} badge={unreadCount} />
    ),
    [unreadCount],
  );
  const MerchantsIcon = useCallback(
    ({focused}: {focused: boolean}) => (
      <TabIcon icon="🏪" label="Merchants" focused={focused} />
    ),
    [],
  );
  const OffersIcon = useCallback(
    ({focused}: {focused: boolean}) => (
      <TabIcon icon="🎯" label="Offers" focused={focused} />
    ),
    [],
  );
  const ActivityIcon = useCallback(
    ({focused}: {focused: boolean}) => (
      <TabIcon icon="📋" label="Activity" focused={focused} />
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
        name="MerchantsTab"
        component={MerchantsStack}
        options={{tabBarIcon: MerchantsIcon}}
      />
      <Tab.Screen
        name="OffersTab"
        component={OffersStack}
        options={{tabBarIcon: OffersIcon}}
      />
      <Tab.Screen
        name="ActivityTab"
        component={ActivityStack}
        options={{tabBarIcon: ActivityIcon}}
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
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
