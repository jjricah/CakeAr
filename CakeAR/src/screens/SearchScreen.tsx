import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
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

const allCakes: CakeDesign[] = [
  { id: '1', name: 'Chocolate Delight', price: 45.99, image: 'cake', category: 'Chocolate', rating: 4.8 },
  { id: '2', name: 'Vanilla Dream', price: 39.99, image: 'cake', category: 'Vanilla', rating: 4.7 },
  { id: '3', name: 'Strawberry Bliss', price: 42.99, image: 'cake', category: 'Fruit', rating: 4.9 },
  { id: '4', name: 'Red Velvet', price: 48.99, image: 'favorite', category: 'Special', rating: 4.6 },
  { id: '5', name: 'Lemon Zest', price: 38.99, image: 'cake', category: 'Fruit', rating: 4.5 },
  { id: '6', name: 'Carrot Cake', price: 41.99, image: 'cake', category: 'Healthy', rating: 4.7 },
  { id: '7', name: 'Tiramisu Tower', price: 52.99, image: 'local-cafe', category: 'Coffee', rating: 4.9 },
  { id: '8', name: 'Blueberry Burst', price: 44.99, image: 'cake', category: 'Fruit', rating: 4.6 },
  { id: '9', name: 'Mint Chocolate', price: 46.99, image: 'cake', category: 'Chocolate', rating: 4.5 },
  { id: '10', name: 'Caramel Supreme', price: 49.99, image: 'cake', category: 'Caramel', rating: 4.8 },
];

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCakes, setFilteredCakes] = useState<CakeDesign[]>(allCakes);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredCakes(allCakes);
    } else {
      const filtered = allCakes.filter(
        (cake) =>
          cake.name.toLowerCase().includes(text.toLowerCase()) ||
          cake.category.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCakes(filtered);
    }
  };

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
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search Cakes</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or category..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Icon name="close" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {filteredCakes.length > 0 ? (
        <FlatList
          data={filteredCakes}
          renderItem={renderCakeItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="search-off" size={60} color="#ccc" style={styles.emptyIcon} />
          <Text style={styles.emptyText}>No cakes found</Text>
          <Text style={styles.emptySubtext}>Try a different search term</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
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
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default SearchScreen;
