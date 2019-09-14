import React from 'react';
import {StatusBar, StyleSheet, Text, View} from 'react-native';
import Blueprint from "../src/lib/Blueprint";


export default class App extends React.PureComponent {
    render() {
        return (
            <Blueprint
                // image={require('./assets/github.png')}
                // image={{
                //     uri: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png'
                // }}
            >
                <StatusBar backgroundColor={'transparent'} translucent={true} barStyle="dark-content"/>
                <View style={[StyleSheet.absoluteFill, {justifyContent: 'center', alignItems: 'center'}]}>
                    <Text>
                        {'React Native Blueprint'}
                    </Text>
                </View>
            </Blueprint>
        );
    }
}
