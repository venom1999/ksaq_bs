import React,{ Component } from 'react';
import {
    BackHandler, Picker,
    ScrollView,
    StyleSheet,
    Text, ToastAndroid, TouchableOpacity,
    View
} from 'react-native';
import SQLite from "../util/SQLite";
var sqLite = new SQLite();
var db;
export default class ExamGuide extends Component{
    static navigationOptions = {
        title: '错题引导界面',

    };
    constructor(props) {
        super(props);
        this.state = {
            hasData:false,
            testName:[],
            eduCategoryName:[],
            selected: '全部',
            testButton: [],
            choosePress: true,
            multipleChoosePress: true,
            judgePress: true,
        }
    }
    componentDidMount(){
        if(!db){
            db = sqLite.open();
        }
        this.getStorage();
    }

    getStorage() {
        db.transaction((tx)=>{
            tx.executeSql("select DISTINCT test_name,edu_category_name,answer_time from wrong_question_t", [],(tx,results)=>{
                var len = results.rows.length;
                let arr= []
                for(let i=0; i<len; i++){
                    var u = results.rows.item(i);
                    //一般在数据查出来之后，  可能要 setState操作，重新渲染页面
                    this.state.testName.push({'testName':u.test_name,'eduCategoryName':u.edu_category_name,'answerTime':u.answer_time})
                }
            });
            tx.executeSql("select DISTINCT edu_category_name from wrong_question_t", [],(tx,results)=>{
                var len = results.rows.length;
                for(let i=0; i<len; i++){
                    var u = results.rows.item(i);
                    //一般在数据查出来之后，  可能要 setState操作，重新渲染页面
                    this.state.eduCategoryName.push({'eduCategoryName':u.edu_category_name})
                }
                this.setState({hasData:true})
            });
        },(error)=>{//打印异常信息
            console.log(error);
    });
    }

    _getTime(num) {
        let date = new Date(num);
        //时间戳为10位需*1000，时间戳为13位的话不需乘1000
        let y = date.getFullYear();
        let MM = date.getMonth() + 1;
        MM = MM < 10 ? ('0' + MM) : MM;//月补0
        let d = date.getDate();
        d = d < 10 ? ('0' + d) : d;//天补0
        let h = date.getHours();
        h = h < 10 ? ('0' + h) : h;//小时补0
        let m = date.getMinutes();
        m = m < 10 ? ('0' + m) : m;//分钟补0
        let s = date.getSeconds();
        s = s < 10 ? ('0' + s) : s;//秒补0
        return  y + '-' + MM + '-' + d + ' ' + h + ':' + m+ ':' + s;
    }

