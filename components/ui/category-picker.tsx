import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Category } from '@/app/_layout';

type Props = {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

// Horizontal row of pressable category pills. The selected one is filled in
// with the category's colour.
export default function CategoryPicker({ categories, selectedId, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Category</Text>
      <View style={styles.row}>
        {categories.map((category) => {
          const isSelected = selectedId === category.id;
          return (
            <Pressable
              key={category.id}
              accessibilityLabel={`Select category ${category.name}`}
              accessibilityRole="button"
              onPress={() => onSelect(category.id)}
              style={[
                styles.pill,
                {
                  backgroundColor: isSelected ? category.color : '#FFFFFF',
                  borderColor: category.color,
                },
              ]}
            >
              <Ionicons
                name={category.icon as keyof typeof Ionicons.glyphMap}
                size={14}
                color={isSelected ? '#FFFFFF' : category.color}
                style={styles.icon}
              />
              <Text
                style={[
                  styles.pillText,
                  { color: isSelected ? '#FFFFFF' : category.color },
                ]}
              >
                {category.name}
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
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1.5,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  icon: {
    marginRight: 6,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
