import React from 'react';
import {
    Animated,
    Dimensions,
    Image,
    ImageRequireSource,
    ImageURISource,
    PanResponder,
    PanResponderInstance,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import {animateGenericNative, base, extra, large, small, tiny} from "./Utils";
import Ruler from "./Ruler";
import Grid, {GridLines, Guides} from "./Grid";
import ImageSelect, {ImageInfo, ImageInfoAsync} from "./ImageSelect";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);


const MAX_SLIDER_VALUE = large * 2;

const dimentions = Dimensions.get('screen');
const screenWidth = dimentions.width;
const screenHeight = dimentions.height;

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
     * Server images
     */
    imagesAsync?: () => Promise<Array<ImageInfoAsync>>;

    /**
     * Add image to pixel-perfect
     */
    images?: Array<ImageURISource | ImageRequireSource>;
}

type BlueprintState = {
    zoom: boolean;
    ruler: boolean;
    gridAlign: 'side' | 'center' | 'left' | 'right' | 'hidden';
    showSelectImageModal: boolean;
    image?: ImageInfo;
    packagerRunning: boolean;
};

const Slider = (props: { pan: PanResponderInstance, value: Animated.Value }) => {

    const height = large;
    const maxmin = (MAX_SLIDER_VALUE) / 4;

    return (
        <View
            style={{
                height: height,
                width: MAX_SLIDER_VALUE,
                borderRadius: height,
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: tiny,
                borderColor: '#18A0FB',
                backgroundColor: "#18A0FB33",
                borderWidth: 1,
                paddingHorizontal: tiny
            }}
            {...props.pan.panHandlers}
            pointerEvents={'auto'}
        >
            <Animated.View
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: 1,
                    backgroundColor: '#18A0FB'
                }}
                pointerEvents={'none'}
            />
            <Animated.View
                style={{
                    width: height - 2,
                    height: height - 2,
                    borderRadius: height - 2,
                    backgroundColor: '#18A0FB',
                    transform: [
                        {
                            translateX: props.value.interpolate({
                                inputRange: [0, MAX_SLIDER_VALUE],
                                outputRange: [-maxmin, maxmin]
                            })
                        }
                    ]
                }}
                pointerEvents={'none'}
            />
        </View>
    )
};

/**
 * Add guidelines on screen
 */
export default class Blueprint extends React.PureComponent<BlueprintProps, BlueprintState> {

    state: BlueprintState = {
        zoom: false,
        ruler: false,
        gridAlign: 'hidden',
        showSelectImageModal: false,
        packagerRunning: false
    };

    private interacting = false;

    private zoomXValue = new Animated.Value(0);

    private zoomYValue = new Animated.Value(0);

    private zoomScaleValue = new Animated.Value(0);

    private zoomX = 0;

    private zoomY = 0;

    private zoomScale = 0;

    private zoomXInit = 0;

    private zoomYInit = 0;

    private zoomScaleInit = 0;

    private imageScaleValue = new Animated.Value(0);

    private imageOpacityValue = new Animated.Value(0);

    private imageXValue = new Animated.Value(0);

    private imageYValue = new Animated.Value(0);

    private imageX = 0;

    private imageY = 0;

    private imageScale = 0;

    private imageOpacity = 0;

    private imageXInit = 0;

    private imageYInit = 0;

    private imageScaleInit = 0;

    private imageOpacityInit = 0;

    private animatedVisibility = new Animated.Value(0);

    private visible = false;

    private ruler?: Ruler;

    private timeout: any;

    private zoomScalePan = PanResponder.create({
        onPanResponderGrant: () => {
            this.zoomScaleInit = this.zoomScale;
            this.interacting = true;
        },
        onPanResponderMove: (event, gestureState) => {
            this.zoomScale = Math.max(0, Math.min(MAX_SLIDER_VALUE, (this.zoomScaleInit + gestureState.dx * 0.8)));
            this.zoomScaleValue.setValue(this.zoomScale);
        },
        onPanResponderEnd: e => {
            this.interacting = false;
            this.hideSchedule();
        },
        onStartShouldSetPanResponder: (event, gestureState) => true,
    });

