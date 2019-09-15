import React from 'react';
import {StatusBar, StyleSheet, Text, View} from 'react-native';
import Blueprint from "../src/lib/Blueprint";


export default class App extends React.PureComponent {
    render() {
        return (
            <Blueprint
                grid={false}
                guides={[
                    {
                        position: 55,
                        orientation: 'vertical',
                        unit: 'dp'
                    },
                    {
                        position: 616,
                        orientation: 'horizontal',
                        unit: 'dp',
                        color:'#ff4aff'
                    },
                    {
                        position: 580,
                        orientation: 'horizontal',
                        unit: 'dp',
                        color:'#ff4aff'
                    }
                ]}
                // image={require('./assets/github.png')}
                // images={[
                //     require('./assets/wireframe-1.png'),
                //     require('./assets/wireframe-2.png'),
                //     require('./assets/wireframe-1.png'),
                //     require('./assets/wireframe-2.png')
                // ]}
                imagesAsync={() => {
                    const server = 'http://localhost:3000';
                    return fetch(`${server}/images.json`)
                        .then(resp => resp.json())
                        .then(images => {
                            images.forEach((image: any) => {
                                image.uri = `${server}/${image.uri}`;
                                image.thumb.uri = `${server}/${image.thumb.uri}`;
                            });
                            return images;
                        });
                }}
            >
                <StatusBar backgroundColor={'transparent'} translucent={true} barStyle="dark-content"/>
                <View style={[StyleSheet.absoluteFill, {justifyContent: 'center', alignItems: 'center'}]}>
                    <Text>
                        {'React Native UI Blueprint'}
                    </Text>
                </View>
            </Blueprint>
        );
    }
}
