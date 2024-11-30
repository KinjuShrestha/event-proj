import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { auth, firestore } from '../database/firebase';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where, doc, deleteDoc, addDoc } from 'firebase/firestore';

const HomeScreen = ({ navigation, route }) => {
  const [events, setEvents] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const userId = auth.currentUser?.uid;

  // Fetch events and favorites when the component mounts
  useEffect(() => {
    if (!userId) {
      Alert.alert("Error", "User not logged in");
      navigation.navigate("Login"); // Redirect to login if not logged in
      return;
    }

    // Fetch all events
    const fetchEvents = async () => {
      try {
        const eventsSnapshot = await getDocs(collection(firestore, 'events'));
        const eventsList = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('Fetched events:', eventsList);
        setEvents(eventsList);
        setUserEvents(eventsList.filter((event) => event.userId === userId));
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    // Fetch user's favorite events
    const fetchFavorites = async () => {
      try {
        const favoritesSnapshot = await getDocs(query(collection(firestore, 'favorites'), where('userId', '==', userId)));
        const favoritesList = favoritesSnapshot.docs.map((doc) => doc.data());
        console.log('Fetched favorites:', favoritesList);
        setFavorites(favoritesList);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };

    fetchEvents();
    fetchFavorites();

    // If a new event is passed from EventScreen, add it to state
    if (route.params?.newEvent) {
      const { newEvent } = route.params;
      setEvents((prevEvents) => [...prevEvents, newEvent]);
      setUserEvents((prevUserEvents) => [...prevUserEvents, newEvent]);
    }
  }, [route.params?.newEvent, userId]);

  const handleLogout = async () => {
    await auth.signOut();
    navigation.navigate("Login"); // Redirect to login screen after logout
  };

  const handleAddEvent = () => {
    navigation.navigate('Event', { isEdit: false });
  };

  const handleEditEvent = (event) => {
    navigation.navigate('Event', { event, isEdit: true });
  };

  // Add event to favorites
  const handleFavorite = async (eventId) => {
    try {
      // Check if the event is already in the favorites
      const favoriteExists = favorites.some((fav) => fav.eventId === eventId);
      
      if (!favoriteExists) {
        // Add to favorites collection
        await addDoc(collection(firestore, 'favorites'), {
          eventId,
          userId,
        });

        // Update favorites in the local state
        setFavorites((prev) => [...prev, { eventId, userId }]);
        console.log('Added to favorites:', eventId);
      } else {
        console.log('Event already in favorites:', eventId);
      }
    } catch (error) {
      console.error("Error adding favorite:", error);
    }
  };

  // Remove event from favorites
  const handleRemoveFavorite = async (eventId) => {
    try {
      const favoritesSnapshot = await getDocs(query(collection(firestore, 'favorites'), where('eventId', '==', eventId), where('userId', '==', userId)));
      favoritesSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref); // Correctly delete from Firestore
      });

      // Update local favorites state
      setFavorites(favorites.filter((fav) => fav.eventId !== eventId));
      console.log('Removed from favorites:', eventId);
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  // Delete event
  const handleDeleteEvent = async (eventId) => {
    try {
      // Delete event from Firestore
      await deleteDoc(doc(firestore, 'events', eventId));

      // Remove from UI state
      setUserEvents(userEvents.filter((event) => event.id !== eventId));
      setEvents(events.filter((event) => event.id !== eventId));

      console.log('Deleted event:', eventId);
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  // Render event item
  const renderEvent = ({ item }) => (
    <View style={styles.event}>
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <TouchableOpacity onPress={() => handleEditEvent(item)}>
          <Ionicons name="pencil" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>
      <Text style={styles.eventDate}>{item.date}</Text>
      <View style={styles.eventActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            favorites.some((fav) => fav.eventId === item.id)
              ? handleRemoveFavorite(item.id)
              : handleFavorite(item.id)
          }
        >
          <Ionicons
            name={
              favorites.some((fav) => fav.eventId === item.id)
                ? 'heart'
                : 'heart-outline'
            }
            size={24}
            color="#FF6347"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            Alert.alert('Delete Event', 'Are you sure?', [
              { text: 'Cancel' },
              { text: 'Delete', onPress: () => handleDeleteEvent(item.id) },
            ])
          }
        >
          <Ionicons name="trash" size={24} color="#FF0000" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#fff" />
          <Text style={styles.headerButtonText}>Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={handleAddEvent}>
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.headerButtonText}>Add Event</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>Your Events</Text>
      <FlatList
        data={userEvents}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>No events found</Text>} // Empty state for user events
      />
      <Text style={styles.sectionTitle}>All Events</Text>
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>No events found</Text>} // Empty state for all events
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    marginTop: 20,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  event: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    marginLeft: 15,
  },
});

export default HomeScreen;