    private zoomXYPan = PanResponder.create({
        onPanResponderGrant: () => {
            this.zoomXInit = this.zoomX;
            this.zoomYInit = this.zoomY;
            this.interacting = true;
        },
        onPanResponderMove: (event, gestureState) => {
            // The higher the zoom, the slower the drag speed
            const speedMax = 1;
            const speedMin = 0.5;
            const speed = (this.zoomScale) * (speedMin - speedMax) / (MAX_SLIDER_VALUE) + speedMax;

            this.zoomX = Math.max(-(screenWidth / 2), Math.min((screenWidth / 2), (this.zoomXInit + gestureState.dx * speed)));
            this.zoomXValue.setValue(this.zoomX);

            this.zoomY = Math.max(-(screenHeight / 2), Math.min((screenHeight / 2), (this.zoomYInit + gestureState.dy * speed)));
            this.zoomYValue.setValue(this.zoomY);
        },
        onPanResponderEnd: e => {
            this.interacting = false;
            this.hideSchedule();
        },
        onStartShouldSetPanResponder: (event, gestureState) => true,
    });

    private imageOpacityPan = PanResponder.create({
        onPanResponderGrant: () => {
            this.imageOpacityInit = this.imageOpacity;
            this.interacting = true;
        },
        onPanResponderMove: (event, gestureState) => {
            this.imageOpacity = Math.max(0, Math.min(MAX_SLIDER_VALUE, (this.imageOpacityInit + gestureState.dx * 0.8)));
            this.imageOpacityValue.setValue(this.imageOpacity);
        },
        onPanResponderEnd: e => {
            this.interacting = false;
            this.hideSchedule();
        },
        onStartShouldSetPanResponder: (event, gestureState) => true,
    });

    private imageScalePan = PanResponder.create({
        onPanResponderGrant: () => {
            this.imageScaleInit = this.imageScale;
            this.interacting = true;
        },
        onPanResponderMove: (event, gestureState) => {
            // Reduces scale speed
            const reducer = 0.2;

            this.imageScale = Math.max(0, Math.min(MAX_SLIDER_VALUE, (this.imageScaleInit + gestureState.dx * reducer)));
            this.imageScaleValue.setValue(this.imageScale);
        },
        onPanResponderEnd: e => {
            this.interacting = false;
            this.hideSchedule();
        },
        onStartShouldSetPanResponder: (event, gestureState) => true,
    });


    private imageXYPan = PanResponder.create({
        onPanResponderGrant: () => {
            this.imageXInit = this.imageX;
            this.imageYInit = this.imageY;
            this.interacting = true;
        },
        onPanResponderMove: (event, gestureState) => {
            // Reduces drag speed
            const reducer = 0.5;

            // The higher the zoom, the slower the drag speed
            const speedMax = 1;
            const speedMin = 0.5;
            const speed = (this.zoomScale) * (speedMin - speedMax) / (MAX_SLIDER_VALUE) + speedMax;

            this.imageX = Math.max(-(screenWidth / 2), Math.min((screenWidth / 2), (this.imageXInit + gestureState.dx * speed * reducer)));
            this.imageXValue.setValue(this.imageX);

            this.imageY = Math.max(-(screenHeight / 2), Math.min((screenHeight / 2), (this.imageYInit + gestureState.dy * speed * reducer)));
            this.imageYValue.setValue(this.imageY);
        },
        onPanResponderEnd: e => {
            this.interacting = false;
            this.hideSchedule();
        },
        onStartShouldSetPanResponder: (event, gestureState) => true,
    });

