import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ARDesignerScreenProps {
  navigation: any;
}

const ARDesignerScreen: React.FC<ARDesignerScreenProps> = ({ navigation }) => {
  const startAR = () => {
    Alert.alert(
      'AR Feature Coming Soon',
      'ViroReact AR library is being configured. This feature will be available after:\n\n1. yarn install\n2. cd ios && pod install\n3. Rebuild the app\n\nFor now, you can explore other features!',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>AR Designer</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.previewContainer}>
          <Icon name="view-in-ar" size={100} color="#7e22ce" />
          <Text style={styles.previewTitle}>Augmented Reality Mode</Text>
          <Text style={styles.previewSubtitle}>
            Design and preview your cake in real-world environment
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Icon name="3d-rotation" size={32} color="#7e22ce" />
            <Text style={styles.featureText}>360° View</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="touch-app" size={32} color="#7e22ce" />
            <Text style={styles.featureText}>Interactive</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="straighten" size={32} color="#7e22ce" />
            <Text style={styles.featureText}>Real Size</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={startAR}>
          <Icon name="play-arrow" size={24} color="#fff" />
          <Text style={styles.startButtonText}>Start AR Experience</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Icon name="info-outline" size={20} color="#666" />
          <Text style={styles.infoText}>
            Make sure you're in a well-lit area and point your camera at a flat surface
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'space-between',
  },
  previewContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
  },
  previewSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 32,
  },
  featureItem: {
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#7e22ce',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#7e22ce',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});

export default ARDesignerScreen;
