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
  Modal,
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
import { ArrowLeft, Navigation, Search, TriangleAlert as AlertTriangle, Shield, Droplets, Zap, Eye, MapPin, Layers, Filter, Target, X, Clock, Users, CircleCheck as CheckCircle } from 'lucide-react-native';

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
  verified: boolean;
  tips: string[];
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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['all']);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [selectedZone, setSelectedZone] = useState<DangerZone | null>(null);
  const [showZoneModal, setShowZoneModal] = useState(false);

  // Sri Lanka bounds
  const sriLankaBounds = {
    latitude: 7.8731,
    longitude: 80.7718,
    latitudeDelta: 3.5,
    longitudeDelta: 3.5,
  };

  // Enhanced danger zones data with more details
  const dangerZones: DangerZone[] = [
    {
      id: '1',
      latitude: 6.9271,
      longitude: 79.8612,
      type: 'scam',
      severity: 'high',
      title: 'Tourist Scam Zone',
      description: 'Fake taxi drivers and overcharging incidents. Be cautious of unofficial transport services.',
      reports: 15,
      lastUpdated: '2 hours ago',
      verified: true,
      tips: [
        'Always use official taxi services or ride-sharing apps',
        'Verify meter is working before starting journey',
        'Ask for estimated fare beforehand'
      ]
    },
    {
      id: '2',
      latitude: 7.2906,
      longitude: 80.6337,
      type: 'theft',
      severity: 'medium',
      title: 'Pickpocketing Area',
      description: 'Increased pickpocketing in market areas, especially during peak hours.',
      reports: 8,
      lastUpdated: '4 hours ago',
      verified: true,
      tips: [
        'Keep valuables in front pockets or secure bags',
        'Avoid displaying expensive items',
        'Stay alert in crowded areas'
      ]
    },
    {
      id: '3',
      latitude: 8.3114,
      longitude: 80.4037,
      type: 'flood',
      severity: 'high',
      title: 'Flood Risk Zone',
      description: 'Monsoon flooding expected. Roads may become impassable during heavy rains.',
      reports: 22,
      lastUpdated: '1 hour ago',
      verified: true,
      tips: [
        'Monitor weather forecasts regularly',
        'Avoid low-lying areas during monsoon',
        'Have alternative routes planned'
      ]
    },
    {
      id: '4',
      latitude: 6.0535,
      longitude: 80.2210,
      type: 'danger',
      severity: 'medium',
      title: 'Road Construction',
      description: 'Major road works causing delays and potential safety hazards.',
      reports: 12,
      lastUpdated: '3 hours ago',
      verified: true,
      tips: [
        'Use alternative routes when possible',
        'Drive slowly in construction zones',
        'Follow traffic signs and signals'
      ]
    },
    {
      id: '5',
      latitude: 7.9553,
      longitude: 81.0188,
      type: 'fraud',
      severity: 'high',
      title: 'ATM Fraud Alert',
      description: 'Card skimming devices reported at several ATM locations in this area.',
      reports: 6,
      lastUpdated: '30 minutes ago',
      verified: false,
      tips: [
        'Check ATM for suspicious devices',
        'Cover PIN when entering',
        'Use ATMs inside banks when possible'
      ]
    },
    // Additional zones for better heatmap visualization
    {
      id: '6',
      latitude: 6.9344,
      longitude: 79.8428,
      type: 'scam',
      severity: 'medium',
      title: 'Gem Shop Scams',
      description: 'Tourists targeted with fake gem deals and overpriced jewelry.',
      reports: 9,
      lastUpdated: '5 hours ago',
      verified: true,
      tips: [
        'Research gem prices beforehand',
        'Only buy from certified dealers',
        'Be wary of "special deals" for tourists'
      ]
    },
    {
      id: '7',
      latitude: 7.2558,
      longitude: 80.5877,
      type: 'theft',
      severity: 'low',
      title: 'Hotel Area Theft',
      description: 'Minor theft incidents reported near budget accommodations.',
      reports: 3,
      lastUpdated: '1 day ago',
      verified: false,
      tips: [
        'Use hotel safes for valuables',
        'Lock rooms when leaving',
        'Don\'t leave items unattended'
      ]
    }
  ];

  // Enhanced heatmap data with better weight distribution and light overlay effect
  const generateHeatmapData = (): HeatmapPoint[] => {
    const basePoints = dangerZones.map(zone => ({
      latitude: zone.latitude,
      longitude: zone.longitude,
      weight: zone.severity === 'high' ? 1.0 : zone.severity === 'medium' ? 0.7 : 0.4,
    }));

    // Add surrounding points for better heatmap visualization with light overlay effect
    const enhancedPoints: HeatmapPoint[] = [];
    
    basePoints.forEach(point => {
      enhancedPoints.push(point);
      
      // Add surrounding points with lower weights for gradient light effect
      const radius = 0.015; // Approximately 1.5km for better coverage
      const surroundingPoints = [
        { lat: point.latitude + radius, lng: point.longitude, weight: point.weight * 0.4 },
        { lat: point.latitude - radius, lng: point.longitude, weight: point.weight * 0.4 },
        { lat: point.latitude, lng: point.longitude + radius, weight: point.weight * 0.4 },
        { lat: point.latitude, lng: point.longitude - radius, weight: point.weight * 0.4 },
        { lat: point.latitude + radius * 0.7, lng: point.longitude + radius * 0.7, weight: point.weight * 0.6 },
        { lat: point.latitude - radius * 0.7, lng: point.longitude - radius * 0.7, weight: point.weight * 0.6 },
        { lat: point.latitude + radius * 0.7, lng: point.longitude - radius * 0.7, weight: point.weight * 0.6 },
        { lat: point.latitude - radius * 0.7, lng: point.longitude + radius * 0.7, weight: point.weight * 0.6 },
        // Additional points for smoother light overlay
        { lat: point.latitude + radius * 0.3, lng: point.longitude + radius * 0.3, weight: point.weight * 0.8 },
        { lat: point.latitude - radius * 0.3, lng: point.longitude - radius * 0.3, weight: point.weight * 0.8 },
        { lat: point.latitude + radius * 0.3, lng: point.longitude - radius * 0.3, weight: point.weight * 0.8 },
        { lat: point.latitude - radius * 0.3, lng: point.longitude + radius * 0.3, weight: point.weight * 0.8 },
      ];

      surroundingPoints.forEach(sp => {
        enhancedPoints.push({
          latitude: sp.lat,
          longitude: sp.lng,
          weight: sp.weight
        });
      });
    });

    return enhancedPoints;
  };

  const heatmapData = generateHeatmapData();

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
    startFadeAnimation();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.6,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startFadeAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
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

  const handleMarkerPress = (zone: DangerZone) => {
    setSelectedZone(zone);
    setShowZoneModal(true);
  };

  const handleBackPress = () => {
    router.push('/(tabs)/safety');
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
        {/* Enhanced Heatmap with Light Overlay Effect */}
        {showHeatmap && (
          <Heatmap
            points={heatmapData}
            radius={80}
            opacity={0.6}
            gradient={{
              colors: [
                'rgba(0,255,0,0)',      // Transparent green (safe)
                'rgba(0,255,0,0.1)',    // Very light green
                'rgba(144,238,144,0.3)', // Light green
                'rgba(255,255,0,0.4)',   // Light yellow (medium risk)
                'rgba(255,165,0,0.6)',   // Light orange
                'rgba(255,69,0,0.7)',    // Orange-red
                'rgba(255,0,0,0.8)',     // Red (high risk)
                'rgba(139,0,0,0.9)'      // Dark red (extreme risk)
              ],
              startPoints: [0.0, 0.1, 0.3, 0.5, 0.65, 0.8, 0.9, 1.0],
              colorMapSize: 1024,
            }}
          />
        )}

        {/* User Location with Enhanced Pulse Effect */}
        {userLocation && (
          <>
            <Marker
              coordinate={{
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <Animated.View style={[styles.userLocationContainer, { opacity: fadeAnim }]}>
                <Animated.View style={[styles.userLocationPulse, { transform: [{ scale: pulseAnim }] }]}>
                  <View style={styles.userLocationDot} />
                </Animated.View>
              </Animated.View>
            </Marker>
            
            <Circle
              center={{
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
              }}
              radius={300}
              fillColor="rgba(32, 178, 170, 0.1)"
              strokeColor="rgba(32, 178, 170, 0.5)"
              strokeWidth={2}
            />
          </>
        )}

        {/* Enhanced Danger Zone Markers */}
        {filteredZones.map((zone) => {
          const IconComponent = getZoneIcon(zone.type);
          return (
            <Marker
              key={zone.id}
              coordinate={{ latitude: zone.latitude, longitude: zone.longitude }}
              onPress={() => handleMarkerPress(zone)}
            >
              <Animated.View style={[styles.dangerMarkerContainer, { opacity: fadeAnim }]}>
                <View style={[styles.dangerMarker, { backgroundColor: getZoneColor(zone.severity) }]}>
                  <IconComponent size={18} color="#FFFFFF" />
                  {zone.verified && (
                    <View style={styles.verifiedBadge}>
                      <CheckCircle size={10} color="#32CD32" />
                    </View>
                  )}
                </View>
                <View style={[styles.markerShadow, { backgroundColor: getZoneColor(zone.severity) }]} />
              </Animated.View>
            </Marker>
          );
        })}
      </MapView>

      {/* Header */}
      <BlurView intensity={80} tint="dark" style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
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
              <X size={18} color="#666" />
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

      {/* Enhanced Legend */}
      <BlurView intensity={70} tint="light" style={styles.legend}>
        <Text style={styles.legendTitle}>Risk Levels</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#32CD32' }]} />
            <Text style={styles.legendText}>Safe</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#F39C12' }]} />
            <Text style={styles.legendText}>Medium</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF6B6B' }]} />
            <Text style={styles.legendText}>High Risk</Text>
          </View>
        </View>
      </BlurView>

      {/* Enhanced Glassy Zone Info Modal */}
      <Modal
        visible={showZoneModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowZoneModal(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={95} tint="dark" style={styles.modalContainer}>
            {selectedZone && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleContainer}>
                    <View style={[styles.modalIcon, { backgroundColor: getZoneColor(selectedZone.severity) }]}>
                      {React.createElement(getZoneIcon(selectedZone.type), {
                        size: 24,
                        color: '#FFFFFF',
                      })}
                    </View>
                    <View style={styles.modalTitleText}>
                      <Text style={styles.modalTitle}>{selectedZone.title}</Text>
                      <Text style={styles.modalSubtitle}>
                        {selectedZone.type.charAt(0).toUpperCase() + selectedZone.type.slice(1)} • {selectedZone.severity.charAt(0).toUpperCase() + selectedZone.severity.slice(1)} Risk
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.modalCloseButton}
                    onPress={() => setShowZoneModal(false)}
                  >
                    <X size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalContent}>
                  <Text style={styles.modalDescription}>{selectedZone.description}</Text>
                  
                  <View style={styles.modalStats}>
                    <View style={styles.modalStat}>
                      <Users size={16} color="#FFFFFF" />
                      <Text style={styles.modalStatText}>{selectedZone.reports} reports</Text>
                    </View>
                    <View style={styles.modalStat}>
                      <Clock size={16} color="#FFFFFF" />
                      <Text style={styles.modalStatText}>{selectedZone.lastUpdated}</Text>
                    </View>
                    {selectedZone.verified && (
                      <View style={styles.modalStat}>
                        <CheckCircle size={16} color="#32CD32" />
                        <Text style={styles.modalStatVerified}>Verified</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.modalTips}>
                    <Text style={styles.modalTipsTitle}>Safety Tips:</Text>
                    {selectedZone.tips.map((tip, index) => (
                      <Text key={index} style={styles.modalTip}>• {tip}</Text>
                    ))}
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => setShowZoneModal(false)}
                >
                  <LinearGradient
                    colors={['rgba(32, 178, 170, 0.9)', 'rgba(72, 209, 204, 0.9)']}
                    style={styles.modalButtonGradient}
                  >
                    <Text style={styles.modalButtonText}>Got it</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </BlurView>
        </View>
      </Modal>
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
  userLocationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userLocationPulse: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(32, 178, 170, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userLocationDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#20B2AA',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  dangerMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    position: 'relative',
  },
  verifiedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerShadow: {
    position: 'absolute',
    bottom: -8,
    width: 20,
    height: 8,
    borderRadius: 10,
    opacity: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalTitleText: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
  },
  modalDescription: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 16,
    opacity: 0.9,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalStatText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#FFFFFF',
    marginLeft: 4,
    opacity: 0.8,
  },
  modalStatVerified: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#32CD32',
    marginLeft: 4,
  },
  modalTips: {
    marginBottom: 20,
  },
  modalTipsTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modalTip: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 20,
    marginBottom: 4,
  },
  modalButton: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
});