    /**
     * Schedule to hide Buttons after 4 seconds
     */
    private hideSchedule = () => {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            if (this.interacting) {
                // re schedule
                return this.hideSchedule();
            }
            this.visible = false;
            animateGenericNative(this.animatedVisibility, 0);
        }, 4000);
    };

    componentDidMount(): void {
        fetch('http://localhost:8081/')
            .then(value => {
                this.setState({
                    packagerRunning: true
                })
            })
            .catch(reason => {
                // ignore
            })
    }

    render() {
        if (this.props.disabled) {
            return this.props.children;
        }

        const {width, height} = Dimensions.get('screen');


        return (
            <View style={[StyleSheet.absoluteFill, {backgroundColor: '#EDEDED'}]}>
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            backgroundColor: '#FFF',
                            transform: [
                                {
                                    scale: this.zoomScaleValue.interpolate({
                                        inputRange: [0, MAX_SLIDER_VALUE],
                                        outputRange: [1, 2]
                                    })
                                },
                                {
                                    translateX: this.zoomXValue.interpolate({
                                        inputRange: [-screenWidth, screenWidth],
                                        outputRange: [-screenWidth, screenWidth]
                                    })
                                },
                                {
                                    translateY: this.zoomYValue.interpolate({
                                        inputRange: [-screenHeight, screenHeight],
                                        outputRange: [-screenHeight, screenHeight]
                                    })
                                }
                            ]
                        }
                    ]}
                    pointerEvents={'box-none'}
                >
                    {/* Content */}
                    {this.props.children}


                    {
                        this.state.image
                            ? (
                                <Animated.Image
                                    source={this.state.image}
                                    style={{
                                        width: screenWidth,
                                        height: screenHeight,
                                        resizeMode: 'contain',
                                        opacity: this.imageOpacityValue.interpolate({
                                            inputRange: [0, MAX_SLIDER_VALUE],
                                            outputRange: [0, 1]
                                        }),
                                        transform: [
                                            {
                                                scale: this.imageScaleValue.interpolate({
                                                    inputRange: [0, MAX_SLIDER_VALUE],
                                                    outputRange: [0.3, 2]
                                                })
                                            },
                                            {
                                                translateX: this.imageXValue.interpolate({
                                                    inputRange: [-screenWidth, screenWidth],
                                                    outputRange: [-screenWidth, screenWidth]
                                                })
                                            },
                                            {
                                                translateY: this.imageYValue.interpolate({
                                                    inputRange: [-screenHeight, screenHeight],
                                                    outputRange: [-screenHeight, screenHeight]
                                                })
                                            }
                                        ]
                                    }}
                                />
                            )
                            : null
                    }

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
                        this.state.ruler ? (
                            <Ruler
                                ref={(ruler) => {
                                    this.ruler = ruler || undefined;
                                }}
                            />
                        ) : null
                    }
                </Animated.View>

                {/* Buttons */}
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            opacity: this.animatedVisibility
                        }
                    ]}
                    pointerEvents={'box-none'}
                >


                    {/*Logo*/}
                    <TouchableOpacity
                        onPress={event => {
                            clearTimeout(this.timeout);
                            if (this.visible) {
                                this.visible = false;
                                animateGenericNative(this.animatedVisibility, 0);
                            } else {
                                this.visible = true;
                                this.hideSchedule();
                                animateGenericNative(this.animatedVisibility, 1);
                            }
                        }}
                        style={{
                            position: 'absolute',
                            left: 0,
                            bottom: large,
                            height: extra,
                            width: extra,
                            marginLeft: tiny,
                            borderRadius: extra,
                            backgroundColor: '#18A0FB33',
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

                    {/*Grid*/}
                    <AnimatedTouchableOpacity
                        style={{
                            position: 'absolute',
                            left: 0,
                            bottom: large + extra + tiny,
                            flexDirection: 'row',
                            alignItems: 'center',
                            height: large,
                            width: large,
                            borderRadius: large,
                            justifyContent: 'center',
                            borderColor: '#18A0FB',
                            borderWidth: 1,
                            transform: [
                                {
                                    translateX: this.animatedVisibility.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [-large, small]
                                    })
                                }
                            ]
                        }}
                        onPress={() => {

                            const OPTIONS = ['side', 'center', 'left', 'right', 'hidden'];
                            let index = OPTIONS.indexOf(this.state.gridAlign);
                            let newPosition = OPTIONS[index + 1] || 'side';

                            this.setState({
                                gridAlign: newPosition as any
                            });

                            this.hideSchedule();
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
                    </AnimatedTouchableOpacity>

                    {/*Ruler*/}
                    <Animated.View
                        style={{
                            position: 'absolute',
                            left: 0,
                            bottom: large * 2 + extra + tiny * 2,
                            flexDirection: 'row',
                            alignItems: 'center',
                            transform: [
                                {
                                    translateX: this.animatedVisibility.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [-(large * 4), small]
                                    })
                                }
                            ]
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                this.hideSchedule();
                                this.setState({
                                    ruler: !this.state.ruler
                                });
                            }}
                            style={{
                                height: large,
                                width: large,
                                borderRadius: large,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderColor: '#18A0FB',
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
                            this.state.ruler ? (
                                <React.Fragment>
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.hideSchedule();
                                            if (this.ruler) {
                                                this.ruler.changeUnit();
                                            }
                                        }}
                                        style={{
                                            height: large,
                                            width: large,
                                            borderRadius: large,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginLeft: tiny,
                                            borderColor: '#18A0FB',
                                            borderWidth: 1
                                        }}

                                    >
                                        <Text
                                            style={{
                                                color: '#18A0FB',
                                                fontSize: base,
                                                fontFamily: 'System',
                                                lineHeight: large,
                                                textAlignVertical: 'center'
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
                                            height: large,
                                            width: large,
                                            borderRadius: large,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginLeft: tiny,
                                            borderColor: '#18A0FB',
                                            borderWidth: 1
                                        }}

                                    >
                                        <Text
                                            style={{
                                                color: '#18A0FB',
                                                fontSize: base,
                                                fontFamily: 'System',
                                                lineHeight: large,
                                                textAlignVertical: 'center'
                                            }}
                                        >{'S'}</Text>
                                    </TouchableOpacity>
                                </React.Fragment>
                            ) : null
                        }
                    </Animated.View>

                    {/*Zoom*/}
                    <Animated.View
                        style={{
                            position: 'absolute',
                            left: 0,
                            bottom: large * 3 + extra + tiny * 3,
                            flexDirection: 'row',
                            alignItems: 'center',
                            transform: [
                                {
                                    translateX: this.animatedVisibility.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [-(large * 3 + extra * 2 + tiny), small]
                                    })
                                }
                            ]
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                this.hideSchedule();
                                this.setState({
                                    zoom: !this.state.zoom
                                });
                            }}
                            style={{
                                height: large,
                                width: large,
                                borderRadius: large,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderColor: '#18A0FB',
                                borderWidth: 1
                            }}
                        >
                            <View
                                style={{
                                    height: base,
                                    width: base,
                                    borderRadius: base,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderColor: '#18A0FB',
                                    backgroundColor: "#18A0FB33",
                                    borderWidth: 1,
                                }}
                            >
                                <Text
                                    style={{
                                        fontFamily: 'System',
                                        lineHeight: base * 1.2,
                                        fontSize: base,
                                        textAlignVertical: 'center',
                                        color: '#18A0FB'
                                    }}
                                >{'+'}</Text>
                            </View>
                        </TouchableOpacity>

                        {
                            this.state.zoom ? (
                                <React.Fragment>
                                    <Slider
                                        pan={this.zoomScalePan}
                                        value={this.zoomScaleValue}
                                    />

                                    <Animated.View
                                        style={{
                                            width: large,
                                            height: large,
                                            justifyContent: 'center',
                                            marginLeft: tiny,
                                            alignItems: 'center'
                                        }}
                                        pointerEvents={'box-only'}
                                        {...this.zoomXYPan.panHandlers}
                                    >
                                        <Image
                                            source={require('./../assets/move.png')}
                                            style={{
                                                width: large,
                                                height: large,
                                                tintColor: '#18A0FB'
                                            }}
                                            width={large}
                                            height={large}
                                        />
                                    </Animated.View>

                                    <Animated.View
                                        style={{
                                            width: large,
                                            height: large,
                                            justifyContent: 'center',
                                            marginLeft: tiny,
                                            alignItems: 'center'
                                        }}
                                    >
                                        <TouchableOpacity
                                            onPress={() => {
                                                this.zoomX = this.zoomY = this.zoomScale = 0;
                                                animateGenericNative(this.zoomScaleValue, 0);
                                                animateGenericNative(this.zoomXValue, 0);
                                                animateGenericNative(this.zoomYValue, 0);
                                            }}
                                        >
                                            <Image
                                                source={require('./../assets/reset.png')}
                                                style={{
                                                    width: large,
                                                    height: large,
                                                    tintColor: '#18A0FB'
                                                }}
                                                width={large}
                                                height={large}
                                            />
                                        </TouchableOpacity>
                                    </Animated.View>
                                </React.Fragment>
                            ) : null
                        }
                    </Animated.View>

                    {/*Image*/}
                    {
                        (this.props.images || this.props.imagesAsync)
                            ? (
                                <Animated.View
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        bottom: large * 4 + extra + tiny * 4,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        transform: [
                                            {
                                                translateX: this.animatedVisibility.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [-(large * 3 + MAX_SLIDER_VALUE * 2), small]
                                                })
                                            }
                                        ]
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.hideSchedule();
                                            if (this.state.image) {

                                                this.setState({
                                                    image: undefined
                                                })
                                            } else {
                                                this.setState({
                                                    showSelectImageModal: !this.state.showSelectImageModal
                                                }, () => {
                                                    this.interacting = this.state.showSelectImageModal;
                                                    this.hideSchedule();
                                                });
                                            }
                                        }}
                                        style={{
                                            height: large,
                                            width: large,
                                            borderRadius: large,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderColor: '#18A0FB',
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
                                                opacity: 0.5,
                                                transform: [
                                                    {translateX: -2},
                                                    {translateY: -2},
                                                ]
                                            }}
                                        />
                                        <View
                                            style={{
                                                position: 'absolute',
                                                height: small,
                                                width: small,
                                                borderColor: '#18A0FB',
                                                backgroundColor: "#18A0FB33",
                                                borderWidth: 1,
                                                opacity: 0.5,
                                                transform: [
                                                    {translateX: 2},
                                                    {translateY: 2},
                                                ]
                                            }}
                                        />
                                    </TouchableOpacity>

                                    {
                                        (this.state.image) ? (
                                            <React.Fragment>

                                                <Slider
                                                    pan={this.imageOpacityPan}
                                                    value={this.imageOpacityValue}
                                                />

                                                <Slider
                                                    pan={this.imageScalePan}
                                                    value={this.imageScaleValue}
                                                />

                                                <Animated.View
                                                    style={{
                                                        width: large,
                                                        height: large,
                                                        marginLeft: tiny,
                                                        justifyContent: 'center',
                                                        alignItems: 'center'
                                                    }}
                                                    pointerEvents={'box-only'}
                                                    {...this.imageXYPan.panHandlers}
                                                >
                                                    <Image
                                                        source={require('./../assets/move.png')}
                                                        style={{
                                                            width: large,
                                                            height: large,
                                                            tintColor: '#18A0FB'
                                                        }}
                                                        width={large}
                                                        height={large}
                                                    />
                                                </Animated.View>
                                            </React.Fragment>
                                        ) : null
                                    }
                                </Animated.View>
                            )
                            : null
                    }

                    {/* Reload app */}
                    {
                        this.state.packagerRunning
                            ? (
                                <Animated.View
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        bottom: large * 5 + extra + tiny * 5,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        transform: [
                                            {
                                                translateX: this.animatedVisibility.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [-(large + small), small]
                                                })
                                            }
                                        ]
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={() => {
                                            fetch('http://localhost:8081/reload')
                                                .then(value => {
                                                })
                                                .catch(reason => {
                                                });
                                        }}
                                    >
                                        <Image
                                            source={require('./../assets/reset.png')}
                                            style={{
                                                width: large,
                                                height: large,
                                                tintColor: '#18A0FB'
                                            }}
                                            width={large}
                                            height={large}
                                        />
                                    </TouchableOpacity>
                                </Animated.View>
                            ) : null
                    }


                    {
                        this.state.showSelectImageModal
                            ? (
                                <Animated.View
                                    style={[
                                        StyleSheet.absoluteFill,
                                        {
                                            opacity: this.animatedVisibility,
                                            transform: [
                                                {
                                                    translateX: this.animatedVisibility.interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: [-screenWidth, 0]
                                                    })
                                                }
                                            ]
                                        }
                                    ]}
                                    pointerEvents={'box-none'}
                                >
                                    <ImageSelect
                                        width={screenWidth - tiny * 2}
                                        bottom={large + extra + tiny - 2}
                                        left={tiny}
                                        height={large * 3 + tiny * 2 + 4}
                                        images={this.props.images}
                                        imagesAsync={this.props.imagesAsync}
                                        onSelect={image => {
                                            // Reset values
                                            this.imageX = 0;
                                            this.imageY = 0;
                                            this.imageScale = MAX_SLIDER_VALUE / 3;
                                            this.imageOpacity = MAX_SLIDER_VALUE / 3;
                                            this.imageXValue.setValue(this.imageX);
                                            this.imageYValue.setValue(this.imageY);
                                            this.imageScaleValue.setValue(this.imageScale);
                                            this.imageOpacityValue.setValue(this.imageOpacity);


                                            this.interacting = false;
                                            this.hideSchedule();

                                            this.setState({
                                                image: image,
                                                showSelectImageModal: false
                                            })
                                        }}
                                    />
                                </Animated.View>
                            )
                            : null
                    }
                </Animated.View>


            </View>
        )
    }


}
