import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type RowBoxContentProps = {
  title: string;
  content: string | number | undefined;
};

const RowBoxContent: React.FC<RowBoxContentProps> = ({ title, content }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{content}</Text>
    </View>
  );
};

export default RowBoxContent;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignContent: 'space-between',
    justifyContent: 'space-between',
    marginTop: 2,
  },

  title: {
    fontSize: 12,
  },
  subtitle: {
    fontSize: 12,
    color: '#2e2e2eff',
  },
});
