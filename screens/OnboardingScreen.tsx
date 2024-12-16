import { View, Text, StyleSheet, Image, Touchable, TouchableOpacity } from 'react-native'
import React from 'react'
import Onboarding from 'react-native-onboarding-swiper';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';

console.log('Lottie component imported correctly');



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
      image: ( <View style={style.lottie}>
        <LottieView source={require('../assets/animations/on1.json')}  autoPlay={true}
        loop={true}
        onAnimationFinish={() => console.log('Animation finished')}
        />
     </View>),
         title: 'Onboarding',
      subtitle: 'Done with React Native Onboarding Swiper',
    },
    {
        backgroundColor: '#1fb3d4',
        image: <Image source={require('../assets/images/react-logo.png')}/>,
           title: 'Onboarding',
        subtitle: 'Done with React Native Onboarding Swiper',
      },
      {
        backgroundColor: '#b5e7fb',
        image: ( <View>
          <Text>hello</Text>
       </View>),
           title: 'Onboarding',
        subtitle: 'Done with React Native Onboarding Swiper',
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