import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  value: string;
  onChange: (iconName: string) => void;
  color: string;
};

// Pre-defined list of Ionicon names that suit habit categories.
// The user taps one to pick it for their category.
const ICONS = [
  'barbell-outline',
  'water-outline',
  'book-outline',
  'leaf-outline',
  'bed-outline',
  'heart-outline',
  'bicycle-outline',
  'musical-notes-outline',
  'sunny-outline',
  'moon-outline',
  'nutrition-outline',
  'flash-outline',
];

export default function IconPicker({ value, onChange, color }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Icon</Text>
      <View style={styles.grid}>
        {ICONS.map((name) => {
          const isSelected = value === name;
          return (
            <Pressable
              key={name}
              accessibilityLabel={`Icon ${name}`}
              accessibilityRole="button"
              onPress={() => onChange(name)}
              style={[
                styles.cell,
                {
                  backgroundColor: isSelected ? color : '#FFFFFF',
                  borderColor: isSelected ? color : '#CBD5E1',
                },
              ]}
            >
              <Ionicons
                name={name as keyof typeof Ionicons.glyphMap}
                size={22}
                color={isSelected ? '#FFFFFF' : '#0F172A'}
              />
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cell: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
});
