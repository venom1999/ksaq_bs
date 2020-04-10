import React,{ Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    BackHandler,
    Dimensions, Alert, TextInput
} from 'react-native';
import HttpUtils from "../../../Utils/HttpUtils";
import URL from "../../../Utils/URL";
import AES from "../../../Utils/AES";
import Modal, {ModalContent, ModalTitle, SlideAnimation} from "react-native-modals";
import CircleButton from "../Component/CircleButton";
import Toast from "react-native-whc-toast";
import StorageUtils from "../../../Utils/StorageUtils";
const {windowWidth, windowHeight} = Dimensions.get('window');
export default class SelectExamination extends Component{
    _didFocusSubscription;
    _willBlurSubscription;
    //设置头部导航相关内容
    static navigationOptions = {
        title: '选择考试',
        headerStyle: {
            backgroundColor: '#0367e1'
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold'
        },
    };
    constructor(props){
        super(props);
        this.state = {
            ExamList: [],
            testID:'',
            userID:'',
            passwordVisible:false,
            password: '',
            edu_category_id: '',
            selectedExamName: '',
            test_time: 0,
            //加载完成否
            loaded: false,
            //是否有试卷
            hasPaper: false,
            //考试类型，1表示正常考试 ，2表示补考
            test_type: 0,
        }
        this.renderRow = this.renderRow.bind(this);
        this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
                    BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
                ) ;
    }

//监听返回键
    onBackButtonPressAndroid = () => {
        if (this.state.passwordVisible) {
                    this.setState({
                        passwordVisible: false,
                    });
                    return true
                }
                return false;
    } ;
    componentDidMount() {
        StorageUtils.get("empNum").then((row)=>{
            this.setState({ userID:row },()=>{
                this.getExamData();
            });
        });
        this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
                    BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
                );
     }


    componentWillUnmount() {
            this._didFocusSubscription && this._didFocusSubscription.remove();
            this._willBlurSubscription && this._willBlurSubscription.remove();
    }


    // 返回cell
    renderRow(rowData){
        console.log('rowData',rowData)
        let test_name ='';
        let testID = '';
        //补考
        if(rowData.item.test_type === 2){
            test_name = rowData.item.test_name+'-补考';
            testID = rowData.item.related_test_id;
        }else{
            test_name = rowData.item.test_name;
            testID = rowData.item.test_id;
        }
        return(
            <TouchableOpacity
                style={styles.wideButton}
                activeOpacity={0.8}
                onPress={()=>{
                    this.setState({
                        passwordVisible: true,
                        edu_category_id: rowData.item.edu_category_id,
                        selectedExamName: test_name,
                        testID: testID,
                        test_time: rowData.item.test_time*60,
                        test_type: rowData.item.test_type,
                    })
                 }
                }
            >
                <Text style={{fontSize:20}}>{test_name}</Text>
            </TouchableOpacity>
        );
    }

    _keyExtractor = (item, index) => {
        return item.test_id + index+'';
    }
    getExamData(){
        let formData = new FormData;
        StorageUtils.get("empNum").then((row)=>{
            this.setState({ userID:row });
        });
        console.log("-=-=-=-=-=-="+this.state.userID)
        formData.append('userID',AES.Encrypt(this.state.userID));
        HttpUtils.PostFetch(URL.url + "/OnlineExam/getExamList",formData)
            .then(res => {
                this.setState({
                    ExamList:res.list,
                    loaded: true
                }),
                console.log(res.list);
                if(res.list.length === 0 ){
                    this.refs.toast.showTop('目前没有已报名的考试', Toast.Duration.short, Toast.Position.center);
                }
            }).catch((error) => {
            console.error(error);
        });
    }
    verifyPassword(){
        this.setState({
            passwordVisible: false,
        });
        let formData = new FormData;
        formData.append('testID',AES.Encrypt(this.state.testID));
        formData.append('userID',AES.Encrypt(this.state.userID));
        formData.append('passWord',AES.Encrypt(this.state.password));
        formData.append('eduCategoryId',AES.Encrypt(this.state.edu_category_id));
        HttpUtils.PostFetch(URL.url + "/OnlineExam/getExamDetail",formData)
            .then(res => {
                this.setState({
                    passwordVisible: false,
                    loaded: true,
                });
                if(res.list === "wrongPassword"){
                    this.refs.toast.showCenter('密码错误', Toast.Duration.short, Toast.Position.center);
                    console.log('-----------------------密码错误')
                }else if(res.list === "noPaper"){
                    this.refs.toast.showCenter('试卷暂未开放...', Toast.Duration.short, Toast.Position.center);

                }else{
                        let chooseArray = res.list.choose;
                        let multipleChooseArray = res.list.multipleChoose;
                        let judgeArray = res.list.judge;
                        console.log("totalScore-------------"+res.list.totalScore);
                        let ExamArray = chooseArray.concat(judgeArray).concat(multipleChooseArray)
                        this.props.navigation.navigate('Examination',
                        {
                            edu_category_id: this.state.edu_category_id,
                            selectedExamName: this.state.selectedExamName,
                            testID: this.state.testID,
                            //单个单选题分
                            singleChooseScore: res.list.single_choose_score,
                            //单个多选题分
                            singleMultipleChooseScore: res.list.multi_choice_score,
                            //单个判断题分
                            singleJudgeScore: res.list.judge_score,
                            examTime: this.state.test_time,
                            totalTime: this.state.test_time,
                            ExamArray: ExamArray,
                            questionNum: ExamArray.length,
                            commitArray: new Array(ExamArray.length),
                            markArray: new Array(ExamArray.length),
                            testType: this.state.test_type,
                            edu_category_name: res.list.eduCategoryName,
                        })
                }
            }).catch((error) => {
            console.error(error);
        });
    }
    render(){
        if (!this.state.loaded) {
            return (
                <View style={styles.loadingContainer}>
                    <View style={styles.loading}>
                        <Text>加载中...</Text>
                    </View>
                </View>
            )
        }
        return (
            <View>
                <FlatList
                    data={this.state.ExamList}
                    renderItem={this.renderRow}
                    keyExtractor={this._keyExtractor}
                    horizontal={false}/>
                <Modal
                    visible={this.state.passwordVisible}
                    onTouchOutside={() => {
                        this.setState({passwordVisible: false});
                    }}
                    modalAnimation={new SlideAnimation({
                        slideFrom: 'bottom',
                    })}
                    modalTitle={<ModalTitle title="请输入考试密码"/>}
                >
                    <ModalContent
                        style={{flexDirection: 'row', flexWrap: 'wrap', width: windowWidth}}>
                        {
                            <View style={styles.container}>
                            <TextInput
                                style={styles.TextInputStyle}
                                onChangeText={(text) => {
                                    this.setState({password: text})
                                }}
                                value={this.state.password}
                                maxLength={20}
                            />
                            <TouchableOpacity
                                onPress={this.verifyPassword.bind(this)}
                            >
                               <Text style={{fontSize:20,marginTop:5}}>确定</Text>
                            </TouchableOpacity>
                            </View>
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
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'white'
    },
    text:{
        fontSize:30,
        color:'black'
    },
    innerViewStyle:{
        margin:10,
        backgroundColor:'#fff',
        alignItems:'center',
        width:windowWidth,
    },
    wideButton: {
        padding: 10,
        paddingLeft: 20,
        backgroundColor: '#fff',
        borderWidth:1,
        borderColor:'#efefef'
    },
    listText:{
        fontSize: 18
    },
    TextInputStyle: {
        borderBottomWidth: 2,
        borderBottomColor: '#0272ff',
        fontSize: 18,
        marginRight: 10
    },
});
