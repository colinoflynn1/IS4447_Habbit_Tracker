import { useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppContext } from '@/app/_layout';

type Props = {
  label: string;
  current: number;
  target: number;
  unit?: string | null;
  color?: string;
};

export default function ProgressBar({
  label,
  current,
  target,
  unit,
  color,
}: Props) {
  const context = useContext(AppContext);
  const theme = context?.theme;
  const barColor = color ?? theme?.primary ?? '#0F766E';

  const ratio = target > 0 ? current / target : 0;
  const clamped = Math.max(0, Math.min(1, ratio));
  const isMet = current >= target;
  const remaining = Math.max(0, target - current);
  const suffix = unit ? ' ' + unit : '';

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: theme?.text ?? '#0F172A' }]}>{label}</Text>
        <Text
          style={[
            styles.status,
            { color: isMet ? (theme?.success ?? '#16A34A') : (theme?.textMuted ?? '#64748B') },
          ]}
        >
          {isMet ? 'Target met' : `${remaining}${suffix} to go`}
        </Text>
      </View>

      <View style={[styles.track, { backgroundColor: theme?.border ?? '#E5E7EB' }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${clamped * 100}%`,
              backgroundColor: isMet ? (theme?.success ?? '#16A34A') : barColor,
            },
          ]}
        />
      </View>

      <Text style={[styles.figures, { color: theme?.textMuted ?? '#64748B' }]}>
        {current}{suffix} of {target}{suffix}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
  },
  track: {
    borderRadius: 6,
    height: 10,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: 6,
    height: '100%',
  },
  figures: {
    fontSize: 12,
    marginTop: 4,
  },
});
