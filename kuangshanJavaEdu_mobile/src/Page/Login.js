import React,{ Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Dimensions,
    Alert
} from 'react-native';

const {width, height} = Dimensions.get('window');
import { StackActions,NavigationActions } from 'react-navigation'



import Loading from "../Utils/Loading";
import Verification from 'react-native-verification'
import HttpUtils from "../Utils/HttpUtils";
import URL from "../Utils/URL";

import StorageUtils from "../Utils/StorageUtils"


const maxUserNameLength = 18;
const maxPasswordLength = 18;
const maxVerificationLength = 4;

const resetAction = StackActions.reset({
  index: 0,
  actions: [
      NavigationActions.navigate({ routeName: 'Home'}),  //Login 要跳转的路由
  ]
})


export default class Home extends Component{


  static navigationOptions = {
    headerShown:false,
  };

  constructor(props){
    super(props);
    this.state={
      userInputVerification:"",
      realVerification:"",
      userID:"",
      passWord:"",
      employeeNum:"",
      is_login:false,
    }
    this._login=this._login.bind(this);
    
  }

  componentDidMount(){
    try {
      StorageUtils.get("empNum").then((row)=>{
        if(row){
          this.setState({is_login:true});
          this.timer = setTimeout(()=>{
            this.getEduTime(row);
            this.getEduScore(row);
            this.props.navigation.dispatch(resetAction);
          },500);
        }else{
        }
      });
    } catch (error) {
      alert("取值错误")
    }
  }

  getEduTime(userId){
    let formData = new FormData;
    formData.append('userId',userId);
    HttpUtils.PostFetch(URL.url + "/mobile/Login/getEduTime",formData)
        .then(res => {
          StorageUtils.save("eduTime",res.edu_time);
        }).catch((error) => {
        console.error(error);
    });
  }

  getEduScore(userId){
    let formData = new FormData;
    formData.append('userId',userId);
    HttpUtils.PostFetch(URL.url + "/mobile/Login/getEduScore",formData)
        .then(res => {
          
          StorageUtils.save("eduScore",res.edu_score);
        }).catch((error) => {
        console.error(error);
    });
  }


  _postData(){
    let formData = new FormData;
    formData.append('userID',this.state.userID);
    formData.append('passWord',this.state.passWord);
    HttpUtils.PostFetch(URL.url + "/mobile/Login/test",formData)
        .then(res => {
            if(res.status!=='ok'||res.status===''){
              Alert.alert("提示",res.text);
              this.setState({is_login:false});
            }else{
              this.setState({employeeNum:res.userNum});
              try {
                StorageUtils.clear();
                StorageUtils.save("empNum",this.state.employeeNum);
                StorageUtils.save('userName',res.userName);
                StorageUtils.save('userInstitutionName',res.userInstitutionName);
                StorageUtils.save('userRight',res.userRight);
                StorageUtils.save('empId',res.employeeId);
                

              } catch (error) {
                Alert.alert("提示","存值错误")
              }
              this.getEduTime(this.state.employeeNum);
              this.getEduScore(this.state.employeeNum);
              this.props.navigation.dispatch(resetAction);
            }
        }).catch((error) => {
        console.error(error);
    });
  } 

  //登录函数
  _login(){
    this.setState({is_login:true})
    console.log(this.state.realVerification.toLowerCase());
    console.log(this.state.userInputVerification.toLowerCase());
    if(this.state.userInputVerification.toLowerCase() === this.state.realVerification.toLowerCase()){
      this._postData();
    }else{
      Alert.alert("提示","验证码输入失败，请重新输入")
      this.setState({is_login:false});
    }
  }

  render(){
    if(!this.state.is_login){
      return (
        <View style={styles.container}>
  
          <View style={styles.titleContent}>
            <Text style={styles.titleText}>
              登录系统
            </Text>
          </View>
  
          <View style={styles.userNameContainer}>
            <Text style={styles.text}>用户名：</Text>
            <TextInput
              style={styles.userNameTextInput}
              placeholder="请输入用户名"
              underlineColorAndroid={'transparent'}
              maxUserNameLength = {maxUserNameLength}
              onChangeText={(text) => this.setState({userID:text})}
            />
            
          </View>
  
          <View style={styles.passwordContainer}>
            <Text style={styles.text}>密码：</Text>
            <TextInput 
              style={styles.userNameTextInput}
              placeholder="请输入密码"
              secureTextEntry={true}
              underlineColorAndroid={'transparent'}
              maxLength={maxPasswordLength}
              onChangeText={(passWord)=>this.setState({passWord})}
            />
          </View>
  
  
          <View style = {styles.VerificationContent}>
            <Text style={styles.text}>验证码：</Text>
            <TextInput
              style={styles.verificationTextInput}
              placeholder="请输入验证码"
              underlineColorAndroid={'transparent'}
              maxLength={maxVerificationLength}
              onChangeText={(text) => 
                this.setState({userInputVerification : text}) 
              }
            />
            <Verification 
                type={'number'} 
                getValue={(value)=>
                  this.setState({realVerification : value})
                }  
              
                />
          </View>
  
          <View style={styles.btnContainer}>
            <TouchableOpacity
              onPress={this._login}
              style={styles.button}>
              <Text
                style={styles.btText}>登录</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }else{
      return (
        <View style={{flex: 1, justifyContent: 'center'}}>
            <Loading text={'登录中'} color={'blue'}/>
        </View>
      );
    }
  }
}
const styles = StyleSheet.create({
    container:{
      flex:1,
    },
    titleText:{
      fontSize:30,
      color:'black',

    },
    text:{
      fontSize:20,
      color:'black'
    },
    
    titleContent:{
      justifyContent:'center',
      flexDirection:"row",
      marginTop:50,
      marginBottom:30,
    },

    userNameContainer:{
      justifyContent:'center',
      flexDirection:"row",
      marginTop:10,
      marginBottom:10,
    },

    passwordContainer:{
      justifyContent:'center',
      flexDirection:"row",
      marginTop:10,
      marginBottom:10,
      marginLeft:17
    },

    btnContainer:{
   
      justifyContent:'center',
      alignItems:'center',
      flexDirection:"row",
      marginTop:50,
    },

    userNameTextInput:{
      height: 40,
      width:200,
      backgroundColor:'#d6dbe0'
    },

    verificationTextInput:{
      height: 40,
      width:100,
      backgroundColor:'#d6dbe0'
    },
    
    VerificationContent:{
      justifyContent:"center",
      flexDirection:"row",
      marginTop:10,
      marginLeft:25
    },
    logInButton:{
      backgroundColor:"pink",
      width:width/2,
      height:50
    },
    button: {
      height: 50,
      width: 280,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      backgroundColor: '#66f',    
      marginBottom: 8,
    },
    btText: {
      color: '#fff',
    }
});
