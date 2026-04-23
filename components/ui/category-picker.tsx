import { Ionicons } from '@expo/vector-icons';
import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppContext, Category } from '@/app/_layout';

type Props = {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

export default function CategoryPicker({ categories, selectedId, onSelect }: Props) {
  const context = useContext(AppContext);
  const theme = context?.theme;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme?.textMuted ?? '#334155' }]}>Category</Text>
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
                  backgroundColor: isSelected
                    ? category.color
                    : theme?.surface ?? '#FFFFFF',
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
