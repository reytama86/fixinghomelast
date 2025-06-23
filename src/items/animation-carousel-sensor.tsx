    // import {StyleSheet, Text, View, ScrollView, Dimensions} from 'react-native';
    // import React from 'react';
    // import data from './data';
    // import ParallaxCarouselCard from '../SensorCarousel';
    // import Animated,{ useSharedValue } from 'react-native-reanimated';
    // const OFFSET = 45;
    // const ITEM_WIDTH = Dimensions.get('window').width - OFFSET * 2;
    // const ITEM_HEIGHT = 420;
    // const AnimationParallaxCarousel = () => {
    //     const scrollX = useSharedValue(0);
    //     return (
    //         <View style={styles.parallaxCarouselView}>
    //             <Animated.ScrollView 
    //             horizontal
    //             decelerationRate={'fast'}
    //             snapTopInterval={ITEM_WIDTH}
    //             bounces={false}
    //             disableIntervalMomentum
    //             onScroll={event => {
    //                 scrollX.value = event.nativeEvent.contentOffset.x;
    //             }}
    //             scrollEventThrottle={12}
    //             >
    //                 {data.map((item, index)=> {
    //                     <ParallaxCarouselCard item={item} key={index} id={index} scrollX={scrollX} total={data.length}/>
    //                 })}
    //             </Animated.ScrollView>
    //         </View>
    //     )
    // }

    // export default AnimationParallaxCarousel;

    // const styles = StyleSheet.create({
    //     parallaxCaruselView: {
    //         paddingVertical: 50,
    //     }
    // })
