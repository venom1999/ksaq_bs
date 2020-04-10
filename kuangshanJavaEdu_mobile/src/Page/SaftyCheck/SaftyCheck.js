import React, {Component} from 'react';
import {
    Image, 
    StyleSheet,
    View,
    Text
} from 'react-native';


export default class SaftyCheck extends Component{
    constructor(props){
        super(props);
    }

    render(){
        return(
            <View style = {styles.container}>
                <Text style={styles.TextStyle}>SaftyCheck</Text>
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'white',
    },
    TextStyle:{
        justifyContent:"center",
        alignItems:"center",
    },
})