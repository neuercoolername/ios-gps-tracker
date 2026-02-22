import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Location from 'expo-location';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

interface LocationData {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
}

interface BackendResponse {
    status: 'ok' | 'error';
    message: string;
    locationId?: string;
}


const LocationTracker = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [backendResponse, setBackendResponse] = useState<BackendResponse | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
      }
    })();
  }, []);

  // Continuous tracking (commented out for now — using manual trigger instead)
  // const startLocationTracking = async () => {
  //   const subscription = await Location.watchPositionAsync(
  //     {
  //       accuracy: Location.Accuracy.High,
  //       distanceInterval: 10,
  //       timeInterval: 5000,
  //     },
  //     (position) => {
  //       const locationData: LocationData = {
  //         latitude: position.coords.latitude,
  //         longitude: position.coords.longitude,
  //         accuracy: position.coords.accuracy ?? 0,
  //         timestamp: position.timestamp,
  //       };
  //       setLocation(locationData);
  //       sendLocationToBackend(locationData);
  //     }
  //   );
  //   return () => subscription.remove();
  // };

  // Manual single location fetch + send
  const trackOnce = async () => {
    setSending(true);
    setError("");
    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy ?? 0,
        timestamp: position.timestamp,
      };
      setLocation(locationData);
      await sendLocationToBackend(locationData);
    } catch (err: any) {
      setError('Error getting location: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  // Send location data to backend
  const sendLocationToBackend = async (locationData: LocationData) => {
    console.log('Location update:', locationData);
    try {
      const response = await fetch(`${API_BASE_URL}/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          lat: locationData.latitude,
          lon: locationData.longitude,
          timestamp: locationData.timestamp,
        }),
      });

      const json = await response.json();
      setBackendResponse(json);
    } catch (err) {
      console.error('Error sending location:', err);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, sending && styles.buttonDisabled]}
        onPress={trackOnce}
        disabled={sending}
      >
        <Text style={styles.buttonText}>
          {sending ? 'Sending...' : 'Track Location'}
        </Text>
      </TouchableOpacity>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}

      {location ? (
        <View style={styles.info}>
          <Text>Latitude: {location.latitude}</Text>
          <Text>Longitude: {location.longitude}</Text>
          <Text>Accuracy: {location.accuracy}m</Text>
          <Text>Last Updated: {new Date(location.timestamp).toLocaleString()}</Text>
        </View>
      ) : null}

      {backendResponse ? (
        <Text style={backendResponse.status === 'ok' ? styles.success : styles.error}>
          {backendResponse.message}
          {backendResponse.locationId ? ` (id: ${backendResponse.locationId})` : ''}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60 },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  error: { color: 'red', marginTop: 16 },
  success: { color: 'green', marginTop: 16 },
  info: { marginTop: 16, gap: 4 },
});

export default LocationTracker;
