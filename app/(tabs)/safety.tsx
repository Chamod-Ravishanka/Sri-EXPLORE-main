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
  
  // Enhanced SOS Animation refs
  const sosScaleAnim = useRef(new Animated.Value(1)).current;
  const sosPulseAnim = useRef(new Animated.Value(1)).current;
  const sosRotateAnim = useRef(new Animated.Value(0)).current;
  const sosGlowAnim = useRef(new Animated.Value(0)).current;
  const sosRippleAnim = useRef(new Animated.Value(0)).current;
  const sosShakeAnim = useRef(new Animated.Value(0)).current;
  
  // Multiple ripple effects
  const rippleAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  
  // Other animation refs
  const alertsAnim = useRef(new Animated.Value(0)).current;
  const slideAnims = useRef<Animated.Value[]>([]).current;

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
    // Enhanced SOS Button Animations
    const startSOSAnimations = () => {
      // Main pulsing effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(sosPulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(sosPulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Continuous rotation
      Animated.loop(
        Animated.timing(sosRotateAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        })
      ).start();

      // Glow effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(sosGlowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(sosGlowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Ripple effects with staggered timing
      const startRipples = () => {
        rippleAnims.forEach((ripple, index) => {
          Animated.loop(
            Animated.sequence([
              Animated.delay(index * 600),
              Animated.timing(ripple, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(ripple, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
              }),
            ])
          ).start();
        });
      };
      startRipples();

      // Subtle shake effect for urgency
      Animated.loop(
        Animated.sequence([
          Animated.timing(sosShakeAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(sosShakeAnim, {
            toValue: -1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(sosShakeAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.delay(3000),
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

    startSOSAnimations();
    animateAlerts();
  }, [safetyAlerts]);

  // Enhanced SOS button press with haptic feedback
  const handleSOSPress = () => {
    // Immediate visual feedback
    Animated.sequence([
      Animated.timing(sosScaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(sosScaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sosScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Haptic feedback for mobile
    if (Platform.OS !== 'web') {
      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    setShowSOSPanel(true);
  };

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

  // Interpolated values for animations
  const rotateInterpolate = sosRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = sosGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const shakeTranslate = sosShakeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-2, 0, 2],
  });

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

          {/* Real-time Safety Alerts */}
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

        {/* Enhanced Floating SOS Button with Multiple Effects */}
        <View style={styles.sosContainer}>
          {/* Ripple Effects */}
          {rippleAnims.map((ripple, index) => (
            <Animated.View
              key={index}
              style={[
                styles.sosRipple,
                {
                  opacity: ripple.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.8, 0.4, 0],
                  }),
                  transform: [
                    {
                      scale: ripple.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 2.5],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}

          {/* Glow Effect */}
          <Animated.View
            style={[
              styles.sosGlow,
              {
                opacity: glowOpacity,
                transform: [{ scale: sosPulseAnim }],
              },
            ]}
          />

          {/* Main SOS Button */}
          <TouchableOpacity
            style={styles.sosButton}
            onPress={handleSOSPress}
            activeOpacity={0.8}
          >
            <Animated.View
              style={[
                styles.sosButtonInner,
                {
                  transform: [
                    { scale: Animated.multiply(sosScaleAnim, sosPulseAnim) },
                    { rotate: rotateInterpolate },
                    { translateX: shakeTranslate },
                  ],
                },
              ]}
            >
              <BlurView intensity={80} tint="light" style={styles.sosBlur}>
                <LinearGradient
                  colors={['#FF6B6B', '#FF4444', '#CC0000']}
                  style={styles.sosGradient}
                >
                  <Text style={styles.sosText}>SOS</Text>
                  <View style={styles.sosInnerGlow} />
                </LinearGradient>
              </BlurView>
            </Animated.View>
          </TouchableOpacity>

          {/* Emergency Indicator */}
          <Animated.View
            style={[
              styles.emergencyIndicator,
              {
                opacity: sosGlowAnim,
              },
            ]}
          >
            <Text style={styles.emergencyText}>EMERGENCY</Text>
          </Animated.View>
        </View>

        {/* Floating Report Button */}
        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => setShowReportModal(true)}
        >
          <BlurView intensity={80} tint="dark" style={styles.reportBlur}>
            <Plus size={24} color="#FFFFFF" />
          </BlurView>
        </TouchableOpacity>

        {/* Emergency Panel Modal */}
        <Modal
          visible={showSOSPanel}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSOSPanel(false)}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={90} tint="dark" style={styles.emergencyPanel}>
              <View style={styles.emergencyHeader}>
                <Text style={styles.emergencyTitle}>🚨 EMERGENCY PANEL</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowSOSPanel(false)}
                >
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.emergencyGrid}>
                {emergencyContacts.map((contact, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.emergencyCard}
                    onPress={() => handleEmergencyCall(contact)}
                  >
                    <BlurView intensity={70} tint="light" style={styles.emergencyCardBlur}>
                      <View style={[styles.emergencyIcon, { backgroundColor: contact.color }]}>
                        <contact.icon size={24} color="#FFFFFF" />
                      </View>
                      <Text style={styles.emergencyName}>{contact.name}</Text>
                      <Text style={styles.emergencyNumber}>{contact.number}</Text>
                    </BlurView>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.shareLocationButton} onPress={handleShareLocation}>
                <BlurView intensity={70} tint="light" style={styles.shareLocationBlur}>
                  <Share size={20} color="#20B2AA" />
                  <Text style={styles.shareLocationText}>Share My Location</Text>
                </BlurView>
              </TouchableOpacity>
            </BlurView>
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
  // Enhanced SOS Button Styles
  sosContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosRipple: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF6B6B',
    borderWidth: 2,
    borderColor: '#FF4444',
  },
  sosGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF6B6B',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
  },
  sosButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    zIndex: 10,
  },
  sosButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
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
    position: 'relative',
  },
  sosText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  sosInnerGlow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  emergencyIndicator: {
    position: 'absolute',
    bottom: -25,
    alignItems: 'center',
  },
  emergencyText: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: '#FF6B6B',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 1,
  },
  reportButton: {
    position: 'absolute',
    bottom: 220,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emergencyPanel: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: height * 0.8,
  },
  emergencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  emergencyTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 20,
    gap: 12,
  },
  emergencyCard: {
    width: (width - 80) / 2,
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
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#FF6B6B',
    textAlign: 'center',
  },
  shareLocationButton: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  shareLocationBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  shareLocationText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#20B2AA',
    marginLeft: 8,
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