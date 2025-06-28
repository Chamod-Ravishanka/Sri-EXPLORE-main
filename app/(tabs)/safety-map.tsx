import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  TextInput,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import MapView, { 
  Marker, 
  Circle, 
  Heatmap, 
  PROVIDER_GOOGLE,
  Region 
} from 'react-native-maps';
import * as Location from 'expo-location';
import { ArrowLeft, Navigation, Search, TriangleAlert as AlertTriangle, Shield, Droplets, Zap, Eye, MapPin, Layers, Filter, Target } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface DangerZone {
  id: string;
  latitude: number;
  longitude: number;
  type: 'danger' | 'flood' | 'fraud' | 'theft' | 'scam';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  reports: number;
  lastUpdated: string;
}

interface HeatmapPoint {
  latitude: number;
  longitude: number;
  weight: number;
}

export default function SafetyMapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['all']);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [showHeatmap, setShowHeatmap] = useState(true);

  // Sri Lanka bounds
  const sriLankaBounds = {
    latitude: 7.8731,
    longitude: 80.7718,
    latitudeDelta: 3.5,
    longitudeDelta: 3.5,
  };

  // Mock danger zones data (in production, this would come from your API)
  const dangerZones: DangerZone[] = [
    {
      id: '1',
      latitude: 6.9271,
      longitude: 79.8612,
      type: 'scam',
      severity: 'high',
      title: 'Tourist Scam Zone',
      description: 'Fake taxi drivers and overcharging incidents',
      reports: 15,
      lastUpdated: '2 hours ago',
    },
    {
      id: '2',
      latitude: 7.2906,
      longitude: 80.6337,
      type: 'theft',
      severity: 'medium',
      title: 'Pickpocketing Area',
      description: 'Increased pickpocketing in market areas',
      reports: 8,
      lastUpdated: '4 hours ago',
    },
    {
      id: '3',
      latitude: 8.3114,
      longitude: 80.4037,
      type: 'flood',
      severity: 'high',
      title: 'Flood Risk Zone',
      description: 'Monsoon flooding expected',
      reports: 22,
      lastUpdated: '1 hour ago',
    },
    {
      id: '4',
      latitude: 6.0535,
      longitude: 80.2210,
      type: 'danger',
      severity: 'medium',
      title: 'Road Construction',
      description: 'Major road works causing delays',
      reports: 12,
      lastUpdated: '3 hours ago',
    },
    {
      id: '5',
      latitude: 7.9553,
      longitude: 81.0188,
      type: 'fraud',
      severity: 'high',
      title: 'ATM Fraud Alert',
      description: 'Card skimming devices reported',
      reports: 6,
      lastUpdated: '30 minutes ago',
    },
  ];

  // Generate heatmap data
  const heatmapData: HeatmapPoint[] = dangerZones.map(zone => ({
    latitude: zone.latitude,
    longitude: zone.longitude,
    weight: zone.severity === 'high' ? 1 : zone.severity === 'medium' ? 0.6 : 0.3,
  }));

  const filterOptions = [
    { key: 'all', label: 'All Zones', icon: Eye, color: '#666' },
    { key: 'danger', label: 'Danger', icon: AlertTriangle, color: '#FF6B6B' },
    { key: 'flood', label: 'Flood', icon: Droplets, color: '#4A90E2' },
    { key: 'fraud', label: 'Fraud', icon: Zap, color: '#F39C12' },
    { key: 'theft', label: 'Theft', icon: Shield, color: '#E74C3C' },
    { key: 'scam', label: 'Scam', icon: Eye, color: '#9B59B6' },
  ];

  useEffect(() => {
    getCurrentLocation();
    startPulseAnimation();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for this feature');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setUserLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Unable to get your current location');
    }
  };

  const focusOnUserLocation = () => {
    if (userLocation && mapRef.current) {
      const region: Region = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current.animateToRegion(region, 1000);
    }
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    try {
      const geocoded = await Location.geocodeAsync(searchQuery + ', Sri Lanka');
      if (geocoded.length > 0) {
        const { latitude, longitude } = geocoded[0];
        const region: Region = {
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        mapRef.current?.animateToRegion(region, 1000);
      } else {
        Alert.alert('Location not found', 'Please try a different search term');
      }
    } catch (error) {
      Alert.alert('Search error', 'Unable to search for location');
    }
  };

  const getZoneIcon = (type: string) => {
    switch (type) {
      case 'danger': return AlertTriangle;
      case 'flood': return Droplets;
      case 'fraud': return Zap;
      case 'theft': return Shield;
      case 'scam': return Eye;
      default: return AlertTriangle;
    }
  };

  const getZoneColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#F39C12';
      case 'low': return '#32CD32';
      default: return '#666';
    }
  };

  const filteredZones = selectedFilters.includes('all') 
    ? dangerZones 
    : dangerZones.filter(zone => selectedFilters.includes(zone.type));

  const toggleFilter = (filter: string) => {
    if (filter === 'all') {
      setSelectedFilters(['all']);
    } else {
      const newFilters = selectedFilters.includes(filter)
        ? selectedFilters.filter(f => f !== filter)
        : [...selectedFilters.filter(f => f !== 'all'), filter];
      
      setSelectedFilters(newFilters.length === 0 ? ['all'] : newFilters);
    }
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        mapType={mapType}
        initialRegion={sriLankaBounds}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {/* Heatmap */}
        {showHeatmap && (
          <Heatmap
            points={heatmapData}
            radius={50}
            opacity={0.7}
            gradient={{
              colors: ['rgba(0,255,0,0)', 'rgba(255,255,0,1)', 'rgba(255,0,0,1)'],
              startPoints: [0.1, 0.5, 1.0],
              colorMapSize: 256,
            }}
          />
        )}

        {/* User Location with Pulse Effect */}
        {userLocation && (
          <>
            <Marker
              coordinate={{
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <Animated.View style={[styles.userLocationPulse, { transform: [{ scale: pulseAnim }] }]}>
                <View style={styles.userLocationDot} />
              </Animated.View>
            </Marker>
            
            <Circle
              center={{
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
              }}
              radius={100}
              fillColor="rgba(32, 178, 170, 0.2)"
              strokeColor="rgba(32, 178, 170, 0.8)"
              strokeWidth={2}
            />
          </>
        )}

        {/* Danger Zone Markers */}
        {filteredZones.map((zone) => {
          const IconComponent = getZoneIcon(zone.type);
          return (
            <Marker
              key={zone.id}
              coordinate={{ latitude: zone.latitude, longitude: zone.longitude }}
              onPress={() => {
                Alert.alert(
                  zone.title,
                  `${zone.description}\n\nReports: ${zone.reports}\nLast updated: ${zone.lastUpdated}`,
                  [{ text: 'OK' }]
                );
              }}
            >
              <View style={[styles.dangerMarker, { backgroundColor: getZoneColor(zone.severity) }]}>
                <IconComponent size={16} color="#FFFFFF" />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Header */}
      <BlurView intensity={80} tint="dark" style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Safety Map</Text>
        
        <TouchableOpacity 
          style={styles.layersButton} 
          onPress={() => setShowHeatmap(!showHeatmap)}
        >
          <Layers size={24} color={showHeatmap ? "#32CD32" : "#FFFFFF"} />
        </TouchableOpacity>
      </BlurView>

      {/* Search Bar */}
      <BlurView intensity={70} tint="light" style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search location in Sri Lanka..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchLocation}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearButton}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </BlurView>

      {/* Filter Toggle */}
      <TouchableOpacity 
        style={styles.filterToggle} 
        onPress={() => setShowFilters(!showFilters)}
      >
        <BlurView intensity={80} tint="dark" style={styles.filterToggleBlur}>
          <Filter size={20} color="#FFFFFF" />
          <Text style={styles.filterToggleText}>Filters</Text>
        </BlurView>
      </TouchableOpacity>

      {/* Filters Panel */}
      {showFilters && (
        <BlurView intensity={80} tint="light" style={styles.filtersPanel}>
          <Text style={styles.filtersPanelTitle}>Safety Zone Filters</Text>
          <View style={styles.filtersGrid}>
            {filterOptions.map((option) => {
              const IconComponent = option.icon;
              const isSelected = selectedFilters.includes(option.key);
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.filterOption,
                    { backgroundColor: isSelected ? option.color : 'rgba(255,255,255,0.3)' }
                  ]}
                  onPress={() => toggleFilter(option.key)}
                >
                  <IconComponent 
                    size={16} 
                    color={isSelected ? "#FFFFFF" : option.color} 
                  />
                  <Text style={[
                    styles.filterOptionText,
                    { color: isSelected ? "#FFFFFF" : option.color }
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </BlurView>
      )}

      {/* GPS Button */}
      <TouchableOpacity style={styles.gpsButton} onPress={focusOnUserLocation}>
        <BlurView intensity={80} tint="dark" style={styles.gpsButtonBlur}>
          <Target size={24} color="#FFFFFF" />
        </BlurView>
      </TouchableOpacity>

      {/* Map Type Selector */}
      <View style={styles.mapTypeSelector}>
        {(['standard', 'satellite', 'hybrid'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.mapTypeButton,
              mapType === type && styles.mapTypeButtonActive
            ]}
            onPress={() => setMapType(type)}
          >
            <BlurView 
              intensity={mapType === type ? 80 : 60} 
              tint={mapType === type ? "light" : "dark"} 
              style={styles.mapTypeButtonBlur}
            >
              <Text style={[
                styles.mapTypeButtonText,
                mapType === type && styles.mapTypeButtonTextActive
              ]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </BlurView>
          </TouchableOpacity>
        ))}
      </View>

      {/* Legend */}
      <BlurView intensity={70} tint="light" style={styles.legend}>
        <Text style={styles.legendTitle}>Danger Levels</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF6B6B' }]} />
            <Text style={styles.legendText}>High Risk</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#F39C12' }]} />
            <Text style={styles.legendText}>Medium Risk</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#32CD32' }]} />
            <Text style={styles.legendText}>Low Risk</Text>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  layersButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    marginLeft: 12,
  },
  clearButton: {
    fontSize: 18,
    color: '#666',
    paddingHorizontal: 8,
  },
  filterToggle: {
    position: 'absolute',
    top: 180,
    right: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  filterToggleBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterToggleText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#FFFFFF',
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  filtersPanel: {
    position: 'absolute',
    top: 220,
    left: 20,
    right: 20,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  filtersPanelTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  filtersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
    minWidth: (width - 80) / 3,
    justifyContent: 'center',
  },
  filterOptionText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    marginLeft: 4,
  },
  gpsButton: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  gpsButtonBlur: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapTypeSelector: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    flexDirection: 'row',
  },
  mapTypeButton: {
    marginRight: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapTypeButtonActive: {
    // Active state handled by BlurView tint
  },
  mapTypeButtonBlur: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  mapTypeButtonText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  mapTypeButtonTextActive: {
    color: '#333',
    textShadowColor: 'transparent',
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    borderRadius: 12,
    padding: 12,
    overflow: 'hidden',
  },
  legendTitle: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  userLocationPulse: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(32, 178, 170, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#20B2AA',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  dangerMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});