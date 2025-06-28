import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Shield,
  TriangleAlert as AlertTriangle,
  MapPin,
  Phone,
  Plus,
  Users,
  Clock,
  Navigation,
  Eye,
  MessageCircle,
  CircleCheck as CheckCircle,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function SafetyScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const safetyAlerts = [
    {
      id: 1,
      type: 'scam',
      title: 'Tourist Scam Warning',
      location: 'Fort Railway Station',
      description:
        'Fake taxi drivers overcharging tourists. Verify meter before starting journey.',
      time: '2 hours ago',
      severity: 'medium',
      reports: 5,
      verified: true,
    },
    {
      id: 2,
      type: 'danger',
      title: 'Road Construction',
      location: 'Galle Road, Colombo 3',
      description:
        'Major road works causing traffic delays. Use alternative routes.',
      time: '4 hours ago',
      severity: 'low',
      reports: 12,
      verified: true,
    },
    {
      id: 3,
      type: 'theft',
      title: 'Pickpocketing Alert',
      location: 'Pettah Market Area',
      description:
        'Increased pickpocketing incidents reported. Keep valuables secure.',
      time: '6 hours ago',
      severity: 'high',
      reports: 8,
      verified: false,
    },
    {
      id: 4,
      type: 'weather',
      title: 'Heavy Rain Warning',
      location: 'Central Province',
      description: 'Monsoon rains expected. Avoid travel to hill country.',
      time: '8 hours ago',
      severity: 'high',
      reports: 15,
      verified: true,
    },
  ];

  const emergencyContacts = [
    { name: 'Police Emergency', number: '119', icon: Shield },
    { name: 'Tourist Police', number: '1912', icon: Users },
    { name: 'Fire & Rescue', number: '110', icon: AlertTriangle },
    { name: 'Medical Emergency', number: '1990', icon: Phone },
  ];

  const filters = [
    { key: 'all', label: 'All Alerts', count: safetyAlerts.length },
    {
      key: 'scam',
      label: 'Scams',
      count: safetyAlerts.filter((a) => a.type === 'scam').length,
    },
    {
      key: 'danger',
      label: 'Dangers',
      count: safetyAlerts.filter((a) => a.type === 'danger').length,
    },
    {
      key: 'theft',
      label: 'Theft',
      count: safetyAlerts.filter((a) => a.type === 'theft').length,
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return '#FF6B6B';
      case 'medium':
        return '#F4A460';
      case 'low':
        return '#32CD32';
      default:
        return '#666';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scam':
        return AlertTriangle;
      case 'danger':
        return Shield;
      case 'theft':
        return Eye;
      case 'weather':
        return Navigation;
      default:
        return Shield;
    }
  };

  const filteredAlerts =
    selectedFilter === 'all'
      ? safetyAlerts
      : safetyAlerts.filter((alert) => alert.type === selectedFilter);

  const reportIncident = () => {
    Alert.alert('Report Incident', 'Choose reporting method:', [
      {
        text: 'Quick Report',
        onPress: () =>
          Alert.alert('Quick Report', 'Quick report form would open here'),
      },
      {
        text: 'Detailed Report',
        onPress: () =>
          Alert.alert(
            'Detailed Report',
            'Detailed report form would open here'
          ),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const callEmergency = (number: string, name: string) => {
    Alert.alert('Emergency Call', `Call ${name} at ${number}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Call',
        onPress: () => Alert.alert('Calling', `Dialing ${number}...`),
      },
    ]);
  };

  const openSafetyMap = () => {
    router.push('/(tabs)/safety-map');
  };

  return (
    <ImageBackground
      source={{
        uri: 'https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      }}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']}
        style={styles.overlay}
      >
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <BlurView intensity={80} tint="dark" style={styles.header}>
            <View style={styles.headerContent}>
              <Shield size={32} color="#FFFFFF" />
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Sri-SafeSpot</Text>
                <Text style={styles.headerSubtitle}>Stay safe, stay informed</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.reportButton} onPress={reportIncident}>
              <BlurView intensity={60} tint="light" style={styles.reportButtonBlur}>
                <Plus size={20} color="#FFFFFF" />
                <Text style={styles.reportButtonText}>Report</Text>
              </BlurView>
            </TouchableOpacity>
          </BlurView>

          {/* Safety Map Button - Moved to top for prominence */}
          <TouchableOpacity style={styles.mapButton} onPress={openSafetyMap}>
            <BlurView intensity={90} tint="light" style={styles.mapButtonBlur}>
              <LinearGradient
                colors={['rgba(255, 107, 107, 0.9)', 'rgba(255, 140, 140, 0.8)']}
                style={styles.mapButtonGradient}
              >
                <MapPin size={28} color="#FFFFFF" />
                <View style={styles.mapButtonTextContainer}>
                  <Text style={styles.mapButtonTitle}>Interactive Safety Map</Text>
                  <Text style={styles.mapButtonSubtitle}>View danger zones & heatmap</Text>
                </View>
                <View style={styles.mapButtonBadge}>
                  <Text style={styles.mapButtonBadgeText}>NEW</Text>
                </View>
              </LinearGradient>
            </BlurView>
          </TouchableOpacity>

          {/* Safety Status */}
          <View style={styles.statusContainer}>
            <BlurView intensity={70} tint="light" style={styles.statusCard}>
              <LinearGradient
                colors={['rgba(50, 205, 50, 0.8)', 'rgba(144, 238, 144, 0.6)']}
                style={styles.statusGradient}
              >
                <CheckCircle size={24} color="#FFFFFF" />
                <View style={styles.statusTextContainer}>
                  <Text style={styles.statusTitle}>You're in a Safe Area</Text>
                  <Text style={styles.statusLocation}>Kandy City Center</Text>
                </View>
              </LinearGradient>
            </BlurView>
          </View>

          {/* Emergency Contacts */}
          <View style={styles.section}>
            <BlurView intensity={60} tint="dark" style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            </BlurView>
            
            <View style={styles.emergencyGrid}>
              {emergencyContacts.map((contact, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.emergencyCard}
                  onPress={() => callEmergency(contact.number, contact.name)}
                >
                  <BlurView intensity={70} tint="light" style={styles.emergencyCardBlur}>
                    <View style={styles.emergencyIcon}>
                      <contact.icon size={24} color="#FF6B6B" />
                    </View>
                    <Text style={styles.emergencyName}>{contact.name}</Text>
                    <Text style={styles.emergencyNumber}>{contact.number}</Text>
                  </BlurView>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Alert Filters */}
          <View style={styles.section}>
            <BlurView intensity={60} tint="dark" style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Safety Alerts</Text>
            </BlurView>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterContainer}
            >
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={styles.filterButton}
                  onPress={() => setSelectedFilter(filter.key)}
                >
                  <BlurView 
                    intensity={selectedFilter === filter.key ? 80 : 60} 
                    tint={selectedFilter === filter.key ? "light" : "dark"} 
                    style={styles.filterButtonBlur}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        selectedFilter === filter.key && styles.filterTextActive,
                      ]}
                    >
                      {filter.label}
                    </Text>
                    <View
                      style={[
                        styles.filterBadge,
                        selectedFilter === filter.key && styles.filterBadgeActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterBadgeText,
                          selectedFilter === filter.key &&
                            styles.filterBadgeTextActive,
                        ]}
                      >
                        {filter.count}
                      </Text>
                    </View>
                  </BlurView>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Safety Alerts List */}
          <View style={styles.alertsList}>
            {filteredAlerts.map((alert) => {
              const IconComponent = getTypeIcon(alert.type);
              return (
                <TouchableOpacity key={alert.id} style={styles.alertCard}>
                  <BlurView intensity={70} tint="light" style={styles.alertCardBlur}>
                    <View style={styles.alertHeader}>
                      <View
                        style={[
                          styles.alertIcon,
                          { backgroundColor: getSeverityColor(alert.severity) },
                        ]}
                      >
                        <IconComponent size={20} color="#FFFFFF" />
                      </View>
                      <View style={styles.alertInfo}>
                        <Text style={styles.alertTitle}>{alert.title}</Text>
                        <View style={styles.alertMeta}>
                          <MapPin size={12} color="#333" />
                          <Text style={styles.alertLocation}>{alert.location}</Text>
                        </View>
                      </View>
                      <View style={styles.alertTime}>
                        <Clock size={12} color="#333" />
                        <Text style={styles.alertTimeText}>{alert.time}</Text>
                      </View>
                    </View>

                    <Text style={styles.alertDescription}>{alert.description}</Text>

                    <View style={styles.alertFooter}>
                      <View style={styles.alertStats}>
                        <View style={styles.statItem}>
                          <Users size={14} color="#333" />
                          <Text style={styles.statText}>{alert.reports} reports</Text>
                        </View>
                        {alert.verified && (
                          <View style={styles.verifiedBadge}>
                            <CheckCircle size={12} color="#32CD32" />
                            <Text style={styles.verifiedText}>Verified</Text>
                          </View>
                        )}
                      </View>

                      <TouchableOpacity style={styles.alertAction}>
                        <MessageCircle size={16} color="#20B2AA" />
                        <Text style={styles.alertActionText}>Discuss</Text>
                      </TouchableOpacity>
                    </View>
                  </BlurView>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Safety Tips */}
          <View style={styles.section}>
            <BlurView intensity={60} tint="dark" style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Safety Tips</Text>
            </BlurView>
            
            <BlurView intensity={70} tint="light" style={styles.tipsContainer}>
              <View style={styles.tipItem}>
                <Shield size={16} color="#20B2AA" />
                <Text style={styles.tipText}>
                  Always keep copies of important documents
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Eye size={16} color="#20B2AA" />
                <Text style={styles.tipText}>Stay aware of your surroundings</Text>
              </View>
              <View style={styles.tipItem}>
                <Phone size={16} color="#20B2AA" />
                <Text style={styles.tipText}>
                  Keep emergency contacts readily available
                </Text>
              </View>
            </BlurView>
          </View>
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    marginTop: 50,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  reportButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  reportButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  reportButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  mapButton: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  mapButtonBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  mapButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    position: 'relative',
  },
  mapButtonTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  mapButtonTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  mapButtonSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  mapButtonBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mapButtonBadgeText: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  statusContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statusCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  statusGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  statusTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  statusLocation: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  emergencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emergencyCard: {
    width: (width - 60) / 2,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  emergencyCardBlur: {
    padding: 16,
    alignItems: 'center',
  },
  emergencyIcon: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 245, 245, 0.8)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emergencyName: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  emergencyNumber: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#FF6B6B',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterButton: {
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  filterButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  filterTextActive: {
    color: '#333',
    textShadowColor: 'transparent',
  },
  filterBadge: {
    backgroundColor: 'rgba(224, 224, 224, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  filterBadgeText: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  filterBadgeTextActive: {
    color: '#333',
  },
  alertsList: {
    paddingHorizontal: 20,
  },
  alertCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  alertCardBlur: {
    padding: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  alertMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertLocation: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    marginLeft: 4,
    opacity: 0.8,
  },
  alertTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertTimeText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    marginLeft: 4,
    opacity: 0.8,
  },
  alertDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
    opacity: 0.9,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    marginLeft: 4,
    opacity: 0.8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#32CD32',
    marginLeft: 4,
  },
  alertAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertActionText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#20B2AA',
    marginLeft: 4,
  },
  tipsContainer: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(240, 240, 240, 0.3)',
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    marginLeft: 12,
    flex: 1,
    opacity: 0.9,
  },
});