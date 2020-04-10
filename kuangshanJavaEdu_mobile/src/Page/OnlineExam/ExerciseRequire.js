import React from "react";
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    View,
    Alert
} from "react-native";
import { StackActions, NavigationActions } from 'react-navigation';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import {Picker} from "native-base";
import HttpUtils from "../../Utils/HttpUtils";
import URL from "../../Utils/URL";
import Toast from "react-native-whc-toast";
import AES from "../../Utils/AES";

const {width, height} = Dimensions.get('window');


class ExerciseRequire extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedExamID: '',
            ExamNameString: '',
            selectArray: [],
            chooseNum: '10',
            questionType: '',
            loaded: false,
        };
    }

    componentDidMount() {
        this.getSelectData();
    }

    getSelectData() {
        HttpUtils.PostFetch(URL.url + "/ExamQuestionManage/Single/GetTCList_vue")
            .then(res => {
                this.setState({
                    selectArray: res.eduCateList,
                    loaded: true
                })

            }).catch((error) => {
            console.error(error);
        });
    }

    //设置头部导航相关内容
    static navigationOptions = ({navigation}) => {
        return ({
            title: '在线模考',
            headerStyle: {
                backgroundColor: '#0367e1'
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontSize: 20,
                fontWeight: 'bold'
            },
        })

    };

    goBack() {
        console.log('点击返回')
    };

    onValueChange1(value: string) {
        this.setState({
            selectedExamID: value,
        });
    }



    render() {
        if (!this.state.loaded) {
            return (
                <View style={styles.container}>
                    <View style={styles.loading}>
                        <Text>加载中...</Text>
                    </View>
                </View>
            )
        }
        let ExamNameList = this.state.selectArray.map((item, i) => (
            <Picker.Item label={item.edu_category_name} key={i}
                         value={item.edu_category_id + ';;;' + item.edu_category_name}/>
        ));
        let selectedExamIDListString = ['单选题', '多选题', '判断题'];
        let selectedExamIDList = [];
        for (let i = 0; i < selectedExamIDListString.length; i++) {
            selectedExamIDList.push(
                <Picker.Item label={selectedExamIDListString[i]} key={i} value={selectedExamIDListString[i]}/>
            )
        }


        return (
            <View style={{backgroundColor: '#fafafa'}}>
                <Text style={{
                    color: 'blue',
                    fontSize: 20,
                    alignSelf: 'center',
                    marginTop: 5,
                    marginBottom: 5
                }}>练习要求</Text>
                <View style={{backgroundColor: '#fff', marginLeft: 10, marginRight: 10,height:height*3/10}}>
                    <View style={styles.numberAndScoreView}>
                        <View>
                            <Text style={styles.ExamRequireText}>练习名称：</Text>
                        </View>
                        <Picker style={{width: '25%'}} mode={'dropdown'}  //'dialog'弹窗 'dropdown'下拉
                                selectedValue={this.state.selectedExamID+";;;"+this.state.ExamNameString} onValueChange={(value) => {
                            let str = []; //定义一数组
                            str = value.split(";;;"); //字符分割
                            this.setState({
                                selectedExamID: str[0],
                                ExamNameString: str[1],
                            })
                        }}>
                            <Picker.Item label={'请选择'} value={'请选择'}/>
                            {ExamNameList}
                        </Picker>
                    </View>
                    <View style={styles.numberAndScoreView}>
                        <View>
                            <Text style={styles.ExamRequireText}>练习题型：</Text>
                        </View>
                        <Picker style={{width: '25%'}} mode={'dropdown'}  //'dialog'弹窗 'dropdown'下拉
                                selectedValue={this.state.questionType} onValueChange={(value) => {
                            this.setState({
                                questionType:value
                            })
                        }}>
                            <Picker.Item label={'请选择'} value={'请选择'}/>
                            {selectedExamIDList}
                        </Picker>
                    </View>
                    <View style={styles.numberAndScoreView}>
                        <View>
                            <Text style={styles.ExamRequireText}>题目数量：</Text>
                        </View>
                        <TextInput
                            style={styles.TextInputStyle}
                            keyboardType={'numeric'}
                            onChangeText={(text) => {
                                const newText = text.replace(/[^0-9]/g, '');
                                const newText2 = newText.replace(/\b(0+)/gi, "")
                                this.setState({chooseNum: newText2})
                            }}
                            value={this.state.chooseNum}
                            maxLength={3}
                        />
                    </View>
                </View>
                <View style={{flexDirection:'column-reverse',alignItems: 'center', backgroundColor: '#fff',marginLeft:10,marginRight:10,height:height*5/10}}>
                    <TouchableOpacity style={{alignItems:'center'}}
                        onPress={()=>{
                            if ('请选择' === this.state.selectedExamID || '' === this.state.selectedExamID) {
                                Alert.alert(
                                    '提示',
                                    '请选择测试名称',
                                    [
                                        {text: '好', onPress: () => console.log('点击确定')}
                                    ]);
                            } else if ('请选择' === this.state.questionType || '' === this.state.questionType) {
                                Alert.alert(
                                    '提示',
                                    '请选择测试题型',
                                    [
                                        {text: '好', onPress: () => console.log('点击确定')}
                                    ]);
                            } else {
                                let selectedExamID = this.state.selectedExamID;
                                let chooseNum = 0;
                                let multipleChooseNum = 0;
                                let judgeNum = 0;
                                if (this.state.questionType === '单选题') {
                                    chooseNum = this.state.chooseNum;
                                } else if (this.state.questionType === '多选题') {
                                    multipleChooseNum = this.state.chooseNum;
                                } else if (this.state.questionType === '判断题') {
                                    judgeNum = this.state.chooseNum;
                                }
                                let formData = new FormData;
                                let chooseArray = [];
                                let multipleChooseArray = [];
                                let judgeArray = [];
                                formData.append('chooseCount',AES.Encrypt(chooseNum));
                                formData.append('multiChoiceCount',AES.Encrypt(multipleChooseNum));
                                formData.append('judgeCount',AES.Encrypt(judgeNum));
                                formData.append('educationCategoryID',AES.Encrypt(selectedExamID));
                                this.setState({
                                    loaded: false
                                })
                                HttpUtils.PostFetch(URL.url + "OnlineExam/getTestPaper", formData)
                                    .then(res => {
                                        this.setState({
                                            loaded: true
                                        })
                                        chooseArray = res.list.choose;
                                        multipleChooseArray = res.list.multipleChoose;
                                        judgeArray = res.list.judge;
                                        let receivedChooseCount = chooseArray.length;
                                        let receivedMultiChooseCount = multipleChooseArray.length;
                                        let receivedJudgeCount = judgeArray.length;
                                        if (receivedChooseCount < chooseNum) {
                                            this.refs.toast.showCenter("题库中单选题数量不足，目前最多可以有" + receivedChooseCount + "道题", Toast.Duration.short, Toast.Position.center);
                                        } else if (receivedJudgeCount < judgeNum) {
                                            this.refs.toast.showCenter("题库中判断题数量不足，目前最多可以有" + receivedJudgeCount + "道题", Toast.Duration.short, Toast.Position.center);
                                        } else if (receivedMultiChooseCount < multipleChooseNum) {
                                            this.refs.toast.showCenter("题库中多选题数量不足，目前最多可以有" + receivedMultiChooseCount + "道题", Toast.Duration.short, Toast.Position.center);
                                        } else {
                                            let ExamArray = chooseArray.concat(judgeArray).concat(multipleChooseArray)
                                            this.props.navigation.push('Exercise', {
                                                selectedExamID: this.state.selectedExamID,
                                                ExamNameString: this.state.ExamNameString,
                                                chooseNum: this.state.chooseNum,
                                                questionType: this.state.questionType,
                                                ExamArray: ExamArray
                                            });
                                        }
                                    }).catch((error) => {
                                    console.error(error);
                                });
                            }
                        }}
                    >
                        <Image source={require('../../../image/onlineExam/generate.png')}
                               style={{width: width / 8, resizeMode: 'contain'}}
                        />
                        <Text>
                            生成试卷
                        </Text>
                    </TouchableOpacity>
                </View>
                <Toast ref="toast"/>
            </View>

        )
    }


}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    ExamRequireText: {
        fontSize: 18,
        margin: 5,
        color: '#717171'
    },
    ImageStyle: {
        width: (width - 200) / 3,
        resizeMode: 'contain'
    },
    TextInputStyle: {
        borderBottomWidth: 2,
        borderBottomColor: '#0272ff',
        fontSize: 18,
        marginRight: 10
    },
    numberAndScoreView: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 5
    }
});
export default ExerciseRequire;
