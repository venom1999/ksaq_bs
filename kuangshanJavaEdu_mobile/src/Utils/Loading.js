import React,{Component} from 'react'
import {
    View,
    ActivityIndicator,
    Text,
    Dimensions,
    Platform,
    StatusBar
} from 'react-native'
import PropTypes from 'prop-types';
export default class Loading extends Component{

    static defaultProps = {
        animating:true,
        hidesWhenStopped:true,
        size:'small',
        color:'#999'
    };
    static propTypes = {
        // 整个Loading的样式
        loadingStyle:PropTypes.object,
        //加载器的颜色
        color:PropTypes.string,
        //加载器的大小，只有两个值：small|large，以下三个跟ActivityIndicator的样式相同
        size:PropTypes.string,
        animating:PropTypes.bool,
        hidesWhenStopped:PropTypes.bool,
        //文本的样式，也就是下面显示字体的样式
        textStyle:PropTypes.object,
        //要显示的文本，这个是必要值，不能为空
        text:PropTypes.string.isRequired
    }

    render() {
        let {loadingStyle,color,size,animating,hidesWhenStopped,textStyle,text} = this.props
        let {width,height} = Dimensions.get('screen')
        if (Platform.OS === 'android') {
            height += StatusBar.currentHeight
        }
        return (
            <View style={{flex:1,alignItems:'center',position:'absolute',justifyContent:'center',width:width,height:height,...loadingStyle}}>
                <ActivityIndicator animating={animating} hidesWhenStopped={hidesWhenStopped} color={color} size={size} />
                <Text style={{fontSize:12,marginTop:5,...textStyle}}>{text}</Text>
            </View>
        )
    }
}
