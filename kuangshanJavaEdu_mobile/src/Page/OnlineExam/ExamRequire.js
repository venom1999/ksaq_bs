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
    Alert, ScrollView
} from "react-native";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import {Picker} from "native-base";
import HttpUtils from "../../Utils/HttpUtils";
import URL from "../../Utils/URL";
import judgeUtil from "./Component/judgeUtil";
import Toast from "react-native-whc-toast";
import AES from "../../Utils/AES";

const {width, height} = Dimensions.get('window');

class ExamRequire extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedExamID: '',
            ExamNameString: '',
            ExamName: '',
            selectArray: [],
            examTime: '120',
            examScore: '100',
            chooseScore: '2',
            chooseNum: '20',
            multipleChooseScore: '5',
            multipleChooseNum: '6',
            judgeScore: '6',
            judgeNum: '5',
            loaded: false,
            chooseArray: [],
            multipleChooseArray: [],
            judgeArray: [],
        };
    }

    componentDidMount() {
        this.getSelectData();
    }

    getSelectData() {
        HttpUtils.PostFetch(URL.url + "OnlineExam/GetTCList_vue")
            .then(res => {
                this.setState({
                    selectArray: res.eduCateList,
                    loaded: true
                }),
                    console.log(res.eduCateList)
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
        return (
            <View style={{flex: 1, backgroundColor: '#fff'}}>
                <ScrollView style={styles.ScrollViewcontainer}>
           <Text style={{
                    color: 'blue',
                    fontSize: 20,
                    alignSelf: 'center',
                    marginTop: 5,
                    marginBottom: 5
                }}>试卷要求</Text>
                <View style={{backgroundColor: '#fff', marginLeft: 10, marginRight: 10}}>
                    <View style={styles.numberAndScoreView}>
                        <View>
                            <Text style={styles.ExamRequireText}>考试名称：</Text>
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
                        <Text style={styles.ExamRequireText}>考试时间：</Text>
                        <TextInput
                            defaultValue='120'
                            style={styles.TextInputStyle}
                            keyboardType={'numeric'}
                            onChangeText={(text) => {
                                const newText = text.replace(/[^0-9]/g, '');
                                const newText2 = newText.replace(/\b(0+)/gi, "")
                                this.setState({examTime: newText2})
                            }}
                            value={this.state.examTime}
                            maxLength={3}
                        />
                        <Text style={styles.ExamRequireText}>分钟</Text>
                    </View>
                    <View style={styles.numberAndScoreView}>
                        <Text style={styles.ExamRequireText}>考试总分：</Text>
                        <TextInput
                            defaultValue='100'
                            style={styles.TextInputStyle}
                            keyboardType={'numeric'}
                            onChangeText={(text) => {
                                let newText = text.replace(/[^0-9.]/g, '');
                                newText = newText.replace(/\b(0+)/gi, ""); //去掉第一个0
                                newText = newText.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的
                                newText = newText.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
                                newText = newText.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');//只能输入两个小数
                                this.setState({examScore: newText})
                            }}
                            value={this.state.examScore}
                            maxLength={6}
                        />
                    </View>
                </View>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', margin: 10,}}>
                    <View style={{
                        flexDirection: 'column',
                        alignItems: 'center',
                        margin: 1,
                        backgroundColor: '#fff',
                    }}>
                        <Image source={require('../../../image/onlineExam/choose.png')}
                               style={styles.ImageStyle}
                        />
                        <View behavior="padding" style={styles.numberAndScoreView}>
                            <Text style={styles.ExamRequireText}>题数：</Text>
                            <TextInput
                                defaultValue='20'
                                style={styles.TextInputStyle}
                                keyboardType={'numeric'}
                                onChangeText={(text) => {
                                    const newText = text.replace(/[^0-9]/g, '');
                                    const newText2 = newText.replace(/\b(0+)/gi, "")
                                    this.setState({chooseNum: newText2})
                                }}
                                value={this.state.chooseNum}
                                maxLength={4}
                            />
                        </View>
                        <View style={styles.numberAndScoreView}>
                            <Text style={styles.ExamRequireText}>小分：</Text>
                            <TextInput
                                defaultValue='2'
                                style={styles.TextInputStyle}
                                keyboardType={'numeric'}
                                onChangeText={(text) => {
                                    let newText = text.replace(/[^0-9.]/g, '');
                                    newText = newText.replace(/\b(0+)/gi, ""); //去掉第一个0
                                    newText = newText.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的
                                    newText = newText.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
                                    newText = newText.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');//只能输入两个小数
                                    this.setState({chooseScore: newText})
                                }}
                                value={this.state.chooseScore}
                                maxLength={6}
                            />
                        </View>
                    </View>
                    <View style={{
                        flexDirection: 'column',
                        alignItems: 'center',
                        margin: 1,
                        backgroundColor: '#fff',
                    }}>
                        <Image source={require('../../../image/onlineExam/multichoice.png')}
                               style={styles.ImageStyle}/>
                        <View style={styles.numberAndScoreView}>
                            <Text style={styles.ExamRequireText}>题数：</Text>
                            <TextInput
                                defaultValue='6'
                                style={styles.TextInputStyle}
                                keyboardType={'numeric'}
                                onChangeText={(text) => {
                                    const newText = text.replace(/[^0-9]/g, '');
                                    const newText2 = newText.replace(/\b(0+)/gi, "")
                                    this.setState({multipleChooseNum: newText2})
                                }}
                                value={this.state.multipleChooseNum}
                                maxLength={4}
                            />
                        </View>
                        <View style={styles.numberAndScoreView}>
                            <Text style={styles.ExamRequireText}>小分：</Text>
                            <TextInput
                                defaultValue='5'
                                style={styles.TextInputStyle}
                                keyboardType={'numeric'}
                                onChangeText={(text) => {
                                    let newText = text.replace(/[^0-9.]/g, '');
                                    newText = newText.replace(/\b(0+)/gi, ""); //去掉第一个0
                                    newText = newText.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的
                                    newText = newText.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
                                    newText = newText.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');//只能输入两个小数
                                    this.setState({multipleChooseScore: newText})
                                }}
                                value={this.state.multipleChooseScore}
                                maxLength={6}
                            />
                        </View>
                    </View>
                    <View style={{
                        flexDirection: 'column',
                        alignItems: 'center',
                        margin: 1,
                        backgroundColor: '#fff',
                    }}>
                        <Image source={require('../../../image/onlineExam/judge.png')}
                               style={styles.ImageStyle}/>
                        <View style={styles.numberAndScoreView}>
                            <Text style={styles.ExamRequireText}>题数：</Text>
                            <TextInput
                                defaultValue='15'
                                style={styles.TextInputStyle}
                                keyboardType={'numeric'}
                                onChangeText={(text) => {
                                    const newText = text.replace(/[^0-9]/g, '');
                                    const newText2 = newText.replace(/\b(0+)/gi, "")
                                    this.setState({judgeNum: newText2})
                                }}
                                value={this.state.judgeNum}
                                maxLength={4}
                            />
                        </View>
                        <View style={styles.numberAndScoreView}>
                            <Text style={styles.ExamRequireText}>小分：</Text>
                            <TextInput
                                defaultValue='2'
                                style={styles.TextInputStyle}
                                keyboardType={'numeric'}
                                onChangeText={(text) => {
                                    let newText = text.replace(/[^0-9.]/g, '');
                                    newText = newText.replace(/\b(0+)/gi, ""); //去掉第一个0
                                    newText = newText.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的
                                    newText = newText.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
                                    newText = newText.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');//只能输入两个小数
                                    this.setState({judgeScore: newText})
                                }}
                                value={this.state.judgeScore}
                                maxLength={6}
                            />
                        </View>
                    </View>
                </View>
                <View style={{flexDirection:'column-reverse',alignItems: 'center', backgroundColor: '#fff',marginLeft:10,marginRight:10}}>
                    <TouchableOpacity style={{alignItems: 'center'}}
                        onPress={() => {
                            if ('请选择' === this.state.selectedExamID || '' === this.state.selectedExamID) {
                                Alert.alert(
                                    '提示',
                                    '请选择考试名称',
                                    [
                                        {text: '好', onPress: () => console.log('点击确定')}
                                    ]);
                            } else {
                                let selectedExamID = this.state.selectedExamID;
                                let examTime = this.state.examTime;
                                let examScore = this.state.examScore;
                                let chooseScore = this.state.chooseScore;
                                let chooseNum = this.state.chooseNum;
                                let multipleChooseScore = this.state.multipleChooseScore;
                                let multipleChooseNum = this.state.multipleChooseNum;
                                let judgeScore = this.state.judgeScore;
                                let judgeNum = this.state.judgeNum;
                                let toast = judgeUtil.wrongEmptyValue(examTime, examScore, chooseNum, chooseScore, judgeNum, judgeScore, multipleChooseNum, multipleChooseScore)
                                if (toast !== '') {
                                    Alert.alert(
                                        '提示',
                                        toast,
                                        [
                                            {text: '好', onPress: () => console.log('点击确定')}
                                        ]);
                                } else {
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
                                            if (receivedChooseCount<chooseNum){
                                                this.refs.toast.showCenter("题库中单选题数量不足，目前最多可以有"+receivedChooseCount+"道题", Toast.Duration.short, Toast.Position.center);
                                            }else if (receivedJudgeCount<judgeNum){
                                                this.refs.toast.showCenter("题库中判断题数量不足，目前最多可以有"+receivedJudgeCount+"道题", Toast.Duration.short, Toast.Position.center);
                                            }else if (receivedMultiChooseCount<multipleChooseNum){
                                                this.refs.toast.showCenter("题库中多选题数量不足，目前最多可以有"+receivedMultiChooseCount+"道题", Toast.Duration.short, Toast.Position.center);
                                            }else{
                                                let ExamArray = chooseArray.concat(judgeArray).concat(multipleChooseArray)
                                                this.props.navigation.push('ExamDetail', {
                                                    selectedExamID: selectedExamID,
                                                    ExamNameString: this.state.ExamNameString,
                                                    ExamArray: ExamArray,
                                                    examTime: examTime*60,
                                                    examScore: examScore,
                                                    chooseScore: chooseScore,
                                                    chooseNum: chooseNum,
                                                    multipleChooseScore: multipleChooseScore,
                                                    multipleChooseNum: multipleChooseNum,
                                                    judgeScore: judgeScore,
                                                    judgeNum: judgeNum,
                                                });
                                            }
                                        }).catch((error) => {
                                        console.error(error);
                                    });

                                    // console.log('考试名称: ' + this.state.ExamNameString)

                                }
                            }
                        }
                        }

                    >
                        <Image source={require('../../../image/onlineExam/generate.png')}
                               style={{width: 50,height: 50, resizeMode: 'contain'}}
                        />
                        <Text>
                            生成试卷
                        </Text>
                    </TouchableOpacity>
                </View>
                <Toast ref="toast"/>
                </ScrollView>
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
    ScrollViewcontainer: {
        height: height * (9 / 10),
        borderRadius: 5,
        backgroundColor: '#fff',
        marginBottom: 10
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    ExamRequireText: {
        fontSize: 14,
        margin: 5,
        color: '#717171'
    },
    ImageStyle: {
        // width: width / 6,
        width: 80,
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
export default ExamRequire;
