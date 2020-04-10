import React, {Component, PureComponent} from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    SectionList,
    TouchableOpacity,
    Dimensions,
    Picker,
    TextInput,
    NativeModules,
    Image,
    ActivityIndicator, ToastAndroid,
    Alert,

} from 'react-native';

import SectionHeader from './SectionHeader'

import second from './second'

import {createAppContainer} from 'react-navigation'
import {createStackNavigator} from 'react-navigation-stack'
import Resource from "./Ovideo";
import HttpUtils from "../../Utils/HttpUtils";
import URL from "../../Utils/URL";
import Loading from "../../Utils/Loading";
import * as Progress from 'react-native-progress';
import RNFS from 'react-native-fs';
import DeviceStorage from "../../Utils/DeviceStorage";
import AES from "../../Utils/AES";
import StorageUtils from "../../Utils/StorageUtils";


export default class SectionListPage extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            //sectionList数据
            // cellDatas:[],
            cellDataArray: [],
            selectArray: [],
            animating: true,
            selected: '全部培训类型',
            secondItem: [],
            progress: [],
            indeterminate: [],
            isDownLoad: [],
            searchFile:'',
            searchCultivate: '',
            refreshing: false,
            empNum: '',
            test: ''
        };
        this.cellDatas = [];


    }

    //加载下拉框内容
    getSelectData() {
        HttpUtils.PostFetch(URL.url + "/mobile/OnlineStudy/getResCategory")
            .then(res => {
                this.setState({
                    selectArray: res.resList,

                }, () => {
                    this.getResultList();
                });
            }).catch((error) => {
            console.error(error);
        });
    }
    //加载资源
     getResultList() {
        let formdata = new FormData;
        formdata.append('userID', AES.Encrypt(this.state.empNum));
        HttpUtils.PostFetch(URL.url + "/mobile/OnlineStudy/getResourceList", formdata)
             .then(res => {
                 /**
                  * 这里需要注意，如果不用newArray中转，直接把this.cellDatas给cellDataArray
                  * 会导致这两个数组绑定，改变其中一个同时也会改变另一个
                  */
                 this.cellDatas = res.resList;
                 let newArray = JSON.parse(JSON.stringify(this.cellDatas));
                 this.setState({cellDataArray: newArray});
             })
             .then(() => {
                 // 在DeviceStorage遍历每一个文件，如下载isDownLoad自动置1
                 let cellDatas = [...this.cellDatas];
                 cellDatas.map((item, index) => {
                     item.data.map((item) => {
                         /** old **/
                         // DeviceStorage.get(item.title).then((res) => {
                         //     if (res === 'ok') {
                         //         item.isDownLoad = '1';
                         //     }
                         // })
                         /**  **/
                         DeviceStorage.get('download').then(res => {
                             if (res !== null) {
                                 let isDownLoad = res.find((v) => {
                                     return v === item.title;
                                 });
                                 if (isDownLoad !== undefined) {
                                     item.isDownLoad = '1';
                                 }
                             }
                         }).then(() => {
                                 let newArray = JSON.parse(JSON.stringify(this.cellDatas));
                                 this.setState({cellDataArray: newArray});
                             });
                     });
                 });
             }).then(() => {
                 this.setState({animating: false,refreshing: false})
         })
             .catch((error) => {
                 this.setState({
                     animating: false,refreshing: false
                 });
                 return (
                     <View>
                         <Text>
                             网络错误，请稍后再试...
                         </Text>
                     </View>

                 )
             });
    }

    componentDidMount() {
        StorageUtils.get("empNum").then((row)=>{
            this.setState({ empNum:row });
            this.getSelectData();
        });

        // this.getSelectData();
    }


    // 下拉刷新
    _renderRefresh = () => {
        this.setState({refreshing: true})
        this.getResultList();
    };


    //搜索培训类型
    searchType(info) {
        this.setState({selected: info,searchFile:'',searchCultivate:''});
        let cellDataArray = [...this.cellDatas];
        if (info !== '全部培训类型') {
            for (let i = cellDataArray.length - 1; i >= 0; --i) {
                if (cellDataArray[i].categoryName !== info ) {
                    cellDataArray.splice(i, 1);
                }
            }
        }
        let newArray = JSON.parse(JSON.stringify(cellDataArray));
        this.setState({
            cellDataArray: newArray
        });

    }

    searchText() {
        if (this.state.searchFile.includes(' ')||this.state.searchCultivate.includes(' ')) {
            ToastAndroid.show('输入包含非法字符请重新输入', ToastAndroid.SHORT);
            return;
        }
        let cellDataArray = [...this.cellDatas];
        if (this.state.searchFile === '' && this.state.searchCultivate === '') {
            if (this.state.selected !== '全部培训类型') {
                for (let i = cellDataArray.length - 1; i >= 0; --i) {
                    if (cellDataArray[i].categoryName !== this.state.selected) {
                        cellDataArray.splice(i, 1);
                    }
                }
            }
        }else if (this.state.searchFile !== '' && this.state.searchCultivate === '') {
            if (this.state.selected !== '全部培训类型') {
                for (let i = cellDataArray.length - 1; i >= 0; --i) {
                    if (!(cellDataArray[i].categoryName === this.state.selected && cellDataArray[i].title.includes(this.state.searchFile))) {
                        cellDataArray.splice(i, 1);
                    }
                }
            } else {
                for (let i = cellDataArray.length - 1; i >= 0; --i) {
                    if (!cellDataArray[i].title.includes(this.state.searchFile)) {
                        cellDataArray.splice(i, 1);
                    }
                }
            }
        }else if (this.state.searchFile === '' && this.state.searchCultivate !== '') {
            if (this.state.selected !== '全部培训类型') {
                for (let i = cellDataArray.length - 1; i >= 0; --i) {
                    if (cellDataArray[i].cultivate === undefined) {
                        cellDataArray.splice(i, 1);
                    } else if (!(cellDataArray[i].categoryName === this.state.selected && JSON.stringify(cellDataArray[i].cultivate).includes(this.state.searchCultivate))) {
                        cellDataArray.splice(i, 1);
                    }
                }
            } else {
                for (let i = cellDataArray.length - 1; i >= 0; --i) {
                    if (cellDataArray[i].cultivate === undefined) {
                        cellDataArray.splice(i, 1);
                    } else if (!JSON.stringify(cellDataArray[i].cultivate).includes(this.state.searchCultivate)) {
                        cellDataArray.splice(i, 1);
                    }
                }
            }
        } else {
            if (this.state.selected !== '全部培训类型') {
                for (let i = cellDataArray.length - 1; i >= 0; --i) {
                    if (cellDataArray[i].cultivate === undefined) {
                        cellDataArray.splice(i, 1);
                    } else if (!(cellDataArray[i].categoryName === this.state.selected && JSON.stringify(cellDataArray[i].cultivate).includes(this.state.searchCultivate)&& cellDataArray[i].title.includes(this.state.searchFile))) {
                        cellDataArray.splice(i, 1);
                    }
                }
            } else {
                for (let i = cellDataArray.length - 1; i >= 0; --i) {
                    if (cellDataArray[i].cultivate === undefined) {
                        cellDataArray.splice(i, 1);
                    } else if (!(JSON.stringify(cellDataArray[i].cultivate).includes(this.state.searchCultivate)&& cellDataArray[i].title.includes(this.state.searchFile))) {
                        cellDataArray.splice(i, 1);
                    }
                }
            }
        }
        let newArray = JSON.parse(JSON.stringify(cellDataArray));
        this.setState({
            cellDataArray: newArray
        });
    }
    //按文件名称模糊搜索
    searchFile(text) {
        this.setState({searchFile:text});
        const cellDataArray = [...this.cellDatas];
        if (text !== '') {
            if (this.state.selected !== '全部培训类型') {
                for (let i = cellDataArray.length - 1; i >= 0; --i) {
                    if (!(cellDataArray[i].categoryName === this.state.selected && cellDataArray[i].title.includes(text))) {
                        cellDataArray.splice(i, 1);
                    }
                }
            } else {
                for (let i = cellDataArray.length - 1; i >= 0; --i) {
                    if (!cellDataArray[i].title.includes(text)) {
                        cellDataArray.splice(i, 1);
                    }
                }
            }
        } else {
            if (this.state.selected !== '全部培训类型') {
                for (let i = cellDataArray.length - 1; i >= 0; --i) {
                    if (cellDataArray[i].categoryName !== this.state.selected) {
                        cellDataArray.splice(i, 1);
                    }
                }
            }
        }
        this.setState({
            cellDataArray: cellDataArray
        });
    }
    //按培训名称模糊搜索
    searchCultivate(text) {
        this.setState({searchCultivate:text});
        const cellDataArray = [...this.cellDatas];
        if (text !== '') {
            if (this.state.selected !== '全部培训类型') {
                for (let i = cellDataArray.length - 1; i >= 0; --i) {
                    if (cellDataArray[i].cultivate === undefined) {
                        cellDataArray.splice(i, 1);
                    }
                    else if (!(cellDataArray[i].categoryName === this.state.selected && JSON.stringify(cellDataArray[i].cultivate).includes(text))) {
                        cellDataArray.splice(i, 1);
                    }
                }
            } else {
                for (let i = cellDataArray.length - 1; i >= 0; --i) {
                    if (cellDataArray[i].cultivate === undefined) {
                        cellDataArray.splice(i, 1);
                    }
                    else if (!JSON.stringify(cellDataArray[i].cultivate).includes(text)) {
                        cellDataArray.splice(i, 1);
                    }
                }
            }
        } else {
            if (this.state.selected !== '全部培训类型') {
                for (let i = cellDataArray.length - 1; i >= 0; --i) {
                    if (cellDataArray[i].categoryName !== this.state.selected) {
                        cellDataArray.splice(i, 1);
                    }
                }
            }
        }
        this.setState({
            cellDataArray: cellDataArray
        });
    }
    /**
     * 展开或收起SectionList
     * @param info:点击的一级列表
     */
    handlerSectionHeader = (info) => {
        let cellDataArray = [...this.state.cellDataArray];
        if (info.section.show) {
            console.log('隐藏')
            //清空要隐藏的数据条目
            cellDataArray.map((item, index) => {
                    if (item === info.section) {
                        item.show = !item.show;
                        //清空要隐藏的数据条目
                        item.data = [{key: 'close'}];
                    }
                }
            );
        } else {
            this.cellDatas.map((item, index) => {
                //判断要显示的那个组
                if (item.key === info.section.key) {
                    //重新获取条目数据
                    let data = item.data;
                    cellDataArray.map((cellItem, index) => {
                        if (cellItem === info.section) {
                            cellItem.show = !cellItem.show;
                            cellItem.data = data;
                        }
                    });
                }
            });
        }

        /**
         * 请先检查你的renderItem函数所依赖的props数据（包括data属性以及可能用到的父组件的state），
         * 如果是一个引用类型（Object或者数组都是引用类型），则需要先修改其引用地址（比如先复制到一个新的Object或者数组中），
         * 然后再修改其值，否则界面很可能不会刷新。
         */
        console.log(this.cellDatas[0].data)
        this.setState({
            cellDataArray: cellDataArray,
        }, () => {
            console.log(this.cellDatas[0].data)
        });
    };


    //sectionList头部
    _ListHeaderComponent = () => {

        let list = this.state.selectArray.map((item, i) => (
            <Picker.Item label={item.id} key={i} value={item.id}/>
        ));
        return (
            <View>
                {/*<View style={{flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}>*/}
                {/*    <Text>培训类型：</Text>*/}
                <Picker
                    mode={'dropdown'}
                    style={styles.picker}
                    selectedValue={this.state.selected}
                    // onValueChange={(value) => this.setState({selected: value})}
                    onValueChange={(value) => this.searchType(value)}
                    item={this.state.selectArray}>
                    {list}
                </Picker>
                {/*</View>*/}
                <View style={styles.margin}>
                    <TextInput
                        placeholder='请输入资源名称'
                        value = {this.state.searchFile}
                        style={{height: 40, borderColor: 'gray', borderWidth: 1,flex:1,marginEnd:5}}
                        onChangeText={text => this.setState({ searchFile:text})}
                    />
                    <TextInput
                        placeholder='请输入培训名称'
                        value = {this.state.searchCultivate}
                        style={{height: 40, borderColor: 'gray', borderWidth: 1,flex:1,marginStart:5}}
                        onChangeText={text =>this.setState({ searchCultivate:text})}
                    />
                    <TouchableOpacity
                        style={{marginStart:5}}
                        onPress={()=>{this.searchText()}}>
                        <Image  style={{height:30,width:30}} source={require('./icon/search.png')}/>
                    </TouchableOpacity>

                </View>
            </View>
        );

    };
    //sectionList底部
    // _ListFooterComponent = () => {
    //     return (
    //         <View style={{height:35,backgroundColor:'cyan',alignItems:'center',justifyContent:'center'}}>
    //             <Text>
    //                 SectionList Footer
    //             </Text>
    //         </View>
    //
    //     );
    //
    // };

    //section之间的间隔
    _renderSectionSeparatorComponent = (info) => {
        return (
            <View style={{height: 1, backgroundColor: 'grey'}}>

            </View>
        );
    };
    //cell之间的间隔
    _renderItemSeparatorComponent = (info) => {
        return (
            <View style={{height: 1, backgroundColor: 'grey'}}>

            </View>
        );

    };
    //section头部
    _renderSectionHeader = (item) => {
        return (
            <SectionHeader
                info={item}
                handlerSectionHeader={this.handlerSectionHeader.bind(this)}
            />
        );
    };
    //浏览文件
    fileView = (info) => {
        RNFS.exists(RNFS.ExternalDirectoryPath + '/' + info.item.title).then((result) => {
            if (result) {
                //本地
                var filePath = RNFS.ExternalDirectoryPath + '/' + info.item.title

            } else {
                //在线
                var filePath = URL.url + '/upload/OnlineResourceEdu/' + info.section.resId + '/' + info.item.title;
            }
            console.log('flph'+filePath)
            if (info.item.title.includes('mp4') || info.item.title.includes('mp3')) {
                //视频音频
                this.props.navigation.navigate('Resource', {'info': info, onGoBack: (res) => this.callBack(res)});
            } else if (info.item.title.includes('pdf') || info.item.title.includes('doc') || info.item.title.includes('docx') || info.item.title.includes('ppt') || info.item.title.includes('pptx') || info.item.title.includes('xlsx') || info.item.title.includes('xls')) {
                //文档
                NativeModules.RNActivity.show(filePath).then(
                    (studyTime) => {
                        console.log('学习时间:' + studyTime);

                        const edu_resource_id = info.section.resId;
                        const upload_file_name = info.item.title;
                        let formdata = new FormData;
                        formdata.append('empNum', AES.Encrypt(this.state.empNum));
                        formdata.append('edu_resource_id', AES.Encrypt(edu_resource_id));
                        formdata.append('upload_file_name', AES.Encrypt(upload_file_name));
                        formdata.append('total_time', AES.Encrypt(studyTime));
                        this.refresh(upload_file_name, edu_resource_id, studyTime);
                        this.postData(formdata)
                    }
                ).catch(
                    (err) => {
                        console.log(err);
                    }
                );
            } else if (info.item.title.includes('jpg') || info.item.title.includes('png') || info.item.title.includes('jpeg')) {
                this.props.navigation.navigate('PhotoView', {'info': info, onGoBack: (res) => this.callBack(res)});
            } else {
                Alert.alert(
                    '提示',
                    '暂不支持此类资源',
                    [
                        /**
                         *  注意参数名字一定不能错
                         */
                        {text: '确定'}
                    ]);
            }
        });

    };

     postData(formdata) {
        fetch(URL.url + "/mobile/OnlineStudy/getStudyTime",
            {method: 'POST',
                body:formdata})
            .catch((error) => {
                console.error(error);
            });
    }

    callBack(res) {
        this.refresh(res[0].title,res[0].resId,res[0].studyTime)
        // const empNum = '20';
        // let formdata = new FormData;
        // formdata.append('empNum', AES.Encrypt(empNum));
        // formdata.append('edu_resource_id', AES.Encrypt(res[0].resId));
        // formdata.append('upload_file_name', AES.Encrypt(res[0].title));
        // formdata.append('total_time', AES.Encrypt(res[0].studyTime));
        // this.postData(formdata)

    }
    //浏览资源后刷新字体
    refresh(title,resId,studyTime) {
        let cellData = [...this.cellDatas];
        let flag = false;
        cellData.map((item) => {
            if (item.resId === resId) {
                item.data.map((item) => {
                    if (item.title === title && item.fileTime <= item.minTime * 60 ) {
                        item.fileTime += studyTime;
                        if (item.fileTime >= item.minTime * 60) {
                            flag = true;
                            StorageUtils.get("eduScore").then((row)=>{
                                StorageUtils.update("eduScore",row+item.credit);
                            });

                        }
                    }
                });
            }
        });
        if (flag) {
            let newArray = JSON.parse(JSON.stringify(this.cellDatas));
            this.setState({cellDataArray:newArray});
        }

    }

    downLoad(info){
        let arr = this.state.progress;
        arr[info.item.contentId] = -1;
        this.setState({
            //如果使用progress:arr 则出现浅比较
            //解决方法如下,改变progress指向
            progress: [...arr]
        });
        const uri = URL.url + '/upload/OnlineResourceEdu/' + info.section.resId + '/' + info.item.title
        const downloadDest = RNFS.ExternalDirectoryPath + '/' + info.item.title;
        const options = {
            fromUrl: encodeURI(uri),
            toFile: downloadDest,
            progressDivider:10,
            background: true,
            begin: (res) => {
                console.log('begin', res);
                console.log('contentLength:', res.contentLength / 1024 / 1024, 'M');
            },
            progress: (res) => {

                let pro = (res.bytesWritten / res.contentLength).toFixed(2);
                // this.state.progress[info.item.contentId] = pro;
                let arr = this.state.progress
                arr[info.item.contentId] = pro;
                this.setState({
                    //如果使用progress:arr 则出现浅比较
                    //解决方法如下,改变progress指向
                    progress: [...arr]
                });
                console.log(this.state.progress[info.item.contentId])
            }
        };

        try {
            const ret = RNFS.downloadFile(options);
            ret.promise.then(res => {
                console.log('success,下载完成', res);
                console.log('file://' + downloadDest)
                /** ----------old---------- **/
                //DeviceStorage.save(info.item.title,"ok");
                /** ------------------------ **/


                /** ----------new---------- **/
                DeviceStorage.get('download').then(res => {
                    console.log(res)
                    if (res === null) {
                        //第一个下载的文件
                        let fileArr = [info.item.title];
                        DeviceStorage.save('download', fileArr);
                    } else {
                        DeviceStorage.get('download').then(res => {
                            let fileArr = res;
                            fileArr.push(info.item.title);
                            DeviceStorage.save('download', fileArr);
                        });
                    }
                });

                /** ------------------------ **/
                //改变isDownLoad
                let cellDatas = [...this.cellDatas];
                cellDatas.map((item) => {
                    item.data.map((item) => {
                        if (item.title === info.item.title) {
                            item.isDownLoad = '1';
                        }
                    });
                });
                //改变progress
                let arr = this.state.progress;
                arr[info.item.contentId] = 100;
                let newArray = JSON.parse(JSON.stringify(this.cellDatas));
                this.setState({
                    //如果使用progress:arr 则出现浅比较
                    //解决方法如下,改变progress指向
                    progress: [...arr],
                    cellDataArray: newArray,
                });
            }).catch(err => {
                console.log('err', err);
            });
        }
        catch (e) {
            console.log(error);
        }
    }



    //cell
   _renderItem =  (info) => {

        //如果title为undefined （解决空数据section之间不显示问题）
        if (info.item.title === undefined) {
            return (<View>

            </View>);

        } else if (info.item.isDownLoad === '0') {
            return (
                <TouchableOpacity
                    style={styles.item}
                    // onPress={() => this.props.navigation.navigate('Resource', {'tittle': info.item.title})}
                    onPress={() => {
                        this.fileView(info)
                    }}
                >
                    <View style={{flex: 4, flexDirection: 'row'}}>
                        <View style={styles.type}>
                            <Text style={{color: 'white', fontSize: 10}}>
                                {info.item.title.substring(info.item.title.lastIndexOf('.') + 1, info.item.title.length)}
                            </Text>
                        </View>
                        <Text style={info.item.fileTime>=info.item.minTime*60?
                            {color: 'green', paddingHorizontal: 10}:
                            {color: 'black', paddingHorizontal: 10}}
                              numberOfLines={1}>
                            {info.item.title.substring(0, info.item.title.lastIndexOf('.'))}
                        </Text>
                    </View>

                    <View style={styles.downLoad}>
                        <TouchableOpacity
                            onPress={() => {
                                this.downLoad(info)
                            }}
                            style={{
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            {/*<View style={styles.circle}>*/}
                            {/*    <Text style={{color: 'white', textAlign: 'center', fontSize: 10}}>*/}
                            {/*        下载*/}
                            {/*    </Text>*/}
                            {/*</View>    */}
                            <Progress.Circle
                                size={30}
                                style={styles.progress}
                                progress={this.state.progress[info.item.contentId]}
                                indeterminate={this.state.progress[info.item.contentId] === -1}
                                showsText={this.state.progress[info.item.contentId] !== undefined}
                                direction="clockwise"
                                children={
                                    <View style={{
                                        position: 'absolute',
                                        top: 5,
                                        left: 5,
                                        justifyContent: 'center',
                                        alignItems: 'center',

                                    }}>
                                        <Image

                                            source={this.state.progress[info.item.contentId] === undefined ? require('./icon/download.png') : null}
                                            style={{width: 20, height: 20}}

                                        />
                                    </View>
                                }
                            />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity
                    style={styles.item}
                    // onPress={() => this.props.navigation.navigate('Resource', {'tittle': info.item.title})}
                    onPress={() => {
                        this.fileView(info)
                    }}
                >
                    <View style={{flex: 4, flexDirection: 'row'}}>
                        <View style={styles.type}>
                            <Text style={{color: 'white', fontSize: 10}}>
                                {info.item.title.substring(info.item.title.lastIndexOf('.') + 1, info.item.title.length)}
                            </Text>
                        </View>
                        <Text style={info.item.fileTime>=info.item.minTime*60?
                            {color: 'green', paddingHorizontal: 10}:
                            {color: 'black', paddingHorizontal: 10}}
                              numberOfLines={1}>
                            {info.item.title.substring(0, info.item.title.lastIndexOf('.'))}
                        </Text>
                    </View>

                    <View style={styles.isDownLoad}>
                        <Image
                            source={require('./icon/downloaded.png')}
                            style={{width: 20, height: 20}}
                        />
                    </View>
                </TouchableOpacity>
            );
        }
    };

    render() {
        if (this.state.animating) {
            return (
                <View style={{flex: 1, justifyContent: 'center'}}>
                    <Loading text={'加载中'} color={'blue'}/>
                </View>
            )
        } else
            return (
                <View style={styles.container}>
                    <SectionList
                        extraData={this.state}
                        ListHeaderComponent={this._ListHeaderComponent}
                        // ListFooterComponent={this._ListFooterComponent}
                        SectionSeparatorComponent={this._renderSectionSeparatorComponent}
                        ItemSeparatorComponent={this._renderItemSeparatorComponent}
                        renderSectionHeader={this._renderSectionHeader}
                        renderItem={this._renderItem}
                        sections={this.state.cellDataArray}
                        ListEmptyComponent={()=>{return(<Text style={styles.LookMoreStyle}>暂无记录</Text>)}}
                        //下拉刷新
                        // refreshing={this.state.refreshing}
                        // onRefresh={this._renderRefresh}
                        // initialNumToRender={20}
                    />
                </View>
            );
    }
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    margin: {
        marginBottom: 2,
        marginLeft: 10,
        marginRight: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    picker: {
        height: 40,
        justifyContent: 'center',
        marginTop: 2,
        marginEnd: 10,
        marginBottom: 2,
    },
    item: {
        height: 40,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between'
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
    title: {
        color: 'black',
        paddingHorizontal: 10
    }, downLoad: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginEnd: 5,
    },
    isDownLoad: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginEnd: 9,
    },
    circle: {
        // marginRight:10,
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        backgroundColor: '#2894FF',
        borderColor: 'green',
        borderStyle: 'solid',
        borderRadius: 15,
        paddingBottom: 2
    },LookMoreStyle: {
        height: 32,
        width: '100%',
        textAlign: 'center',
        fontSize: 15,
        paddingTop: 10,

    },
});
