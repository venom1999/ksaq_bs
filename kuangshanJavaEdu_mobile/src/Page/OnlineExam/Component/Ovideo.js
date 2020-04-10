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
    StatusBar
} from 'react-native';

const width=Dimensions.get('window').width;
const height=Dimensions.get('window').height;
import Video from 'react-native-video';
import Orientation from 'react-native-orientation';
import Slider from '@react-native-community/slider';
export default class OVideo extends Component<> {
    static navigationOptions = ({ navigation }) => ({
        title: `${navigation.state.params.tittle}`,
        headerShown: false
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
            paused: true,
            ignoreSilentSwitch: null,
            isBuffering: false,
            uri:'https://media.w3.org/2010/05/sintel/trailer.mp4',
            showPlayButton: false
        };

        this.onLoad = this.onLoad.bind(this);
        this.onLoadStart = this.onLoadStart.bind(this);
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

        Orientation.addOrientationListener(this._updateOrientation);
        Orientation.addSpecificOrientationListener(this._updateSpecificOrientation);
    }

    componentWillUnmount() {
        Orientation.removeOrientationListener(this._updateOrientation);
        Orientation.removeSpecificOrientationListener(this._updateSpecificOrientation);
        Orientation.lockToPortrait();
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
    }

    onLoad(data) {
        //视频总长度
        this.setState({
            duration: data.duration,
            showPlayButton:true});
    }
    onLoadStart(data){
        this.setState({
            showPlayButton:false
        })
    }

    onProgress(data) {
        //播放进度
        this.setState({currentTime: data.currentTime});
    }

    onBuffer({ isBuffering }: { isBuffering: boolean }) {
        this.setState({ isBuffering });
    }

    getCurrentTimePercentage() {
        if (this.state.currentTime > 0) {
            return parseFloat(this.state.currentTime) / parseFloat(this.state.duration);
        } else {
            return 0;
        }
    }
    getAudioTimeString(seconds){
        const h = parseInt(seconds/(60*60));
        const m = parseInt(seconds%(60*60)/60);
        const s = parseInt(seconds%60);

        return ((h<10?'0'+h:h) + ':' + (m<10?'0'+m:m) + ':' + (s<10?'0'+s:s));
    }

    render() {
        // return this.renderNativeSkin();
        let playButton = this.state.showPlayButton?
            <TouchableOpacity
                onPress={()=>{
                    this.setState({
                        paused:!this.state.paused
                    })
                }}
            >
                {/*//播放暂停按钮判断*/}
                <Image source={this.state.paused?require('./resources/ui_play.png'):require('./resources/ui_pause.png')} style={{marginLeft:5,marginRight:5,width:25,height:25}}/>
            </TouchableOpacity>
            :<Image source={require('../../../../image/onlineExam/loading.gif')} style={{marginLeft:5,marginRight:5,width:25,height:25}}/>;
        const videoStyle = styles.fullScreen;
        let currentTimeString = this.getAudioTimeString(this.state.currentTime)
        let TotalTimeString = this.getAudioTimeString(this.state.duration)
        const { init, orientation, specificOrientation } = this.state;
        let ViewStyle = '';
        let fullScreenButton;
        if(this.props.audioOrVideo === 'audio'){
            ViewStyle = {width:width*3/4,height:0,alignItems:'center',backgroundColor:'#000'}
        }else{ //视频
            ViewStyle = {width:width*3/4,height:height/5,alignItems:'center',backgroundColor:'#000'}
           fullScreenButton =(
               <TouchableOpacity
                   onPress={this.props.onPress}
               >
                   <Image source={require('./resources/ui_fullscreen.png')} style={{width:25,height:25,marginRight:10}}/>
               </TouchableOpacity>
           )
        }
        return (
            <View style={styles.container}>
                {/*//hidden:隐藏状态栏*/}
                <StatusBar
                    hidden={false}
                />
                <View>
                    <TouchableOpacity
                        // onPress={() => {this.setState({paused: !this.state.paused})}}
                        style={ViewStyle}>
                        <Video
                            ref={ref => this.player = ref}
                            //source={require('./video/movie.mp4')} //本地视频
                            source={{uri:this.props.uri}}
                            style={styles.fullScreen}
                            rate={this.state.rate}
                            paused={this.state.paused}
                            volume={this.state.volume}
                            muted={this.state.muted}
                            ignoreSilentSwitch={this.state.ignoreSilentSwitch}
                            //resizeMode={this.state.resizeMode}//视频尺寸设置
                            resizeMode="contain"
                            onBuffer={this.onBuffer}
                            onLoad={this.onLoad}                       // 当视频加载完毕时的回调函数
                            onLoadStart={this.onLoadStart}             // 当视频开始加载时的回调函数
                            onProgress={this.onProgress}
                            onEnd={(data) => this.onEnd(data)}
                            repeat={true}
                            controls={this.state.controls}
                        />
                    </TouchableOpacity>
                    <View style={{width:width*3/4,backgroundColor:'#898989',height:40,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>

                        {playButton}
                        <View style={{width: 60}}>
                            <Text style={{color:'#000',fontSize: 10}}>{currentTimeString}</Text>
                        </View>

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
                            <Text style={{color: '#000'.white,fontSize: 10}}>{this.getAudioTimeString(this.state.duration)}</Text>
                        </View>

                        {/*//全屏切换*/}
                        {fullScreenButton}

                    </View>
                </View>

            </View>
        );
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
