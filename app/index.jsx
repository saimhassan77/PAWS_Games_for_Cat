import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import HomeScreen from '../screens/HomeScreen.jsx'

const index = () => {
  return (
    <SafeAreaView style={{flex:1}}>
      <HomeScreen/>
    </SafeAreaView>
  )
}

export default index

const styles = StyleSheet.create({})