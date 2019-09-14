import React from 'react';
import {
    Animated,
    Dimensions,
    Image,
    ImageRequireSource,
    ImageURISource, PanResponder,
    PixelRatio,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import {animateGenericNative} from "./Utils";
import Ruler from "./Ruler";
import Grid, {GridLines, Guides} from "./Grid";

const tiny = 8;
const small = 16;
const base = 24;
const large = 48;
const extra = 64;

const MAX_ZOOM = extra * 2;

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
     * Add image to pixel-perfect
     */
    image?: ImageURISource | ImageRequireSource;
}

type BlueprintState = {
    zoom: boolean;
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
        zoom: false,
        showRuler: false,
        gridAlign: 'hidden',
        photos: []
    };

    private animatedZoom = new Animated.Value(0);

    private animatedZoomSlideX = new Animated.Value(0);

    private animatedZoomSlideY = new Animated.Value(0);

    private x = 0;
    private y = 0;
    private z = 0;
    private zInit = 0;
    private xInit = 0;
    private yInit = 0;

    private panSliderZoom = PanResponder.create({
        onPanResponderGrant: () => {
            this.zInit = this.z;
        },
        onPanResponderMove: (event, gestureState) => {
            this.z = Math.max(0, Math.min(MAX_ZOOM, (this.zInit + gestureState.dx * 0.8)));
            this.animatedZoom.setValue(this.z);
        },
        onStartShouldSetPanResponder: (event, gestureState) => true,
    });

    private panSliderZoomSlide = PanResponder.create({
        onPanResponderGrant: () => {
            this.xInit = this.x;
            this.yInit = this.y;
        },
        onPanResponderMove: (event, gestureState) => {
            this.x = Math.max(-(screenWidth / 2), Math.min((screenWidth / 2), (this.xInit + gestureState.dx)));
            this.animatedZoomSlideX.setValue(this.x);

            this.y = Math.max(-(screenHeight / 2), Math.min((screenHeight / 2), (this.yInit + gestureState.dy)));
            this.animatedZoomSlideY.setValue(this.y);
        },
        onStartShouldSetPanResponder: (event, gestureState) => true,
    });

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


        return (
            <View style={[StyleSheet.absoluteFill, {backgroundColor: '#EDEDED'}]}>

                {/* Content */}
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            backgroundColor: '#FFF',
                            transform: [
                                {
                                    scale: this.animatedZoom.interpolate({
                                        inputRange: [0, MAX_ZOOM],
                                        outputRange: [1, 2]
                                    })
                                },
                                {
                                    translateX: this.animatedZoomSlideX.interpolate({
                                        inputRange: [-screenWidth, screenWidth],
                                        outputRange: [-screenWidth, screenWidth]
                                    })
                                },
                                {
                                    translateY: this.animatedZoomSlideY.interpolate({
                                        inputRange: [-screenHeight, screenHeight],
                                        outputRange: [-screenHeight, screenHeight]
                                    })
                                }
                            ]
                        }
                    ]}
                    pointerEvents={'box-none'}
                >
                    {this.props.children}

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


                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: large,
                            justifyContent: 'flex-end',
                            alignItems: 'flex-start',
                            opacity: this.animatedVisibility
                        }
                    ]}
                    pointerEvents={'box-none'}
                >
                    {/*Zoom*/}
                    <Animated.View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: tiny,
                            transform: [
                                {
                                    translateX: this.animatedVisibility.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [-(large + extra * 2 + tiny), small]
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
                                borderColor: '#2C2C2CAA',
                                borderWidth: 1
                            }}
                        >
                            <View
                                style={{
                                    height: small,
                                    width: small,
                                    borderRadius: small,
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
                                        lineHeight: small * 1.2,
                                        fontSize: small,
                                        textAlignVertical: 'center',
                                        color: '#18A0FB'
                                    }}
                                >{'+'}</Text>
                            </View>
                        </TouchableOpacity>

                        {
                            this.state.zoom ? (
                                <React.Fragment>
                                    <View
                                        style={{
                                            height: large - tiny,
                                            width: extra * 2,
                                            borderRadius: large - tiny,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginLeft: tiny,
                                            borderColor: '#2C2C2CAA',
                                            backgroundColor: "#18A0FB33",
                                            borderWidth: 1,
                                            paddingHorizontal: tiny
                                        }}
                                        {...this.panSliderZoom.panHandlers}
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
                                                width: large - tiny - 1,
                                                height: large - tiny - 1,
                                                borderRadius: large - tiny - 1,
                                                backgroundColor: '#18A0FB',
                                                transform: [
                                                    {
                                                        translateX: this.animatedZoom.interpolate({
                                                            inputRange: [0, extra * 2],
                                                            outputRange: [-(extra - ((large - tiny - 1) / 2) - 0.5), (extra - ((large - tiny - 1) / 2) - 1)]
                                                        })
                                                    }
                                                ]
                                            }}
                                            pointerEvents={'none'}
                                        />
                                    </View>
                                </React.Fragment>
                            ) : null
                        }
                    </Animated.View>

                    {/*Ruler*/}
                    <Animated.View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: tiny,
                            transform: [
                                {
                                    translateX: this.animatedVisibility.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [-(large + base * 3), small]
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

                    {/*Grid*/}
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
                                borderWidth: 1,

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

                    {/*Logo*/}
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

                {
                    this.state.zoom ? (
                        <React.Fragment>
                            <Animated.View
                                style={{
                                    position: 'absolute',
                                    left: tiny * 4 + extra * 2 + large,
                                    bottom: extra + large * 3 + tiny * 3,
                                    width: large,
                                    height: large,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    zIndex: 5000,
                                    opacity: this.animatedVisibility,
                                    transform: [
                                        {
                                            translateX: this.animatedVisibility.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [-(tiny * 4 + extra * 2 + large * 2), 0]
                                            })
                                        }
                                    ]
                                }}
                                pointerEvents={'box-only'}
                                {...this.panSliderZoomSlide.panHandlers}
                            >
                                <Image
                                    source={require('./../assets/move.png')}
                                    style={{
                                        width: large - tiny,
                                        height: large - tiny,
                                        tintColor: '#18A0FB'
                                    }}
                                    width={large - tiny}
                                    height={large - tiny}
                                />
                            </Animated.View>

                            <Animated.View
                                style={{
                                    position: 'absolute',
                                    left: tiny * 4 + extra * 2 + large * 2,
                                    bottom: extra + large * 3 + tiny * 3,
                                    width: large,
                                    height: large,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    zIndex: 5000,
                                    opacity: this.animatedVisibility,
                                    transform: [
                                        {
                                            translateX: this.animatedVisibility.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [-(tiny * 4 + extra * 2 + large * 3), 0]
                                            })
                                        }
                                    ]
                                }}
                            >
                                <TouchableOpacity
                                    onPress={() => {
                                        this.x = this.y = this.z = 0;
                                        animateGenericNative(this.animatedZoom, 0);
                                        animateGenericNative(this.animatedZoomSlideX, 0);
                                        animateGenericNative(this.animatedZoomSlideY, 0);
                                    }}
                                >
                                    <Image
                                        source={require('./../assets/reset.png')}
                                        style={{
                                            width: large - tiny,
                                            height: large - tiny,
                                            tintColor: '#18A0FB'
                                        }}
                                        width={large - tiny}
                                        height={large - tiny}
                                    />
                                </TouchableOpacity>
                            </Animated.View>
                        </React.Fragment>
                    ) : null
                }
            </View>
        )
    }


}
