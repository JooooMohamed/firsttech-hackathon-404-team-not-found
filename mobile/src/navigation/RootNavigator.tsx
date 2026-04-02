import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {useAuthStore} from '../stores';
import {AuthStack} from './AuthStack';
import {MemberStack} from './MemberStack';
import {StaffStack} from './StaffStack';
import {AdminStack} from './AdminStack';
import {ConsentScreen} from '../screens/auth/ConsentScreen';
import {
  OnboardingScreen,
  checkOnboardingSeen,
} from '../screens/onboarding/OnboardingScreen';

export const RootNavigator: React.FC = () => {
  const {isAuthenticated, user, activeRole} = useAuthStore();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboardingSeen().then(seen => setShowOnboarding(!seen));
  }, []);

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
