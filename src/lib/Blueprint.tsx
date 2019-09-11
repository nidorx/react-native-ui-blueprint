import React from 'react';
import {
    Animated,
    Dimensions,
    Image,
    ImageRequireSource,
    ImageURISource,
    PanResponder,
    PixelRatio,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import {animateGenericNative} from "./Utils";


const MAGENTA = '#ff4aff';
const CYAN = '#4affff';
const GRAY = '#828282';

const pixelRatio = PixelRatio.get();

function pointToPixel(points: number) {
    return points * pixelRatio;
}

function pixelToPoint(pixels: number) {
    return pixels / pixelRatio;
}

export type Guides = Array<{
    position: number;
    orientation: 'horizontal' | 'vertical';
    units?: 'percent' | 'point';
    color?: string;
    opacity?: number;
    width?: number;
}>;

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
     * Add image to pixel-perfect
     */
    image?: ImageURISource | ImageRequireSource;
}

type BlueprintState = {
    align: 'center' | 'side' | 'hidden';
    imageSize?: { width: number, height: number, uri: string };
    photos: Array<any>
}

/**
 * Add guidelines on screen
 */
export default class Blueprint extends React.PureComponent<BlueprintProps, BlueprintState> {

    state: BlueprintState = {
        align: 'side',
        photos: []
    };

    private animatedGridValue = new Animated.Value(0);

    private ruler = (() => {

        const MIN_SIZE = 8;
        const MIN_SIZE_PX = pointToPixel(MIN_SIZE);

        const dimentions = Dimensions.get('screen');
        const screenWidth = dimentions.width;
        const screenWidthPx = pointToPixel(screenWidth);
        const screenHeight = dimentions.height;
        const screenHeightPx = pointToPixel(screenHeight);


        let pointsHorizontal = [];
        let pointsVertical = [];

        for (let a = 0; a < screenWidthPx; a += MIN_SIZE_PX) {
            pointsHorizontal.push(pixelToPoint(a));
        }

        for (let a = 0; a < screenHeightPx; a += MIN_SIZE_PX) {
            pointsVertical.push(pixelToPoint(a));
        }

        let top = 50;
        let topInit = 0;

        let height = 100;
        let heightInit = 0;

        let left = 50;
        let leftInit = 0;

        let width = 50;
        let widthInit = 0;

        let valueLeft = new Animated.Value(left);
        let valueWidth = new Animated.Value(width);

        let valueTop = new Animated.Value(top);
        let valueHeigth = new Animated.Value(height);

        return {
            points: {
                vertical: pointsVertical,
                horizontal: pointsHorizontal
            },
            valueTop: valueTop,
            valueLeft: valueLeft,
            valueWidth: valueWidth,
            valueHeigth: valueHeigth,
            valueBottom: Animated.add(
                valueTop.interpolate({
                    inputRange: [0, screenHeight],
                    outputRange: [0, screenHeight]
                }),
                valueHeigth.interpolate({
                    inputRange: [0, screenHeight],
                    outputRange: [0, screenHeight]
                })
            ),
            valueRight: Animated.add(
                valueLeft.interpolate({
                    inputRange: [0, screenWidth],
                    outputRange: [0, screenWidth]
                }),
                valueWidth.interpolate({
                    inputRange: [0, screenWidth],
                    outputRange: [0, screenWidth]
                })
            ),
            panCenter: PanResponder.create({
                onPanResponderGrant: () => {
                    topInit = top;
                    leftInit = left;
                    widthInit = width;
                    heightInit = height;
                },
                onPanResponderMove: (event, gestureState) => {
                    const maxRight = (leftInit + widthInit) - MIN_SIZE;
                    const maxBottom = (topInit + heightInit) - MIN_SIZE;
                },
                onStartShouldSetPanResponder: (event, gestureState) => true,
            }),
            panTopLeft: PanResponder.create({
                onPanResponderGrant: () => {
                    topInit = top;
                    leftInit = left;
                    widthInit = width;
                    heightInit = height;
                },
                onPanResponderMove: (event, gestureState) => {
                    const maxRight = (leftInit + widthInit) - MIN_SIZE;
                    const maxBottom = (topInit + heightInit) - MIN_SIZE;

                    top = Math.max(0, Math.min(maxBottom, (topInit + gestureState.dy)));
                    valueTop.setValue(top);

                    left = Math.max(0, Math.min(maxRight, (leftInit + gestureState.dx)));
                    valueLeft.setValue(left);

                    width = maxRight - left + MIN_SIZE;
                    valueWidth.setValue(width);

                    height = maxBottom - top + MIN_SIZE;
                    valueHeigth.setValue(height);

                },
                onStartShouldSetPanResponder: (event, gestureState) => true,
            }),
            panTopRight: PanResponder.create({
                onPanResponderGrant: () => {
                    topInit = top;
                    widthInit = width;
                    heightInit = height;
                },
                onPanResponderMove: (event, gestureState) => {
                    const maxBottom = (topInit + heightInit) - MIN_SIZE;

                    top = Math.max(0, Math.min(maxBottom, (topInit + gestureState.dy)));
                    valueTop.setValue(top);

                    height = maxBottom - top + MIN_SIZE;
                    valueHeigth.setValue(height);

                    width = Math.max(MIN_SIZE, Math.min(screenWidth, (widthInit + gestureState.dx)));
                    valueWidth.setValue(width);
                },
                onStartShouldSetPanResponder: (event, gestureState) => true,
            }),
            panBottomLeft: PanResponder.create({
                onPanResponderGrant: () => {
                    leftInit = left;
                    widthInit = width;
                    heightInit = height;
                },
                onPanResponderMove: (event, gestureState) => {
                    const maxRight = (leftInit + widthInit) - MIN_SIZE;

                    left = Math.max(0, Math.min(maxRight, (leftInit + gestureState.dx)));
                    valueLeft.setValue(left);

                    width = maxRight - left + MIN_SIZE;
                    valueWidth.setValue(width);

                    height = Math.max(MIN_SIZE, Math.min(screenHeight, (heightInit + gestureState.dy)));
                    valueHeigth.setValue(height);
                },
                onStartShouldSetPanResponder: (event, gestureState) => true,
            }),
            panBottomRight: PanResponder.create({
                onPanResponderGrant: () => {
                    widthInit = width;
                    heightInit = height;
                },
                onPanResponderMove: (event, gestureState) => {
                    width = Math.max(MIN_SIZE, Math.min(screenWidth, (widthInit + gestureState.dx)));
                    valueWidth.setValue(width);

                    height = Math.max(MIN_SIZE, Math.min(screenHeight, (heightInit + gestureState.dy)));
                    valueHeigth.setValue(height);
                },
                onStartShouldSetPanResponder: (event, gestureState) => true,
            })
        }
    })();

