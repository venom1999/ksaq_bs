import React, { Component } from 'react';
import {
    Alert,
    AppRegistry,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    Dimensions,
    Slider,
    StatusBar,
    AppState,
    Button,
    BackHandler,
} from 'react-native';
const width=Dimensions.get('window').width;
const height=Dimensions.get('window').height;
import Video from 'react-native-video';
import Orientation from 'react-native-orientation';
import URL from "../../Utils/URL";
import HttpUtils from "../../Utils/HttpUtils";
import RNFS from "react-native-fs";
// import Slider from '@react-native-community/slider';
import SectionListPage from "./SectionListPage";
import AES from "../../Utils/AES";
import StorageUtils from "../../Utils/StorageUtils";
const headerHeight = 50;
export default class OVideo extends Component {
    static navigationOptions = ({ navigation }) => ({
        title: `${navigation.state.params.info.item.title.substring(0, navigation.state.params.info.item.title.lastIndexOf('.'))}`,
        headerStyle: { // 导航栏相关设置项, // 标题栏的样式
            height: headerHeight
        },
    });
    constructor(props) {
        super(props);
        this.player = null
        this.state={
            rate: 1,
            volume: 1,
            muted: false,
            resizeMode: 'contain',
            duration: 0.0,
            slideValue: 0.00,
            currentTime: 0,
            controls: false,
            paused: false,
            ignoreSilentSwitch: null,
            isBuffering: false,
            flag:true,
            uri: '',
            startTime: '',
            appState: AppState.currentState,
            empNum: '',
        };
        this.onLoad = this.onLoad.bind(this);
        this.onProgress = this.onProgress.bind(this);
        this.onBuffer = this.onBuffer.bind(this);
    }

    UNSAFE_componentWillMount() {
        const init = Orientation.getInitialOrientation();
        this.setState({
            init,
            orientation: init,
            specificOrientation: init,
        });

    }

    componentDidMount() {
        StorageUtils.get("empNum").then((row)=>{
            console.log(row)
            this.setState({ empNum:row });
        });
        const info = this.props.navigation.state.params.info;
        RNFS.exists(RNFS.ExternalDirectoryPath + '/' + info.item.title).then((res) => {
            if (res) {
                const uri = RNFS.ExternalDirectoryPath + '/' + info.item.title;
                this.setState({uri: uri});
            } else {
                const uri = URL.url + '/upload/OnlineResourceEdu/' + info.section.resId + '/' + info.item.title;
                this.setState({uri: encodeURI(uri)});
            }
        });

        let time =  (new Date()).valueOf()
        this.startTime = time;
        //安卓监听返回按键
        // BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
        //监听状态（后台）
        AppState.addEventListener('change', this._handleAppStateChange);
        Orientation.addOrientationListener(this._updateOrientation);
        Orientation.addSpecificOrientationListener(this._updateSpecificOrientation);
    }

    componentWillUnmount() {
        this.computeStudyTime()
        Orientation.removeOrientationListener(this._updateOrientation);
        Orientation.removeSpecificOrientationListener(this._updateSpecificOrientation);
        Orientation.lockToPortrait();
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
        this.goBack();
    }
    postData(formdata) {
        fetch(URL.url + "/mobile/OnlineStudy/getStudyTime",
            {method: 'POST',
                body:formdata})
           .catch((error) => {
            console.error(error);
        });
    }
    goBack=()=> {
        let arr = [];
        const info = this.props.navigation.state.params.info;
        const edu_resource_id = info.section.resId;
        const upload_file_name = info.item.title;
        let time =  (new Date()).valueOf()
        let studyTime = (time - this.startTime) / 1000;
        arr.push({title:upload_file_name,resId:edu_resource_id,studyTime:studyTime})
        this.props.navigation.state.params.onGoBack(arr);
        this.props.navigation.goBack();
    }
    _getOrientation() {
        Orientation.getOrientation((err, orientation) => {
            Alert.alert(`Orientation is ${orientation}`);
        });
    }

    _getSpecificOrientation() {
        Orientation.getSpecificOrientation((err, orientation) => {
            Alert.alert(`Specific orientation is ${orientation}`);
        });
    }

    _updateOrientation = (orientation) => this.setState({ orientation });
    _updateSpecificOrientation = (specificOrientation) => this.setState({ specificOrientation });

    //以上为横向
    onEnd(data) {
        this.player.seek(0)
        this.setState({
            paused:true
        })
    }

    onLoad(data) {

        //视频总长度
        this.setState({duration: data.duration});
    }

    onProgress(data) {
        //播放进度
        this.setState({currentTime: data.currentTime});
    }

    onBuffer({ isBuffering }: { isBuffering: boolean }) {
        this.setState({ isBuffering });
    }

