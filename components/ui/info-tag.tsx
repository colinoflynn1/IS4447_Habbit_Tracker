import { useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppContext } from '@/app/_layout';

type Props = {
  label: string;
  value: string;
  color?: string;
};

export default function InfoTag({ label, value, color }: Props) {
  const context = useContext(AppContext);
  const theme = context?.theme;
  const isDark = theme?.name === 'dark';

  // If a colour is given, use it. Otherwise fall back to a neutral.
  const accent = color ?? (isDark ? '#94A3B8' : '#1D4ED8');
  const background = color
    ? isDark
      ? `${color}33`
      : `${color}22`
    : isDark
      ? '#334155'
      : '#EFF6FF';

  return (
    <View style={[styles.tag, { backgroundColor: background }]}>
      <Text style={[styles.label, { color: accent }]}>{label}</Text>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderRadius: 999,
    flexDirection: 'row',
    marginRight: 8,
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  value: {
    fontSize: 12,
    fontWeight: '500',
  },
});
