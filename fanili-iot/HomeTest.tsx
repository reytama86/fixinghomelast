// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   ImageBackground,
//   ScrollView,
//   // Video
// } from 'react-native';
// import React from 'react';
// import {SafeAreaView} from 'react-native-safe-area-context';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import LinearGradient from 'react-native-linear-gradient';
// import Video from 'react-native-video';
// import Svg, {Path} from 'react-native-svg';
// import type { NativeStackScreenProps } from '@react-navigation/native-stack';
// import { HomeStackParamList } from './HomeStack';  // pastikan path sesuai lokasi
// type Props = NativeStackScreenProps<HomeStackParamList, 'HomeTest'>;
// import {
//   Logout,
//   Maximize,
//   Maximize1,
//   Maximize3,
//   Maximize4,
//   ArrowDown,
// } from 'iconsax-react-native';

// const HomeTest:React.FC<Props> = ({navigation}) => {
//   return (
//     <SafeAreaView style={{flex: 1}} edges={['top', 'left', 'right']}>
//       <View style={styles.home}>
//         <ScrollView>
//           <View style={styles.header}>
//             <TouchableOpacity onPress={() => {}} style={styles.userInfo}>
//               <Image
//                 source={{
//                   uri: 'https://xsgames.co/randomusers/avatar.php?g=male',
//                 }}
//                 style={styles.avatar}
//               />
//               <Text style={styles.username}>Bapak Arik</Text>
//             </TouchableOpacity>

//             <TouchableOpacity onPress={() => {}}>
//               <Logout
//                 color="black"
//                 variant="Outline"
//                 size={24}
//                 style={{transform: [{rotate: '90deg'}]}}
//               />
//             </TouchableOpacity>
//           </View>
//           <ImageBackground
//             source={require('./assets/images/weather.png')}
//             style={styles.card}
//             imageStyle={styles.image}>
//             {/* <Text style={styles.title}>Vanili Jaya</Text>
//         <Text style={styles.subtitle}>Kebun Pintar</Text> */}
//             <View style={styles.location}>
//               <Ionicons name="location" size={20} color={'white'} />
//               <Text style={styles.locationText}>Rembangan, Jember</Text>
//             </View>
//             <View style={styles.weatherSectionTwo}>
//               {/* <View style={{flexDirection: 'row', alignItems: 'center'}}>
//     <Ionicons name="sunny" size={20} color="white" />
//     <Text style={styles.weatherText}>28°C</Text>
//   </View>
//   <View style={{flexDirection: 'row', alignItems: 'center'}}>
//     <Ionicons name="water" size={20} color="white" />
//     <Text style={styles.weatherText}>70%</Text>
        
//   </View> */}
//               <Text
//                 style={{
//                   fontSize: 40,
//                   fontFamily: 'SpaceGrotesk-Regular',
//                   color: 'white',
//                   fontWeight: 600,
//                   textAlign: 'center',
//                 }}>
//                 18°
//               </Text>
//               <View style={styles.detailSectionTwo}>
//                 <Text style={styles.detailSectionTwoText}>Humidity : 18% </Text>
//                 <Text style={styles.detailSectionTwoText}>Light : 18 Lux </Text>
//               </View>
//             </View>

//             <LinearGradient
//               colors={['rgba(255,255,255,0)', '#FFFFFF', 'rgba(255,255,255,0)']}
//               start={{x: 0, y: 0}}
//               end={{x: 1, y: 0}}
//               style={styles.gradientLine}
//             />
//             <View style={styles.detailSectionThree}>
//               <View style={{flex: 1}}>
//                 <Text style={styles.detailSectionThreeText}>
//                   Soil Temperature
//                 </Text>
//                 <Text style={styles.detailSectionThreeText}>12°</Text>
//               </View>
//               <View style={{flex: 1}}>
//                 <Text style={styles.detailSectionThreeText}>Soil Moisture</Text>
//                 <Text style={styles.detailSectionThreeText}>45%</Text>
//               </View>
//               <View style={{flex: 1}}>
//                 <Text style={styles.detailSectionThreeText}>
//                   Light Intensity
//                 </Text>
//                 <Text style={styles.detailSectionThreeText}>120 Lux</Text>
//               </View>
//             </View>
//           </ImageBackground>
//           <View style={styles.cardTwo}>
//             <Text style={styles.soilTitle}>Soil Statistic</Text>
//             <View style={styles.soilStatisticOne}>
//               <View style={styles.detailStatisticOne}>
//                 <View style={styles.statContent}>
//                   <Text style={styles.statLabel}>PH</Text>
//                   <Text style={styles.statValue}>34</Text>
//                 </View>
//                 <View style={styles.statExtra}>
//                   <Ionicons name="arrow-down" size={18} color="red" />
//                   <Text style={styles.statStatus}>Low</Text>
//                 </View>
//               </View>

