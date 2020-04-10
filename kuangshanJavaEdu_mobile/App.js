import React from 'react';
import MainStack from "./src/Navigation/MainNavigator";
import {
    StyleSheet,
    View
} from 'react-native';
export default class App extends React.Component {
    render() {
        return (
          <View style={styles.container}>
            <MainStack />
          </View>
        );
      }
};

const styles = StyleSheet.create({
    container: {
      flex: 1
    }
});
  
