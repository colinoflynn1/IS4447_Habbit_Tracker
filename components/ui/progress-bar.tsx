import { StyleSheet, Text, View } from 'react-native';

type Props = {
  label: string;
  current: number;
  target: number;
  unit?: string | null;
  color?: string;
};

// Progress bar for a weekly or monthly target.
// Shows the label, the current vs target numbers, remaining,
// and fills the bar green if the target has been met.
export default function ProgressBar({
  label,
  current,
  target,
  unit,
  color = '#0F766E',
}: Props) {
  const ratio = target > 0 ? current / target : 0;
  const clamped = Math.max(0, Math.min(1, ratio));
  const isMet = current >= target;
  const remaining = Math.max(0, target - current);
  const suffix = unit ? ' ' + unit : '';

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.status, isMet ? styles.statusMet : null]}>
          {isMet ? 'Target met' : `${remaining}${suffix} to go`}
        </Text>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${clamped * 100}%`,
              backgroundColor: isMet ? '#16A34A' : color,
            },
          ]}
        />
      </View>

      <Text style={styles.figures}>
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
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  status: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  statusMet: {
    color: '#16A34A',
  },
  track: {
    backgroundColor: '#E5E7EB',
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
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
  },
});
