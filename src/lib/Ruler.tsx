import React from 'react';
import {Animated, Dimensions, PanResponder, PanResponderInstance, PixelRatio, StyleSheet, View,} from 'react-native'


const pixelRatio = PixelRatio.get();

function pointToPixel(points: number) {
    return points * pixelRatio;
}

function pixelToPoint(pixels: number) {
    return pixels / pixelRatio;
}

type RulerType = {
    screenWidth: number;
    screenHeight: number;
    minSize: number;

    valueTop: Animated.Value;
    valueLeft: Animated.Value;
    valueWidth: Animated.Value;
    valueHeigth: Animated.Value;
    valueBottom: Animated.Value;
    valueRight: Animated.Value;


    valueTopCP: Animated.Value;
    valueLeftCP: Animated.Value;
    valueWidthCP: Animated.Value;
    valueHeigthCP: Animated.Value;
    valueBottomCP: Animated.Value;
    valueRightCP: Animated.Value;

    panCenter: PanResponderInstance;
    panTopLeft: PanResponderInstance;
    panTopRight: PanResponderInstance;
    panBottomLeft: PanResponderInstance;
    panBottomRight: PanResponderInstance;
}

class CustomText extends React.PureComponent<any> {
    state: any = {};

    setText(text: string) {
        this.setState({
            text: text
        });
    }

    render(): React.ReactNode {
        return (
            <Animated.Text
                {...this.props}
            >
                {this.state.text || this.props.text || ''}
            </Animated.Text>
        )
    }
};

/**
 * Render drag corner
 *
 * @param props
 * @constructor
 */
const DragCorner = (props: { ruler: RulerType, right?: boolean, bottom?: boolean }) => {
    const {ruler, right, bottom} = props;
    const DEBUG = false;
    const DEBUG_COLOR_A = '#dedeff';
    const DEBUG_COLOR_B = '#ffdede';
    return (

        <React.Fragment>
            {/*Corner*/}
            <Animated.View
                style={{
                    position: 'absolute',
                    left: right ? -15 : -35,
                    top: bottom ? -15 : -35,
                    width: 50,
                    height: 50,
                    transform: [
                        {
                            translateX: Animated.subtract(
                                right ? ruler.valueRightCP : ruler.valueLeftCP,
                                ruler.valueWidthCP.interpolate({
                                    inputRange: [50, 141],
                                    outputRange: right ? [-15, 0] : [15, 0],
                                    extrapolate: 'clamp'
                                })
                            )
                        },
                        {
                            translateY: Animated.subtract(
                                bottom ? ruler.valueBottomCP : ruler.valueTopCP,
                                ruler.valueHeigthCP.interpolate({
                                    inputRange: [50, 141],
                                    outputRange: bottom ? [-15, 0] : [15, 0],
                                    extrapolate: 'clamp'
                                })
                            )
                        }
                    ],
                    opacity: DEBUG ? 0.5 : 0,
                    backgroundColor: DEBUG ? DEBUG_COLOR_A : undefined
                }}
                {
                    ...(
                        bottom
                            ? (right ? ruler.panBottomRight : ruler.panBottomLeft)
                            : (right ? ruler.panTopRight : ruler.panTopLeft)
                    ).panHandlers
                }
                pointerEvents={'box-only'}
            />

            {/*Left/Right*/}
            <Animated.View
                style={{
                    position: 'absolute',
                    left: right ? -15 : -35,
                    top: 0,
                    width: 50,
                    height: 35,
                    transform: [
                        {
                            translateX: Animated.subtract(
                                right ? ruler.valueRightCP : ruler.valueLeftCP,
                                ruler.valueWidthCP.interpolate({
                                    inputRange: [50, 141],
                                    outputRange: right ? [-15, 0] : [15, 0],
                                    extrapolate: 'clamp'
                                })
                            )
                        },
                        {
                            translateY: Animated.subtract(
                                bottom ? ruler.valueBottomCP : ruler.valueTopCP,
                                ruler.valueHeigthCP.interpolate({
                                    inputRange: [50, 141],
                                    outputRange: bottom ? [0, 50] : [35, -15],
                                    extrapolate: 'clamp'
                                })
                            )
                        }
                    ],
                    opacity: DEBUG ? 0.5 : 0,
                    backgroundColor: DEBUG ? DEBUG_COLOR_B : undefined
                }}
                {
                    ...(
                        bottom
                            ? (right ? ruler.panBottomRight : ruler.panBottomLeft)
                            : (right ? ruler.panTopRight : ruler.panTopLeft)
                    ).panHandlers
                }
                pointerEvents={'box-only'}
            />

            {/*Top/Bottom*/}
            <Animated.View
                style={{
                    position: 'absolute',
                    left: 0,
                    top: bottom ? -15 : -35,
                    width: 35,
                    height: 50,
                    transform: [
                        {
                            translateX: Animated.subtract(
                                right ? ruler.valueRightCP : ruler.valueLeftCP,
                                ruler.valueWidthCP.interpolate({
                                    inputRange: [50, 141],
                                    outputRange: right ? [0, 50] : [35, -15],
                                    extrapolate: 'clamp'
                                })
                            )
                        },
                        {
                            translateY: Animated.subtract(
                                bottom ? ruler.valueBottomCP : ruler.valueTopCP,
                                ruler.valueHeigthCP.interpolate({
                                    inputRange: [50, 141],
                                    outputRange: bottom ? [-15, 0] : [15, 0],
                                    extrapolate: 'clamp'
                                })
                            )
                        }
                    ],
                    opacity: DEBUG ? 0.5 : 0,
                    backgroundColor: DEBUG ? DEBUG_COLOR_B : undefined
                }}
                {
                    ...(
                        bottom
                            ? (right ? ruler.panBottomRight : ruler.panBottomLeft)
                            : (right ? ruler.panTopRight : ruler.panTopLeft)
                    ).panHandlers
                }
                pointerEvents={'box-only'}
            />
        </React.Fragment>
    )
};

