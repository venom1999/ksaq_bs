import React, {Component} from 'react'
import {createAppContainer} from 'react-navigation'
import {createStackNavigator} from 'react-navigation-stack'
import {createBottomTabNavigator, BottomTabBar} from 'react-navigation-tabs'

import {Image, StyleSheet} from 'react-native'

import Home from "../src/Home";
import Lesson from "../src/OnlineStudy/Lesson";
import LessonRootStack from "./LessonStackNavigator";
import Test from "../src/Test";
import HomeRootStack from "../src/Mine";
import H_RootStack from "../src/HomeNav";
import Login from "../src/Login/Login";
import PonsenalInfo from "../src/ponsenalInfo"

// 底部导航
const TABS = createBottomTabNavigator({
    Home: {
        screen: H_RootStack,
        navigationOptions: {
            tabBarLabel: '首页',
            tabBarIcon: ({focused})=>{
                if(!focused){
                    return <Image source={require('../image/home_n.png')}  style={styles.bottomTabIconStyle}/>
                }else {
                    return <Image source={require('../image/home_y.png')}  style={styles.bottomTabIconStyle}/>
                }
            },
        }
    },
    Lesson: {
        screen: LessonRootStack,
        navigationOptions: {
            tabBarLabel: '课程',
            tabBarIcon: ({focused})=>{
                if(!focused){
                    return <Image source={require('../image/lesson_n.png')}  style={styles.bottomTabIconStyle}/>
                }else {
                    return <Image source={require('../image/lesson_y.png')}  style={styles.bottomTabIconStyle}/>
                }
            }
        }
    },
    Test: {
        screen: Test,
        navigationOptions: {
            tabBarLabel: '考试',
            tabBarIcon: ({focused})=>{
                if(!focused){
                    return <Image source={require('../image/test_n.png')}  style={styles.bottomTabIconStyle}/>
                }else {
                    return <Image source={require('../image/test_y.png')}  style={styles.bottomTabIconStyle}/>
                }
            }
        }
    },
    Me: {
        screen: HomeRootStack,
        navigationOptions: {
            tabBarLabel: '我的',
            tabBarIcon: ({focused})=>{
                if(!focused){
                    return <Image source={require('../image/me_n.png')}  style={styles.bottomTabIconStyle}/>
                }else {
                    return <Image source={require('../image/me_y.png')}  style={styles.bottomTabIconStyle}/>
                }
            }
        }
    }
},{
    tabBarComponent: props => (
        <BottomTabBar {...props} activeTintColor='rgb(62, 187, 175)'/>
    ),
})


const AppNavigator = createAppContainer(createStackNavigator({
    Login: Login,
    MainTabNavigator: {
        screen: TABS,
        navigationOptions: {
          headerShown:false,
        }
    },
}, {
    initialRouteName: "Login",
},));

const styles = StyleSheet.create({
    bottomTabIconStyle: {
        width: 30,
        height: 30
    }
});

export default AppNavigator;
