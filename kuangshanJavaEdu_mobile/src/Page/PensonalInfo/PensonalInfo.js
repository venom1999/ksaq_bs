import React, {Component} from 'react';
import {
    View,
    TouchableOpacity, 
    StyleSheet,
    ToastAndroid,
    Text,
} from 'react-native';
import { StackActions,NavigationActions } from 'react-navigation'

import StorageUtils from "../../Utils/StorageUtils"

const resetAction = StackActions.reset({
    index: 0,
    actions: [
        NavigationActions.navigate({ routeName: 'Login'}),
    ]
})

export default class PensonalInfo extends Component{
    constructor(props){
        super(props);
    }

    static navigationOptions = {
        title: '个人中心',
        headerStyle: {
            backgroundColor: '#0367e1'
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold'
        },
    };

    render(){
        return(
            <View style={{flex:1,marginTop:5}}>
                <TouchableOpacity
                    onPress={()=>this.props.navigation.navigate('PensonalInfoDetiles')}
                    style={styles.wideButton}
                >
                    <Text style={styles.listText}>
                        个人信息
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    //onPress={()=>this.props.navigation.navigate('Login')}
                    style={styles.wideButton}
                >
                    <Text style={styles.listText}>
                        修改密码
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={()=>{
                        StorageUtils.clear();
                        ToastAndroid.show('成功退出，请重新登录', 1000);
                        this.props.navigation.dispatch(resetAction);
                    }}
                    style={styles.wideButton}
                >
                    <Text style={styles.listText}>
                        退出
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    wideButton: {
        padding: 10,
        paddingLeft: 20,
        backgroundColor: '#fff',
        borderWidth:1,
        borderColor:'#efefef'
    },
    listText:{
        fontSize: 20
    },
})