/**
 * Add guidelines on screen
 */
export default class Ruler extends React.PureComponent {

    private ruler: any;

    private verticalTextTop?: CustomText;
    private verticalTextBottom?: CustomText;
    private horizontalTextLeft?: CustomText;
    private horizontalTextRight?: CustomText;


    private textWidthTop?: CustomText;
    private textWidthBottom?: CustomText;
    private textHeightLeft?: CustomText;
    private textHeightRight?: CustomText;

    /**
     * dp = Density-independent Pixel
     */
    private unit: 'dp' | 'px' | '%' = 'dp';

    private sensitivity = 1;

    public changeSensitivity = () => {
        this.sensitivity = this.sensitivity === 1
            ? 0.5
            : this.sensitivity === 0.5
                ? 0.1
                : 1;
    };

    public changeUnit() {
        if (this.unit === 'dp') {
            this.unit = 'px';
        } else if (this.unit === 'px') {
            this.unit = '%';
        } else {
            this.unit = 'dp';
        }

        this.updateTextInformation();
    }

    private updateTextInformation = () => {

    };

    private getRuler(): RulerType {

        if (this.ruler) {
            return this.ruler;
        }

        const MIN_SIZE = 8;
        const MIN_SIZE_PX = pointToPixel(MIN_SIZE);

        const dimentions = Dimensions.get('screen');
        const screenWidth = dimentions.width;
        const screenHeight = dimentions.height;

        let top = screenHeight / 2 - 50;
        let topInit = 0;

        let height = 100;
        let heightInit = 0;

        let left = screenWidth / 2 - 50;
        let leftInit = 0;

        let width = 100;
        let widthInit = 0;

        const valueLeft = new Animated.Value(left);
        const valueWidth = new Animated.Value(width);
        const valueTop = new Animated.Value(top);
        const valueHeigth = new Animated.Value(height);
        const valueBottom = Animated.add(
            valueTop.interpolate({
                inputRange: [0, screenHeight],
                outputRange: [0, screenHeight]
            }),
            valueHeigth.interpolate({
                inputRange: [0, screenHeight],
                outputRange: [0, screenHeight]
            })
        );
        const valueRight = Animated.add(
            valueLeft.interpolate({
                inputRange: [0, screenWidth],
                outputRange: [0, screenWidth]
            }),
            valueWidth.interpolate({
                inputRange: [0, screenWidth],
                outputRange: [0, screenWidth]
            })
        );


        const valueLeftCP = new Animated.Value(left);
        const valueWidthCP = new Animated.Value(width);
        const valueTopCP = new Animated.Value(top);
        const valueHeigthCP = new Animated.Value(height);
        const valueBottomCP = Animated.add(
            valueTopCP.interpolate({
                inputRange: [0, screenHeight],
                outputRange: [0, screenHeight]
            }),
            valueHeigthCP.interpolate({
                inputRange: [0, screenHeight],
                outputRange: [0, screenHeight]
            })
        );
        const valueRightCP = Animated.add(
            valueLeftCP.interpolate({
                inputRange: [0, screenWidth],
                outputRange: [0, screenWidth]
            }),
            valueWidthCP.interpolate({
                inputRange: [0, screenWidth],
                outputRange: [0, screenWidth]
            })
        );

        this.updateTextInformation = () => {
            // dp to px = PixelRatio.getPixelSizeForLayoutSize()

            const convert = (valueDP: number, maxDP: number): string => {
                let value: string = '';
                if (this.unit === 'dp') {
                    value = valueDP.toFixed(2);
                } else if (this.unit === 'px') {
                    // Converts a layout size (dp) to pixel size (px).
                    value = '' + PixelRatio.getPixelSizeForLayoutSize(valueDP);
                } else {
                    let maxPx = PixelRatio.getPixelSizeForLayoutSize(maxDP);
                    let valuePx = PixelRatio.getPixelSizeForLayoutSize(valueDP);
                    value = (valuePx / maxPx * 100).toFixed(2);
                }
                return `${value}${this.unit}`;
            };

            requestAnimationFrame(() => {
                if (this.verticalTextTop) {
                    this.verticalTextTop.setText(convert(top, screenHeight));
                }

                if (this.verticalTextBottom) {
                    this.verticalTextBottom.setText(convert(screenHeight - (top + height), screenHeight));
                }

                if (this.horizontalTextLeft) {
                    this.horizontalTextLeft.setText(convert(left, screenWidth));
                }

                if (this.horizontalTextRight) {
                    this.horizontalTextRight.setText(convert(screenWidth - (left + width), screenWidth));
                }

                if (this.textWidthTop) {
                    this.textWidthTop.setText(convert(width, screenWidth));
                }

                if (this.textWidthBottom) {
                    this.textWidthBottom.setText(convert(width, screenWidth));
                }

                if (this.textHeightLeft) {
                    this.textHeightLeft.setText(convert(height, screenHeight));
                }

                if (this.textHeightRight) {
                    this.textHeightRight.setText(convert(height, screenHeight));
                }
            })
        };


        let onPanResponderEnd = () => {
            valueLeftCP.setValue(left);
            valueWidthCP.setValue(width);
            valueTopCP.setValue(top);
            valueHeigthCP.setValue(height);
        };

        this.ruler = {
            screenWidth: screenWidth,
            screenHeight: screenHeight,
            minSize: pixelToPoint(MIN_SIZE_PX),
            valueTop: valueTop,
            valueLeft: valueLeft,
            valueWidth: valueWidth,
            valueHeigth: valueHeigth,
            valueBottom: valueBottom,
            valueRight: valueRight,
            //
            valueTopCP: valueTopCP,
            valueLeftCP: valueLeftCP,
            valueWidthCP: valueWidthCP,
            valueHeigthCP: valueHeigthCP,
            valueBottomCP: valueBottomCP,
            valueRightCP: valueRightCP,
            panCenter: PanResponder.create({
                onPanResponderGrant: () => {
                    topInit = top;
                    leftInit = left;
                    widthInit = width;
                    heightInit = height;
                },
                onPanResponderMove: (event, gestureState) => {
                    const maxLeft = (screenWidth - width);
                    const maxTop = (screenHeight - height);

                    top = Math.max(0, Math.min(maxTop, (topInit + gestureState.dy * this.sensitivity)));
                    valueTop.setValue(top);

                    left = Math.max(0, Math.min(maxLeft, (leftInit + gestureState.dx * this.sensitivity)));
                    valueLeft.setValue(left);

                    this.updateTextInformation();
                },
                onPanResponderEnd: onPanResponderEnd,
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

                    top = Math.max(0, Math.min(maxBottom, (topInit + gestureState.dy * this.sensitivity)));
                    valueTop.setValue(top);

                    left = Math.max(0, Math.min(maxRight, (leftInit + gestureState.dx * this.sensitivity)));
                    valueLeft.setValue(left);

                    width = maxRight - left + MIN_SIZE;
                    valueWidth.setValue(width);

                    height = maxBottom - top + MIN_SIZE;
                    valueHeigth.setValue(height);

                    this.updateTextInformation();
                },
                onPanResponderEnd: onPanResponderEnd,
                onStartShouldSetPanResponder: (event, gestureState) => true,
            }),
            panTopRight: PanResponder.create({
                onPanResponderGrant: () => {
                    topInit = top;
                    widthInit = width;
                    heightInit = height;
                },
                onPanResponderMove: (event, gestureState) => {
                    const maxWidth = (screenWidth - left);
                    const maxBottom = (topInit + heightInit) - MIN_SIZE;

                    top = Math.max(0, Math.min(maxBottom, (topInit + gestureState.dy * this.sensitivity)));
                    valueTop.setValue(top);

                    height = maxBottom - top + MIN_SIZE;
                    valueHeigth.setValue(height);

                    width = Math.max(MIN_SIZE, Math.min(maxWidth, (widthInit + gestureState.dx * this.sensitivity)));
                    valueWidth.setValue(width);

                    this.updateTextInformation();
                },
                onPanResponderEnd: onPanResponderEnd,
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
                    const maxHeight = (screenHeight - top);

                    left = Math.max(0, Math.min(maxRight, (leftInit + gestureState.dx * this.sensitivity)));
                    valueLeft.setValue(left);

                    width = maxRight - left + MIN_SIZE;
                    valueWidth.setValue(width);

                    height = Math.max(MIN_SIZE, Math.min(maxHeight, (heightInit + gestureState.dy * this.sensitivity)));
                    valueHeigth.setValue(height);

                    this.updateTextInformation();
                },
                onPanResponderEnd: onPanResponderEnd,
                onStartShouldSetPanResponder: (event, gestureState) => true,
            }),
            panBottomRight: PanResponder.create({
                onPanResponderGrant: () => {
                    widthInit = width;
                    heightInit = height;
                },
                onPanResponderMove: (event, gestureState) => {
                    const maxWidth = (screenWidth - left);
                    const maxHeight = (screenHeight - top);

                    width = Math.max(MIN_SIZE, Math.min(maxWidth, (widthInit + gestureState.dx * this.sensitivity)));
                    valueWidth.setValue(width);

                    height = Math.max(MIN_SIZE, Math.min(maxHeight, (heightInit + gestureState.dy * this.sensitivity)));
                    valueHeigth.setValue(height);

                    this.updateTextInformation();
                },
                onPanResponderEnd: onPanResponderEnd,
                onStartShouldSetPanResponder: (event, gestureState) => true,
            })
        };

        return this.ruler;
    };

    render() {
        const ruler = this.getRuler();
        const screenWidth = ruler.screenWidth;
        const screenHeight = ruler.screenHeight;

        const color = '#18A0FB';
        const colorBG = '#18A0FB33';

        const verticalCenterSquare = Animated.add(
            ruler.valueLeft,
            ruler.valueWidth.interpolate({
                inputRange: [0, screenWidth],
                outputRange: [0, screenWidth / 2]
            })
        );

        const verticalCenterSquareText = verticalCenterSquare.interpolate({
            inputRange: [0, 30, 33, screenWidth - 33, screenWidth - 30, screenWidth],
            outputRange: [2, 33, 3, screenWidth - 62, screenWidth - 92, screenWidth - 62]
        });

        const verticalCenterSquareTextLeft = verticalCenterSquareText;

        const horizontalCenterSquare = Animated.add(
            ruler.valueTop,
            ruler.valueHeigth.interpolate({
                inputRange: [0, screenHeight],
                outputRange: [0, screenHeight / 2]
            })
        );

        const horizontalCenterSquareText = horizontalCenterSquare.interpolate({
            inputRange: [0, screenHeight - 63, screenHeight - 60, screenHeight],
            outputRange: [3, screenHeight - 60, screenHeight - 73, screenHeight - 12]
        });

        const verticalTextStyle = {
            position: 'absolute',
            fontSize: 9,
            lineHeight: 11,
            width: 60,
            color: '#fff',
            fontFamily: 'System',
            textAlignVertical: 'center',
            textAlign: 'center',
            backgroundColor: color,
            borderRadius: 2,
        };

        const horizontalTextStyle = {
            ...verticalTextStyle,
            top: 0,
            left: -20
        };

        const sideVerticalY = Animated.add(
            ruler.valueTop,
            ruler.valueHeigth.interpolate({
                inputRange: [0, screenHeight],
                outputRange: [-screenHeight / 2, 0]
            })
        );

        const sideVerticalScale = ruler.valueHeigth.interpolate({
            inputRange: [0, screenHeight],
            outputRange: [0, 1]
        });

        let sideHorizontalX = Animated.add(
            ruler.valueLeft,
            ruler.valueWidth.interpolate({
                inputRange: [0, screenWidth],
                outputRange: [-screenWidth / 2, 0]
            })
        );

        let sideHorizontalScale = ruler.valueWidth.interpolate({
            inputRange: [0, screenWidth],
            outputRange: [0, 1]
        });

        return (
            <View style={[StyleSheet.absoluteFill, {zIndex: 5000}]}>

                <Animated.View
                    style={
                        [
                            {
                                position: 'absolute',
                                transform: [
                                    {translateX: verticalCenterSquare}
                                ],
                            }
                        ]
                    }
                >
                    {/*Vertical Line Top*/}
                    <Animated.View
                        style={
                            [
                                {
                                    position: 'absolute',
                                    borderColor: color,
                                    height: screenHeight * 1.5,
                                    top: -(screenHeight * 1.5),
                                    borderRightWidth: 1,
                                    transform: [
                                        {translateY: ruler.valueTop}
                                    ]
                                }
                            ]
                        }
                    />

                    {/*Vertical Line Bottom*/}
                    <Animated.View
                        style={
                            [
                                {
                                    position: 'absolute',
                                    borderColor: color,
                                    height: screenHeight * 1.5,
                                    top: 0,
                                    borderRightWidth: 1,
                                    transform: [
                                        {translateY: ruler.valueBottom}
                                    ]
                                }
                            ]
                        }
                    />
                </Animated.View>

                <Animated.View
                    style={
                        [
                            {
                                position: 'absolute',
                                transform: [
                                    {translateY: horizontalCenterSquare},
                                ],
                            }
                        ]
                    }
                >
                    {/*Horizontal Line Left*/}
                    <Animated.View
                        style={
                            [
                                {
                                    position: 'absolute',
                                    borderColor: color,
                                    width: screenWidth * 1.5,
                                    left: -(screenWidth * 1.5),
                                    borderTopWidth: 1,
                                    transform: [
                                        {translateX: ruler.valueLeft}
                                    ],
                                }
                            ]
                        }
                    />

                    {/*Horizontal Line Right*/}
                    <Animated.View
                        style={
                            [
                                {
                                    position: 'absolute',
                                    borderColor: color,
                                    width: screenWidth * 1.5,
                                    left: 0,
                                    borderTopWidth: 1,
                                    transform: [
                                        {translateX: ruler.valueRight}
                                    ],
                                }
                            ]
                        }
                    />
                </Animated.View>

                {/*Side Left*/}
                <Animated.View
                    style={
                        [
                            {
                                position: 'absolute',
                                borderColor: color,
                                height: screenHeight,
                                left: -1,
                                top: 0,
                                borderLeftWidth: 1,
                                transform: [
                                    {translateX: ruler.valueLeft},
                                    {translateY: sideVerticalY},
                                    {scaleY: sideVerticalScale}
                                ],
                            }
                        ]
                    }
                />

                {/*Side Right*/}
                <Animated.View
                    style={
                        [
                            {
                                position: 'absolute',
                                borderColor: color,
                                height: screenHeight,
                                left: 0,
                                top: 0,
                                borderRightWidth: 1,
                                transform: [
                                    {translateX: ruler.valueRight},
                                    {translateY: sideVerticalY},
                                    {scaleY: sideVerticalScale}
                                ],
                            }
                        ]
                    }
                />

                {/*Side Top*/}
                <Animated.View
                    style={
                        [
                            {
                                position: 'absolute',
                                borderColor: color,
                                width: screenWidth,
                                left: 0,
                                top: -1,
                                borderTopWidth: 1,
                                transform: [
                                    {translateY: ruler.valueTop},
                                    {translateX: sideHorizontalX},
                                    {scaleX: sideHorizontalScale}
                                ],
                            }
                        ]
                    }
                />

                {/*Side Bottom*/}
                <Animated.View
                    style={
                        [
                            {
                                position: 'absolute',
                                borderColor: color,
                                width: screenWidth,
                                left: 0,
                                top: 0,
                                borderBottomWidth: 1,
                                transform: [
                                    {translateY: ruler.valueBottom},
                                    {translateX: sideHorizontalX},
                                    {scaleX: sideHorizontalScale}
                                ],
                            }
                        ]
                    }
                />

                <Animated.View
                    style={
                        [
                            {
                                position: 'absolute',
                                transform: [
                                    {translateY: ruler.valueTop}
                                ],
                            }
                        ]
                    }
                >
                    {/*Square Top Left*/}
                    <Animated.View
                        style={
                            [
                                {
                                    position: 'absolute',
                                    borderColor: color,
                                    width: 8,
                                    height: 8,
                                    left: -8,
                                    top: -8,
                                    borderWidth: 1,
                                    backgroundColor: colorBG,
                                    transform: [
                                        {translateX: ruler.valueLeft}
                                    ]
                                }
                            ]
                        }
                    />

                    {/*Square Top Right*/}
                    <Animated.View
                        style={
                            [
                                {
                                    position: 'absolute',
                                    borderColor: color,
                                    width: 8,
                                    height: 8,
                                    left: 0,
                                    top: -8,
                                    borderWidth: 1,
                                    backgroundColor: colorBG,
                                    transform: [
                                        {translateX: ruler.valueRight}
                                    ]
                                }
                            ]
                        }
                    />
                </Animated.View>

                <Animated.View
                    style={
                        [
                            {
                                position: 'absolute',
                                transform: [
                                    {translateY: ruler.valueBottom}
                                ]
                            }
                        ]
                    }
                >
                    {/*Square Bottom Left*/}
                    <Animated.View
                        style={
                            [
                                {
                                    position: 'absolute',
                                    borderColor: color,
                                    width: 8,
                                    height: 8,
                                    top: 0,
                                    left: -8,
                                    borderWidth: 1,
                                    backgroundColor: colorBG,
                                    transform: [
                                        {translateX: ruler.valueLeft}
                                    ]
                                }
                            ]
                        }
                    />

                    {/*Square Bottom Right*/}
                    <Animated.View
                        style={
                            [
                                {
                                    position: 'absolute',
                                    borderColor: color,
                                    width: 8,
                                    height: 8,
                                    top: 0,
                                    left: 0,
                                    borderWidth: 1,
                                    backgroundColor: colorBG,
                                    transform: [
                                        {translateX: ruler.valueRight}
                                    ]
                                }
                            ]
                        }
                    />
                </Animated.View>


                <Animated.View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        transform: [
                            {translateX: verticalCenterSquareText}
                        ]
                    }}
                >
                    <Animated.View
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: screenHeight,
                            backgroundColor: 'blue',
                            transform: [
                                {translateX: verticalCenterSquareText}
                            ]
                        }}
                    >
                    </Animated.View>

                    {/*Vertical Text Top*/}
                    <CustomText
                        ref={(ref) => {
                            if (this.verticalTextTop !== ref) {
                                this.verticalTextTop = ref || undefined;
                                this.updateTextInformation();
                            }
                        }}
                        style={[
                            verticalTextStyle,
                            {
                                transform: [
                                    {
                                        translateY: Animated.subtract(
                                            ruler.valueTop.interpolate({
                                                inputRange: [0, 27, screenHeight],
                                                outputRange: [-27, 0, screenHeight / 2]
                                            }),
                                            ruler.valueWidth.interpolate({
                                                inputRange: [60, 65],
                                                outputRange: [6, 0],
                                                extrapolate: 'clamp'
                                            })
                                        )
                                    }
                                ],
                            }
                        ]}
                    />

                    {/*Vertical Text Bottom*/}
                    <CustomText
                        ref={(ref) => {
                            if (this.verticalTextBottom !== ref) {
                                this.verticalTextBottom = ref || undefined;
                                this.updateTextInformation();
                            }
                        }}
                        style={[
                            verticalTextStyle,
                            {
                                transform: [
                                    {
                                        translateY: Animated.subtract(
                                            ruler.valueBottom.interpolate({
                                                inputRange: [0, screenHeight - 27, screenHeight],
                                                outputRange: [screenHeight / 2, screenHeight - 11, screenHeight + 15]
                                            }),
                                            ruler.valueWidth.interpolate({
                                                inputRange: [60, 65],
                                                outputRange: [-7, 0],
                                                extrapolate: 'clamp'
                                            })
                                        )
                                    },
                                ],
                            }
                        ]}
                    />

                    {/*Text Width Top*/}
                    <CustomText
                        ref={(ref) => {
                            if (this.textWidthTop !== ref) {
                                this.textWidthTop = ref || undefined;
                                this.updateTextInformation();
                            }
                        }}
                        style={[
                            verticalTextStyle,
                            {
                                transform: [
                                    {
                                        translateY: Animated.subtract(
                                            ruler.valueTop.interpolate({
                                                inputRange: [0, screenHeight],
                                                outputRange: [-14, screenHeight - 15]
                                            }),
                                            ruler.valueWidth.interpolate({
                                                inputRange: [60, 65],
                                                outputRange: [6, 0],
                                                extrapolate: 'clamp'
                                            })
                                        )
                                    },
                                ],
                            }
                        ]}
                    />

                    {/*Text Width Bottom*/}
                    <CustomText
                        ref={(ref) => {
                            if (this.textWidthBottom !== ref) {
                                this.textWidthBottom = ref || undefined;
                                this.updateTextInformation();
                            }
                        }}
                        style={[
                            verticalTextStyle,
                            {
                                transform: [
                                    {
                                        translateY: Animated.subtract(
                                            ruler.valueBottom.interpolate({
                                                inputRange: [0, screenHeight],
                                                outputRange: [3, screenHeight + 3]
                                            }),
                                            ruler.valueWidth.interpolate({
                                                inputRange: [60, 65],
                                                outputRange: [-8, 0],
                                                extrapolate: 'clamp'
                                            })
                                        )
                                    },
                                ],
                            }
                        ]}
                    />
                </Animated.View>

                <Animated.View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        transform: [
                            {translateY: horizontalCenterSquareText}
                        ]
                    }}
                >

                    {/*Horizontal Text left*/}
                    <CustomText
                        ref={(ref) => {
                            if (this.horizontalTextLeft !== ref) {
                                this.horizontalTextLeft = ref || undefined;
                                this.updateTextInformation();
                            }
                        }}
                        style={[
                            horizontalTextStyle,
                            {
                                transform: [
                                    {
                                        translateX: Animated.subtract(
                                            ruler.valueLeft.interpolate({
                                                inputRange: [0, 60, screenWidth],
                                                outputRange: [-44, 17, screenWidth / 2]
                                            }),
                                            ruler.valueHeigth.interpolate({
                                                inputRange: [30, 35],
                                                outputRange: [7, 0],
                                                extrapolate: 'clamp'
                                            })
                                        )
                                    }
                                ],
                            }
                        ]}
                    />

                    {/*Horizontal Text Right*/}
                    <CustomText
                        ref={(ref) => {
                            if (this.horizontalTextRight !== ref) {
                                this.horizontalTextRight = ref || undefined;
                                this.updateTextInformation();
                            }
                        }}
                        style={[
                            horizontalTextStyle,
                            {
                                transform: [
                                    {
                                        translateX: Animated.add(
                                            ruler.valueRight.interpolate({
                                                inputRange: [0, screenWidth - 60, screenWidth],
                                                outputRange: [screenWidth / 2, screenWidth - 38, screenWidth + 24]
                                            }),
                                            ruler.valueHeigth.interpolate({
                                                inputRange: [30, 35],
                                                outputRange: [8, 0],
                                                extrapolate: 'clamp'
                                            })
                                        )
                                    }
                                ],
                            }
                        ]}
                    />


                    {/*Text Height Left*/}
                    <CustomText
                        ref={(ref) => {
                            if (this.textHeightLeft !== ref) {
                                this.textHeightLeft = ref || undefined;
                                this.updateTextInformation();
                            }
                        }}
                        style={[
                            horizontalTextStyle,
                            {
                                top: -16,
                                transform: [
                                    {
                                        translateX: Animated.subtract(
                                            ruler.valueLeft.interpolate({
                                                inputRange: [0, 60, screenWidth],
                                                outputRange: [-44, 17, screenWidth - 44]
                                            }),
                                            ruler.valueHeigth.interpolate({
                                                inputRange: [30, 35],
                                                outputRange: [7, 0],
                                                extrapolate: 'clamp'
                                            })
                                        )
                                    }
                                ],
                            }
                        ]}
                    />

                    {/*Text Height Right*/}
                    <CustomText
                        ref={(ref) => {
                            if (this.textHeightRight !== ref) {
                                this.textHeightRight = ref || undefined;
                                this.updateTextInformation();
                            }
                        }}
                        style={[
                            horizontalTextStyle,
                            {
                                top: -16,
                                transform: [
                                    {
                                        translateX: Animated.add(
                                            ruler.valueRight.interpolate({
                                                inputRange: [0, screenWidth - 60, screenWidth],
                                                outputRange: [24, screenWidth - 38, screenWidth + 24]
                                            }),
                                            ruler.valueHeigth.interpolate({
                                                inputRange: [30, 35],
                                                outputRange: [8, 0],
                                                extrapolate: 'clamp'
                                            })
                                        )
                                    }
                                ],
                            }
                        ]}
                    />

                </Animated.View>

                {/*Drag - Background*/}
                <Animated.View
                    style={
                        [
                            {
                                position: 'absolute',
                                height: screenHeight,
                                width: screenWidth,
                                left: 0,
                                top: 0,
                                // opacity: 0.2,
                                // backgroundColor: '#ccc',
                                transform: [
                                    {
                                        translateX: Animated.add(
                                            ruler.valueLeftCP,
                                            ruler.valueWidthCP.interpolate({
                                                inputRange: [0, screenWidth],
                                                outputRange: [-screenWidth / 2, 0]
                                            })
                                        )
                                    },
                                    {
                                        scaleX: ruler.valueWidthCP.interpolate({
                                            inputRange: [0, screenWidth],
                                            outputRange: [0, 1]
                                        })
                                    },
                                    {
                                        translateY: Animated.add(
                                            ruler.valueTopCP,
                                            ruler.valueHeigthCP.interpolate({
                                                inputRange: [0, screenHeight],
                                                outputRange: [-screenHeight / 2, 0]
                                            })
                                        )
                                    },
                                    {
                                        scaleY: ruler.valueHeigthCP.interpolate({
                                            inputRange: [0, screenHeight],
                                            outputRange: [0, 1]
                                        })
                                    }
                                ],
                            }
                        ]
                    }
                    {
                        ...ruler.panCenter.panHandlers
                    }
                    pointerEvents={'box-only'}
                />

                {/*Drag - Corner Top Left*/}
                <DragCorner ruler={ruler} bottom={false} right={false}/>

                {/*Drag - Corner Top Right*/}
                <DragCorner ruler={ruler} bottom={false} right={true}/>

                {/*Drag - Corner Bottom Left*/}
                <DragCorner ruler={ruler} bottom={true} right={false}/>

                {/*Drag - Corner Bottom Right*/}
                <DragCorner ruler={ruler} bottom={true} right={true}/>
            </View>
        )
    }
}