    render(){
        if(!this.state.hasData) {
            return(
                <View style={styles.loadingContainer}>
                    <View style={styles.loading}>
                        <Text>暂时没有错题...</Text>
                    </View>
                </View>
            )
        }
        let testNameList = this.state.eduCategoryName.map(( item,i) => (
            <Picker.Item label={item.eduCategoryName} key={i} value={item.eduCategoryName}/>
        ));
        let testButton = [];
        testButton.push(
            <TouchableOpacity
                style={
                    {
                        flexDirection: 'column',
                        borderRadius: 5,
                        marginTop: 10,
                        backgroundColor: '#DDDDDD',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 200,
                        height:30,

                    }
                }
                onPress={() => {
                    if (!this.state.choosePress && !this.state.multipleChoosePress && !this.state.judgeArray) {
                        ToastAndroid.show('请选择至少一种题型', ToastAndroid.SHORT);
                        return;
                    }
                    this.props.navigation.navigate('ErrorExam', {testName:'all',choosePress:this.state.choosePress,multipleChoosePress:this.state.multipleChoosePress,judgePress:this.state.judgePress});
                }}
            >
                <Text>全部考试</Text>
            </TouchableOpacity>
        )
        for (let i = 0; i < this.state.testName.length; ++i) {

            if (this.state.selected === '全部'||this.state.selected === this.state.testName[i].eduCategoryName) {
                testButton.push(
                    <TouchableOpacity
                        style={styles.name}
                        onPress={() => {
                            if (!this.state.choosePress && !this.state.multipleChoosePress && !this.state.judgeArray) {
                                ToastAndroid.show('请选择至少一种题型', ToastAndroid.SHORT);
                                return;
                            }
                            this.props.navigation.navigate('ErrorExam', {testName: this.state.testName[i].testName,choosePress:this.state.choosePress,multipleChoosePress:this.state.multipleChoosePress,judgePress:this.state.judgePress})
                        }}
                    >
                        <View
                        style={{flexDirection:'row'}}>
                            <View style={{flex:1,justifyContent:'center',marginStart:10}}>
                                <Text>{this.state.testName[i].testName.substring(this.state.testName[i].testName.lastIndexOf('-')+1,this.state.testName[i].testName.lastIndexOf('-')+3)}</Text>
                            </View>
                            <View style={{flex:4,alignItems:"center",justifyContent:'center'}}>
                                <Text>{this.state.testName[i].testName.substring(0,this.state.testName[i].testName.lastIndexOf('-'))}</Text>
                                <Text>{this._getTime(this.state.testName[i].answerTime)}</Text>
                            </View>
                        </View>

                    </TouchableOpacity>
                );
            }
            // else if (this.state.selected === this.state.testName[i].eduCategoryName) {
            //     testButton.push(
            //         <TouchableOpacity
            //             style={styles.name}
            //             onPress={() => {
            //                 this.props.navigation.navigate('ErrorExam', {testName: this.state.testName[i].testName,choosePress:this.state.choosePress,multipleChoosePress:this.state.multipleChoosePress,judgePress:this.state.judgePress})
            //             }}
            //         >
            //             <Text>{this.state.testName[i].testName}</Text>
            //         </TouchableOpacity>
            //     );
            // }
        }
        return (
            <ScrollView contentContainerStyle={styles.container}>
                <View
                style={{flexDirection:'row',alignItems:'center',marginTop:10,marginStart:5,marginLeft:10}}>
                    <Text>请选择培训：</Text>
                    <Picker
                        mode={'dropdown'}
                        style={{marginStart:10,width: '65%'}}
                        selectedValue={this.state.selected}
                        onValueChange={(value) => {
                            this.setState({selected:value})}}
                        item={this.state.eduCategoryName}>
                        <Picker.Item label="全部" value="全部" />
                        {testNameList}
                    </Picker>
                </View>

                <View style={{flexDirection:'row',justifyContent: 'space-around',marginTop:30,marginBottom:20,alignItems: 'center'}}>
                    <Text >请选择题目类型：</Text>
                    <TouchableOpacity
                        style={{width:50,height:30,borderRadius:5,borderColor:this.state.choosePress?'green':"black",borderWidth:2, justifyContent: 'center', alignItems: 'center'}}
                        onPress={()=>{this.setState({choosePress:!this.state.choosePress})}}
                    >
                        <Text>单选题</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{width:50,height:30,borderRadius:5,borderColor:this.state.multipleChoosePress?'green':"black",borderWidth:2, justifyContent: 'center', alignItems: 'center'}}
                        onPress={()=>{this.setState({multipleChoosePress:!this.state.multipleChoosePress})}}
                    >
                        <Text >多选题</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{width:50,height:30,borderRadius:5,borderColor:this.state.judgePress?'green':"black",borderWidth:2, justifyContent: 'center', alignItems: 'center'}}
                        onPress={()=>{this.setState({judgePress:!this.state.judgePress})}}
                    >
                        <Text >判断题</Text>
                    </TouchableOpacity>
                </View>

                <View
                    style={{alignItems:'center',marginTop:10}}>
                    <Text>请选择考试</Text>
                    {testButton}
                </View>

            </ScrollView>
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
    },
    name: {
        flexDirection: 'column',
        borderRadius: 5,
        marginTop:10,
        backgroundColor:'#DDDDDD',
        justifyContent:'center',
        alignItems:'center',
        width:200,
    },
    picker: {
        height: 40,
        justifyContent: 'center',
        marginTop: 2,
        marginEnd: 10,
        marginBottom: 2,
    },
    type: {
        width: 30,
        height: 18,
        borderRadius: 5,
        backgroundColor: '#2894FF',
        marginStart: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
