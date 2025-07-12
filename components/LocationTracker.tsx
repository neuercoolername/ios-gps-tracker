import React, { useEffect, useState } from 'react';
import { View, Text, Alert, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

interface LocationData {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
}


const LocationTracker = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");

  const configureLocation = () => {
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'always',
    });
  };

  // Request permissions
//   const requestLocationPermission = async (): Promise<void> => {
//     try {
//       if (Platform.OS === 'ios') {
//         const auth = await Geolocation.requestAuthorization('always');
//         if (auth === 'granted') {
//           startLocationTracking();
//         }
//       }
//     } catch (err) {
//       setError('Failed to get location permission');
//     }
//   };

const getLocationOnce = () => {
  const result = Geolocation.getCurrentPosition((position)=>{
    
  })
}

  // Start tracking location
  const startLocationTracking = () => {
    // Watch position with continuous updates
    const watchId = Geolocation.watchPosition(
      position => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        
        // setLocation(locationData);
        sendLocationToBackend(locationData);
      },
      error => {
        setError('Error getting location: ' + error.message);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        interval: 5000, // Update every 5 seconds
        fastestInterval: 2000, // Fastest possible update interval
      }
    );

    // Clean up function to stop tracking when component unmounts
    return () => Geolocation.clearWatch(watchId);
  };

  // Send location data to backend
  const sendLocationToBackend = async (locationData: LocationData) => {
    console.log(locationData)
    // try {
    //   const response = await fetch('YOUR_BACKEND_URL/location', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       // Add any authentication headers here
    //     },
    //     body: JSON.stringify(locationData),
    //   });

    //   if (!response.ok) {
    //     throw new Error('Failed to send location data');
    //   }
    // } catch (err) {
    //   console.error('Error sending location:', err);
    //   // Implement retry logic or error handling as needed
    // }
  };

  useEffect(() => {
    configureLocation();
    // requestLocationPermission();

    // Clean up when component unmounts
    return () => {
      Geolocation.stopObserving();
    };
  }, []);

  return (
    <View style={{ padding: 20 }}>
      {error ? (
        <Text style={{ color: 'red' }}>{error}</Text>
      ) : location ? (
        <View>
          <Text>Latitude: {location.latitude}</Text>
          <Text>Longitude: {location.longitude}</Text>
          <Text>Accuracy: {location.accuracy}m</Text>
          <Text>Last Updated: {new Date(location.timestamp).toLocaleString()}</Text>
        </View>
      ) : (
        <Text>Getting location...</Text>
      )}
    </View>
  );
};

export default LocationTracker;