    getAudioTimeString(seconds){
        const h = parseInt(seconds/(60*60));
        const m = parseInt(seconds%(60*60)/60);
        const s = parseInt(seconds%60);

        return ((h<10?'0'+h:h) + ':' + (m<10?'0'+m:m) + ':' + (s<10?'0'+s:s));
    }
    renderNativeSkin() {
        const videoStyle = styles.fullScreen;
        let currentTimeString = this.getAudioTimeString(this.state.currentTime)
        const { init, orientation, specificOrientation } = this.state;
        return (
            <View style={styles.container}>
                {/*//hidden:隐藏状态栏*/}
                {/*<StatusBar*/}
                {/*    hidden={true}*/}
                {/*/>*/}

                    <TouchableOpacity
                        onPress={() => {this.setState({paused: !this.state.paused})}}
                        style={{
                            width:'100%',
                            flex:this.state.flag?13:9,
                            // height:this.state.flag?height-40:'90.4%',
                            paddingTop:headerHeight,
                            alignItems:'center',
                            backgroundColor:'#000'
                        }}>
                        <Video
                            ref={ref => this.player = ref}
                            source={{uri:this.state.uri}}
                            style={styles.fullScreen}
                            rate={this.state.rate}
                            paused={this.state.paused}
                            volume={this.state.volume}
                            muted={this.state.muted}
                            playInBackground={false}
                            ignoreSilentSwitch={this.state.ignoreSilentSwitch}
                            //resizeMode={this.state.resizeMode}//视频尺寸设置
                            resizeMode="contain"
                            onLoad={this.onLoad}
                            onBuffer={this.onBuffer}
                            onProgress={this.onProgress}
                            onEnd={(data) => this.onEnd(data)}
                            repeat={false}
                            controls={this.state.controls}
                        />
                    </TouchableOpacity>
                    <View style={{
                        width:'100%',
                        backgroundColor:'#898989',
                        // height:40,
                        flex:1,
                        flexDirection:'row',
                        justifyContent:'space-around',
                        alignItems:'center'}}>

                        <TouchableOpacity
                            onPress={()=>{
                                if(this.state.paused){
                                    this.setState({
                                        paused:false
                                    })
                                }else if(!this.state.paused) {
                                    this.setState({
                                        paused:true
                                    })
                                }
                            }}
                        >
                            {/*//播放暂停按钮判断*/}
                            <Image source={this.state.paused?require('../OnlineExam/Component/resources/ui_play.png'):require('../OnlineExam/Component/resources/ui_pause.png')} style={{marginLeft:5,width:25,height:25}}/>
                        </TouchableOpacity>

                        <View style={{width: 60}}>
                            <Text style={{color:'#000',fontSize: 15}}>{currentTimeString}</Text>
                        </View>
                        {/*<View style={{width: 35}}>*/}
                        {/*    <Text style={{color:'#000'}}>{this.state.currentTime.toFixed(0)}S</Text>*/}
                        {/*</View>*/}

                        {/*//Slider大家直接去官网查看就行，没有什么难度*/}

                        <Slider
                            style={styles.slider}
                            value={this.state.currentTime}
                            minimumValue={0}
                            maximumValue={this.state.duration}
                            minimumTrackTintColor='orange'
                            maximumTrackTintColor='#fff'
                            step={1}
                            onValueChange={value => {
                                console.log(value);
                                this.setState({currentTime: value})
                            }}
                            onSlidingComplete={value => this.player.seek(value)}
                        />

                        {/*//视频总时长*/}
                        <View style={{width: 60}}>
                            <Text style={{color: '#000'.white,fontSize: 15}}>{this.getAudioTimeString(this.state.duration)}</Text>
                        </View>

                        {/*<View style={{width: 35}}>*/}
                        {/*    <Text style={{color: '#000'.white, fontSize: 12}}>{this.state.duration.toFixed(0)}S</Text>*/}
                        {/*</View>*/}

                        {/*全屏切换*/}
                        <TouchableOpacity
                            onPress={()=>{
                                if(this.state.flag){
                                    this.setState({
                                        flag:false
                                    });
                                    Orientation.lockToLandscape()
                                }else if(!this.state.flag){
                                    this.setState({
                                        flag:true
                                    });
                                    Orientation.lockToPortrait()
                                }
                            }}
                        >
                            <Image source={require('../OnlineExam/Component/resources/ui_fullscreen.png')} style={{width:25,height:25,marginRight:10}}/>
                        </TouchableOpacity>

                    </View>


            </View>
        );
    }
    render() {
        return this.renderNativeSkin();
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    fullScreen: {
        position:'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
    buttonContainer: {
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    button: {
        padding: 5,
        margin: 5,
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 3,
        backgroundColor: 'grey',
    },
    slider: {
        flex: 1,
        width:'80%',
        height: 20
    },
    headerTitleStyle:{
        height: 20,
        borderColor: 'white',
    }
});
