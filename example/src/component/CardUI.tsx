import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

type CardUIProps = {
  mt?: number;
  title: string;
  description?: string;
  image?: string;
  children?: React.ReactNode;
};

const CardUI: React.FC<CardUIProps> = ({
  mt,
  title,
  description,
  image,
  children,
}) => {
  return (
    <View style={[styles.card, { marginTop: mt }]}>
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.subtitle}>{description}</Text>}
        {children}
      </View>
    </View>
  );
};

export default CardUI;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 5,
    overflow: 'hidden',
    borderColor: '#525050ff',
    borderWidth: 1,
    padding: 15,
  },
  image: {
    width: '100%',
    height: 150,
  },
  content: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#2e2e2eff',
  },
});
