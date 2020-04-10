import React, { Component, PropTypes } from 'react';
import {
    View,
    Text,
    TouchableHighlight,
    StyleSheet,
    ScrollView,
    ListView,
    Modal,
    TouchableOpacity, Dimensions,
    ActivityIndicator, CameraRoll, AppState, BackHandler,
} from 'react-native';
import RNFS from "react-native-fs";
import URL from "../../Utils/URL";
import ImageViewer from 'react-native-image-zoom-viewer';
import Orientation from "react-native-orientation";
import AES from "../../Utils/AES";
import StorageUtils from "../../Utils/StorageUtils";
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const {width, height} = Dimensions.get('window');
const empNum = StorageUtils.get("empNum");
export default class LookPhotoModal extends Component {
    static navigationOptions = ({ navigation }) => ({
        title: `${navigation.state.params.info.item.title.substring(0, navigation.state.params.info.item.title.lastIndexOf('.'))}`,
    });
    constructor(props) {
        super(props);
        this.state = {
            animating: true,
            uri: [],
            startTime: '',
            appState: AppState.currentState,
            images : [{
                url: ''
            }],
            empNum: ''
        };
        this.renderLoad = this.renderLoad.bind(this);
    }

    componentDidMount(){
        StorageUtils.get("empNum").then((row)=>{
            console.log(row)
            this.setState({ empNum:row });
        });
        const info = this.props.navigation.state.params.info;
        const uri = URL.url + '/upload/OnlineResourceEdu/' + info.section.resId + '/' + info.item.title;
        let arr = [];
        arr.push({'url':uri})
        this.setState({images: arr,animating:false});
        RNFS.exists(RNFS.ExternalDirectoryPath + '/' + info.item.title).then((res) => {
            if (res) {
                const uri = RNFS.ExternalDirectoryPath + '/' + info.item.title;
                this.setState({uri: uri,animating:false});
            } else {
                // const uri = URL.TestUrl + '/upload/OnlineResourceEdu/' + info.section.resId + '/' + info.item.title;
                // let arr = [];
                // arr.push({'url':uri})
                // this.setState({images: arr,animating:false});
            }
        });

        let time =  (new Date()).valueOf()
        this.startTime = time;

        //安卓监听返回按键
        BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
        //监听状态（后台）
        AppState.addEventListener('change', this._handleAppStateChange);
    }
    componentWillUnmount() {
        this.computeStudyTime();
        this.onBackButtonPressAndroid()
        AppState.removeEventListener('change', this._handleAppStateChange);
        BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    }

    _handleAppStateChange = (nextAppState) => {

        if (this.state.appState.match(/active/) && nextAppState === 'background') {
            this.computeStudyTime();
        } else if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            let time =  (new Date()).valueOf()
            this.startTime = time;
        }
        this.setState({appState: nextAppState});
    }

    onBackButtonPressAndroid = () => {
        let arr = [];
        const info = this.props.navigation.state.params.info;
        const edu_resource_id = info.section.resId;
        const upload_file_name = info.item.title;
        let time =  (new Date()).valueOf()
        let studyTime = (time - this.startTime) / 1000;
        arr.push({title:upload_file_name,resId:edu_resource_id,studyTime:studyTime})
        this.props.navigation.state.params.onGoBack(arr);
        return false;
    };
    computeStudyTime() {
        let time =  (new Date()).valueOf()
        let studyTime = (time - this.startTime) / 1000;
        console.log("本次学习时间："+studyTime+"秒")
        const info = this.props.navigation.state.params.info;
        const edu_resource_id = info.section.resId;
        const upload_file_name = info.item.title;
        let formdata = new FormData;
        formdata.append('empNum', AES.Encrypt(this.state.empNum));
        formdata.append('edu_resource_id', AES.Encrypt(edu_resource_id));
        formdata.append('upload_file_name', AES.Encrypt(upload_file_name));
        formdata.append('total_time', AES.Encrypt(studyTime));
        this.postData(formdata);
    }
    postData(formdata) {
        fetch(URL.url + "/mobile/OnlineStudy/getStudyTime",
            {method: 'POST',
                body:formdata})
            .catch((error) => {
                console.error(error);
            });
    }
    _Close() {

        this.props.cancel();
    }
    renderLoad() { //这里是写的一个loading
        return (
            <View style={{ marginTop: (screenHeight / 2) - 20 }}>
                <ActivityIndicator animating={this.state.animating} size={"large"} />
            </View>
        )
    }


    render() {
        console.log(this.state.images)
        return (
            <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}>
                    <ImageViewer
                        imageUrls={this.state.images} // 照片路径
                        enableImageZoom={true} // 是否开启手势缩放
                    />
            </View>

        );
    }

}