//               <View style={styles.detailStatisticOne}>
//                 <View style={styles.statContent}>
//                   <Text style={styles.statLabel}>Nitrogen</Text>
//                   <Text style={styles.statValue}>12 mg/L</Text>
//                 </View>
//                 <View style={styles.statExtra}>
//                   <Ionicons name="arrow-down" size={18} color="red" />
//                   <Text style={styles.statStatus}>Low</Text>
//                 </View>
//               </View>
//             </View>

//             <View style={styles.soilStatisticTwo}>
//               <View style={styles.detailStatisticOne}>
//                 <View style={styles.statContent}>
//                   <Text style={styles.statLabel}>Phosphor</Text>
//                   <Text style={styles.statValue}>12 mg/L</Text>
//                 </View>
//                 <View style={styles.statExtra}>
//                   <Ionicons name="arrow-down" size={18} color="red" />
//                   <Text style={styles.statStatus}>Low</Text>
//                 </View>
//               </View>

//               <View style={styles.detailStatisticOne}>
//                 <View style={styles.statContent}>
//                   <Text style={styles.statLabel}>Kalium</Text>
//                   <Text style={styles.statValue}>12 mg/L</Text>
//                 </View>
//                 <View style={styles.statExtra}>
//                   <Ionicons name="arrow-up" size={18} color="green" />
//                   <Text style={[styles.statStatus, {color: 'green'}]}>
//                     Good
//                   </Text>
//                 </View>
//               </View>
//             </View>
//           </View>
//           <View style={styles.controlCentre}>
//             <Text style={styles.controlCentreText}>Control Centre</Text>
//             <View style={styles.controlCentreBox}>
//               <View style={styles.boxControl}>
//                 <View style={styles.frameTopControl}>
//                   <Text style={styles.titleControl}>Water</Text>
//                   <TouchableOpacity
//                     style={styles.powerButtonContainer}
//                     onPress={() => {}}>
//                     <View style={styles.circleLevel1}>
//                       <View style={styles.circleLevel2}>
//                         <View style={styles.circleLevel3}>
//                           <View style={styles.circleLevel4}>
//                             <View style={styles.circleLevel5}>
//                               <Ionicons
//                                 name="power-outline"
//                                 size={24}
//                                 color="#B4DC45"
//                                 style={styles.powerIcon}
//                               />
//                             </View>
//                           </View>
//                         </View>
//                       </View>
//                     </View>
//                   </TouchableOpacity>
//                 </View>
//                 <View style={styles.frameVideoPlay}>
//                   <Video
//                     source={require('./assets/videos/air.mp4')}
//                     style={{width: 70, height: 70, opacity: 0.5}}
//                     resizeMode="cover"
//                     repeat
//                     muted
//                   />
//                   <View style={styles.informationSprayer}>
//                     <Text style={styles.informationSprayerText}>
//                       Last action
//                     </Text>
//                     <Text style={styles.informationSprayerText}>
//                       23 May 2025
//                     </Text>
//                     <Text style={styles.informationSprayerText}>14.00</Text>
//                   </View>
//                 </View>
//               </View>
//               <View style={styles.boxControl}>
//                 <View style={styles.frameTopControl}>
//                   <Text style={styles.titleControl}>Fertilizer</Text>
//                   <TouchableOpacity
//                     style={styles.powerButtonContainer}
//                     onPress={() => {}}>
//                     <View style={styles.circleLevel1}>
//                       <View style={styles.circleLevel2}>
//                         <View style={styles.circleLevel3}>
//                           <View style={styles.circleLevel4}>
//                             <View style={styles.circleLevel5}>
//                               <Ionicons
//                                 name="power-outline"
//                                 size={24}
//                                 color="#B4DC45"
//                                 style={styles.powerIcon}
//                               />
//                             </View>
//                           </View>
//                         </View>
//                       </View>
//                     </View>
//                   </TouchableOpacity>
//                 </View>
//                 <View style={styles.frameVideoPlay}>
//                   <Video
//                     source={require('./assets/videos/pupuk.mp4')}
//                     style={{width: 70, height: 70, opacity: 0.5}}
//                     resizeMode="cover"
//                     repeat
//                     muted
//                   />
//                   <View style={styles.informationSprayer}>
//                     <Text style={styles.informationSprayerText}>
//                       Last action
//                     </Text>
//                     <Text style={styles.informationSprayerText}>
//                       23 May 2025
//                     </Text>
//                     <Text style={styles.informationSprayerText}>14.00</Text>
//                   </View>
//                 </View>
//               </View>
//             </View>
//           </View>
//           <View style={styles.fieldList}>
//             <View style={styles.headerFieldList}>
//               <Text style={{fontSize: 14, fontWeight: 600}}>Field List</Text>
//               <TouchableOpacity>
//                 <View style={styles.showAll}>
//                   <Text
//                     style={{
//                       fontSize: 14,
//                       fontFamily: 'SpaceGrotesk-Regular',
//                       fontWeight: 400,
//                       color: '#B4DC45',
//                     }}>
//                     Show All
//                   </Text>
//                   <Maximize1 color="#B4DC45" variant="Broken" size={24} />
//                 </View>
//               </TouchableOpacity>
//             </View>
//             <View style={styles.containerBlock}>
//               <TouchableOpacity onPress={()=> {navigation.replace('DetailBlock')}}>
//                 <View style={styles.cardBlock}>
//                   <View style={styles.containerVector}>
//                     {/* Frame notifikasi Fertilizer */}
//                     <View style={styles.notifIconFertilizer}>
//                       <Video
//                         source={require('./assets/videos/pupuk.mp4')}
//                         style={{width: 24, height: 24}}
//                         resizeMode="cover"
//                         repeat
//                         muted
//                         paused={true}
//                       />
//                     </View>
//                     <View style={styles.notifIconWater}>
//                       <Video
//                         source={require('./assets/videos/air.mp4')}
//                         style={{width: 24, height: 24}}
//                         resizeMode="cover"
//                         repeat
//                         muted
//                         paused={true}
//                       />
//                     </View>
//                     <View style={styles.svgContainer}>
//                       <Svg
//                         width={103.5}
//                         height={87.5}
//                         viewBox="0 0 103 89"
//                         fill="none">
//                         {/* fill shape */}
//                         <Path
//                           d="M14.5 53C14.1413 48.3364 6.51668 22.4115 1.58114 6.17196C0.798561 3.59703 2.72462 1 5.41584 1H44.0326C44.98 1 45.8966 1.33629 46.6193 1.94897L68.5 20.5L100.231 49.9647C101.976 51.5849 101.928 54.3613 100.128 55.9199L64.9215 86.4033C63.5061 87.6288 61.43 87.7086 59.9247 86.5954L14.5 53Z"
//                           fill="#F0F8DA"
//                         />
//                         {/* stroke shape */}
//                         <Path
//                           d="M14.5 53C14.1413 48.3364 6.51668 22.4115 1.58114 6.17196C0.798561 3.59703 2.72462 1 5.41584 1H44.0326C44.98 1 45.8966 1.33629 46.6193 1.94897L68.5 20.5M14.5 53L59.9247 86.5954C61.43 87.7086 63.5061 87.6288 64.9215 86.4033L100.128 55.9199C101.928 54.3613 101.976 51.5849 100.231 49.9647L68.5 20.5M14.5 53L68.5 20.5"
//                           stroke="#A3C73F"
//                           strokeWidth={2}
//                           strokeLinejoin="round"
//                         />
//                       </Svg>
//                     </View>
//                     <Text style={styles.vectorLabel1}>1</Text>
//                   </View>
//                   <View style={styles.containerTextBlock}>
//                     <Text style={styles.textBlockHeader}>Block 1</Text>
//                     <Text style={styles.textBlock}>Humidity : 18%</Text>
//                     <Text style={styles.textBlock}>Light: 1000 Lux</Text>
//                   </View>
//                   <View style={styles.cutoutMask} />
//                     {/* Tombol panah dengan Iconsax */}
//                     <View style={styles.cutoutButton}>
//                       {/* Background lingkaran hijau */}
//                       <Svg width={36} height={36} viewBox="0 0 36 36">
//                         <Path
//                           d="M18 36C27.9411 36 36 27.9411 36 18C36 8.05888 27.9411 0 18 0C8.05888 0 0 8.05888 0 18C0 27.9411 8.05888 36 18 36Z"
//                           fill="#B4DC45"
//                         />
//                       </Svg>
//                       {/* Ikon panah dari Iconsax */}
//                       <ArrowDown
//                         variant="Linear"
//                         size={38}
//                         color="white"
//                         style={styles.arrowIcon}
//                       />
//                     </View>
//                 </View>
//               </TouchableOpacity>
//               <TouchableOpacity>
//                 <View style={styles.cardBlock}>
//                   <View style={styles.containerVector}>
//                     {/* Frame notifikasi Fertilizer */}
//                     {/* <View style={styles.notifIconFertilizer}>
//                 <Video
//                   source={require('./assets/videos/pupuk.mp4')}
//                   style={{ width: 24, height: 24 }}
//                   resizeMode="cover"
//                   repeat
//                   muted
//                   paused={true}
//                 />
//               </View>
//               <View style={styles.notifIconWater}>
//                 <Video
//                   source={require('./assets/videos/air.mp4')}
//                   style={{ width: 24, height: 24 }}
//                   resizeMode="cover"
//                   repeat
//                   muted
//                   paused={true}
//                 />
//               </View> */}
//                     <View style={styles.svgContainer}>
//                       <Svg
//                         width={102}
//                         height={77}
//                         viewBox="0 0 102 77"
//                         fill="none">
//                         <Path
//                           d="M1.49996 43.5C1.14581 38.8961 14.7443 18.9287 17.8669 14.4109C18.2851 13.8058 18.8567 13.3446 19.5312 13.0509L45.6306 1.68501C47.7332 0.769373 50.1736 1.80538 50.9753 3.95399L62 33.5L97.6325 47.988C101.055 49.3794 100.923 54.2696 97.4307 55.4746L38.7879 75.7105C37.3813 76.1959 35.8216 75.8604 34.739 74.8397L1.49996 43.5Z"
//                           fill="#F0F8DA"
//                         />
//                         <Path
//                           d="M1.49996 43.5C1.14581 38.8961 14.7443 18.9287 17.8669 14.4109C18.2851 13.8058 18.8567 13.3446 19.5312 13.0509L45.6306 1.68501C47.7332 0.769373 50.1736 1.80538 50.9753 3.95399L62 33.5M1.49996 43.5L34.739 74.8397C35.8216 75.8604 37.3813 76.1959 38.7879 75.7105L97.4307 55.4746C100.923 54.2696 101.055 49.3794 97.6325 47.988L62 33.5M1.49996 43.5L62 33.5"
//                           stroke="#A3C73F"
//                           strokeWidth={2}
//                           strokeLinejoin="round"
//                         />
//                       </Svg>
//                     </View>
//                     <Text style={styles.vectorLabel2}>2</Text>
//                   </View>
//                   <View style={styles.containerTextBlock}>
//                     <Text style={styles.textBlockHeader}>Block 2</Text>
//                     <Text style={styles.textBlock}>Humidity : 18%</Text>
//                     <Text style={styles.textBlock}>Light: 1000 Lux</Text>
//                   </View>
//                 </View>
//                 <View style={styles.cutoutMask} />
//                     {/* Tombol panah dengan Iconsax */}
//                     <View style={styles.cutoutButton}>
//                       {/* Background lingkaran hijau */}
//                       <Svg width={36} height={36} viewBox="0 0 36 36">
//                         <Path
//                           d="M18 36C27.9411 36 36 27.9411 36 18C36 8.05888 27.9411 0 18 0C8.05888 0 0 8.05888 0 18C0 27.9411 8.05888 36 18 36Z"
//                           fill="#B4DC45"
//                         />
//                       </Svg>
//                       {/* Ikon panah dari Iconsax */}
//                       <ArrowDown
//                         variant="Linear"
//                         size={38}
//                         color="white"
//                         style={styles.arrowIcon}
//                       />
//                     </View>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </ScrollView>
//       </View>
//     </SafeAreaView>
//   );
// };

