import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, fontFamily } from '@/theme';

interface SegmentedControlProps {
  tabs: string[];
  activeIndex: number;
  onChange: (index: number) => void;
}

export function SegmentedControl({ tabs, activeIndex, onChange }: SegmentedControlProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.semantic.bg.layout }]}>
      {tabs.map((tab, index) => {
        const isActive = index === activeIndex;
        return (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              isActive && {
                backgroundColor: theme.colors.brandBlue[6],
              },
            ]}
            onPress={() => onChange(index)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: isActive
                    ? '#ffffff'
                    : theme.semantic.text.secondary,
                },
                isActive && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontFamily: fontFamily.sans('400'),
    lineHeight: 20,
  },
  tabTextActive: {
    fontFamily: fontFamily.sans('500'),
  },
});
