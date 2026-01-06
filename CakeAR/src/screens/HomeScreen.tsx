import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

interface CakeDesign {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
}

const dummyCakes: CakeDesign[] = [
  {
    id: '1',
    name: 'Chocolate Delight',
    price: 45.99,
    image: 'cake',
    category: 'Chocolate',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Vanilla Dream',
    price: 39.99,
    image: 'cake',
    category: 'Vanilla',
    rating: 4.7,
  },
  {
    id: '3',
    name: 'Strawberry Bliss',
    price: 42.99,
    image: 'cake',
    category: 'Fruit',
    rating: 4.9,
  },
  {
    id: '4',
    name: 'Red Velvet',
    price: 48.99,
    image: 'favorite',
    category: 'Special',
    rating: 4.6,
  },
  {
    id: '5',
    name: 'Lemon Zest',
    price: 38.99,
    image: 'cake',
    category: 'Fruit',
    rating: 4.5,
  },
  {
    id: '6',
    name: 'Carrot Cake',
    price: 41.99,
    image: 'cake',
    category: 'Healthy',
    rating: 4.7,
  },
  {
    id: '7',
    name: 'Tiramisu Tower',
    price: 52.99,
    image: 'local-cafe',
    category: 'Coffee',
    rating: 4.9,
  },
  {
    id: '8',
    name: 'Blueberry Burst',
    price: 44.99,
    image: 'cake',
    category: 'Fruit',
    rating: 4.6,
  },
];

interface HomeScreenProps {
  navigation?: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const renderCakeItem = ({ item }: { item: CakeDesign }) => (
    <TouchableOpacity style={styles.cakeCard}>
      <View style={styles.imageContainer}>
        <Icon name={item.image} size={50} color="#7e22ce" />
      </View>
      <View style={styles.cakeInfo}>
        <Text style={styles.cakeName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.cakeCategory}>{item.category}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.cakePrice}>${item.price}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color="#FFA500" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello!</Text>
          <Text style={styles.subtitle}>Find your perfect cake</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Icon name="notifications" size={24} color="#7e22ce" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TouchableOpacity style={styles.searchBar}>
          <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Search cakes...</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoryContainer}>
        <Text style={styles.sectionTitle}>Popular Categories</Text>
        <View style={styles.categoryScroll}>
          {['All', 'Chocolate', 'Vanilla', 'Fruit', 'Special'].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                cat === 'All' && styles.categoryChipActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  cat === 'All' && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Featured Designs</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={dummyCakes}
        renderItem={renderCakeItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  categoryContainer: {
    marginBottom: 20,
    paddingLeft: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryChipActive: {
    backgroundColor: '#7e22ce',
    borderColor: '#7e22ce',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#7e22ce',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cakeCard: {
    width: ITEM_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cakeInfo: {
    flex: 1,
  },
  cakeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cakeCategory: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cakePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7e22ce',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  addButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7e22ce',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7e22ce',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
