import { useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppContext } from '@/app/_layout';

type Props = {
  title: string;
  subtitle?: string;
};

export default function ScreenHeader({ title, subtitle }: Props) {
  const context = useContext(AppContext);
  const theme = context?.theme;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme?.text ?? '#111827' }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: theme?.textMuted ?? '#6B7280' }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
});
