import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { loginUser } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useContext, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../_layout';

export default function LoginScreen() {
  const context = useContext(AppContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!context) return;
    setSubmitting(true);
    const result = await loginUser(username, password);
    setSubmitting(false);

    if (!result.ok) {
      Alert.alert('Could not log in', result.error);
      return;
    }
    context.setCurrentUserId(result.userId);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brandRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-done-outline" size={26} color="#FFFFFF" />
          </View>
          <Text style={styles.brandName}>Habit Tracker</Text>
        </View>

        <ScreenHeader title="Welcome back" subtitle="Log in to continue" />

        <FormField
          label="Username"
          value={username}
          onChangeText={setUsername}
          placeholder="Your username"
        />
        <FormField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Your password"
          secureTextEntry
        />

        <View style={styles.actions}>
          <PrimaryButton
            label={submitting ? 'Logging in...' : 'Log in'}
            onPress={handleLogin}
          />
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>No account yet?</Text>
          <Link href="/auth/register" style={styles.footerLink}>
            Register
          </Link>
        </View>

        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>Demo account</Text>
          <Text style={styles.demoText}>
            Username: demo{'\n'}Password: demo123
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F8FAFC',
    flex: 1,
    paddingHorizontal: 18,
  },
  content: {
    paddingBottom: 40,
    paddingTop: 30,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: '#0F766E',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    marginRight: 10,
    width: 44,
  },
  brandName: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
  },
  actions: {
    marginTop: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    color: '#64748B',
    fontSize: 14,
    marginRight: 6,
  },
  footerLink: {
    color: '#0F766E',
    fontSize: 14,
    fontWeight: '700',
  },
  demoBox: {
    backgroundColor: '#F0FDFA',
    borderColor: '#0F766E',
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 30,
    padding: 12,
  },
  demoTitle: {
    color: '#0F766E',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  demoText: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 19,
  },
});
