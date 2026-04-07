import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {useAuthStore, useBiometricStore} from '../stores';
import {AuthStack} from './AuthStack';
import {MemberStack} from './MemberStack';
import {StaffStack} from './StaffStack';
import {AdminStack} from './AdminStack';
import {ConsentScreen} from '../screens/auth/ConsentScreen';
import {
  OnboardingScreen,
  checkOnboardingSeen,
} from '../screens/onboarding/OnboardingScreen';
import ReactNativeBiometrics from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

export const RootNavigator: React.FC = () => {
  const {isAuthenticated, user, activeRole} = useAuthStore();
  const {biometricEnabled} = useBiometricStore();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [biometricUnlocked, setBiometricUnlocked] = useState(false);
  const [biometricFailed, setBiometricFailed] = useState(false);

  useEffect(() => {
    checkOnboardingSeen().then(seen => setShowOnboarding(!seen));
  }, []);

  // Prompt biometric when authenticated and biometric is enabled
  useEffect(() => {
    if (isAuthenticated && biometricEnabled && !biometricUnlocked) {
      promptBiometric();
    }
    if (!isAuthenticated) {
      setBiometricUnlocked(false);
      setBiometricFailed(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, biometricEnabled]);

  const promptBiometric = async () => {
    try {
      const {success} = await rnBiometrics.simplePrompt({
        promptMessage: 'Unlock EasyPoints',
        cancelButtonText: 'Cancel',
      });
      if (success) {
        setBiometricUnlocked(true);
        setBiometricFailed(false);
      } else {
        setBiometricFailed(true);
      }
    } catch {
      setBiometricFailed(true);
    }
  };

  // Biometric lock screen
  if (isAuthenticated && biometricEnabled && !biometricUnlocked) {
    return (
      <SafeAreaView style={lockStyles.container}>
        <View style={lockStyles.center}>
          <Text style={lockStyles.icon}>{'\uD83D\uDD12'}</Text>
          <Text style={lockStyles.title}>EasyPoints Locked</Text>
          <Text style={lockStyles.sub}>
            {biometricFailed
              ? 'Authentication failed. Tap to try again.'
              : 'Authenticate to continue'}
          </Text>
          <TouchableOpacity
            style={lockStyles.btn}
            onPress={promptBiometric}
            activeOpacity={0.7}>
            <Text style={lockStyles.btnText}>{'\uD83D\uDD13'} Unlock</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Not logged in
  if (!isAuthenticated || !user) {
    // Show onboarding before auth if first launch
    if (showOnboarding === true) {
      return <OnboardingScreen onComplete={() => setShowOnboarding(false)} />;
    }
    return (
      <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
    );
  }

  // Logged in but no consent
  if (!user.consentGiven) {
    return (
      <NavigationContainer>
        <ConsentScreen />
      </NavigationContainer>
    );
  }

  // Role-based navigation
  const renderStack = () => {
    switch (activeRole) {
      case 'staff':
      case 'merchant':
        return <StaffStack />;
      case 'admin':
        return <AdminStack />;
      case 'member':
      default:
        return <MemberStack />;
    }
  };

  return <NavigationContainer>{renderStack()}</NavigationContainer>;
};

const lockStyles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8F9FE'},
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {fontSize: 64, marginBottom: 16},
  title: {fontSize: 24, fontWeight: '900', color: '#1A1A2E'},
  sub: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  btn: {
    marginTop: 32,
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  btnText: {color: '#FFF', fontSize: 16, fontWeight: '800'},
});
