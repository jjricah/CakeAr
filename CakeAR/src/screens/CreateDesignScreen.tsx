import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface CreateDesignScreenProps {
  navigation: any;
}

const CreateDesignScreen: React.FC<CreateDesignScreenProps> = ({ navigation }) => {
  const designOptions = [
    {
      id: '1',
      icon: 'view-in-ar',
      title: 'AR Designer',
      subtitle: 'Design with Augmented Reality',
      color: '#7e22ce',
    },
    {
      id: '2',
      icon: 'palette',
      title: 'Custom Design',
      subtitle: 'Create from scratch',
      color: '#2563eb',
    },
    {
      id: '3',
      icon: 'photo-library',
      title: 'Gallery',
      subtitle: 'Choose from templates',
      color: '#059669',
    },
    {
      id: '4',
      icon: 'camera-alt',
      title: 'Upload Photo',
      subtitle: 'Use your own image',
      color: '#dc2626',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <Icon name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Design</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.heroSection}>
            <Icon name="cake" size={80} color="#7e22ce" />
            <Text style={styles.heroTitle}>Design Your Dream Cake</Text>
            <Text style={styles.heroSubtitle}>
              Choose how you want to create your perfect cake design
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {designOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionCard}
                activeOpacity={0.7}
                onPress={() => {
                  if (option.id === '1') {
                    navigation.navigate('ARDesigner');
                  }
                }}
              >
                <View
                  style={[
                    styles.optionIconContainer,
                    { backgroundColor: `${option.color}15` },
                  ]}
                >
                  <Icon name={option.icon} size={32} color={option.color} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Icon name="info-outline" size={24} color="#7e22ce" />
              <Text style={styles.infoText}>
                Preview your design in real-time with AR technology before ordering
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  closeButton: {
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
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  optionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  infoSection: {
    marginTop: 32,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f5ff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default CreateDesignScreen;