// const CARD_RADIUS = 1;
// const CUTOUT_DIAM = 50;
// const CUTOUT_RADIUS = CUTOUT_DIAM / 2;

// const styles = StyleSheet.create({
//   home: {
//     flex: 1,
//     paddingHorizontal: 16,
//     backgroundColor: '#f5f5f5',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     gap: 8,
//   },
//   userInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 100,
//     marginRight: 10,
//   },
//   username: {
//     fontFamily: 'SpaceGrotesk-Regular',
//     fontSize: 14,
//     color: '#333',
//   },
//   card: {
//     width: '100%',
//     height: 162,
//     borderRadius: 16,
//     overflow: 'hidden',
//     // justifyContent: 'flex-start',
//     padding: 1,
//     marginTop: 12,
//   },
//   image: {
//     borderRadius: 16,
//   },
//   location: {
//     justifyContent: 'flex-start',
//     flexDirection: 'row',
//     paddingHorizontal: 16,
//     paddingBottom: 100,
//     marginLeft: -5,
//     marginTop: 10,
//     alignItems: 'center',
//   },
//   locationText: {
//     fontSize: 14,
//     fontFamily: 'SpaceGrotesk-Regular',
//     fontWeight: 400,
//     color: 'white',
//     marginLeft: 4,
//   },
//   weatherSectionTwo: {
//     width: 159,
//     height: 44,
//     backgroundColor: 'transparent',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     marginTop: -90, // tambahkan sedikit spasi setelah location
//     // marginLeft: 16, // sejajar dengan location
//     borderRadius: 12,
//     gap: 10, // aktifkan jika desainnya rounded
//   },

