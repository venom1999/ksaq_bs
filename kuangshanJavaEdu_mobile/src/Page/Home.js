import React, {Component} from 'react';
import {
    Image, 
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    ToastAndroid,
    BackHandler,
    Alert
} from 'react-native';

import FontAwesome from 'react-native-vector-icons/FontAwesome';

const {width, height} = Dimensions.get('window');

export default class Home extends Component{
    constructor(props){
        super(props);
    }

    static navigationOptions = {
        headerShown:false,
    };

    componentWillMount() { 
        if (Platform.OS === 'android') {                 
            BackHandler.addEventListener('hardwareBackPress',this.onBackAndroid);
        } 
    } 
    
    componentDidUnmount() {
        if (Platform.OS === 'android') { 
            BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid); 
        } 
    } 
    
    onBackAndroid = () => {
        if(this.props.navigation.isFocused()){
            if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
                BackHandler.exitApp();//直接退出APP
            }else{
                this.lastBackPressed = Date.now();
                ToastAndroid.show('再按一次退出应用', 1000);//提示
                return true;
            }
        }
    }

    render(){
        return(
            <View style = {styles.container}>
                <View>
                    <Image source={require('../../image/BackGround.jpg')} style={styles.imageStyle}></Image>
                </View>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={styles.btnContainer}>
                        <TouchableOpacity onPress={()=>this.props.navigation.navigate("Lesson")}>
                            <View style={{marginLeft:50}}>
                                <FontAwesome name="book" size={100} color="#C0C0C0" />
                                <Text style={styles.TextStyle}>在线学习</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>this.props.navigation.navigate("ExamCenter")}>
                            <View style={{marginRight:50}}>
                                <FontAwesome name="pencil" size={100} color="#FF8C00"/>
                                <Text style={styles.TextStyle}>在线考试</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.btnContainer}>
                        <TouchableOpacity onPress={()=>this.props.navigation.navigate("SaftyCheck")}>
                            <View style={{marginLeft:50}}>
                                <FontAwesome name="wrench" size={100} color="#BDB76B" />
                                <Text style={styles.TextStyle}>安全检查</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>this.props.navigation.navigate("CloseLoop")}>
                            <View style={{marginRight:50}}>
                                <FontAwesome name="refresh" size={100} color="green"/>
                                <Text style={styles.TextStyle}>闭环管理</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                <View style={styles.rootView}>
                    <View style={{marginRight:20}}>
                        <TouchableOpacity onPress={()=>this.props.navigation.navigate("PensonalInfo")}>
                            <FontAwesome name="user" size={50} color="black"/>
                        </TouchableOpacity>
                    </View>
                </View>
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
        fontSize:25
    },
    imageStyle:{
        width:width,
        height:height*0.3,
        resizeMode:"stretch",
        
    },
    btnContainer:{
        flexDirection:'row',
        width:width,
        marginTop:30,
        justifyContent:"space-between",
    },
    scrollView:{
        height:height*0.6
    },
    rootView:{
        width:width,
        height:height*0.1,
        borderWidth:1,
        borderColor:'#efefef',
        justifyContent:"center",
        alignItems:"flex-end",
    }
})