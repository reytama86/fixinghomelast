import React from 'react';
import { View, ViewStyle } from 'react-native';

interface CardProps extends React.PropsWithChildren {
  style?: ViewStyle;
}

export default function Card({ children, style = {} }: CardProps) {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 15,
        backgroundColor: 'white',
        elevation: 5,
        shadowColor: '#000',
        shadowRadius: 6,
        shadowOffset: { height: 4, width: 0 },
        shadowOpacity: 0.1,
        ...style,
      }}
    >
      {children}
    </View>
  );
}
