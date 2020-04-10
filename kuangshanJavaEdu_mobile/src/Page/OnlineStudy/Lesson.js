import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Button
} from 'react-native';

import SectionListPage from "./SectionListPage";

export default class SectionListDemo extends Component {
    static navigationOptions = {
        headerShown:false,
    };
    render() {
        return (
            <View style={styles.container}>
                <SectionListPage navigation={this.props.navigation}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});
