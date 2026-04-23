import { Ionicons } from '@expo/vector-icons';
import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppContext } from '@/app/_layout';

type Props = {
  value: string;
  onChange: (iconName: string) => void;
  color: string;
};

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
  const context = useContext(AppContext);
  const theme = context?.theme;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme?.textMuted ?? '#334155' }]}>Icon</Text>
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
                  backgroundColor: isSelected ? color : theme?.surface ?? '#FFFFFF',
                  borderColor: isSelected ? color : theme?.inputBorder ?? '#CBD5E1',
                },
              ]}
            >
              <Ionicons
                name={name as keyof typeof Ionicons.glyphMap}
                size={22}
                color={isSelected ? '#FFFFFF' : theme?.text ?? '#0F172A'}
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
