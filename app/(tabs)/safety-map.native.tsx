import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import MapView, { Marker, Heatmap, PROVIDER_GOOGLE } from 'react-native-maps';
import { ArrowLeft, Search, MapPin, Navigation, Layers, Filter, TriangleAlert as AlertTriangle, Shield, Eye, Waves, CreditCard, X, Crosshair } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface DangerZone {
  id: string;
  latitude: number;
  longitude: number;
  type: 'scam' | 'flood' | 'theft' | 'fraud' | 'danger';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  reports: number;
  verified: boolean;
  weight?: number;
}

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
    verified: true,
    weight: 0.8,
  },
  {
    id: '2',
    latitude: 7.2906,
    longitude: 80.6337,
    type: 'theft',
    severity: 'medium',
    title: 'Pickpocketing Area',
    description: 'High pickpocketing incidents in market area',
    reports: 8,
    verified: true,
    weight: 0.6,
  },
  {
    id: '3',
    latitude: 6.0535,
    longitude: 80.2210,
    type: 'flood',
    severity: 'high',
    title: 'Flood Risk Zone',
    description: 'Monsoon flooding during rainy season',
    reports: 12,
    verified: true,
    weight: 0.9,
  },
  {
    id: '4',
    latitude: 8.5874,
    longitude: 81.2152,
    type: 'fraud',
    severity: 'medium',
    title: 'ATM Fraud Alert',
    description: 'Card skimming devices reported',
    reports: 6,
    verified: false,
    weight: 0.5,
  },
  {
    id: '5',
    latitude: 7.9553,
    longitude: 81.0188,
    type: 'danger',
    severity: 'low',
    title: 'Road Construction',
    description: 'Ongoing road works causing delays',
    reports: 4,
    verified: true,
    weight: 0.3,
  },
];

