import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Search,
  MapPin,
  Navigation,
  Layers,
  Filter,
  AlertTriangle,
  Shield,
  Eye,
  Waves,
  CreditCard,
  X,
  Crosshair,
  Globe,
  Smartphone,
} from 'lucide-react-native';

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
}

const dangerZones: DangerZone[] = [
  {
    id: '1',
    latitude: 6.9271,
    longitude: 79.8612,
    type: 'scam',
    severity: 'high',
    title: 'Tourist Scam Zone - Colombo Fort',
    description: 'Fake taxi drivers and overcharging incidents reported near railway station',
    reports: 15,
    verified: true,
  },
  {
    id: '2',
    latitude: 7.2906,
    longitude: 80.6337,
    type: 'theft',
    severity: 'medium',
    title: 'Pickpocketing Area - Kandy Market',
    description: 'High pickpocketing incidents in crowded market areas',
    reports: 8,
    verified: true,
  },
  {
    id: '3',
    latitude: 6.0535,
    longitude: 80.2210,
    type: 'flood',
    severity: 'high',
    title: 'Flood Risk Zone - Galle',
    description: 'Monsoon flooding during rainy season, avoid low-lying areas',
    reports: 12,
    verified: true,
  },
  {
    id: '4',
    latitude: 8.5874,
    longitude: 81.2152,
    type: 'fraud',
    severity: 'medium',
    title: 'ATM Fraud Alert - Trincomalee',
    description: 'Card skimming devices reported at several ATM locations',
    reports: 6,
    verified: false,
  },
  {
    id: '5',
    latitude: 7.9553,
    longitude: 81.0188,
    type: 'danger',
    severity: 'low',
    title: 'Road Construction - Anuradhapura',
    description: 'Ongoing road works causing traffic delays and detours',
    reports: 4,
    verified: true,
  },
];

