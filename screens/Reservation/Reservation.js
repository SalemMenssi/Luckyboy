import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  Dimensions,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import ReservationDetails from './ReservationDetails';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import {url} from '../../url';
import axios from 'axios';
import PayReservation from './PayReservation';

const Reservation = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalPayVisible, setModalPayVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [Bookings, setBookings] = useState([]);
  const [Current, setCurrent] = useState({});

  useEffect(() => {
    getCurrentUser();
    getBookings();
  }, []);

  const getCurrentUser = async () => {
    const token = await AsyncStorage.getItem('token');
    const currentId = jwtDecode(token).id;

    try {
      let currentUser = await axios.get(`${url}/api/user/${currentId}`);
      setCurrent(currentUser.data.user);
    } catch (error) {
      console.log(error);
    }
  };

  const getBookings = async () => {
    try {
      let BookingsData = await axios.get(`${url}/api/booking`);
      setBookings(BookingsData.data.BookingList);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearch = text => {
    setSearchText(text);
  };

  const handleSeeMore = card => {
    setSelectedCard(card);
    card.status === 'Confirmed'
      ? setModalPayVisible(true)
      : setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedCard(null);
  };
  const closePayModal = () => {
    setModalPayVisible(false);
    setSelectedCard(null);
  };

  const getStatusColor = status => {
    switch (status) {
      case 'Confirmed':
        return '#2B9406'; // Green
      case 'Pending':
        return '#F68A72'; // Orange
      case 'Cancelled':
        return '#383E44'; // black
      case 'Refused':
        return '#C73244'; // Red
      default:
        return '#000000'; // Black
    }
  };

  const myBookings = Bookings.filter(
    booking => booking.client._id === Current._id,
  );
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Reservation History</Text>

      {/* Cards */}
      <View style={styles.cards} showsVerticalScrollIndicator={false}>
        {myBookings.reverse().map(card => (
          <View style={styles.card} key={card._id}>
            <Image
              source={{uri: `${url}${card.service && card.service.image.url}`}}
              style={styles.cardImage}
              resizeMode="cover"
            />

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>
                {card.service && card.service.title}
              </Text>
              <Text style={styles.contentStyle}>
                {card.date.slice(0, 10)} {card.time}
              </Text>
              <Text style={styles.contentStyle}>Guests: {card.people}</Text>
              <Text
                style={[styles.status, {color: getStatusColor(card.status)}]}>
                {card.status}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.seeMoreButton}
              onPress={() => handleSeeMore(card)}>
              <Text style={styles.seeMoreButtonText}>See More {'>'}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Modal */}
      <Modal
        animationType="fade"
        visible={modalVisible}
        onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ReservationDetails
              card={selectedCard}
              getBookings={getBookings}
              close={closeModal}
            />
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        visible={modalPayVisible}
        onRequestClose={closePayModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <PayReservation
              card={selectedCard}
              getBookings={getBookings}
              close={closePayModal}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Reservation;

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  title: {
    fontSize: 30,
    fontFamily: 'OriginalSurfer-Regular',
    color: '#383E44',
    marginTop: windowHeight * 0.09,
    marginBottom: windowHeight * 0.09,
    alignSelf: 'center',
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    height: windowHeight * 0.2,
    width: windowWidth * 0.87,
    marginVertical: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },

  cardImage: {
    width: '36%',
    height: '100%',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  cardContent: {
    width: '60%',
    marginHorizontal: 5,
  },
  cardTitle: {
    fontFamily: 'OriginalSurfer-Regular',
    fontSize: 30,
    color: '#383E44',
    top: '-8%',
    marginHorizontal: 10,
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
    bottom: '-5%',
  },
  seeMoreButton: {position: 'absolute', bottom: 15, right: 20},
  seeMoreButtonText: {
    fontSize: 14,
    color: '#3C84AC',
    fontFamily: 'OriginalSurfer-Regular',
  },

  contentStyle: {
    fontWeight: 'normal',
    fontSize: 14,
    color: '#000',
    letterSpacing: 0.5,
    top: '-5%',
    lineHeight: 24,
  },
  cards: {paddingBottom: 100, alignItems: 'center'},
  //   modalContainer: {
  //     flex: 1,
  //     justifyContent: 'center',
  //     alignItems: 'center',
  //     backgroundColor: 'rgba(0, 0, 0, 0.5)',
  //   },
  //   modalContent: {
  //     backgroundColor: '#fff',
  //     borderRadius: 10,
  //     padding: 20,
  //     elevation: 5,
  //   },
});