const mapStyles = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#1d2c4d' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8ec3b9' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1a3646' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#4b6878' }],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64779e' }],
  },
  {
    featureType: 'administrative.province',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#4b6878' }],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#334e87' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#023e58' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#283d6a' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6f9ba5' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1d2c4d' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#023e58' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3C7680' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#304a7d' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#98a5be' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1d2c4d' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2c6675' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#255763' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#b0d5ce' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#023e58' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#98a5be' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1d2c4d' }],
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry.fill',
    stylers: [{ color: '#283d6a' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'geometry',
    stylers: [{ color: '#3a4762' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0e1626' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4e6d70' }],
  },
];

export default function SafetyMapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['all']);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<DangerZone | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const filterOptions = [
    { key: 'all', label: 'All Zones', icon: Shield, color: '#20B2AA' },
    { key: 'scam', label: 'Scams', icon: AlertTriangle, color: '#FF6B6B' },
    { key: 'theft', label: 'Theft', icon: Eye, color: '#F4A460' },
    { key: 'flood', label: 'Floods', icon: Waves, color: '#4169E1' },
    { key: 'fraud', label: 'Fraud', icon: CreditCard, color: '#9B59B6' },
    { key: 'danger', label: 'Danger', icon: Shield, color: '#E67E22' },
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setIsLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for this feature');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setUserLocation(location);
      
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 1000);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setIsLocating(false);
    }
  };

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'scam': return AlertTriangle;
      case 'theft': return Eye;
      case 'flood': return Waves;
      case 'fraud': return CreditCard;
      case 'danger': return Shield;
      default: return Shield;
    }
  };

  const getMarkerColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#F4A460';
      case 'low': return '#32CD32';
      default: return '#666';
    }
  };

  const filteredZones = selectedFilters.includes('all') 
    ? dangerZones 
    : dangerZones.filter(zone => selectedFilters.includes(zone.type));

  const heatmapPoints = filteredZones.map(zone => ({
    latitude: zone.latitude,
    longitude: zone.longitude,
    weight: zone.weight || 0.5,
  }));

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

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const geocoded = await Location.geocodeAsync(searchQuery + ', Sri Lanka');
      if (geocoded.length > 0) {
        const { latitude, longitude } = geocoded[0];
        mapRef.current?.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 1000);
      } else {
        Alert.alert('Location not found', 'Please try a different search term');
      }
    } catch (error) {
      Alert.alert('Search Error', 'Failed to search location');
    }
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        mapType={mapType}
        customMapStyle={mapStyles}
        initialRegion={{
          latitude: 7.8731,
          longitude: 80.7718,
          latitudeDelta: 2.0,
          longitudeDelta: 2.0,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onPress={() => setSelectedMarker(null)}
      >
        {/* Heatmap */}
        {showHeatmap && (
          <Heatmap
            points={heatmapPoints}
            radius={50}
            opacity={0.7}
            gradient={{
              colors: ['#00FF00', '#FFFF00', '#FF0000'],
              startPoints: [0.2, 0.5, 1.0],
              colorMapSize: 256,
            }}
          />
        )}

        {/* Danger Zone Markers */}
        {filteredZones.map((zone) => {
          const IconComponent = getMarkerIcon(zone.type);
          return (
            <Marker
              key={zone.id}
              coordinate={{
                latitude: zone.latitude,
                longitude: zone.longitude,
              }}
              onPress={() => setSelectedMarker(zone)}
            >
              <View style={[styles.markerContainer, { borderColor: getMarkerColor(zone.severity) }]}>
                <IconComponent size={16} color={getMarkerColor(zone.severity)} />
              </View>
            </Marker>
          );
        })}

        {/* User Location Pulse */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
          >
            <View style={styles.userLocationMarker}>
              <View style={styles.userLocationPulse} />
              <View style={styles.userLocationDot} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Header */}
      <BlurView intensity={80} tint="dark" style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safety Map</Text>
        <TouchableOpacity style={styles.layersButton} onPress={() => setShowFilters(!showFilters)}>
          <Layers size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </BlurView>

      {/* Search Bar */}
      <BlurView intensity={80} tint="dark" style={styles.searchContainer}>
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
        </View>
      </BlurView>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, isLocating && styles.controlButtonActive]}
          onPress={getCurrentLocation}
          disabled={isLocating}
        >
          <BlurView intensity={80} tint="dark" style={styles.controlButtonBlur}>
            <Crosshair size={24} color={isLocating ? "#32CD32" : "#FFFFFF"} />
          </BlurView>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowHeatmap(!showHeatmap)}
        >
          <BlurView intensity={80} tint="dark" style={styles.controlButtonBlur}>
            <MapPin size={24} color={showHeatmap ? "#32CD32" : "#FFFFFF"} />
          </BlurView>
        </TouchableOpacity>
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <BlurView intensity={80} tint="dark" style={styles.filtersPanel}>
          <View style={styles.filtersPanelHeader}>
            <Text style={styles.filtersPanelTitle}>Filters & Layers</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filtersContent} showsVerticalScrollIndicator={false}>
            {/* Map Type */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Map Type</Text>
              <View style={styles.mapTypeButtons}>
                {['standard', 'satellite', 'hybrid'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.mapTypeButton,
                      mapType === type && styles.mapTypeButtonActive,
                    ]}
                    onPress={() => setMapType(type as any)}
                  >
                    <Text
                      style={[
                        styles.mapTypeButtonText,
                        mapType === type && styles.mapTypeButtonTextActive,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Danger Filters */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Danger Types</Text>
              <View style={styles.filterButtons}>
                {filterOptions.map((filter) => {
                  const IconComponent = filter.icon;
                  const isSelected = selectedFilters.includes(filter.key);
                  return (
                    <TouchableOpacity
                      key={filter.key}
                      style={[
                        styles.filterButton,
                        isSelected && { backgroundColor: filter.color },
                      ]}
                      onPress={() => toggleFilter(filter.key)}
                    >
                      <IconComponent
                        size={16}
                        color={isSelected ? "#FFFFFF" : filter.color}
                      />
                      <Text
                        style={[
                          styles.filterButtonText,
                          isSelected && styles.filterButtonTextActive,
                        ]}
                      >
                        {filter.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Heatmap Toggle */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Visualization</Text>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  showHeatmap && styles.toggleButtonActive,
                ]}
                onPress={() => setShowHeatmap(!showHeatmap)}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    showHeatmap && styles.toggleButtonTextActive,
                  ]}
                >
                  Show Heatmap
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </BlurView>
      )}

      {/* Selected Marker Info */}
      {selectedMarker && (
        <BlurView intensity={80} tint="dark" style={styles.markerInfo}>
          <View style={styles.markerInfoHeader}>
            <View style={styles.markerInfoTitle}>
              <View
                style={[
                  styles.markerInfoIcon,
                  { backgroundColor: getMarkerColor(selectedMarker.severity) },
                ]}
              >
                {React.createElement(getMarkerIcon(selectedMarker.type), {
                  size: 16,
                  color: '#FFFFFF',
                })}
              </View>
              <Text style={styles.markerInfoTitleText}>{selectedMarker.title}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedMarker(null)}>
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.markerInfoDescription}>{selectedMarker.description}</Text>
          <View style={styles.markerInfoStats}>
            <Text style={styles.markerInfoStat}>
              {selectedMarker.reports} reports
            </Text>
            <Text style={styles.markerInfoStat}>
              Severity: {selectedMarker.severity}
            </Text>
            {selectedMarker.verified && (
              <Text style={styles.markerInfoVerified}>✓ Verified</Text>
            )}
          </View>
        </BlurView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  map: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
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
    flex: 1,
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
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
    top: 110,
    left: 20,
    right: 20,
    borderRadius: 12,
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
    color: '#FFFFFF',
    marginLeft: 12,
  },
  controls: {
    position: 'absolute',
    right: 20,
    bottom: 100,
  },
  controlButton: {
    marginBottom: 12,
    borderRadius: 25,
    overflow: 'hidden',
  },
  controlButtonActive: {
    transform: [{ scale: 1.1 }],
  },
  controlButtonBlur: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersPanel: {
    position: 'absolute',
    top: 170,
    left: 20,
    right: 20,
    maxHeight: height * 0.6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  filtersPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  filtersPanelTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  filtersContent: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  mapTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mapTypeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  mapTypeButtonActive: {
    backgroundColor: '#20B2AA',
  },
  mapTypeButtonText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#FFFFFF',
  },
  mapTypeButtonTextActive: {
    color: '#FFFFFF',
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    margin: 4,
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  toggleButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#20B2AA',
  },
  toggleButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#FFFFFF',
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
  markerContainer: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userLocationMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userLocationPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(32, 178, 170, 0.3)',
  },
  userLocationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#20B2AA',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  markerInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  markerInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  markerInfoTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  markerInfoIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  markerInfoTitleText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    flex: 1,
  },
  markerInfoDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#FFFFFF',
    opacity: 0.8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  markerInfoStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  markerInfoStat: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#FFFFFF',
    opacity: 0.7,
  },
  markerInfoVerified: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#32CD32',
  },
});