import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// import "./index.scss";

export default class Countdown extends Component {
    constructor(props) {
        super(props);
        this.state = {
            seconds: null,
            timeTotal: this.props.timetotal,
            timeHour: '',
            timeMinite: '',
            timeSecond: ''
        };
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

    componentWillUnmount() {
        clearTimeout(this.timer);
    }
    componentDidMount() {
        //声明一个定时器
        this.timer = setInterval(
            () => {
                this._timeShow();
            },
            1000,
        );

    }

    _timeShow = () => {

        // this.state.timeTotal 是需要倒计时的总数，单位是 秒
        let timeDown = this.state.timeTotal;
        //初始化小时，分钟和秒
        let hour = 0;

        let minute = 0;
        // 初始化秒
        let second = 0;
        //总数-1
        timeDown = timeDown - 1;
        //如果总数到0，则关闭定时器
        if (timeDown === 0 || this.props.timetotal === 0) {
            this.setState({
                timeTotal: 0,
            });
            console.log('计时结束啦')
            this.props.timeOver();
            //关闭定时器
            clearTimeout(this.timer);
        } else {
            //修改state，渲染页面
            this.setState({
                timeTotal: timeDown,
            });
        }
    }

    render() {
        let timeHour = this.transformTime(this.state.timeTotal,'hour');
        let timeMinute = this.transformTime(this.state.timeTotal,'minute');
        let timeSecond = this.transformTime(this.state.timeTotal,'second');
        return (
            <View className="desc-card">
                    <View style={styles.container}>
                            <Text style={styles.text}>
                                {timeHour}:{timeMinute}:{timeSecond}</Text>
                    </View>
            </View>
        );
    }
}
const styles =StyleSheet.create({
    container:{
        flexDirection:'row',

    },
    text:{
        color:'#f9821f',
        fontSize:20
    }
})



