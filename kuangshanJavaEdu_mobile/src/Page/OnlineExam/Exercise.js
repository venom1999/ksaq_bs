import React, {Component} from 'react';
import Toast from 'react-native-whc-toast';
import Modal, {ModalTitle, SlideAnimation, ModalContent} from 'react-native-modals';
import {
    StyleSheet,
    Text,
    View,
    PixelRatio,
    Alert,
    TouchableOpacity,
    Image,
    Dimensions,
    ScrollView,
    ToastAndroid,
    BackHandler
} from 'react-native';
import colors from "../../../styles/colors";
import CircleButton from "./Component/CircleButton";
import HttpUtils from "../../Utils/HttpUtils";
import URL from "../../Utils/URL";
import OVideo from "../OnlineExam/Component/Ovideo";
import CorrectOrWrongViewButton from "./Component/CorrectOrWrongViewButton";
import { StackActions, NavigationActions } from 'react-navigation';
import SQLite from "./util/SQLite";

var sqLite = new SQLite();
var db;
const {width, height} = Dimensions.get('window');

export default class Exercise extends Component {
    _didFocusSubscription;
    _willBlurSubscription;
    constructor(props) {
        super(props);
        this.state = {
            //选择练习名称
            selectedExamID: '1',
            chooseQuestionVisible: false,
            quitVisible: false,
            //已经练习时长
            examTime: 0,
            //试卷数组
            ExamArray: [],
            //用户回答的答案
            commitArray: [],
            //多选题是否点击提交
            hasCommittedArray:[],
            //标记的题目
            markArray: [],
            //是否展开解析
            explanation: false,
            loaded: false,
            questionIndex: 0,
            questionNum: 0,
            hasWrong: false,

        };
        this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
            BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
        ) ;
    }
    compennetDidUnmount(){
        //关闭数据库
        sqLite.close();
    }
    componentDidMount() {
        const {navigation} = this.props;
        this.getExamData2();
        this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
            BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
        );
        //声明一个定时器
        this.timer = setInterval(
            () => {
                this._timeShow();
            },
            1000,
        );
        this.props.navigation.setParams({navigatePress:this.quit})
    }

    //监听返回键
    onBackButtonPressAndroid = () => {
        this.setState({
            quitVisible: true
        })
        return true;
    } ;

    formatDateTime() {
        let date = new Date();
        let y = date.getFullYear();
        let m = date.getMonth() + 1;
        m = m < 10 ? ('0' + m) : m;
        let d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        let h = date.getHours();
        h = h < 10 ? ('0' + h) : h;
        let minute = date.getMinutes();
        let second = date.getSeconds();
        minute = minute < 10 ? ('0' + minute) : minute;
        second = second < 10 ? ('0' + second) : second;
        return y  + m  + d  + h + minute;
    };
    componentWillUnmount() {
        this._didFocusSubscription && this._didFocusSubscription.remove();
        this._willBlurSubscription && this._willBlurSubscription.remove();
        clearTimeout(this.timer);
        this.setState = (state,callback)=>{
            return;
        };
        //开启数据库
        if(!db){
            db = sqLite.open();
        }
        //建表
        sqLite.createTable();
        //数据
        var wrongQuestionData = [];
        let examArray = this.state.ExamArray;
        const {navigation} = this.props;
        let time =Date.now();
        console.log('现在时间-----------------'+time);
        for (let i = 0; i < examArray.length; i++) {
            //存储错题
            if (!(this.state.commitArray[i] == null || this.state.commitArray[i] === '') && this.state.commitArray[i] !== examArray[i].answer) {
                let wrongQuestion = {edu_category_id: 1,
                    test_name: navigation.getParam('ExamNameString')+"-练习"+this.formatDateTime(),
                    question_content: examArray[i].question_content,
                    choose_a: examArray[i].choose_a,
                    choose_b: examArray[i].choose_b,
                    choose_c: examArray[i].choose_c,
                    choose_d: examArray[i].choose_d,
                    answer: examArray[i].answer,
                    wrong_answer: this.state.commitArray[i],
                    answer_time: time,
                    question_type: examArray[i].question_type,
                    explanation: examArray[i].explanation,
                    edu_category_name: navigation.getParam('ExamNameString')};
                    wrongQuestionData.push(wrongQuestion);
            }
        }
        sqLite.insertwrongQuestionData(wrongQuestionData);
    }

    getExamData2() {
        const {navigation} = this.props;
        let ExamArray = navigation.getParam('ExamArray')
        console.log('考试题目：'+JSON.stringify(ExamArray))
        this.setState({
            ExamArray: ExamArray,
            questionNum: ExamArray.length,
            loaded: true,
            commitArray: new Array(ExamArray.length),
            hasCommittedArray: new Array(ExamArray.length),
            markArray: new Array(ExamArray.length)
        })
    }
    quit =()=>{
        this.setState({
            quitVisible: true
        })
    }
    //设置头部导航相关内容
    static navigationOptions = ({navigation,screenProps}) => {
        const {params} = navigation.state;
        return ({
            title: params ? params.ExamNameString : '练习',
            headerStyle: {
                backgroundColor: '#0367e1'
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontSize: 18,
                fontWeight: 'bold',
            },
            headerLeft: ()=>(
                <TouchableOpacity style={styles.touchable}
                                  onPress={()=>navigation.state.params.navigatePress()}
                >
                    <Image source={require('../../../image/onlineExam/goback.png')} style={{resizeMode:'stretch',width: width /15,
                        height: width/15, marginLeft: 10}}/>
                </TouchableOpacity>
            )

        })

    };


    toQuestion(index) {
        console.log("第多少题：" + index.toString());
        this.setState({questionIndex: index});
    }

    // onPress = (index, item) => {
    //     this.setState({questionIndex: index});
    //     this.props.onPress ? this.props.onPress(index, item) : () => {
    //     }
    // }

    nextQuestion() {
        if (this.state.questionIndex === this.state.questionNum - 1) {
            this.refs.toast.showCenter('已经是最后一题了', Toast.Duration.short, Toast.Position.center);
        } else {
            let number = this.state.questionIndex + 1;
            this.setState(
                {questionIndex: number}
            )
        }
    }

    lastQuestion() {
        if (this.state.questionIndex === 0) {
            this.refs.toast.showCenter('已经是第一题了', Toast.Duration.short, Toast.Position.center);
        } else {
            let number = this.state.questionIndex - 1;
            this.setState(
                {questionIndex: number}
            )
        }
    }

    mkJudgeButtons(choose,isCommitted) {
        let select: '';
        switch (choose) {
            case '1':
                select = '对';
                break;
            case '0':
                select = '错';
                break;
        }
        //已经提交
        if (isCommitted) {
            //此项为正确答案
            if (this.state.ExamArray[this.state.questionIndex].answer === choose) {
                return (
                    <CorrectOrWrongViewButton content_type={'judge'} select={select} correctOrWrong={true}/>
                )
                //此项为错误答案，并且选择此项
            } else if (this.state.commitArray[this.state.questionIndex] === choose) {
                return (
                    <CorrectOrWrongViewButton content_type={'judge'} select={select} correctOrWrong={false}/>
                )
            } else {
                return (
                    <View style={styles.testViewStyle}>
                        <View style={{marginLeft:10}}>
                            <Text style={styles.optionsFont}>{select}</Text>
                        </View>
                    </View>
                )
            }
        }else { //判断题未交卷
            return (
                <View
                    style={this.state.commitArray[this.state.questionIndex] === choose ? styles.selectedTestViewStyle : styles.testViewStyle}>
                    <View style={{marginLeft:10}}>
                        <Text style={this.state.commitArray[this.state.questionIndex] === choose ? styles.selectedOptionFont : styles.optionsFont}>{select}</Text>
                    </View>
                </View>
            )
        }
    }
    ToFullScreen(url){
        console.log("到这里了")
        this.props.navigation.push('fullScreenVideo',{
            someuri: url
        })
    }

    //question_type,1是单选题，2是多选题
    mkAnswerButtons(choose,question_type,isCommitted) {
        let select: ''
        switch (choose) {
            case 'A':
                select = this.state.ExamArray[this.state.questionIndex].choose_a;
                break;
            case 'B':
                select = this.state.ExamArray[this.state.questionIndex].choose_b;
                break;
            case 'C':
                select = this.state.ExamArray[this.state.questionIndex].choose_c;
                break;
            case 'D':
                select = this.state.ExamArray[this.state.questionIndex].choose_d;
                break;
        }

        let souPath = '';
        if(select.indexOf("<img") !== -1 || select.indexOf("<video") !== -1 || select.indexOf("<audio") !== -1) {
            let sourcepath = select.match(/src="(.*?)"/)[0]
            sourcepath = sourcepath.substring(5, sourcepath.length - 1);
            souPath = URL.ResourceUrl + sourcepath;
        }
        let correctStandard;
        //单选题选项正确的标准
        if(question_type === 1){
            correctStandard = this.state.ExamArray[this.state.questionIndex].answer === choose;
        }
        //多选题选项正确的标准
        else if(question_type === 2){
            correctStandard = this.state.ExamArray[this.state.questionIndex].answer.indexOf(choose)!== -1;
        }

        let committedStandard = false;
        if(this.state.commitArray[this.state.questionIndex]!==null){
            let string = this.state.commitArray[this.state.questionIndex]+'';
            if(string.indexOf(choose) !== -1){
                committedStandard =true;
            }
        }
        //已经交卷
        let optionString = select.replace(/<\/?.+?>/g,"");
        console.log("这是optionstring:"+optionString)
        if (isCommitted) {
            //此项为正确答案
            if (correctStandard) {
                if (select.indexOf("<img") !== -1) {
                    console.log('imgPath:' + souPath)
                    return (
                        <CorrectOrWrongViewButton souPath={souPath} choose={choose} content_type={'image'} option_string={optionString} correctOrWrong={true}/>
                    )
                }
                if (select.indexOf("<video") !== -1 ) {
                    console.log('videoPath:'+encodeURI(souPath))
                    return (
                        <CorrectOrWrongViewButton souPath={souPath} choose={choose} content_type={'video'} option_string={optionString} correctOrWrong={true}/>
                    )
                }
                if(select.indexOf("<audio") !== -1){
                    console.log('audioPath:'+encodeURI(souPath))
                    return (
                        <CorrectOrWrongViewButton souPath={souPath} choose={choose} content_type={'audio'} option_string={optionString} correctOrWrong={true}/>
                    )
                }
                return (
                    <CorrectOrWrongViewButton souPath={souPath} choose={choose} content_type={'text'} option_string={optionString} correctOrWrong={true}/>
                )
                //此项为错误答案，并且选择此项
            } else if (committedStandard) {
                if (select.indexOf("<img") !== -1) {
                    console.log('imgPath:' + souPath)
                    return (
                        <CorrectOrWrongViewButton souPath={souPath} choose={choose} content_type={'image'} option_string={optionString} correctOrWrong={false}/>
                    )
                }
                if (select.indexOf("<video") !== -1 ) {
                    console.log('videoPath:'+encodeURI(souPath))
                    return (
                        <CorrectOrWrongViewButton souPath={souPath} choose={choose} content_type={'video'} option_string={optionString} correctOrWrong={false} onPress={() => {
                            this.ToFullScreen(encodeURI(souPath));}}/>
                    )
                }
                if(select.indexOf("<audio") !== -1){
                    console.log('audioPath:'+encodeURI(souPath))
                    return (
                        <CorrectOrWrongViewButton souPath={souPath} choose={choose} content_type={'audio'} option_string={optionString} correctOrWrong={false}/>
                    )
                }
                return (
                    <CorrectOrWrongViewButton souPath={souPath} choose={choose} content_type={'text'} option_string={optionString} correctOrWrong={false}/>
                )
            } else { //其他选项
                if (select.indexOf("<img") !== -1) {
                    console.log('imgPath:' + souPath)
                    return (
                        <View style={styles.testViewStyle}>
                            <View style={{marginLeft:10}}>
                                <Text style={styles.optionsFont}>{choose}. {optionString}</Text>
                                <Image source={{uri: encodeURI(souPath)}}
                                       style={{width: width - 100, height: 200, resizeMode: 'contain'}}/>
                            </View>
                        </View>
                    )
                }
                if (select.indexOf("<video") !== -1 ) {
                    console.log('videoPath:'+encodeURI(souPath))
                    return (
                        <View style={styles.testViewStyle}>
                            <View style={{marginLeft:10}}>
                                <Text style={ styles.optionsFont}>{choose}. {optionString}</Text>
                                {/*<OVideo uri={encodeURI(souPath)} audioOrVideo={'video'} onPress={() => {*/}
                                {/*    this.ToFullScreen(encodeURI(souPath));}}/>*/}
                                <TouchableOpacity style={{width:100}} onPress={() => {
                                    this.ToFullScreen(encodeURI(souPath));}}>
                                    <Text style={{fontSize:18,color:'blue',textDecorationLine:'underline'}}>查看视频</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                }
                if(select.indexOf("<audio") !== -1){
                    console.log('audioPath:'+encodeURI(souPath))
                    return (
                        <View style={styles.testViewStyle}>
                            <View style={{marginLeft:10}}>
                                <Text style={styles.optionsFont}>{choose}. {optionString}</Text>
                                <OVideo uri={encodeURI(souPath)} audioOrVideo={'audio'} />
                            </View>
                        </View>
                    )
                }
                return (
                    <View style={styles.testViewStyle}>
                        <View style={{marginLeft:10}}>
                            <Text style={styles.optionsFont}>{choose}. {optionString}</Text>
                        </View>
                    </View>
                )
            }
        } else { //未交卷
            if (select.indexOf("<img") !== -1) {
                console.log('imgPath:' + souPath)
                return (
                    <View style={committedStandard ? styles.selectedTestViewStyle : styles.testViewStyle}>
                        <View style={{marginLeft:10}}>
                            <Text style={this.state.commitArray[this.state.questionIndex] === choose ? styles.selectedOptionFont : styles.optionsFont}>{choose}. {optionString} </Text>
                            <Image source={{uri: encodeURI(souPath)}}
                                   style={{width: width - 100, height: 200, resizeMode: 'contain'}}/>
                        </View>
                    </View>
                )
            }
            if (select.indexOf("<video") !== -1 ) {
                console.log('videoPath:'+encodeURI(souPath))
                return (
                    <View
                        style={committedStandard ? styles.selectedTestViewStyle : styles.testViewStyle}>
                        <View style={{marginLeft:10}}>
                            <Text style={this.state.commitArray[this.state.questionIndex] === choose ? styles.selectedOptionFont : styles.optionsFont}>{choose}. {optionString}  </Text>
                            {/*<OVideo uri={encodeURI(souPath)} audioOrVideo={'video'} onPress={() => {*/}
                            {/*    this.ToFullScreen(encodeURI(souPath));}}/>*/}
                            <TouchableOpacity style={{width:100}} onPress={() => {
                                this.ToFullScreen(encodeURI(souPath));}}>
                                <Text style={{fontSize:18,color:'blue',textDecorationLine:'underline'}}>查看视频</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )
            }
            if(select.indexOf("<audio") !== -1){
                console.log('audioPath:'+encodeURI(souPath))
                return (
                    <View
                        style={committedStandard ? styles.selectedTestViewStyle : styles.testViewStyle}>
                        <Text style={this.state.commitArray[this.state.questionIndex] === choose ? styles.selectedOptionFont : styles.optionsFont}>{choose}. {optionString} </Text>
                        <OVideo uri={encodeURI(souPath)} audioOrVideo={'audio'}/>
                    </View>
                )
            }
            return (
                <View
                    style={committedStandard ? styles.selectedTestViewStyle : styles.testViewStyle}>
                    <View style={{marginLeft:10}}>
                        <Text style={committedStandard ? styles.selectedOptionFont : styles.optionsFont}>{choose}. {optionString} </Text>
                    </View>
                </View>
            )
        }
    }
    setMark() {
        if(this.state.markArray[this.state.questionIndex]){
            return(
                <Image source={require('../../../image/onlineExam/mark.png')}
                       style={styles.ImageStyle}
                />
            )
        }else{
            return(
                <Image source={require('../../../image/onlineExam/noMark.png')}
                       style={styles.ImageStyle}
                />
            )
        }

    }
    setExplanation(){
        if(this.state.explanation){
            return(
                <Image source={require('../../../image/onlineExam/bulb_light.png')}
                       style={styles.ImageStyle}
                />
            )
        }else{
            return(
                <Image source={require('../../../image/onlineExam/bulb_black.png')}
                       style={styles.ImageStyle}
                />
            )
        }
    }

    _timeShow = () => {

        // this.state.examTime 是需要倒计时的总数，单位是 秒
        let timeDown = this.state.examTime;
        //初始化小时，分钟和秒
        let hour = 0;

        let minute = 0;
        // 初始化秒
        let second = 0;
        //总数-1
        timeDown = timeDown + 1;
        //如果总数到0，则关闭定时器
        if (this.state.examTime === -1) {
            //关闭定时器
            clearTimeout(this.timer);
        } else {
            //修改state，渲染页面
            this.setState({
                examTime: timeDown,
            });
        }
    }

    transformTime(seconds, type) {

        const day = Math.floor(seconds / 3600 / 24);
        const hour = Math.floor((seconds - day * 24 * 3600) / 3600);
        const minute = Math.floor((seconds - day * 24 * 3600 - hour * 3600) / 60);
        const second = Math.floor(
            seconds - day * 24 * 3600 - hour * 3600 - minute * 60
        );
        if (type === "day") {
            return day;
        } else if (type === "hour") {
            return hour < 10 ? `0${hour}` : hour;
        } else if (type === "minute") {
            return minute < 10 ? `0${minute}` : minute;
        } else {
            return second < 10 ? `0${second}` : second;
        }
    }

    getAnswer(){
            let correctAnswer;
            let answer;
            let questionIndex = this.state.questionIndex;
            //判断题
            if(this.state.ExamArray[questionIndex].question_type === 3){
                correctAnswer = this.state.ExamArray[questionIndex].answer === '0'?'错':'对';
                answer = this.state.commitArray[questionIndex] === '0'?'错':'对';
            }else{
                correctAnswer = this.state.ExamArray[questionIndex].answer;
                answer = this.state.commitArray[questionIndex];
            }
            return (
                <View style={{fontSize:18,marginLeft:20,marginRight:20,marginTop:20,marginButtom:20,backgroundColor: '#fafbfd'}}>
                    <Text style={{fontSize: 18}}>{typeof(this.state.commitArray[questionIndex])!=='string'?'未回答此题':(this.state.commitArray[questionIndex]===this.state.ExamArray[questionIndex].answer?'答对了':'答错了')}</Text>
                    <Text style={{fontSize: 18}}>参考答案：{correctAnswer}</Text>
                    <Text style={{fontSize:18}}>您的回答：{answer}</Text>
                </View>
            )
    }

    render() {
        let questionIndex = this.state.questionIndex;
        let isCommitted = false;
        if (!this.state.loaded) {
            return (
                <View style={styles.loadingContainer}>
                    <View style={styles.loading}>
                        <Text>加载中...</Text>
                    </View>
                </View>
            )
        }
        let typeString = '';
        let optionABCD=['A','B','C','D'];
        let judgeOption = ['1','0'];
        let chooseButton =[];
        let confirmButton;
        let question_content_view;
        let referenceAnswer;
        let explain;
        let explanationString;
        if(typeof(this.state.ExamArray[questionIndex].explanation) === 'string'){
            explanationString = this.state.ExamArray[questionIndex].explanation;
        }else{
            explanationString = '略';
        }

            explain = (
                <Text style={{fontSize:18,marginLeft:20,marginRight:20,marginTop:20,backgroundColor: '#fafbfd',
                    borderRadius: 5,
                    borderColor: '#f2f3f5',
                    borderWidth: 2 / PixelRatio.get()}}>题目详解：{explanationString}</Text>
            )


        switch(this.state.ExamArray[questionIndex].question_type){
            //单选题
            case 1:
                if(this.state.commitArray[this.state.questionIndex] == null || this.state.commitArray[this.state.questionIndex] === ''){
                    isCommitted = false;
                }else{
                    isCommitted = true;
                    referenceAnswer = this.getAnswer();
                }
            //多选题
            case 2:
                if(this.state.ExamArray[questionIndex].question_type === 2){
                    if(this.state.hasCommittedArray[this.state.questionIndex]){
                        isCommitted = true;
                        referenceAnswer = this.getAnswer();
                    }else{
                        isCommitted = false;
                    };
                confirmButton = (
                    <TouchableOpacity
                        style={{flexDirection:'row',
                            width:100,
                            justifyContent:'center',
                            alignSelf:'center',
                            marginTop: 10,
                            backgroundColor: '#BA9E83',
                            borderRadius: 5,
                            borderColor: '#BA9E83',
                            borderWidth: 2 / PixelRatio.get(),}}

                        onPress={()=>{
                            let items = this.state.hasCommittedArray;
                            items[this.state.questionIndex] = true;
                            this.setState({
                                hasCommittedArray: items
                            });
                        }}>
                        <Text style={{color:'#fff',fontSize:20}}>确定</Text>
                    </TouchableOpacity>
                )}
                for(let i=0;i<4;i++){
                    chooseButton.push(
                        <TouchableOpacity
                            key = {i}
                            onPress={() => {
                                if (!isCommitted) {
                                    let items = this.state.commitArray;
                                    //单选题
                                    if(this.state.ExamArray[questionIndex].question_type === 1){
                                        items[questionIndex] = optionABCD[i];
                                    }
                                    //多选题
                                    else if(this.state.ExamArray[questionIndex].question_type === 2){

                                        let answerString = items[questionIndex] + '';
                                        //已选项中有答案
                                        if (answerString.indexOf('A') !== -1 || answerString.indexOf('B') !== -1 || answerString.indexOf('C') !== -1 || answerString.indexOf('D') !== -1) {
                                            //已选项不包含此选项
                                            if (answerString.indexOf(optionABCD[i]) === -1) {
                                                answerString = answerString + optionABCD[i];
                                                console.log('点击了，选择了11 ' + answerString)
                                            }
                                            //已选项包含了此选项
                                            else {
                                                answerString = answerString.replace(optionABCD[i], '');

                                            }
                                            answerString = Array.from(answerString).sort().join("")
                                            items[questionIndex] = answerString;
                                            console.log('选择了' + answerString)
                                        } else {
                                            console.log('点击了，选择了33 ' + optionABCD[i])
                                            items[questionIndex] = optionABCD[i];
                                        }
                                    }
                                    this.setState({
                                        commitArray: items
                                    });
                                    console.log("题目：" + (questionIndex + 1) + " 回答：" + this.state.commitArray[questionIndex])
                                }
                            }}
                        >{this.mkAnswerButtons(optionABCD[i],this.state.ExamArray[questionIndex].question_type,isCommitted)}
                        </TouchableOpacity>
                    )
                }
                break;
            //判断题
            case 3:
                if(this.state.commitArray[this.state.questionIndex] == null || this.state.commitArray[this.state.questionIndex] === ''){
                    isCommitted = false;
                }else{
                    isCommitted = true;
                    referenceAnswer = this.getAnswer();
                }
                for(let i=0;i<2;i++){
                    chooseButton.push(
                        <TouchableOpacity
                            key = {i}
                            onPress={() => {
                                if (!isCommitted) {
                                    let items = this.state.commitArray;
                                    items[questionIndex] = judgeOption[i];
                                    this.setState({
                                        commitArray: items
                                    });
                                    console.log("题目：" + (questionIndex + 1) + " 回答：" + this.state.commitArray[questionIndex])
                                }
                            }}
                        >{this.mkJudgeButtons(judgeOption[i],isCommitted)}
                        </TouchableOpacity>
                    )
                }
                break;
        }
        switch(this.state.ExamArray[questionIndex].question_type){
            case 1:typeString='单选题';break;
            case 2:typeString='多选题';break;
            case 3: typeString='判断题';break;
        }
        let content = this.state.ExamArray[questionIndex].question_content;
        let contentString = content.replace(/<\/?.+?>/g,"").replace("&nbsp;"," ");
        if (content.indexOf("<img") !== -1 || content.indexOf("<video") !== -1 || content.indexOf("<audio") !== -1) {
            let sourcepath = content.match(/src="(.*?)"/)[0]
            sourcepath = sourcepath.substring(5, sourcepath.length - 1);
            let souPath = URL.ResourceUrl + sourcepath;
            if (content.indexOf("<img") !== -1) {
                console.log('imgPath:' + souPath)
                question_content_view =(
                    <View>
                        <Text style={styles.contentFont}>{questionIndex+1}.{contentString}</Text>
                        <Image source={{uri: encodeURI(souPath)}}
                               style={{width: width - 100, height: 200, resizeMode: 'contain',marginLeft:20}}/>
                    </View>
                )
            }
            if (content.indexOf("<video") !== -1) {
                console.log('videoPath:' + encodeURI(souPath))
                question_content_view = (
                    <View>
                        <Text style={styles.contentFont}>{questionIndex+1}.{contentString}</Text>
                        <View style={{marginLeft:20}}>
                            {/*<OVideo uri={encodeURI(souPath)} audioOrVideo={'video'} onPress={() => {*/}
                            {/*    this.ToFullScreen(encodeURI(souPath));}}/>*/}
                            <TouchableOpacity style={{width:100}} onPress={() => {
                                this.ToFullScreen(encodeURI(souPath));}}>
                                <Text style={{fontSize:18,color:'blue',textDecorationLine:'underline'}}>查看视频</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )
            }
            if (content.indexOf("<audio") !== -1) {
                console.log('audioPath:' + encodeURI(souPath))
                question_content_view = (
                    <View>
                        <Text style={styles.contentFont}>{questionIndex+1}.{contentString}</Text>
                        <View style={{marginLeft:20}}>
                            <OVideo uri={encodeURI(souPath)} audioOrVideo={'audio'}/>
                        </View>
                    </View>
                )
            }
        } else {
            question_content_view = (
                <View>
                    <Text style={styles.contentFont}>{questionIndex + 1}.{contentString}</Text>
                </View>
            )
        }

        return (
            <View style={{flex: 1, backgroundColor: '#fff'}}>
                <ScrollView style={styles.container}>
                    <View style={styles.title}>
                        <View style={styles.titleLeft}>
                            <View style={{width: 4, height: 30, backgroundColor: 'steelblue'}}/>
                            <Text style={[styles.titleFont, {marginLeft: 3}]}>{typeString}</Text>
                            <Text style={[styles.titleFont, {marginLeft: 5}]}>{questionIndex + 1}/{this.state.questionNum}</Text>
                        </View>
                        <View style={styles.titleRight}>
                            <Image source={require('../../../image/onlineExam/timer.png')} style={{marginRight: 5}}/>
                            <View className="desc-card">
                                <View style={{flexDirection:'row'}}>
                                    <Text style={styles.text}>
                                        {this.transformTime(this.state.examTime,'hour')}:{this.transformTime(this.state.examTime,'minute')}:{this.transformTime(this.state.examTime,'second')}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    {question_content_view}
                    {chooseButton}
                    {confirmButton}
                    {isCommitted?referenceAnswer:null}
                    {this.state.explanation?explain:null}
                    <Text></Text>
                </ScrollView>
                <View style={{
                    height: height * (1 / 10),
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                    marginLeft: 20,
                    marginRight: 20,
                    backgroundColor: '#fff'
                }}>
                    <TouchableOpacity style={styles.touchable}
                                      onPress={() => {
                                          this.lastQuestion()
                                      }}
                    >
                        <Image source={require('../../../image/onlineExam/last.png')}
                               style={styles.ImageStyle}
                        />
                        <Text style={{fontSize: 16}}>上一题</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.touchable}
                                      onPress={() => {
                                          let items = this.state.markArray;
                                          if(items[questionIndex] === null){
                                              items[questionIndex] = true;
                                          }else{
                                              items[questionIndex] = !items[questionIndex];
                                          }
                                          console.log('标记状态'+items[questionIndex])
                                          this.setState({
                                              markArray: items
                                          });
                                      }}
                    >{
                        this.setMark()
                    }
                        <Text style={{fontSize: 16}}>标记</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.touchable}
                                      onPress={() => {
                                          let items = !this.state.explanation;
                                          this.setState({
                                              explanation: items,
                                          });
                                      }}
                    >{
                        this.setExplanation()
                    }
                        <Text style={{fontSize: 16}}>展开解析</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.touchable}
                                      onPress={() => {
                                          this.setState({chooseQuestionVisible: true});
                                      }}
                    >
                        <Image source={require('../../../image/onlineExam/02选题.png')}
                               style={styles.ImageStyle}
                        />
                        <Text style={{fontSize: 16}}>选题</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.touchable}
                                      onPress={() => {
                                          this.nextQuestion();
                                      }}
                    >
                        <Image source={require('../../../image/onlineExam/next.png')}
                               style={styles.ImageStyle}
                        />
                        <Text style={{fontSize: 16}}>下一题</Text>
                    </TouchableOpacity>
                </View>
                <Modal
                    visible={this.state.quitVisible}
                    onTouchOutside={() => {
                        this.setState({quitVisible: false});
                    }}
                    modalAnimation={new SlideAnimation({
                        slideFrom: 'bottom',
                    })}
                    modalTitle={<ModalTitle title="提示"/>}
                >
                    <ModalContent style={{flexDirection: 'column', justifyContent: 'center',width:width,alignItems:'center'}}>
                        <TouchableOpacity style={{flexDirection:'column',
                            justifyContent:'center',
                            alignSelf:'center',
                            marginTop: 10,}}
                            onPress={() => {
                               this.storeError();
                            }}>
                            <Text style={{color:'blue',fontSize:20}}>查看本次错题</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{flexDirection:'column',
                            justifyContent:'center',
                            alignSelf:'center',
                            marginTop: 10,}}
                            onPress={() => {
                            this.setState({
                                questionIndex:0,
                                quitVisible:false
                            })
                        }}>
                            <Text style={{color:'blue',fontSize:20}}>回顾本次练习</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignSelf: 'center',
                            marginTop: 10,
                        }}
                                          onPress={() => {
                                              this.setState({
                                                  quitVisible:false
                                              })
                                              this.props.navigation.goBack();
                                          }}
                        >
                            <Text style={{color: 'blue', fontSize: 20}}>退出本次练习</Text>
                        </TouchableOpacity>
                    </ModalContent>
                </Modal>
                <Modal
                    visible={this.state.chooseQuestionVisible}
                    onTouchOutside={() => {
                        this.setState({chooseQuestionVisible: false});
                    }}
                    modalAnimation={new SlideAnimation({
                        slideFrom: 'bottom',
                    })}
                    modalTitle={<ModalTitle title="请选择题号"/>}
                >
                    <ModalContent style={{flexDirection: 'row', flexWrap: 'wrap',width:width, justifyContent: 'flex-start'}}>
                        {
                            //this.state.ExamArray
                            this.state.ExamArray.map((elem, index) => {
                                let btnStyle = {};
                                let textStyle = {};
                                let items = this.state.markArray;
                                let mark=items[index];
                                //没有回答
                                if (this.state.commitArray[index] == null || this.state.commitArray[index] === '') {
                                    btnStyle = styles.noAnswerClickBtnStyle;
                                    textStyle = styles.noAnswerStyle;
                                } else {
                                        //答对了
                                        if(this.state.commitArray[index]===this.state.ExamArray[index].answer){
                                            btnStyle = styles.correctClickBtnStyle;
                                            textStyle = styles.correctStyle;
                                        }else{
                                            btnStyle = styles.wrongClickBtnStyle;
                                            textStyle = styles.wrongStyle;
                                        }
                                }
                                return (
                                    <CircleButton index={index + 1} key={index} isMark={mark} clickBtnStyle={btnStyle}
                                                  textStyle={textStyle} onPress1={() => {
                                        this.setState({chooseQuestionVisible: false});
                                        this.toQuestion(index)
                                    }}/>
                                )
                            })
                        }
                    </ModalContent>
                </Modal>

                <Toast ref="toast"/>
            </View>
        );
    }

    storeError(){
        this.setState({
            quitVisible: false
        });
        let examArray = this.state.ExamArray;
        let wrongNum = 0;
        let errorQuestionArray =[];
        let newCommitArray = [];
        for (let i = 0; i < examArray.length; i++) {
            //存储错题
            if (!(this.state.commitArray[i] == null || this.state.commitArray[i] === '') && this.state.commitArray[i] !== examArray[i].answer) {
                wrongNum++;
                errorQuestionArray.push(examArray[i]);
                newCommitArray.push(this.state.commitArray[i]);
            }
        }
        console.log("存的错题222" + JSON.stringify(errorQuestionArray));

        if(errorQuestionArray.length === 0){
            this.refs.toast.showCenter('没有错题哦~', Toast.Duration.short, Toast.Position.center);
        }else{
            console.log("存的错" + JSON.stringify(errorQuestionArray));
            this.setState({
                quitVisible: false,
                commitArray: newCommitArray,
                ExamArray: errorQuestionArray,
                questionNum: errorQuestionArray.length,
                hasCommittedArray: new Array(errorQuestionArray.length),
                markArray: new Array(errorQuestionArray.length),
                questionIndex:0
            });
        }

    }
}

