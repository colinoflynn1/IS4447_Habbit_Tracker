import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppContext } from '@/app/_layout';

type Props = {
  value: 'boolean' | 'count';
  onChange: (value: 'boolean' | 'count') => void;
};

export default function MetricTypePicker({ value, onChange }: Props) {
  const context = useContext(AppContext);
  const theme = context?.theme;

  const options: { key: 'boolean' | 'count'; label: string; helper: string }[] = [
    { key: 'boolean', label: 'Done or not', helper: 'Tick off when complete' },
    { key: 'count', label: 'Count', helper: 'Track a number' },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme?.textMuted ?? '#334155' }]}>
        How do you want to track this?
      </Text>
      <View style={styles.row}>
        {options.map((option) => {
          const isSelected = value === option.key;
          const bg = isSelected
            ? theme?.primaryFaint ?? '#F0FDFA'
            : theme?.surface ?? '#FFFFFF';
          const border = isSelected
            ? theme?.primary ?? '#0F766E'
            : theme?.inputBorder ?? '#CBD5E1';
          const labelColor = isSelected
            ? theme?.primary ?? '#0F766E'
            : theme?.text ?? '#0F172A';
          const helperColor = isSelected
            ? theme?.primary ?? '#0F766E'
            : theme?.textMuted ?? '#64748B';

          return (
            <Pressable
              key={option.key}
              accessibilityLabel={`Metric type ${option.label}`}
              accessibilityRole="button"
              onPress={() => onChange(option.key)}
              style={[styles.option, { backgroundColor: bg, borderColor: border }]}
            >
              <Text style={[styles.optionLabel, { color: labelColor }]}>{option.label}</Text>
              <Text style={[styles.optionHelper, { color: helperColor }]}>{option.helper}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  optionHelper: {
    fontSize: 12,
    marginTop: 2,
  },
});
