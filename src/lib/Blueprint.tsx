import React from 'react';
import {
    Animated,
    Dimensions,
    Image,
    ImageRequireSource,
    ImageURISource,
    PixelRatio,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import {animateGenericNative} from "./Utils";
import Ruler from "./Ruler";
import Grid, {GridLines, Guides} from "./Grid";

export type BlueprintProps = {
    /**
     * Desabilita completamente o Blueprint
     */
    disabled?: boolean;

    /**
     * Add guides on screen. Percentual, points or pixel. Ex. v50%, h50%, v10px, v10p
     */
    guides?: Guides;

    /**
     * Allows you to add regularly spaced marker lines on the screen
     */
    grid?: GridLines;

    /**
     * Add image to pixel-perfect
     */
    image?: ImageURISource | ImageRequireSource;
}

type BlueprintState = {
    showRuler: boolean;
    gridAlign: 'side' | 'center' | 'left' | 'right' | 'hidden';
    imageSize?: { width: number, height: number, uri: string };
    photos: Array<any>
}

/**
 * Add guidelines on screen
 */
export default class Blueprint extends React.PureComponent<BlueprintProps, BlueprintState> {

    state: BlueprintState = {
        showRuler: false,
        gridAlign: 'hidden',
        photos: []
    };

    private animatedVisibility = new Animated.Value(0);

    private visible = true;

    private ruler?: Ruler;

    private timeout: any;

    /**
     * Schedule to hide Buttons after 4 seconds
     */
    private hideSchedule = () => {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.visible = false;
            animateGenericNative(this.animatedVisibility, 0);
        }, 4000);
    };

    resolveImage = () => {
        this.setState({
            imageSize: undefined
        }, async () => {
            if (this.props.image) {
                let imageSize = await this.getImageSize();
                this.setState({
                    imageSize: imageSize
                });
            }
        });
    };

    async getImageSize(): Promise<undefined | { width: number, height: number, uri: string }> {
        if (this.props.image) {
            if (typeof this.props.image === "number") {
                return Image.resolveAssetSource(this.props.image);
            }

            const uri = this.props.image.uri as string;

            return new Promise((resolve, reject) => {
                Image.getSize(uri, (width: number, height: number) => {
                    resolve({
                        uri: uri,
                        width: width,
                        height: height
                    })
                }, reject);
            })
        }
        return Promise.resolve(undefined);
    }

    componentDidMount(): void {
        this.resolveImage();
    }

    componentDidUpdate(prevProps: Readonly<BlueprintProps>, prevState: Readonly<BlueprintState>, snapshot?: any) {
        if (prevProps.image !== this.props.image) {
            this.resolveImage();
        }
    }

    render() {
        if (this.props.disabled) {
            return this.props.children;
        }

        const {width, height} = Dimensions.get('screen');

        const tiny = 8;
        const small = 16;
        const base = 24;
        const large = 48;
        const extra = 64;

        return (
            <View style={StyleSheet.absoluteFill}>

                {/* Content */}
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill
                    ]}
                    pointerEvents={'box-none'}
                >
                    {this.props.children}
                </Animated.View>

                {/* Pixel Perfect Image */}
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill
                    ]}
                    pointerEvents={'box-none'}
                >
                    {
                        this.state.imageSize ? (
                            <View>
                                <Text>
                                    {JSON.stringify(this.state.imageSize)}
                                </Text>
                            </View>
                        ) : null
                    }
                </Animated.View>

                {
                    this.state.gridAlign !== 'hidden'
                        ? (
                            <Grid
                                grid={this.props.grid}
                                guides={this.props.guides}
                                align={this.state.gridAlign}
                            />
                        )
                        : null
                }


                {
                    this.state.showRuler ? (
                        <Ruler
                            ref={(ruler) => {
                                this.ruler = ruler || undefined;
                            }}
                        />
                    ) : null
                }

                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: large,
                            justifyContent: 'flex-end',
                            alignItems: 'flex-start',
                            opacity: this.animatedVisibility.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 0.7]
                            })
                        }
                    ]}
                    pointerEvents={'box-none'}
                >
                    <Animated.View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: tiny,
                            transform: [
                                {
                                    translateX: this.animatedVisibility.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [-large, small]
                                    })
                                }
                            ]
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                this.hideSchedule();
                                this.setState({
                                    showRuler: !this.state.showRuler
                                });
                            }}
                            style={{
                                height: large,
                                width: large,
                                borderRadius: large,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderColor: '#2C2C2CAA',
                                borderWidth: 1
                            }}
                        >
                            <View
                                style={{
                                    height: small,
                                    width: small,
                                    borderColor: '#18A0FB',
                                    backgroundColor: "#18A0FB33",
                                    borderWidth: 1,
                                }}
                            />
                        </TouchableOpacity>

                        {
                            this.state.showRuler ? (
                                <React.Fragment>
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.hideSchedule();
                                            if (this.ruler) {
                                                this.ruler.changeUnit();
                                            }
                                        }}
                                        style={{
                                            height: base,
                                            width: base,
                                            borderRadius: base,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginLeft: tiny,
                                            borderColor: '#2C2C2CAA',
                                            backgroundColor: "#18A0FB33",
                                            borderWidth: 1
                                        }}

                                    >
                                        <Text
                                            style={{
                                                color: '#18A0FB'
                                            }}
                                        >{'U'}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => {
                                            this.hideSchedule();
                                            if (this.ruler) {
                                                this.ruler.changeSensitivity();
                                            }
                                        }}
                                        style={{
                                            height: base,
                                            width: base,
                                            borderRadius: base,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginLeft: tiny,
                                            borderColor: '#2C2C2CAA',
                                            backgroundColor: "#18A0FB33",
                                            borderWidth: 1
                                        }}

                                    >
                                        <Text
                                            style={{
                                                color: '#18A0FB'
                                            }}
                                        >{'S'}</Text>
                                    </TouchableOpacity>
                                </React.Fragment>
                            ) : null
                        }
                    </Animated.View>


                    <Animated.View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: tiny,
                            transform: [
                                {
                                    translateX: this.animatedVisibility.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [-large, small]
                                    })
                                }
                            ]
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => {

                                const OPTIONS = ['side', 'center', 'left', 'right', 'hidden'];
                                let index = OPTIONS.indexOf(this.state.gridAlign);
                                let newPosition = OPTIONS[index + 1] || 'side';

                                this.setState({
                                    gridAlign: newPosition as any
                                });

                                this.hideSchedule();
                            }}
                            style={{
                                height: large,
                                width: large,
                                borderRadius: large,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderColor: '#2C2C2CAA',
                                borderWidth: 1
                            }}
                        >
                            <View
                                style={
                                    this.state.gridAlign === 'center'
                                        ? {
                                            height: small,
                                            width: 2,
                                            alignSelf: 'center',
                                            backgroundColor: '#18A0FB',
                                        }
                                        : (
                                            this.state.gridAlign === 'hidden'
                                                ? {

                                                    opacity: 0

                                                }
                                                : {
                                                    height: small,
                                                    width: small,
                                                    borderColor: '#18A0FB',
                                                    borderRightWidth: this.state.gridAlign === 'left' ? 0 : 2,
                                                    borderLeftWidth: this.state.gridAlign === 'right' ? 0 : 2
                                                }
                                        )
                                }
                            />
                        </TouchableOpacity>
                    </Animated.View>


                    <TouchableOpacity
                        onPress={event => {
                            clearTimeout(this.timeout);
                            if (this.visible) {
                                animateGenericNative(this.animatedVisibility, 0);
                            } else {
                                this.hideSchedule();
                                animateGenericNative(this.animatedVisibility, 1);
                            }

                            this.visible = !this.visible;
                        }}
                        style={{
                            height: extra,
                            width: extra,
                            marginLeft: tiny,
                            borderRadius: extra,
                            backgroundColor: '#18A0FB33'
                        }}
                    >
                        <Image
                            source={require('./../assets/logo.png')}
                            style={{
                                width: extra,
                                height: extra,
                                resizeMode: 'stretch'
                            }}
                            width={extra}
                            height={extra}
                        />
                    </TouchableOpacity>
                </Animated.View>
            </View>
        )
    }


}
