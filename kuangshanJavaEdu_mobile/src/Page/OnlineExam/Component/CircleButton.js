import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    Image
} from 'react-native';
const {width, height} = Dimensions.get('window');
export default class CircleButton extends Component{
    render() {
        if(this.props.isMark === null || !this.props.isMark){
            return(
                <View>
                    <TouchableOpacity style={this.props.clickBtnStyle} onPress={this.props.onPress1} index={this.props.index1}>
                        <Text style={this.props.textStyle}>{this.props.index}</Text>
                    </TouchableOpacity>
                </View>
            );
        }else{
            return(
                <View>
                    <TouchableOpacity style={this.props.clickBtnStyle} onPress={this.props.onPress1}
                                      index={this.props.index1}>
                        <Text style={[this.props.textStyle,{marginLeft:width/20}]}>{this.props.index}</Text>
                        <Image source={require('../../../../image/onlineExam/mark.png')} style={styles.ImageStyle}/>
                    </TouchableOpacity>
                </View>
            );
        }

    }
}
const styles = StyleSheet.create({
    ImageStyle: {
        alignSelf: 'flex-start',
        width: width /20,
        height: width/20,
        resizeMode: 'stretch'
    },
})
