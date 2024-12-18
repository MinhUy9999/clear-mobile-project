import { View, Text, StyleSheet, Image, Touchable, TouchableOpacity } from 'react-native'
import React from 'react'
import Onboarding from 'react-native-onboarding-swiper';

import { useNavigation } from '@react-navigation/native';





export default function OnboardingScreen() {
 const navigation = useNavigation();
  const handleDone = () => {
    navigation.navigate({name: 'MainTabs'});
  }
  const handleSkip = () => {
    navigation.navigate({name: 'MainTabs'});
  }
  const doneButton = ({...props})=>{
    return(
      <TouchableOpacity style={style.donebutton}{...props}>
        <Text>Done</Text>
      </TouchableOpacity>
    )
  }
  return (
    <View style={style.container}>
      <Onboarding
      onDone={handleDone}
      onSkip={handleSkip}
      bottomBarHighlight={false}
      DoneButtonComponent={doneButton}
      containerStyles={{paddingHorizontal:15}}
  pages={[
    {
      backgroundColor: '#238bc3',
      image: <Image source={require('../assets/images/mop.png')}/>,
           title: 'Perfect Cleaning Service',
        subtitle: 'Bring Clean Space to Your Home',
    },
    {
        backgroundColor: '#1fb3d4',
        image: <Image style={style.lottie} source={require('../assets/images/vacuum.png')}/>,
           title: 'Clean Space, Sublime Life',
        subtitle: 'Reliable Cleaning Service',
      },
      {
        backgroundColor: '#b5e7fb',
        image: <Image style={style.lottie} source={require('../assets/images/house-cleaning.png')}/>,
        title: 'Professional Cleaning Services',
     subtitle: 'Maximum Satisfaction Guaranteed',
      },
  ]}
/>
    </View>
  )
}
const style = StyleSheet.create({
  container: {
    flex: 1,
backgroundColor:'wihte'
  },
  lottie: {
    width: 300,
    height: 400,
  },
  donebutton: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: '100%',
    borderBottomLeftRadius: '100%',
  }
})