    private visible = true;

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

        if (prevState.align !== this.state.align) {
            if (this.state.align === 'hidden') {
                animateGenericNative(this.animatedGridValue, 0);
            } else {
                animateGenericNative(this.animatedGridValue, 1);
            }
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

        let rulerV: Guides = [];

        let maxPx = pointToPixel(width);
        let spacingPx = pointToPixel(tiny);
        for (let a = 0; a < maxPx; a += spacingPx) {
            rulerV.push({
                position: pixelToPoint(a),
                orientation: 'vertical',
                units: 'point',
                color: GRAY,
                opacity: 1,
            });
        }

        let guides: Guides = [];
        if (this.props.guides) {
            guides = this.props.guides
        } else {
            guides = [
                // Default guides
                {
                    position: 50,
                    orientation: 'horizontal',
                    units: 'percent'
                },
                {
                    position: 50,
                    orientation: 'vertical',
                    units: 'percent'
                }
            ];

            const addGuides = (
                maxPx: number,
                spacingPx: number,
                orientation: 'horizontal' | 'vertical',
                color: string,
                opacity: number,
                width?: number,
                ruler?: boolean
            ) => {
                if (orientation === 'vertical') {
                    let midle = maxPx / 2;
                    if (this.state.align === 'center') {
                        for (let a = midle - spacingPx; a >= 0; a -= spacingPx) {
                            guides.push({
                                position: pixelToPoint(a),
                                orientation: orientation,
                                units: 'point',
                                color: color,
                                opacity: opacity,
                                width: width
                            });
                        }
                        for (let a = midle - spacingPx; a <= maxPx; a += spacingPx) {
                            guides.push({
                                position: pixelToPoint(a),
                                orientation: orientation,
                                units: 'point',
                                color: color,
                                opacity: opacity,
                                width: width
                            });
                        }
                    } else {
                        for (let a = spacingPx; a < midle; a += spacingPx) {
                            guides.push({
                                position: pixelToPoint(a),
                                orientation: orientation,
                                units: 'point',
                                color: color,
                                opacity: opacity,
                                width: width
                            });
                        }
                        for (let a = maxPx - spacingPx; a > midle; a -= spacingPx) {
                            guides.push({
                                position: pixelToPoint(a),
                                orientation: orientation,
                                units: 'point',
                                color: color,
                                opacity: opacity,
                                width: width
                            });
                        }
                    }
                } else {
                    for (let a = spacingPx; a <= maxPx; a += spacingPx) {
                        guides.push({
                            position: pixelToPoint(a),
                            orientation: orientation,
                            units: 'point',
                            color: color,
                            opacity: opacity,
                            width: width
                        });
                    }
                }
            };

            addGuides(pointToPixel(width), pointToPixel(tiny), 'vertical', GRAY, 0.2);
            addGuides(pointToPixel(height), pointToPixel(tiny), 'horizontal', GRAY, 0.2);
            addGuides(pointToPixel(width), pointToPixel(base), 'vertical', MAGENTA, 0.3);
            addGuides(pointToPixel(height), pointToPixel(base), 'horizontal', MAGENTA, 0.3);
        }

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

                {/*Grid*/}
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        {opacity: this.animatedGridValue}
                    ]}
                    pointerEvents={'box-none'}
                >
                    {
                        guides.map((guide, index) => {
                            return (
                                <View
                                    key={`guide_${index}`}
                                    style={
                                        [
                                            {
                                                position: 'absolute',
                                                opacity: guide.opacity || 1,
                                                borderColor: guide.color || CYAN
                                            },
                                            guide.orientation === 'horizontal'
                                                ? {
                                                    left: 0,
                                                    right: 0,
                                                    top: guide.units === 'point'
                                                        ? guide.position :
                                                        `${guide.position}%`,
                                                    borderTopWidth: guide.width || StyleSheet.hairlineWidth,
                                                    transform: [
                                                        {translateY: -((guide.width || 1) / 2)}
                                                    ]
                                                }
                                                : {
                                                    top: 0,
                                                    bottom: 0,
                                                    left: guide.units === 'point'
                                                        ? guide.position :
                                                        `${guide.position}%`,
                                                    borderLeftWidth: guide.width || StyleSheet.hairlineWidth,
                                                    transform: [
                                                        {translateX: -((guide.width || 1) / 2)}
                                                    ]
                                                }
                                        ]
                                    }
                                />
                            )
                        })
                    }
                </Animated.View>

                <Animated.View
                    style={{
                        position: 'absolute',
                        left: -25,
                        top: -25,
                        width: 50,
                        height: 50,
                        backgroundColor: 'green',
                        opacity: 0.2,
                        transform: [
                            {translateX: this.ruler.valueLeft},
                            {translateY: this.ruler.valueTop}
                        ]
                    }}
                    {...this.ruler.panTopLeft.panHandlers}
                    pointerEvents={'box-only'}
                />


                <Animated.View
                    style={{
                        position: 'absolute',
                        left: -25,
                        top: -25,
                        width: 50,
                        height: 50,
                        backgroundColor: 'pink',
                        opacity: 0.2,
                        transform: [
                            {translateX: this.ruler.valueRight},
                            {translateY: this.ruler.valueTop}
                        ]
                    }}
                    {...this.ruler.panTopRight.panHandlers}
                    pointerEvents={'box-only'}
                />

                <Animated.View
                    style={{
                        position: 'absolute',
                        left: -25,
                        top: -25,
                        width: 50,
                        height: 50,
                        backgroundColor: 'yellow',
                        opacity: 0.2,
                        transform: [
                            {translateX: this.ruler.valueLeft},
                            {translateY: this.ruler.valueBottom}
                        ]
                    }}
                    {...this.ruler.panBottomLeft.panHandlers}
                    pointerEvents={'box-only'}
                />

                <Animated.View
                    style={{
                        position: 'absolute',
                        left: -25,
                        top: -25,
                        width: 50,
                        height: 50,
                        backgroundColor: 'blue',
                        opacity: 0.2,
                        transform: [
                            {translateX: this.ruler.valueRight},
                            {translateY: this.ruler.valueBottom}
                        ]
                    }}
                    {...this.ruler.panBottomRight.panHandlers}
                    pointerEvents={'box-only'}
                />

                <Animated.View
                    style={{
                        position: 'absolute',
                        left: -25,
                        top: -25,
                        width: 50,
                        height: 50,
                        backgroundColor: 'blue',
                        opacity: 0.2,
                        transform: [
                            {translateX: this.ruler.valueRight},
                            {translateY: this.ruler.valueBottom}
                        ]
                    }}
                    {...this.ruler.panBottomRight.panHandlers}
                    pointerEvents={'box-only'}
                />


                {/*Ruler H*/}
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            top: 0,
                            left: 0,
                            transform: [
                                {translateY: this.ruler.valueBottom},
                                {translateX: this.ruler.valueLeft}
                            ]
                        }
                    ]}
                    pointerEvents={'box-none'}
                >
                    {
                        this.ruler.points.horizontal.map((position, index) => {
                            return (
                                <Animated.View
                                    key={`guide_${index}`}
                                    style={
                                        [
                                            {
                                                position: 'absolute',
                                                borderColor: '#000',
                                                height: index > 0 ? 10 : 20,
                                                top: 0,
                                                bottom: 0,
                                                left: position,
                                                borderLeftWidth: StyleSheet.hairlineWidth,
                                                opacity: this.ruler.valueWidth.interpolate({
                                                    inputRange: [0, position, position],
                                                    outputRange: [0, 0, 1]
                                                })
                                            }
                                        ]
                                    }
                                />
                            )
                        })
                    }

                    <Animated.View
                        style={
                            [
                                {
                                    position: 'absolute',
                                    borderColor: '#000',
                                    height: 20,
                                    top: 0,
                                    bottom: 0,
                                    left: 0,
                                    borderLeftWidth: StyleSheet.hairlineWidth,
                                    transform: [
                                        {translateX: this.ruler.valueWidth}
                                    ]
                                }
                            ]
                        }
                    />
                </Animated.View>


                {/*Ruler V*/}
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            top: 0,
                            left: 0,
                            transform: [
                                {translateY: this.ruler.valueTop},
                                {translateX: this.ruler.valueRight}
                            ]
                        }
                    ]}
                    pointerEvents={'box-none'}
                >
                    {
                        this.ruler.points.vertical.map((position, index) => {
                            return (
                                <Animated.View
                                    key={`guide_${index}`}
                                    style={
                                        [
                                            {
                                                position: 'absolute',
                                                borderColor: '#000',
                                                width: index > 0 ? 10 : 20,
                                                top: position,
                                                borderTopWidth: StyleSheet.hairlineWidth,
                                                opacity: this.ruler.valueHeigth.interpolate({
                                                    inputRange: [0, position, position],
                                                    outputRange: [0, 0, 1]
                                                })
                                            }
                                        ]
                                    }
                                />
                            )
                        })
                    }

                    <Animated.View
                        style={
                            [
                                {
                                    position: 'absolute',
                                    borderColor: '#000',
                                    width: 20,
                                    top: 0,
                                    borderTopWidth: StyleSheet.hairlineWidth,
                                    transform: [
                                        {translateY: this.ruler.valueHeigth}
                                    ]
                                }
                            ]
                        }
                    />
                </Animated.View>

                <TouchableOpacity
                    onPress={event => {
                        if (this.visible) {
                            this.setState({
                                align:
                                    this.state.align === 'side'
                                        ? 'center'
                                        : (
                                            this.state.align === 'center'
                                                ? 'hidden'
                                                : 'side'
                                        )
                            });
                        }
                    }}
                    style={{
                        position: 'absolute',
                        bottom: small * 2 + extra,
                        left: tiny,
                        height: base,
                        width: base,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: "#4affff66",
                        opacity: 0
                    }}
                >
                    <View
                        style={
                            this.state.align === 'side'
                                ? {
                                    height: base,
                                    width: base,
                                    borderColor: '#000',
                                    borderRightWidth: 1,
                                    borderLeftWidth: 1
                                }
                                : (
                                    this.state.align === 'center'
                                        ? {
                                            height: base,
                                            width: 1,
                                            alignSelf: 'center',
                                            backgroundColor: '#000',
                                        }
                                        : {
                                            opacity: 0
                                        }
                                )
                        }
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={event => {
                        if (this.visible) {
                            animateGenericNative(this.animatedGridValue, 0);
                        } else {
                            animateGenericNative(this.animatedGridValue, 1);
                        }

                        this.visible = !this.visible;
                    }}
                    style={{
                        position: 'absolute',
                        bottom: small,
                        left: -(extra - large),
                        height: extra,
                        width: extra,
                        borderRadius: extra,
                        backgroundColor: MAGENTA,
                        opacity: 0
                    }}
                />
            </View>
        )
    }
}
