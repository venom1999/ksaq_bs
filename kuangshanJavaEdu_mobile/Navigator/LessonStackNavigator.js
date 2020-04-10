import {createStackNavigator} from 'react-navigation-stack'
import Lesson from "../src/OnlineStudy/Lesson";
import Resource from "../src/OnlineStudy/Ovideo";
import SectionListPage from "../src/OnlineStudy/SectionListPage";
import PhotoView from "../src/OnlineStudy/PhotoView";
// import LKHomeDetail from "./LKHomeDetail";
const LessonRootStack = createStackNavigator({
    Lesson: Lesson,
    Resource: Resource,
    PhotoView:PhotoView,

}, {
    initialRouteName: "Lesson",
    navigationOptions: ({navigation})=>({
        tabBarVisible: navigation.state.index === 0,
    })
},);

export default LessonRootStack;
