import React from 'react';
import {StatusBar, StyleSheet, Text, View} from 'react-native';
import Blueprint from "../src/lib/Blueprint";


export default class App extends React.PureComponent {
    render() {
        return (
            <Blueprint

                // grid={[
                //     {
                //         spacing: 30,
                //
                //     },
                //     {
                //         spacing: 60
                //     }
                // ]}


                guides={[
                    {
                        position: -10,
                        orientation: 'vertical',
                        unit: '%',
                        color: 'green',
                        width: 2
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
                        {'React Native Blueprint'}
                    </Text>
                </View>
            </Blueprint>
        );
    }
}