const styles = StyleSheet.create({
    timeContainer:{
        flexDirection: 'row'
    },
    text:{
        color:'#f9821f',
        fontSize:20
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    testViewStyle: {
        flexDirection:'column',
        marginTop: 10,
        backgroundColor: '#fafbfd',
        marginLeft: 16,
        marginRight: 16,
        borderRadius: 5,
        borderColor: '#f2f3f5',
        borderWidth: 2 / PixelRatio.get(),
    },
    selectedTestViewStyle: {
        flexDirection:'column',
        marginTop: 10,
        backgroundColor: '#F8F6F3',
        marginLeft: 16,
        marginRight: 16,
        borderRadius: 5,
        borderColor: '#BA9E83',
        borderWidth: 2 / PixelRatio.get(),
    },

    wrongTestViewStyle: {
        flexDirection:'row',
        marginTop: 10,
        backgroundColor: '#FEECED',
        marginLeft: 16,
        marginRight: 16,
        borderRadius: 5,
        borderColor: '#FEECED',
        borderWidth: 2 / PixelRatio.get(),
    },
    container: {
        height: height * (9 / 10),
        borderRadius: 5,
        backgroundColor: '#fff',
        marginBottom: 10
    },
    title: {
        height: 63,
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingTop: 10,
        borderBottomWidth: 3 / PixelRatio.get(),
        borderColor: '#efefef'
    },
    titleLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10
    },
    titleRight: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginRight: 10
    },
    titleFont: {
        color: '#0367e1',
        fontSize: 18,
        fontWeight: 'bold',
    },
    contentFont: {
        color: '#000',
        fontSize: 18,
        margin: 20
    },

    optionsFont: {
        fontSize: 18,
        marginLeft: 20,
        marginTop: 10,
        marginBottom: 10
    },
    selectedOptionFont: {
        fontSize: 18,
        marginLeft: 20,
        marginTop: 10,
        marginBottom: 10,
        color: '#BA9E83'
    },

    wrongOptionFont: {
        fontSize: 18,
        marginLeft: 20,
        marginTop: 10,
        marginBottom: 10,
        marginRight: 20,
        color: '#F5444B'
    },
    btn: {
        width: 100,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    btnText: {
        fontSize: 18
    },
    options: {backgroundColor: "#FFFFFF"},
    continueButton: {backgroundColor: colors.tan},
    rightAnswer: {backgroundColor: colors.green},
    wrongAnswer: {backgroundColor: colors.pink},
    ImageStyle: {
        width: width /15,
        height: width/15,
        resizeMode: 'contain'
    },
    touchable: {
        alignItems: 'center'

    },
    textStyle: {
        fontSize: 18,
        color: '#BA9E83'
    },
    noAnswerStyle: {
        fontSize: 18,
        color: '#afafaf'
    },
    clickBtnStyle: {
        flexDirection:'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: width / 8,
        height: width / 8,
        backgroundColor: '#F8F6F3',
        borderRadius: width / 3,
        borderWidth: 1,
        borderColor: '#BA9E83',
        marginRight: width / 80,
        marginLeft: width / 80,
        marginTop: 5
    },
    noAnswerClickBtnStyle: {
        flexDirection:'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: width / 8,
        height: width / 8,
        backgroundColor: '#fefefe',
        borderRadius: width / 3,
        borderWidth: 1,
        borderColor: '#efefef',
        marginLeft: width / 80,
        marginRight: width / 80,
        marginTop: 5
    },
    imageOptionStyle:{
        width:width/10,
        height:width/10,
    },
    correctStyle: {
        fontSize: 18,
        color:  '#3DC076'
    },
    wrongStyle: {
        fontSize: 18,
        color: '#F5444B'
    },
    wrongClickBtnStyle:{
        flexDirection:'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: width / 8,
        height: width / 8,
        backgroundColor: '#FEECED',
        borderRadius: width / 3,
        borderWidth: 1,
        borderColor: '#FEECED',
        marginLeft: width / 80,
        marginRight: width / 80,
        marginTop: 5
    },
    correctClickBtnStyle: {
        flexDirection:'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: width / 8,
        height: width / 8,
        backgroundColor: '#ECF9F1',
        borderRadius: width / 3,
        borderWidth: 1,
        borderColor: '#ECF9F1',
        marginLeft: width / 80,
        marginRight: width / 80,
        marginTop: 5
    },
});


