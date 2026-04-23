import { useContext } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { AppContext } from '@/app/_layout';

type Props = {
  label: string;
  onPress: () => void;
  compact?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
};

export default function PrimaryButton({
  label,
  onPress,
  compact = false,
  variant = 'primary',
}: Props) {
  const context = useContext(AppContext);
  const theme = context?.theme;

  const bg =
    variant === 'secondary'
      ? theme?.surface ?? '#F8FAFC'
      : variant === 'danger'
        ? theme?.dangerBg ?? '#FEF2F2'
        : theme?.primary ?? '#0F766E';

  const borderColor =
    variant === 'secondary'
      ? theme?.inputBorder ?? '#94A3B8'
      : variant === 'danger'
        ? theme?.dangerBorder ?? '#FCA5A5'
        : 'transparent';

  const labelColor =
    variant === 'secondary'
      ? theme?.text ?? '#0F172A'
      : variant === 'danger'
        ? theme?.danger ?? '#7F1D1D'
        : theme?.textOnPrimary ?? '#FFFFFF';

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, borderColor, borderWidth: variant === 'primary' ? 0 : 1 },
        compact ? styles.compact : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <Text style={[styles.label, compact ? styles.compactLabel : null, { color: labelColor }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  compact: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  compactLabel: {
    fontSize: 13,
  },
});
