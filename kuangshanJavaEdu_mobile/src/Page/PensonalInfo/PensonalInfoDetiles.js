import React, {Component} from 'react';
import {
    View,
    TouchableOpacity, 
    StyleSheet,
    ToastAndroid,
    Text,
} from 'react-native';

import StorageUtils from "../../Utils/StorageUtils"

export default class PensonalInfo extends Component{
    constructor(props){
        super(props);
        this.state={
            empId:'',
            userName:'',
            userInstitutionName:'',
        }
    }

    static navigationOptions = {
        title:"个人信息",
        headerStyle: {
            backgroundColor: '#0367e1'
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold'
        },
    };


    componentDidMount(){
        StorageUtils.get("empId").then((row)=>{
            this.setState({ empId:row });
        });
        StorageUtils.get("userName").then((row)=>{
            this.setState({ userName:row });
        });
        StorageUtils.get("userInstitutionName").then((row)=>{
            this.setState({ userInstitutionName:row });
        });
    }

    render(){
        return(
            <View style={styles.container}>
                <View style={styles.childContainer}>
                    <Text style={{fontSize:20,color:'black'}}>
                        用户编号
                    </Text>
                    <Text style={{fontSize:20,color:"#A9A9A9",marginLeft:50}}>
                        {this.state.empId}
                    </Text>
                </View>

                <View style={styles.childContainer}>
                    <Text style={{fontSize:20,color:'black'}}>
                        用户姓名
                    </Text>
                    <Text style={{fontSize:20,color:"#A9A9A9",marginLeft:50}}>
                        {this.state.userName}
                    </Text>
                </View>

                <View style={styles.childContainer}>
                    <Text style={{fontSize:20,color:'black'}}>
                        所属机构
                    </Text>
                    <Text style={{fontSize:20,color:"#A9A9A9",marginLeft:50}}>
                        {this.state.userInstitutionName}
                    </Text>
                </View>
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container:{
        flex:1,
    },
    childContainer:{
        flexDirection:"row",
        padding: 10,
        paddingLeft: 20,
        backgroundColor: '#fff',
        borderWidth:1,
        borderColor:'#efefef'
    },
})