//   weatherText: {
//     color: 'white',
//     fontSize: 14,
//     marginLeft: 6,
//     fontFamily: 'SpaceGrotesk-Regular',
//   },
//   detailSectionTwo: {
//     flexDirection: 'column',
//     gap: 1,
//     alignContent: 'center',
//   },
//   detailSectionTwoText: {
//     fontSize: 12,
//     fontWeight: 400,
//     fontFamily: 'SpaceGrotesk-Regular',
//     color: 'white',
//   },
//   gradientLine: {
//     width: 319,
//     height: 2,
//     opacity: 0.62,
//     marginTop: 20,
//     alignSelf: 'center',
//     borderRadius: 1,
//     marginBottom: 10,
//   },
//   // detailSectionThree: {
//   //   flexDirection: "row",
//   //   justifyContent: "space-between",
//   //   width: 314,
//   //   height: 36,
//   //   alignItems: "center",
//   // },
//   detailSectionThree: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     // pakai paddingHorizontal yang sama dengan container utama
//     paddingHorizontal: 16,
//     height: 36,
//     // jangan set width tetap — biarkan melebar sesuai parent
//     width: '100%',
//   },
//   detailSectionThreeText: {
//     flex: 1,
//     textAlign: 'center',
//     fontSize: 12,
//     fontWeight: 600,
//     fontFamily: 'SpaceGrotesk-Regular',
//     color: 'white',

