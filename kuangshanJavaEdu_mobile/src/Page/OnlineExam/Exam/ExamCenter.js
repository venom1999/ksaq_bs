import React from 'react';
import {Dimensions, StyleSheet, Text, TouchableOpacity, View,Image} from "react-native";
const {width, height} = Dimensions.get('window');
export default class ExamCenter extends React.Component{
    //设置头部导航相关内容
    static navigationOptions = {
        title: '考试中心',
        headerStyle: {
            backgroundColor: '#0367e1'
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold'
        },

    };
    constructor(props){
        super(props);
    }
    render(){
        return (
            <View style={{alignItems: 'center',justifyContent:'center', backgroundColor: '#fff',flex: 1}}>
                <TouchableOpacity style={{justifyContent:'center',alignItems: 'center',backgroundColor:'#fff'}} onPress={()=>this.props.navigation.navigate('SelectExamination')}>
                    <Image source={require('../../../../image/onlineExam/onlineexam.png')} style={{width:width*9/10,height:width*3/10}} resizeMode={'contain'}/>
                </TouchableOpacity>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    listText:{
        fontSize: 18
    },
});
