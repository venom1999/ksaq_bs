import React, {Component} from 'react'
import {createStackNavigator} from 'react-navigation-stack'
import {createAppContainer} from 'react-navigation'

import Home from "../Page/Home"
import CloseLoop from "../Page/CloseLoop/CloseLoop"
import SaftyCheck from "../Page/SaftyCheck/SaftyCheck"
import Mine from "../Page/Mine/Mine"
import Login from "../Page/Login"
import PensonalInfo from "../Page/PensonalInfo/PensonalInfo"
import PensonalInfoDetiles from "../Page/PensonalInfo/PensonalInfoDetiles"
import ExamCenter from "../Page/OnlineExam/Exam/ExamCenter";
import SelectExamination from "../Page/OnlineExam/Exam/SelectExamination";
import Examination from "../Page/OnlineExam/Exam/Examination";
import ExamfullScreenVideo from "../Page/OnlineExam/Exam/ExamfullScreenVideo";
import Lesson from "../Page/OnlineStudy/Lesson";
import Resource from "../Page/OnlineStudy/Ovideo";
import PhotoView from "../Page/OnlineStudy/PhotoView";

const MainStack = createAppContainer(createStackNavigator({
    Home:Home,
    SaftyCheck:SaftyCheck,
    Mine:Mine,
    CloseLoop:CloseLoop,
    PensonalInfo:PensonalInfo,
    PensonalInfoDetiles:PensonalInfoDetiles,
    Login:Login,
    ExamCenter: ExamCenter,
    SelectExamination: SelectExamination,
    Examination: Examination,
    ExamfullScreenVideo: ExamfullScreenVideo,
    Lesson: Lesson,
    Resource: Resource,
    PhotoView:PhotoView,
},{
    initialRouteName: "Login",
}))

export default MainStack;