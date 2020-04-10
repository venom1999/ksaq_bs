import React, {Component} from 'react';
import {
    Text,
    View,
    Image,
    PixelRatio,
    Dimensions,
    StyleSheet, TouchableOpacity
} from 'react-native';
import OVideo from "./Ovideo";
const {width, height} = Dimensions.get('window');
export default class CorrectOrWrongViewButton extends Component {
    constructor(props) {
        super(props);
        this.state={}
    }
   render(){
        let content_component;
        let ImgPath ='';
        let correctOrWrong =this.props.correctOrWrong;
        if(correctOrWrong){
            ImgPath = '../../../../image/onlineExam/correct.png';
        }else{
            ImgPath = '../../../../image/onlineExam/wrong.png';
        }
       if(this.props.content_type === 'image'){
           content_component = (
               <Image source={{uri: encodeURI(this.props.souPath)}}
                      style={{width: width - 100, height: 200, resizeMode: 'contain'}}/>
           )
       }else if(this.props.content_type === 'audio'){
           content_component = (
               <OVideo uri={encodeURI(this.props.souPath)} audioOrVideo={'audio'}/>
           );
       }else if(this.props.content_type === 'video'){
           content_component = (
               <TouchableOpacity style={{width:100}} onPress={this.props.onPress}>
                <Text style={{fontSize:18,color:'blue',textDecorationLine:'underline'}}>查看视频</Text>
               </TouchableOpacity>
           );
       }else if(this.props.content_type === 'judge'){
           return (
               <View style={correctOrWrong?styles.correctTestViewStyle:styles.wrongTestViewStyle}>
                   <Image source={correctOrWrong?require('../../../../image/onlineExam/correct.png'):require('../../../../image/onlineExam/wrong.png')}
                          style={{alignSelf: 'center', width: width / 12, height: width / 12, resizeMode: 'stretch'}}/>
                   <Text style={correctOrWrong?styles.correctOptionFont:styles.wrongOptionFont}>{this.props.select}</Text>
               </View>
           )
       }
       return(
           <View style={correctOrWrong?styles.correctTestViewStyle:styles.wrongTestViewStyle}>
               <Image source={correctOrWrong?require('../../../../image/onlineExam/correct.png'):require('../../../../image/onlineExam/wrong.png')} style={{alignSelf:'center',width:width/12, height:width/12,resizeMode: 'stretch',marginLeft:5}}/>
               <View style={{flexDirection:'column',marginLeft: 5,
                   marginBottom: 10,}}>
               <Text style={correctOrWrong?styles.correctOptionFont:styles.wrongOptionFont}>{this.props.choose}.{this.props.option_string}</Text>
               {content_component}
               </View>
           </View>
       )
   }
}
const styles =StyleSheet.create({
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
    correctOptionFont: {
        fontSize: 18,
        marginTop: 10,
        marginBottom: 10,
        marginRight: 20,
        color: '#3DC076'
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
    wrongOptionFont: {
        fontSize: 18,
        marginTop: 10,
        marginBottom: 10,
        marginRight: 20,
        color: '#F5444B'
    },
})
