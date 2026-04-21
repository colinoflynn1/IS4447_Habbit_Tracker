import { StyleSheet, Text, View } from 'react-native';

type Props = {
  label: string;
  value: string;
  color?: string;
};

export default function InfoTag({ label, value, color }: Props) {
  const background = color ? `${color}22` : '#EFF6FF';
  const border = color ?? '#1D4ED8';

  return (
    <View style={[styles.tag, { backgroundColor: background }]}>
      <Text style={[styles.label, { color: border }]}>{label}</Text>
      <Text style={[styles.value, { color: border }]}>{value}</Text>
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
