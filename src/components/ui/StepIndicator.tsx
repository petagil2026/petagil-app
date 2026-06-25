/**
 * StepIndicator — Step progress with dots centered over labels
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, fontFamily } from '@/theme';

interface StepIndicatorProps {
  steps: string[];
  current: number;
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {steps.map((label, i) => {
        const isDone = i < current;
        const isActive = i === current;
        const dotColor = isDone || isActive
          ? theme.colors.brandBlue[6]
          : theme.colors.grey[300];
        const labelColor = isActive
          ? theme.colors.brandBlue[6]
          : isDone
            ? theme.semantic.text.secondary
            : theme.semantic.text.placeholder;
        const lineColor = isDone
          ? theme.colors.brandBlue[4]
          : theme.colors.grey[200];

        return (
          <React.Fragment key={i}>
            {/* Line before (except first) */}
            {i > 0 && (
              <View style={[styles.line, { backgroundColor: lineColor }]} />
            )}
            {/* Step column: dot + label */}
            <View style={styles.stepColumn}>
              <View
                style={[
                  styles.dot,
                  isActive && styles.dotActive,
                  { backgroundColor: dotColor },
                ]}
              />
              <Text
                style={[
                  styles.label,
                  {
                    color: labelColor,
                    fontFamily: isActive ? fontFamily.sans('600') : fontFamily.sans('400'),
                  },
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  stepColumn: {
    alignItems: 'center',
    gap: 6,
    width: 72,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotActive: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  line: {
    flex: 1,
    height: 2,
    marginTop: 6,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
});