export default function SafetyMapWebScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['all']);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedZone, setSelectedZone] = useState<DangerZone | null>(null);

  const filterOptions = [
    { key: 'all', label: 'All Zones', icon: Shield, color: '#20B2AA' },
    { key: 'scam', label: 'Scams', icon: AlertTriangle, color: '#FF6B6B' },
    { key: 'theft', label: 'Theft', icon: Eye, color: '#F4A460' },
    { key: 'flood', label: 'Floods', icon: Waves, color: '#4169E1' },
    { key: 'fraud', label: 'Fraud', icon: CreditCard, color: '#9B59B6' },
    { key: 'danger', label: 'Danger', icon: Shield, color: '#E67E22' },
  ];

  const getZoneIcon = (type: string) => {
    switch (type) {
      case 'scam': return AlertTriangle;
      case 'theft': return Eye;
      case 'flood': return Waves;
      case 'fraud': return CreditCard;
      case 'danger': return Shield;
      default: return Shield;
    }
  };

  const getZoneColor = (severity: string) => {
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
      {/* Header */}
      <LinearGradient colors={['#FF6B6B', '#FF8E8E']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safety Map</Text>
        <TouchableOpacity style={styles.layersButton} onPress={() => setShowFilters(!showFilters)}>
          <Layers size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Web Notice */}
      <View style={styles.webNotice}>
        <View style={styles.webNoticeContent}>
          <Globe size={24} color="#20B2AA" />
          <View style={styles.webNoticeText}>
            <Text style={styles.webNoticeTitle}>Interactive Map Available on Mobile</Text>
            <Text style={styles.webNoticeSubtitle}>
              Download our mobile app for the full interactive map experience with GPS tracking and real-time heatmap visualization
            </Text>
          </View>
          <Smartphone size={24} color="#20B2AA" />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search location in Sri Lanka..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filtersPanelHeader}>
            <Text style={styles.filtersPanelTitle}>Danger Zone Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
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
          </ScrollView>
        </View>
      )}

      {/* Map Placeholder */}
      <View style={styles.mapPlaceholder}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={styles.mapGradient}
        >
          <View style={styles.mapOverlay}>
            <MapPin size={60} color="#20B2AA" />
            <Text style={styles.mapPlaceholderTitle}>Sri Lanka Safety Map</Text>
            <Text style={styles.mapPlaceholderSubtitle}>
              Interactive heatmap visualization showing danger zones across Sri Lanka
            </Text>
            
            {/* Simulated Heatmap Legend */}
            <View style={styles.heatmapLegend}>
              <Text style={styles.legendTitle}>Risk Level</Text>
              <View style={styles.legendBar}>
                <View style={[styles.legendSegment, { backgroundColor: '#32CD32' }]} />
                <View style={[styles.legendSegment, { backgroundColor: '#FFFF00' }]} />
                <View style={[styles.legendSegment, { backgroundColor: '#FF6B6B' }]} />
              </View>
              <View style={styles.legendLabels}>
                <Text style={styles.legendLabel}>Low</Text>
                <Text style={styles.legendLabel}>Medium</Text>
                <Text style={styles.legendLabel}>High</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Danger Zones List */}
      <ScrollView style={styles.zonesList} showsVerticalScrollIndicator={false}>
        <Text style={styles.zonesListTitle}>
          Danger Zones ({filteredZones.length})
        </Text>
        
        {filteredZones.map((zone) => {
          const IconComponent = getZoneIcon(zone.type);
          return (
            <TouchableOpacity
              key={zone.id}
              style={styles.zoneCard}
              onPress={() => setSelectedZone(selectedZone?.id === zone.id ? null : zone)}
            >
              <View style={styles.zoneHeader}>
                <View
                  style={[
                    styles.zoneIcon,
                    { backgroundColor: getZoneColor(zone.severity) },
                  ]}
                >
                  <IconComponent size={20} color="#FFFFFF" />
                </View>
                <View style={styles.zoneInfo}>
                  <Text style={styles.zoneTitle}>{zone.title}</Text>
                  <View style={styles.zoneMeta}>
                    <Text style={styles.zoneType}>
                      {zone.type.charAt(0).toUpperCase() + zone.type.slice(1)}
                    </Text>
                    <Text style={styles.zoneSeverity}>
                      {zone.severity.charAt(0).toUpperCase() + zone.severity.slice(1)} Risk
                    </Text>
                  </View>
                </View>
                <View style={styles.zoneStats}>
                  <Text style={styles.zoneReports}>{zone.reports}</Text>
                  <Text style={styles.zoneReportsLabel}>reports</Text>
                </View>
              </View>
              
              {selectedZone?.id === zone.id && (
                <View style={styles.zoneDetails}>
                  <Text style={styles.zoneDescription}>{zone.description}</Text>
                  <View style={styles.zoneFooter}>
                    <Text style={styles.zoneCoordinates}>
                      📍 {zone.latitude.toFixed(4)}, {zone.longitude.toFixed(4)}
                    </Text>
                    {zone.verified && (
                      <Text style={styles.zoneVerified}>✓ Verified</Text>
                    )}
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Mobile App CTA */}
      <View style={styles.ctaContainer}>
        <LinearGradient colors={['#20B2AA', '#48D1CC']} style={styles.ctaGradient}>
          <Smartphone size={24} color="#FFFFFF" />
          <View style={styles.ctaText}>
            <Text style={styles.ctaTitle}>Get the Full Experience</Text>
            <Text style={styles.ctaSubtitle}>Download our mobile app for interactive maps</Text>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  layersButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webNotice: {
    backgroundColor: '#E8F8F5',
    borderLeftWidth: 4,
    borderLeftColor: '#20B2AA',
    margin: 20,
    borderRadius: 12,
  },
  webNoticeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  webNoticeText: {
    flex: 1,
    marginHorizontal: 12,
  },
  webNoticeTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  webNoticeSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    lineHeight: 16,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    marginLeft: 12,
  },
  filtersPanel: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filtersPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filtersPanelTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  filtersScroll: {
    padding: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#666',
    marginLeft: 6,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  mapPlaceholder: {
    height: 250,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  mapGradient: {
    flex: 1,
  },
  mapOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapPlaceholderTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  mapPlaceholderSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 20,
  },
  heatmapLegend: {
    alignItems: 'center',
  },
  legendTitle: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  legendBar: {
    flexDirection: 'row',
    width: 120,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  legendSegment: {
    flex: 1,
  },
  legendLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 120,
  },
  legendLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  zonesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  zonesListTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  zoneCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  zoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  zoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  zoneInfo: {
    flex: 1,
  },
  zoneTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  zoneMeta: {
    flexDirection: 'row',
  },
  zoneType: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginRight: 12,
  },
  zoneSeverity: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#FF6B6B',
  },
  zoneStats: {
    alignItems: 'center',
  },
  zoneReports: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#20B2AA',
  },
  zoneReportsLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  zoneDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  zoneDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  zoneFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zoneCoordinates: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#999',
  },
  zoneVerified: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#32CD32',
  },
  ctaContainer: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  ctaText: {
    flex: 1,
    marginLeft: 12,
  },
  ctaTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  ctaSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
  },
});