//     // jika mau custom font atau ukuran:
//     // fontFamily: 'SpaceGrotesk-Regular',
//     // fontSize: 12,
//   },
//   cardTwo: {
//     width: '100%',
//     height: 162,
//     borderRadius: 16,
//     overflow: 'hidden',
//     // justifyContent: 'flex-start',
//     padding: 12,
//     marginTop: 12,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.1,
//     backgroundColor: 'white',
//     marginBottom: 8,
//   },
//   soilStatisticOne: {
//     height: 52,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     // gap 8px → gunakan margin atau justifyContent+flex
//     // marginTop kecil jika perlu spasi ke atas
//     marginTop: 9,
//     marginHorizontal: 1,
//     gap: 8,
//   },
//   soilStatisticTwo: {
//     height: 52,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     // gap 8px → gunakan margin atau justifyContent+flex
//     // marginTop kecil jika perlu spasi ke atas
//     marginTop: 8,
//     marginHorizontal: 1,
//     gap: 8,
//   },
//   detailStatisticOne: {
//     paddingHorizontal: 8,
//     width: 170,
//     height: 52,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#DEE2E7', // warna border yang netral
//     justifyContent: 'space-between',
//     flexDirection: 'row',
//     // alignItems: 'center',
//   },
//   ph: {
//     flexDirection: 'column',
//     alignItems: 'center',
//     marginHorizontal: -8,
//     gap: 2,
//   },
//   nitrogen: {
//     flexDirection: 'column',
//     alignItems: 'center',
//     marginHorizontal: -8,
//     gap: 2,
//   },
//   phosphor: {
//     flexDirection: 'column',
//     alignItems: 'center',
//     marginHorizontal: -8,
//     gap: 2,
//   },
//   kalium: {
//     flexDirection: 'column',
//     alignItems: 'center',
//     marginHorizontal: -8,
//     gap: 2,
//   },
//   arrowOne: {
//     marginHorizontal: -8,
//   },
//   statContent: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   statLabel: {
//     fontSize: 12,
//     fontWeight: '400',
//     fontFamily: 'SpaceGrotesk-Regular',
//   },
//   statValue: {
//     fontSize: 14,
//     fontWeight: '600',
//     fontFamily: 'SpaceGrotesk-Regular',
//   },
//   statExtra: {
//     flexDirection: 'column',
//     marginTop: 10,
//     alignItems: 'center',
//     marginLeft: 8,
//   },
//   statStatus: {
//     fontSize: 12.5,
//     marginLeft: 4,
//   },
//   soilTitle: {
//     fontSize: 14,
//     fontWeight: 600,
//     fontFamily: 'SpaceGrotesk-Regular',
//   },
//   controlCentre: {
//     marginBottom: 8,
//   },
//   controlCentreText: {
//     fontSize: 14,
//     fontFamily: 'SpaceGrotesk-Regular',
//     fontWeight: 600,
//     marginBottom: 8,
//   },
//   controlCentreBox: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: 2,
//   },
//   boxControl: {
//     backgroundColor: 'white',
//     width: 178,
//     height: 132,
//     borderRadius: 16,
//     gap: 2,
//   },
//   frameTopControl: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingHorizontal: 8,
//     marginTop: 9,
//     marginHorizontal: 1,
//     gap: 8,
//     // marginBottom: 2,
//   },
//   titleControl: {
//     fontSize: 16,
//     fontWeight: 500,
//   },
//   frameVideo: {
//     backgroundColor: 'white',
//     width: 146,
//     height: 70,
//     paddingHorizontal: 8,
//     // marginTop: 9,
//     marginHorizontal: 8,
//     marginBottom: 8,
//     marginLeft: 20,
//   },
//   frameVideoPlay: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   video: {
//     width: 70,
//     height: 70,
//     borderRadius: 8,
//     opacity: 0.5,
//   },
//   informationSprayer: {
//     flex: 1,
//     justifyContent: 'center',
//     paddingHorizontal: 10,
//   },
//   informationSprayerText: {
//     fontSize: 12,
//     color: 'black',
//     textAlign: 'right',
//     fontFamily: 'SpaceGrotesk-Regular',
//   },
//   circleLevel1: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#D9D9D9',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   circleLevel2: {
//     width: 32.5,
//     height: 32.5,
//     borderRadius: 16.25,
//     borderWidth: 1.25,
//     borderColor: '#EFFFC2',
//     justifyContent: 'center',
//     alignItems: 'center',
//     // backdropFilter: 'blur(1.25px)',
//   },
//   circleLevel3: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     borderWidth: 1.25,
//     borderColor: 'rgba(0,0,0,0.2)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     // backdropFilter: 'blur(1.75px)',
//   },
//   circleLevel4: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     borderWidth: 5,
//     borderColor: '#B4DC45',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   circleLevel5: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: '#FFFFFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#B8B8B8DE',
//     shadowOffset: {width: 0, height: -0.63},
//     shadowOpacity: 0.75,
//     shadowRadius: 0.25,
//   },
//   powerIcon: {},
//   powerButtonContainer: {},
//   fieldList: {
//     height: 201,
//   },
//   headerFieldList: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   showAll: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 5,
//   },
//   containerBlock: {
//     height: 175,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   cardBlock: {
//     backgroundColor: 'white',
//     width: 178,
//     height: 175,
//     borderRadius: 16,
//     gap: 2,
//   },
//   containerTextBlock: {
//     alignItems: 'flex-start',
//     top: 111,
//     paddingHorizontal: 12,
//     width: '100%',
//     height: 52,
//   },
//   textBlockHeader: {
//     fontSize: 14,
//     fontWeight: 600,
//     fontFamily: 'SpaceGrotesk-Regular',
//   },
//   textBlock: {
//     fontSize: 14,
//     fontFamily: 'SpaceGrotesk-Regular',
//   },
//   containerVector: {
//     position: 'absolute',
//     width: 147,
//     height: 87.5,
//     top: 16,
//     left: 10,
//     // example background or children can be added here
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     borderRadius: 8,
//   },
//   notifIconWater: {
//     position: 'absolute',
//     width: 24,
//     height: 24,
//     top: -12,
//     left: -4,
//     borderRadius: 24,
//     borderWidth: 0.34,
//     borderColor: '#ddd',
//     overflow: 'hidden',
//     zIndex: 10, // agar video terpotong sesuai radius
//   },
//   notifIconFertilizer: {
//     position: 'absolute',
//     width: 24,
//     height: 24,
//     top: -12,
//     left: 24,
//     borderRadius: 24,
//     borderWidth: 0.34,
//     borderColor: '#ddd',
//     overflow: 'hidden',
//     zIndex: 10,
//   },
//   svgContainer: {
//     width: 100,    // +8px
//     height: 85,    // -2px atau sesuai proporsi
//     left: 20,
//     top: 0, // memastikan isi clip ke dalam radius
//     backgroundColor: '#white',
//   },
//   vectorLabel1: {
//     position: 'absolute',
//     width: 10,
//     height: 20,
//     top: 36,
//     left: 70, // 22px offset wrapper + left teks 70px
//     fontFamily: 'SpaceGrotesk-Regular',
//     fontWeight: '500',
//     fontSize: 16,
//     lineHeight: 20,
//     letterSpacing: 0,
//     textAlign: 'center',
//     color: '#A3C73F',
//   },
//   vectorLabel2: {
//     position: 'absolute',
//     width: 10,
//     height: 20,
//     top: 40,
//     left: 60, // 22px offset wrapper + left teks 70px
//     fontFamily: 'SpaceGrotesk-Regular',
//     fontWeight: '500',
//     fontSize: 16,
//     lineHeight: 20,
//     letterSpacing: 0,
//     textAlign: 'center',
//     color: '#A3C73F',
//   },
//   // … style lainnya …
//   cutoutMask: {
//     position: 'absolute',
//     width: CUTOUT_DIAM,
//     height: CUTOUT_DIAM,
//     borderRadius: CUTOUT_RADIUS,
//     backgroundColor: '#f5f5f5',  // warna background layar
//     bottom: -CUTOUT_RADIUS + 18,
//     right: -CUTOUT_RADIUS + 16,
//     zIndex: 1,
//   },
//   cutoutButton: {
//     position: 'absolute',
//     width: 36,
//     height: 36,
//     bottom: -CUTOUT_RADIUS + 2 + (CUTOUT_DIAM - 1) / 2,
//     right: -CUTOUT_RADIUS + 1 + (CUTOUT_DIAM - 1) / 2,
//     zIndex: 2,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   arrowIcon: {
//     position: 'absolute',
//     transform: [{ rotate: '-70deg' }],
//   },
// });

// //   title: {
// //     color: '#fff',x
// //     fontSize: 20,
// //     fontWeight: 'bold',
// //   },
// //   subtitle: {
// //     color: '#fff',
// //     fontSize: 14,
// //   },

// export default HomeTest;