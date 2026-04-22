import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

type Props = {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
};

// Bar chart drawn with react-native-svg.
// Each bar is a Rect, labels are SvgText.
// I scale the bar heights based on the largest value so the chart always
// looks good no matter what numbers come in.
export default function BarChart({ data, height = 180, color = '#0F766E' }: Props) {
  const chartHeight = height;
  const labelHeight = 30;
  const valueHeight = 16;
  const barAreaHeight = chartHeight - labelHeight - valueHeight;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barCount = data.length;
  const gap = 6;

  // The viewBox is fixed at 320 wide so the chart scales to the parent width.
  const totalWidth = 320;
  const barWidth = (totalWidth - (barCount + 1) * gap) / barCount;

  return (
    <View style={styles.wrapper}>
      <Svg
        viewBox={`0 0 ${totalWidth} ${chartHeight}`}
        width="100%"
        height={chartHeight}
        preserveAspectRatio="xMidYMid meet"
      >
        {data.map((point, i) => {
          const ratio = point.value / maxValue;
          const barH = ratio * barAreaHeight;
          const x = gap + i * (barWidth + gap);
          const y = valueHeight + (barAreaHeight - barH);
          return (
            <React.Fragment key={i}>
              <SvgText
                x={x + barWidth / 2}
                y={y - 4}
                fontSize="10"
                fill="#475569"
                textAnchor="middle"
              >
                {point.value > 0 ? String(point.value) : ''}
              </SvgText>

              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(2, barH)}
                rx={3}
                fill={point.value > 0 ? color : '#E5E7EB'}
              />

              <SvgText
                x={x + barWidth / 2}
                y={chartHeight - 12}
                fontSize="10"
                fill="#64748B"
                textAnchor="middle"
              >
                {point.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
});
