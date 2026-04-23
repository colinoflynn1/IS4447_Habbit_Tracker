import { useContext } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { AppContext } from '@/app/_layout';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address';
};

export default function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
}: Props) {
  const context = useContext(AppContext);
  const theme = context?.theme;

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: theme?.textMuted ?? '#334155' }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholder={placeholder ?? label}
        placeholderTextColor={theme?.textMuted ?? '#94A3B8'}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        style={[
          styles.input,
          {
            backgroundColor: theme?.inputBg ?? '#FFFFFF',
            borderColor: theme?.inputBorder ?? '#CBD5E1',
            color: theme?.text ?? '#0F172A',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
