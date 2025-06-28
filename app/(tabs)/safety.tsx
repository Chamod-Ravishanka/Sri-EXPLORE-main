import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  ImageBackground,
  TextInput,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Shield, TriangleAlert as AlertTriangle, MapPin, Phone, Plus, Users, Clock, Navigation, Eye, MessageCircle, CircleCheck as CheckCircle, Camera, Image as ImageIcon, Video, UserCheck, Flame, Droplets, Building, Zap, X, ChevronDown, Send, Share, CircleAlert as AlertCircle } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface SafetyAlert {
  id: number;
  type: 'critical' | 'warning' | 'info';
  category: 'fire' | 'flood' | 'general';
  title: string;
  location: string;
  description: string;
  time: string;
  distance?: string;
}

export default function SafetyScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showSOSPanel, setShowSOSPanel] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    type: '',
    location: '',
    description: '',
    anonymous: false,
  });
  
  // Animation refs
  const sosAnim = useRef(new Animated.Value(1)).current;
  const alertsAnim = useRef(new Animated.Value(0)).current;
  const slideAnims = useRef<Animated.Value[]>([]).current;
  const emergencyPanelAnim = useRef(new Animated.Value(0)).current;
  const emergencyCardsAnims = useRef<Animated.Value[]>([]).current;
  const shareLocationAnim = useRef(new Animated.Value(0)).current;

  // Real-time safety alerts
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([
    {
      id: 1,
      type: 'critical',
      category: 'fire',
      title: 'Building Fire Alert',
      location: 'Galle Face Green, Colombo',
      description: 'Fire reported at nearby hotel. Avoid the area and follow evacuation routes.',
      time: '2 min ago',
      distance: '0.5 km',
    },
    {
      id: 2,
      type: 'warning',
      category: 'flood',
      title: 'Flash Flood Warning',
      location: 'Kandy City Center',
      description: 'Heavy rainfall causing street flooding. Use alternative routes.',
      time: '15 min ago',
      distance: '2.1 km',
    },
    {
      id: 3,
      type: 'info',
      category: 'general',
      title: 'Tourist Advisory',
      location: 'Pettah Market Area',
      description: 'Increased security presence due to festival celebrations.',
      time: '1 hour ago',
      distance: '3.2 km',
    },
  ]);

  const emergencyContacts = [
    { name: 'Tourist Police', number: '1912', icon: Shield, color: '#FF6B6B' },
    { name: 'Ambulance', number: '1990', icon: Plus, color: '#32CD32' },
    { name: 'Fire Department', number: '110', icon: Flame, color: '#FF8C00' },
    { name: 'Embassy', number: '+94112695299', icon: Building, color: '#4169E1' },
    { name: 'Personal Contact', number: '+94771234567', icon: UserCheck, color: '#9B59B6' },
  ];

  const incidentTypes = [
    'Theft/Robbery',
    'Scam/Fraud',
    'Medical Emergency',
    'Natural Disaster',
    'Traffic Accident',
    'Harassment',
    'Lost/Stolen Items',
    'Other',
  ];

  useEffect(() => {
    // Start SOS pulsing animation
    const startSOSAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(sosAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(sosAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    // Animate alerts sliding in
    const animateAlerts = () => {
      Animated.stagger(200, [
        Animated.timing(alertsAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        ...safetyAlerts.map((_, index) => {
          if (!slideAnims[index]) {
            slideAnims[index] = new Animated.Value(-100);
          }
          return Animated.timing(slideAnims[index], {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          });
        }),
      ]).start();
    };

    startSOSAnimation();
    animateAlerts();
  }, [safetyAlerts]);

  useEffect(() => {
    if (showSOSPanel) {
      // Initialize emergency cards animations
      emergencyContacts.forEach((_, index) => {
        if (!emergencyCardsAnims[index]) {
          emergencyCardsAnims[index] = new Animated.Value(0);
        }
      });

      // Animate emergency panel entrance
      Animated.sequence([
        Animated.timing(emergencyPanelAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.stagger(100, [
          ...emergencyCardsAnims.map(anim =>
            Animated.spring(anim, {
              toValue: 1,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            })
          ),
          Animated.spring(shareLocationAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      // Reset animations when panel closes
      emergencyPanelAnim.setValue(0);
      emergencyCardsAnims.forEach(anim => anim.setValue(0));
      shareLocationAnim.setValue(0);
    }
  }, [showSOSPanel]);

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return '#FF6B6B';
      case 'warning': return '#FF8C00';
      case 'info': return '#4169E1';
      default: return '#666';
    }
  };

  const getAlertIcon = (category: string) => {
    switch (category) {
      case 'fire': return Flame;
      case 'flood': return Droplets;
      case 'general': return AlertTriangle;
      default: return AlertTriangle;
    }
  };

  const handleEmergencyCall = (contact: any) => {
    // Add haptic feedback animation
    const cardIndex = emergencyContacts.findIndex(c => c.number === contact.number);
    if (emergencyCardsAnims[cardIndex]) {
      Animated.sequence([
        Animated.timing(emergencyCardsAnims[cardIndex], {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(emergencyCardsAnims[cardIndex], {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }

    Alert.alert(
      'Emergency Call',
      `Call ${contact.name} at ${contact.number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          style: 'destructive',
          onPress: () => {
            if (Platform.OS !== 'web') {
              // Linking.openURL(`tel:${contact.number}`);
            }
            Alert.alert('Calling', `Dialing ${contact.number}...`);
          },
        },
      ]
    );
  };

  const handleShareLocation = () => {
    // Animate share location button
    Animated.sequence([
      Animated.timing(shareLocationAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shareLocationAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    Alert.alert(
      'Share Location',
      'Share your current location with emergency contacts?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Share',
          onPress: () => Alert.alert('Location Shared', 'Your location has been shared with emergency contacts'),
        },
      ]
    );
  };

  const handleReportSubmit = () => {
    if (!reportForm.type || !reportForm.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    Alert.alert(
      'Report Submitted',
      'Your incident report has been submitted successfully. Authorities will be notified.',
      [
        {
          text: 'OK',
          onPress: () => {
            setShowReportModal(false);
            setReportForm({ type: '', location: '', description: '', anonymous: false });
          },
        },
      ]
    );
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

            <TouchableOpacity style={styles.mapButton} onPress={openSafetyMap}>
              <BlurView intensity={60} tint="light" style={styles.mapButtonBlur}>
                <MapPin size={20} color="#FFFFFF" />
                <Text style={styles.mapButtonText}>Map</Text>
              </BlurView>
            </TouchableOpacity>
          </BlurView>

          {/* Interactive Safety Map Button - Moved to top */}
          <TouchableOpacity style={styles.safetyMapButton} onPress={openSafetyMap}>
            <BlurView intensity={90} tint="light" style={styles.safetyMapButtonBlur}>
              <LinearGradient
                colors={['rgba(255, 107, 107, 0.9)', 'rgba(255, 140, 140, 0.8)']}
                style={styles.safetyMapButtonGradient}
              >
                <MapPin size={32} color="#FFFFFF" />
                <View style={styles.safetyMapButtonTextContainer}>
                  <Text style={styles.safetyMapButtonTitle}>Interactive Safety Map</Text>
                  <Text style={styles.safetyMapButtonSubtitle}>View danger zones & heatmap</Text>
                </View>
                <View style={styles.safetyMapButtonBadge}>
                  <Text style={styles.safetyMapButtonBadgeText}>NEW</Text>
                </View>
              </LinearGradient>
            </BlurView>
          </TouchableOpacity>

          {/* Real-time Safety Alerts - Moved below map button */}
          <View style={styles.section}>
            <BlurView intensity={60} tint="dark" style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🚨 Real-time Safety Alerts</Text>
            </BlurView>
            
            <Animated.View style={[styles.alertsContainer, { opacity: alertsAnim }]}>
              {safetyAlerts.map((alert, index) => {
                const IconComponent = getAlertIcon(alert.category);
                const slideAnim = slideAnims[index] || new Animated.Value(0);
                
                return (
                  <Animated.View
                    key={alert.id}
                    style={[
                      styles.alertCard,
                      {
                        transform: [{ translateY: slideAnim }],
                      },
                    ]}
                  >
                    <BlurView intensity={70} tint="light" style={styles.alertCardBlur}>
                      <LinearGradient
                        colors={[
                          `${getAlertColor(alert.type)}20`,
                          `${getAlertColor(alert.type)}10`,
                        ]}
                        style={styles.alertGradient}
                      >
                        <View style={styles.alertHeader}>
                          <View
                            style={[
                              styles.alertIcon,
                              { backgroundColor: getAlertColor(alert.type) },
                            ]}
                          >
                            <IconComponent size={20} color="#FFFFFF" />
                          </View>
                          <View style={styles.alertInfo}>
                            <Text style={styles.alertTitle}>{alert.title}</Text>
                            <View style={styles.alertMeta}>
                              <MapPin size={12} color="#333" />
                              <Text style={styles.alertLocation}>{alert.location}</Text>
                              {alert.distance && (
                                <Text style={styles.alertDistance}>• {alert.distance}</Text>
                              )}
                            </View>
                          </View>
                          <View style={styles.alertTime}>
                            <Clock size={12} color="#333" />
                            <Text style={styles.alertTimeText}>{alert.time}</Text>
                          </View>
                        </View>
                        <Text style={styles.alertDescription}>{alert.description}</Text>
                      </LinearGradient>
                    </BlurView>
                  </Animated.View>
                );
              })}
            </Animated.View>
          </View>

          {/* Safety Tips */}
          <View style={styles.section}>
            <BlurView intensity={60} tint="dark" style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>💡 Safety Tips</Text>
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

        {/* Floating SOS Button */}
        <TouchableOpacity
          style={styles.sosButton}
          onPress={() => setShowSOSPanel(true)}
        >
          <Animated.View style={[styles.sosButtonInner, { transform: [{ scale: sosAnim }] }]}>
            <BlurView intensity={80} tint="light" style={styles.sosBlur}>
              <LinearGradient
                colors={['#FF6B6B', '#FF4444']}
                style={styles.sosGradient}
              >
                <Text style={styles.sosText}>SOS</Text>
              </LinearGradient>
            </BlurView>
          </Animated.View>
        </TouchableOpacity>

        {/* Floating Report Button */}
        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => setShowReportModal(true)}
        >
          <BlurView intensity={80} tint="dark" style={styles.reportBlur}>
            <Plus size={24} color="#FFFFFF" />
          </BlurView>
        </TouchableOpacity>

        {/* Enhanced Emergency Panel Modal */}
        <Modal
          visible={showSOSPanel}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSOSPanel(false)}
        >
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.emergencyPanelContainer,
                {
                  opacity: emergencyPanelAnim,
                  transform: [
                    {
                      scale: emergencyPanelAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <BlurView intensity={95} tint="dark" style={styles.emergencyPanel}>
                <LinearGradient
                  colors={['rgba(255, 107, 107, 0.1)', 'rgba(255, 68, 68, 0.05)']}
                  style={styles.emergencyPanelGradient}
                >
                  <View style={styles.emergencyHeader}>
                    <View style={styles.emergencyHeaderContent}>
                      <View style={styles.emergencyHeaderIcon}>
                        <Shield size={28} color="#FF6B6B" />
                      </View>
                      <View>
                        <Text style={styles.emergencyTitle}>EMERGENCY PANEL</Text>
                        <Text style={styles.emergencySubtitle}>Quick access to help</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setShowSOSPanel(false)}
                    >
                      <X size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.emergencyContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.emergencyGrid}>
                      {emergencyContacts.map((contact, index) => {
                        const cardAnim = emergencyCardsAnims[index] || new Animated.Value(0);
                        return (
                          <Animated.View
                            key={index}
                            style={[
                              styles.emergencyCardWrapper,
                              {
                                opacity: cardAnim,
                                transform: [
                                  {
                                    scale: cardAnim.interpolate({
                                      inputRange: [0, 1],
                                      outputRange: [0.8, 1],
                                    }),
                                  },
                                  {
                                    translateY: cardAnim.interpolate({
                                      inputRange: [0, 1],
                                      outputRange: [20, 0],
                                    }),
                                  },
                                ],
                              },
                            ]}
                          >
                            <TouchableOpacity
                              style={styles.emergencyCard}
                              onPress={() => handleEmergencyCall(contact)}
                              activeOpacity={0.8}
                            >
                              <BlurView intensity={80} tint="light" style={styles.emergencyCardBlur}>
                                <LinearGradient
                                  colors={[`${contact.color}15`, `${contact.color}08`]}
                                  style={styles.emergencyCardGradient}
                                >
                                  <View style={[styles.emergencyIcon, { backgroundColor: contact.color }]}>
                                    <contact.icon size={28} color="#FFFFFF" />
                                  </View>
                                  <Text style={styles.emergencyName}>{contact.name}</Text>
                                  <Text style={[styles.emergencyNumber, { color: contact.color }]}>
                                    {contact.number}
                                  </Text>
                                  <View style={styles.callIndicator}>
                                    <Phone size={12} color={contact.color} />
                                    <Text style={[styles.callText, { color: contact.color }]}>Tap to call</Text>
                                  </View>
                                </LinearGradient>
                              </BlurView>
                            </TouchableOpacity>
                          </Animated.View>
                        );
                      })}
                    </View>

                    <Animated.View
                      style={[
                        styles.shareLocationContainer,
                        {
                          opacity: shareLocationAnim,
                          transform: [
                            {
                              scale: shareLocationAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.9, 1],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <TouchableOpacity style={styles.shareLocationButton} onPress={handleShareLocation}>
                        <BlurView intensity={80} tint="light" style={styles.shareLocationBlur}>
                          <LinearGradient
                            colors={['rgba(32, 178, 170, 0.15)', 'rgba(72, 209, 204, 0.08)']}
                            style={styles.shareLocationGradient}
                          >
                            <View style={styles.shareLocationIcon}>
                              <Share size={24} color="#20B2AA" />
                            </View>
                            <View style={styles.shareLocationTextContainer}>
                              <Text style={styles.shareLocationText}>Share My Location</Text>
                              <Text style={styles.shareLocationSubtext}>Send to emergency contacts</Text>
                            </View>
                            <View style={styles.shareLocationArrow}>
                              <Navigation size={16} color="#20B2AA" />
                            </View>
                          </LinearGradient>
                        </BlurView>
                      </TouchableOpacity>
                    </Animated.View>
                  </ScrollView>
                </LinearGradient>
              </BlurView>
            </Animated.View>
          </View>
        </Modal>

        {/* Report Incident Modal */}
        <Modal
          visible={showReportModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowReportModal(false)}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={90} tint="light" style={styles.reportModal}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportTitle}>📝 Report Incident</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowReportModal(false)}
                >
                  <X size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.reportForm} showsVerticalScrollIndicator={false}>
                {/* Incident Type */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Incident Type *</Text>
                  <TouchableOpacity style={styles.dropdown}>
                    <Text style={styles.dropdownText}>
                      {reportForm.type || 'Select incident type'}
                    </Text>
                    <ChevronDown size={20} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Location */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Location</Text>
                  <View style={styles.locationInput}>
                    <MapPin size={16} color="#666" />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Current location or specify"
                      value={reportForm.location}
                      onChangeText={(text) => setReportForm({ ...reportForm, location: text })}
                    />
                  </View>
                </View>

                {/* Description */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Description *</Text>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Describe the incident in detail..."
                    multiline
                    numberOfLines={4}
                    value={reportForm.description}
                    onChangeText={(text) => setReportForm({ ...reportForm, description: text })}
                  />
                </View>

                {/* Attachments */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Attachments (Optional)</Text>
                  <View style={styles.attachmentButtons}>
                    <TouchableOpacity style={styles.attachmentButton}>
                      <Camera size={20} color="#666" />
                      <Text style={styles.attachmentText}>Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.attachmentButton}>
                      <Video size={20} color="#666" />
                      <Text style={styles.attachmentText}>Video</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.attachmentButton}>
                      <ImageIcon size={20} color="#666" />
                      <Text style={styles.attachmentText}>Gallery</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Anonymous Toggle */}
                <TouchableOpacity
                  style={styles.anonymousToggle}
                  onPress={() => setReportForm({ ...reportForm, anonymous: !reportForm.anonymous })}
                >
                  <View style={styles.toggleLeft}>
                    <UserCheck size={20} color="#666" />
                    <Text style={styles.toggleText}>Report Anonymously</Text>
                  </View>
                  <View style={[styles.toggle, reportForm.anonymous && styles.toggleActive]}>
                    <View style={[styles.toggleThumb, reportForm.anonymous && styles.toggleThumbActive]} />
                  </View>
                </TouchableOpacity>

                {/* Submit Button */}
                <TouchableOpacity style={styles.submitButton} onPress={handleReportSubmit}>
                  <LinearGradient
                    colors={['#20B2AA', '#48D1CC']}
                    style={styles.submitGradient}
                  >
                    <Send size={20} color="#FFFFFF" />
                    <Text style={styles.submitText}>Submit Report</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            </BlurView>
          </View>
        </Modal>
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
  mapButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  mapButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  mapButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  safetyMapButton: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  safetyMapButtonBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  safetyMapButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    position: 'relative',
  },
  safetyMapButtonTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  safetyMapButtonTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  safetyMapButtonSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  safetyMapButtonBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  safetyMapButtonBadgeText: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
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
  alertsContainer: {
    gap: 12,
  },
  alertCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  alertCardBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  alertGradient: {
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
  alertDistance: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#20B2AA',
    marginLeft: 4,
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
    opacity: 0.9,
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
  sosButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  sosButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    overflow: 'hidden',
  },
  sosBlur: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    overflow: 'hidden',
  },
  sosGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  reportButton: {
    position: 'absolute',
    bottom: 200,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  reportBlur: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emergencyPanelContainer: {
    width: '100%',
    maxWidth: 420,
    maxHeight: height * 0.85,
  },
  emergencyPanel: {
    borderRadius: 24,
    overflow: 'hidden',
    flex: 1,
  },
  emergencyPanelGradient: {
    flex: 1,
  },
  emergencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  emergencyHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emergencyHeaderIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emergencyTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  emergencySubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#FFFFFF',
    opacity: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 20,
    gap: 16,
  },
  emergencyCardWrapper: {
    width: (width - 80) / 2,
  },
  emergencyCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  emergencyCardBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  emergencyCardGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'space-between',
  },
  emergencyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emergencyName: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 16,
  },
  emergencyNumber: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  callIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  callText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    marginLeft: 4,
  },
  shareLocationContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  shareLocationButton: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  shareLocationBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  shareLocationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  shareLocationIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(32, 178, 170, 0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  shareLocationTextContainer: {
    flex: 1,
  },
  shareLocationText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#20B2AA',
    marginBottom: 2,
  },
  shareLocationSubtext: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    opacity: 0.8,
  },
  shareLocationArrow: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(32, 178, 170, 0.1)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportModal: {
    width: '100%',
    maxWidth: 400,
    maxHeight: height * 0.9,
    borderRadius: 20,
    overflow: 'hidden',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  reportTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#333',
  },
  reportForm: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    paddingVertical: 12,
    marginLeft: 8,
  },
  textArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    textAlignVertical: 'top',
  },
  attachmentButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  attachmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  attachmentText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#666',
    marginLeft: 4,
  },
  anonymousToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#333',
    marginLeft: 8,
  },
  toggle: {
    width: 50,
    height: 28,
    backgroundColor: '#E0E0E0',
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#20B2AA',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  submitText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});