import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppContext } from '@/app/_layout';

type Props = {
  value: string;
  onChange: (color: string) => void;
};

const COLORS = [
  '#0F766E',
  '#2563EB',
  '#D97706',
  '#7C3AED',
  '#DC2626',
  '#059669',
  '#DB2777',
  '#0891B2',
  '#EA580C',
  '#4F46E5',
  '#CA8A04',
  '#16A34A',
];

export default function ColorPicker({ value, onChange }: Props) {
  const context = useContext(AppContext);
  const theme = context?.theme;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme?.textMuted ?? '#334155' }]}>Colour</Text>
      <View style={styles.row}>
        {COLORS.map((color) => {
          const isSelected = value === color;
          return (
            <Pressable
              key={color}
              accessibilityLabel={`Colour ${color}`}
              accessibilityRole="button"
              onPress={() => onChange(color)}
              style={[
                styles.swatch,
                {
                  backgroundColor: color,
                  borderColor: isSelected ? (theme?.text ?? '#0F172A') : 'transparent',
                },
              ]}
            />
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
    flexWrap: 'wrap',
    gap: 8,
  },
  swatch: {
    borderRadius: 20,
    borderWidth: 3,
    height: 36,
    width: 36,
  },
});
