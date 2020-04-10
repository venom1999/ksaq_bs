import React, { Component } from 'react';
import Toast from 'react-native-whc-toast';
import Modal, {ModalTitle,SlideAnimation, ModalContent } from 'react-native-modals';
import {
    StyleSheet,
    Text,
    View,
    PixelRatio,
    Alert,
    TouchableOpacity,
    Image,
    Dimensions,
    ScrollView, BackHandler, ToastAndroid,

} from 'react-native';
import colors from "../../../../styles/colors";
import CircleButton from "../Component/CircleButton";
import CorrectOrWrongViewButton from "../Component/CorrectOrWrongViewButton";
import URL from "../../../Utils/URL";
import OVideo from "../Component/Ovideo";
import SQLite from "../util/SQLite";
var sqLite = new SQLite();
var db;
const {width, height} = Dimensions.get('window');


export default class errorQuestion extends Component {
    static navigationOptions = {
        title: '错题',
    };
    constructor(props) {
        super(props);
        this.state = {
            //选择的考试名称
            selected:'nn',
            visible: false,
            ExamArray: [],
            //标记的题目
            markArray: [],
            loaded: false,
            questionIndex: 0,
            questionNum: 0,
            committed: true,
            testName: '',
        };
        this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
            BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
        ) ;
    }
    componentDidMount(){
        this.state.testName = this.props.navigation.state.params.testName;
        this.getStorage();
        this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
            BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
        );
    }

    compennetDidUnmount(){
        //关闭数据库
        sqLite.close();
    }
    //监听返回键
    onBackButtonPressAndroid = () => {
        let {navigation} = this.props;
        if(this.state.visible === true ){
            this.setState({visible: false});
            return true;
        }else if (navigation.isFocused()) {
            if (this.lastPressAndroidBack && this.lastPressAndroidBack + 2000 >= Date.now()) {
                return false;
            }
            this.lastPressAndroidBack = Date.now();
            ToastAndroid.show('再按一次返回将退出错题', ToastAndroid.SHORT);
            return true;
        }
    } ;

    componentWillUnmount() {
        this._didFocusSubscription && this._didFocusSubscription.remove();
        this._willBlurSubscription && this._willBlurSubscription.remove();
    }
    getStorage() {
        if(!db){
            db = sqLite.open();
        }
        let params = this.props.navigation.state.params;
        let condtion = '';
        if (params.choosePress && params.multipleChoosePress && params.judgePress) {
             condtion = ' 2 or question_type = 1 or question_type = 3';
        }else if (params.choosePress && !params.multipleChoosePress && !params.judgePress) {
             condtion = ' 1';
        }else if (params.choosePress && !params.multipleChoosePress && params.judgePress) {
             condtion = ' 3 or question_type = 1';
        }else if (params.choosePress && params.multipleChoosePress && !params.judgePress) {
             condtion = ' 2 or question_type = 1';
        }else if (!params.choosePress && params.multipleChoosePress && !params.judgePress) {
             condtion = ' 2';
        }else if (!params.choosePress && params.multipleChoosePress && params.judgePress) {
             condtion = ' 2 or question_type = 3';
        }else if (!params.choosePress && !params.multipleChoosePress && params.judgePress) {
             condtion = ' 3';
        }
        if (params.testName === 'all') {
            sqLite.QueryData("select * from wrong_question_t where question_type =  "+condtion,null ,(resData)=>{
                //处理结果
                this.setState({
                    ExamArray: resData,
                    questionNum: resData.length,
                    loaded: true,
                    markArray: new Array(resData.length),
                })
            });
        } else {
            sqLite.QueryData("select * from wrong_question_t where test_name =? and (question_type = "+condtion+")" , this.state.testName,(resData)=>{
                //处理结果
                this.setState({
                    ExamArray: resData,
                    questionNum: resData.length,
                    loaded: true,
                    markArray: new Array(resData.length),
                })
            });
        }

    }

    toQuestion (index){
        console.log("第多少题："+index.toString());
        this.setState({questionIndex:index});
    }
    // onPress = (index, item)=> {
    //     this.setState({questionIndex: index});
    //     this.props.onPress ? this.props.onPress(index, item) : ()=> {
    //     }
    // }

    nextQuestion(){
        if(this.state.questionIndex===this.state.questionNum - 1){
            this.refs.toast.showCenter('已经是最后一题了', Toast.Duration.short, Toast.Position.center);
        }else{
            let number=this.state.questionIndex+1;
            this.setState(
                {questionIndex:number}
            )
        }
    }
    lastQuestion(){
        if(this.state.questionIndex === 0){
            this.refs.toast.showCenter('已经是第一题了', Toast.Duration.short, Toast.Position.center);
        }else{
            let number=this.state.questionIndex-1;
            this.setState(
                {questionIndex:number}
            )
        }
    }

    mkJudgeButtons(choose) {
        let select: '';
        switch (choose) {
            case '1':
                select = '对';
                break;
            case '0':
                select = '错';
                break;
        }
        //判断题已经交卷
        if (this.state.committed) {
            //此项为正确答案
            if (this.state.ExamArray[this.state.questionIndex].answer === choose) {
                return (
                    <CorrectOrWrongViewButton content_type={'judge'} select={select} correctOrWrong={true}/>
                )
                //此项为错误答案，并且选择此项
            } else if (this.state.ExamArray[this.state.questionIndex].wrong_answer === choose) {
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
                <View style={this.state.ExamArray[this.state.questionIndex].wrong_answer === choose ? styles.selectedTestViewStyle : styles.testViewStyle}>
                    <View style={{marginLeft:10}}>
                        <Text style={this.state.ExamArray[this.state.questionIndex].wrong_answer === choose ? styles.selectedOptionFont : styles.optionsFont}>{select}</Text>
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
    mkAnswerButtons(choose,question_type) {
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
        //单选题
        if(question_type === "1"){
            correctStandard = this.state.ExamArray[this.state.questionIndex].answer === choose;
        }
        //多选题
        else if(question_type === "2"){
            correctStandard = this.state.ExamArray[this.state.questionIndex].answer.indexOf(choose)!== -1;
        }

        let committedStandard = false;
        if((this.state.ExamArray[this.state.questionIndex].wrong_answer+'').indexOf(choose) !== -1 ){
            console.log(choose+'是选择项')
            committedStandard =true;
        }
        //已经交卷
        let optionString = select.replace(/<\/?.+?>/g,"");
        //此项为正确答案
        console.log('错误选项：'+this.state.ExamArray[this.state.questionIndex].wrong_answer);
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
                    <CorrectOrWrongViewButton souPath={souPath} choose={choose} content_type={'video'} option_string={optionString} correctOrWrong={true} onPress={() => {
                        this.ToFullScreen(encodeURI(souPath));
                    }}/>                )
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
                    <View
                        style={styles.testViewStyle}>
                        <Text style={styles.optionsFont}>{choose}. </Text>
                        <Image source={{uri: encodeURI(souPath)}}
                               style={{width: width - 100, height: 200, resizeMode: 'contain'}}/>
                    </View>
                )
            }
            if (select.indexOf("<video") !== -1 ) {
                console.log('videoPath:'+encodeURI(souPath))
                return (
                    <View
                        style={styles.testViewStyle}>
                        <Text style={ styles.optionsFont}>{choose}. </Text>
                        {/*<OVideo uri={encodeURI(souPath)} audioOrVideo={'video'} onPress={() => {*/}
                        {/*    this.ToFullScreen(encodeURI(souPath));}}/>*/}
                        <TouchableOpacity style={{width:100}} onPress={() => {
                            this.ToFullScreen(encodeURI(souPath));}}>
                            <Text style={{fontSize:18,color:'blue',textDecorationLine:'underline'}}>查看视频</Text>
                        </TouchableOpacity>
                    </View>
                )
            }
            if(select.indexOf("<audio") !== -1){
                console.log('audioPath:'+encodeURI(souPath))
                return (
                    <View
                        style={styles.testViewStyle}>
                        <Text style={styles.optionsFont}>{choose}. </Text>
                        <OVideo uri={encodeURI(souPath)} audioOrVideo={'audio'}/>
                    </View>
                )
            }
            return (
                <View style={styles.testViewStyle}>
                    <Text
                        style={styles.optionsFont}>{choose}.{optionString}</Text>
                </View>
            )
        }
    }
    //标记题目
    setMark() {
        if(this.state.markArray[this.state.questionIndex]){
            return(
                <Image source={require('../../../../image/onlineExam/mark.png')}
                       style={styles.ImageStyle}
                />
            )
        }else{
            return(
                <Image source={require('../../../../image/onlineExam/noMark.png')}
                       style={styles.ImageStyle}
                />
            )
        }

    }


    getAnswer(){
        let correctAnswer;
        let answer;
        let questionIndex = this.state.questionIndex;
        let explanation = this.state.ExamArray[questionIndex].explanation;
        console.log('---'+explanation)
        //判断题
        if(this.state.ExamArray[questionIndex].question_type === "3"){
            correctAnswer = this.state.ExamArray[questionIndex].answer === '0'?'错':'对';
            answer = this.state.ExamArray[questionIndex].wrong_answer === '0'?'错':'对';
        }else{
            correctAnswer = this.state.ExamArray[questionIndex].answer;
            answer = this.state.ExamArray[questionIndex].wrong_answer ;
        }
        return (
            <View style={{fontSize:18,marginLeft:20,marginRight:20,marginTop:20,marginButtom:20,backgroundColor: '#fafbfd'}}>
                <Text style={{fontSize: 18}}>{typeof(this.state.ExamArray[questionIndex].wrong_answer )!=='string'?'未回答此题':(this.state.ExamArray[questionIndex].wrong_answer ===this.state.ExamArray[questionIndex].answer?'答对了':'答错了')}</Text>
                <Text style={{fontSize: 18}}>参考答案：{correctAnswer}</Text>
                <Text style={{fontSize:18}}>您的回答：{answer}</Text>
                <Text style={{fontSize:18}}>答案解析：{explanation === null? '略':explanation}</Text>
            </View>
        )
    }

    render() {
        if (this.state.ExamArray.length === 0&&this.state.loaded) {
            return (
                <View style={styles.loadingContainer}>
                    <View style={styles.loading}>
                        <Text>没有此类型错题...</Text>
                    </View>
                </View>
            )
        }
        let newArray = this.state.ExamArray;
        let questionIndex = this.state.questionIndex;
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
        let optionABCD = ['A', 'B', 'C', 'D'];
        let judgeOption = ['1', '0'];
        let chooseButton = [];
        let question_content_view;
        let referenceAnswer = this.getAnswer();
        console.log('----------题目类型------'+this.state.ExamArray[questionIndex].question_type);
        switch (this.state.ExamArray[questionIndex].question_type) {
            //单选题
            case "1":
            //多选题
            case "2":
                for (let i = 0; i < 4; i++) {
                    chooseButton.push(
                        <TouchableOpacity
                            key={i}
                            onPress={() => {
                            }}
                        >{this.mkAnswerButtons(optionABCD[i], this.state.ExamArray[questionIndex].question_type)}
                        </TouchableOpacity>
                    )
                }
                break;
            //判断题
            case "3":
                for (let i = 0; i < 2; i++) {
                    chooseButton.push(
                        <TouchableOpacity
                            key={i}
                            onPress={() => {
                            }}
                        >{this.mkJudgeButtons(judgeOption[i])}
                        </TouchableOpacity>
                    )
                }
                break;
        }
        switch (this.state.ExamArray[questionIndex].question_type) {
            case "1":
                typeString = '单选题';
                break;
            case "2":
                typeString = '多选题';
                break;
            case "3":
                typeString = '判断题';
                break;
        }
        let content = this.state.ExamArray[questionIndex].question_content;
        let contentString = content.replace(/<\/?.+?>/g, "");
        if (content.indexOf("<img") !== -1 || content.indexOf("<video") !== -1 || content.indexOf("<audio") !== -1) {
            let sourcepath = content.match(/src="(.*?)"/)[0]
            sourcepath = sourcepath.substring(5, sourcepath.length - 1);
            let souPath = URL.ResourceUrl + sourcepath;
            if (content.indexOf("<img") !== -1) {
                console.log('imgPath:' + souPath)
                question_content_view = (
                    <View>
                        <Text style={styles.contentFont}>{questionIndex + 1}.{contentString}</Text>
                        <Image source={{uri: encodeURI(souPath)}}
                               style={{width: width - 100, height: 200, resizeMode: 'contain', marginLeft: 20}}/>
                    </View>
                )
            }
            if (content.indexOf("<video") !== -1) {
                console.log('videoPath:' + encodeURI(souPath))
                question_content_view = (
                    <View>
                        <Text style={styles.contentFont}>{questionIndex + 1}.{contentString}</Text>
                        <View style={{marginLeft: 20}}>
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
                        <Text style={styles.contentFont}>{questionIndex + 1}.{contentString}</Text>
                        <View style={{marginLeft: 20}}>
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
                            <Text
                                style={[styles.titleFont, {marginLeft: 5}]}>{questionIndex + 1}/{this.state.questionNum}</Text>
                        </View>
                    </View>
                    {question_content_view}
                    {chooseButton}
                    {referenceAnswer}
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
                        <Image source={require('../../../../image/onlineExam/last.png')}
                               style={styles.ImageStyle}
                        />
                        <Text style={{fontSize: 16}}>上一题</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.touchable}
                                      onPress={() => {
                                          let items = this.state.markArray;
                                          if (items[questionIndex] === null) {
                                              items[questionIndex] = true;
                                          } else {
                                              items[questionIndex] = !items[questionIndex];
                                          }
                                          console.log('标记状态' + items[questionIndex])
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
                                          this.setState({visible: true});
                                      }}
                    >
                        <Image source={require('../../../../image/onlineExam/02选题.png')}
                               style={styles.ImageStyle}
                        />
                        <Text style={{fontSize: 16}}>选题</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.touchable}
                                      onPress={() => {
                                          this.nextQuestion();
                                      }}
                    >
                        <Image source={require('../../../../image/onlineExam/next.png')}
                               style={styles.ImageStyle}
                        />
                        <Text style={{fontSize: 16}}>下一题</Text>
                    </TouchableOpacity>
                </View>
                <Modal
                    visible={this.state.visible}
                    onTouchOutside={() => {
                        this.setState({visible: false});
                    }}
                    modalAnimation={new SlideAnimation({
                        slideFrom: 'bottom',
                    })}
                    modalTitle={<ModalTitle title="请选择题号"/>}
                >
                    <ModalContent
                        style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', width: width}}>
                        {
                            //this.state.ExamArray
                            this.state.ExamArray.map((elem, index) => {
                                let btnStyle = {};
                                let textStyle = {};
                                let items = this.state.markArray;
                                let mark = items[index];
                                btnStyle = styles.wrongClickBtnStyle;
                                textStyle = styles.wrongStyle;

                                return (
                                    <CircleButton index={index + 1} key={index} isMark={mark} clickBtnStyle={btnStyle}
                                                  textStyle={textStyle} onPress1={() => {
                                        this.setState({visible: false});
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
}


const styles = StyleSheet.create({
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
        marginTop: 10,
        backgroundColor: '#fafbfd',
        marginLeft: 16,
        marginRight: 16,
        borderRadius: 5,
        borderColor: '#f2f3f5',
        borderWidth: 2 / PixelRatio.get(),
    },
    selectedTestViewStyle: {
        marginTop: 10,
        backgroundColor: '#F8F6F3',
        marginLeft: 16,
        marginRight: 16,
        borderRadius: 5,
        borderColor: '#BA9E83',
        borderWidth: 2 / PixelRatio.get(),
    },
    correctTestViewStyle: {
        flexDirection:'row',
        marginTop: 10,
        backgroundColor: '#ECF9F1',
        marginLeft: 16,
        marginRight: 16,
        borderRadius: 5,
        borderColor: '#ECF9F1',
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
    correctOptionFont: {
        fontSize: 18,
        marginLeft: 20,
        marginTop: 10,
        marginBottom: 10,
        paddingRight: 24,
        color: '#3DC076'
    },
    wrongOptionFont: {
        fontSize: 18,
        marginLeft: 20,
        marginTop: 10,
        marginBottom: 10,
        paddingRight: 24,
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
        width: width / 10,
        height: width / 10,
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
});



