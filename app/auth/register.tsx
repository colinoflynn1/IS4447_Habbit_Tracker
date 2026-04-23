import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { registerUser } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useContext, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../_layout';

export default function RegisterScreen() {
  const context = useContext(AppContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!context) return;
    if (password !== confirm) {
      Alert.alert('Passwords do not match', 'Please re-enter your password.');
      return;
    }
    setSubmitting(true);
    const result = await registerUser(username, password);
    setSubmitting(false);

    if (!result.ok) {
      Alert.alert('Could not register', result.error);
      return;
    }
    context.setCurrentUserId(result.userId);
  };

  if (!context) return null;
  const { theme } = context;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brandRow}>
          <View style={[styles.iconCircle, { backgroundColor: theme.primary }]}>
            <Ionicons name="checkmark-done-outline" size={26} color="#FFFFFF" />
          </View>
          <Text style={[styles.brandName, { color: theme.text }]}>Habit Tracker</Text>
        </View>

        <ScreenHeader title="Create account" subtitle="Pick a username and password" />

        <FormField
          label="Username"
          value={username}
          onChangeText={setUsername}
          placeholder="Choose a username"
        />
        <FormField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 4 characters"
          secureTextEntry
        />
        <FormField
          label="Confirm password"
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Repeat your password"
          secureTextEntry
        />

        <View style={styles.actions}>
          <PrimaryButton
            label={submitting ? 'Creating...' : 'Create account'}
            onPress={handleRegister}
          />
        </View>

        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            Already have an account?
          </Text>
          <Link href="/auth/login" style={[styles.footerLink, { color: theme.primary }]}>
            Log in
          </Link>
        </View>

        <Text style={[styles.note, { color: theme.textMuted }]}>
          Your account is stored only on this device. No data leaves your phone.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
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
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    marginRight: 10,
    width: 44,
  },
  brandName: {
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
    fontSize: 14,
    marginRight: 6,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  note: {
    fontSize: 12,
    marginTop: 30,
    textAlign: 'center',
  },
});
