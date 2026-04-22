import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  value: 'boolean' | 'count';
  onChange: (value: 'boolean' | 'count') => void;
};

// Two-option toggle for picking the metric type of a habit.
// Boolean is for yes/no habits (like "went to gym"), count is for tracking
// amounts (like "drank 8 glasses of water").
export default function MetricTypePicker({ value, onChange }: Props) {
  const options: { key: 'boolean' | 'count'; label: string; helper: string }[] = [
    { key: 'boolean', label: 'Done or not', helper: 'Tick off when complete' },
    { key: 'count', label: 'Count', helper: 'Track a number' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>How do you want to track this?</Text>
      <View style={styles.row}>
        {options.map((option) => {
          const isSelected = value === option.key;
          return (
            <Pressable
              key={option.key}
              accessibilityLabel={`Metric type ${option.label}`}
              accessibilityRole="button"
              onPress={() => onChange(option.key)}
              style={[
                styles.option,
                isSelected ? styles.optionSelected : null,
              ]}
            >
              <Text
                style={[
                  styles.optionLabel,
                  isSelected ? styles.optionLabelSelected : null,
                ]}
              >
                {option.label}
              </Text>
              <Text
                style={[
                  styles.optionHelper,
                  isSelected ? styles.optionHelperSelected : null,
                ]}
              >
                {option.helper}
              </Text>
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
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  optionSelected: {
    backgroundColor: '#F0FDFA',
    borderColor: '#0F766E',
  },
  optionLabel: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  optionLabelSelected: {
    color: '#0F766E',
  },
  optionHelper: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  optionHelperSelected: {
    color: '#0F766E',
  },
});
