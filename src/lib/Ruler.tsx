import React from 'react';
import {
    Animated,
    Dimensions,
    Image,
    ImageRequireSource,
    ImageURISource,
    PanResponder, PanResponderInstance,
    PixelRatio,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'


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
                {this.state.text || this.props.text || this.props.children}
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
    const colorPan = '#dedede';
    return (

        <React.Fragment>
            {/*Corner*/}
            <Animated.View
                style={{
                    position: 'absolute',
                    left: right ? 0 : -50,
                    top: bottom ? 0 : -50,
                    width: 50,
                    height: 50,
                    // backgroundColor: colorPan,
                    opacity: 0.2,
                    transform: [
                        {translateX: right ? ruler.valueRight : ruler.valueLeft},
                        {translateY: bottom ? ruler.valueBottom : ruler.valueTop}
                    ]
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
                    left: right ? 0 : -50,
                    top: 0,
                    width: 50,
                    height: 50,
                    // backgroundColor: colorPan,
                    opacity: 0.2,
                    transform: [
                        {translateX: right ? ruler.valueRight : ruler.valueLeft},
                        {
                            translateY: Animated.subtract(
                                bottom ? ruler.valueBottom : ruler.valueTop,
                                ruler.valueHeigth.interpolate({
                                    inputRange: [50, 141],
                                    outputRange: bottom ? [0, 50] : [50, 0],
                                    extrapolate: 'clamp'
                                })
                            )
                        }
                    ]
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
                    top: bottom ? 0 : -50,
                    width: 50,
                    height: 50,
                    // backgroundColor: colorPan,
                    opacity: 0.2,
                    transform: [
                        {
                            translateX: Animated.subtract(
                                right ? ruler.valueRight : ruler.valueLeft,
                                ruler.valueWidth.interpolate({
                                    inputRange: [50, 141],
                                    outputRange: right ? [0, 50] : [50, 0],
                                    extrapolate: 'clamp'
                                })
                            )
                        },
                        {translateY: bottom ? ruler.valueBottom : ruler.valueTop}
                    ]
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

    private getRuler(): RulerType {

        if (this.ruler) {
            return this.ruler;
        }

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

        const updateTexts = () => {
            requestAnimationFrame(() => {
                if (this.verticalTextTop) {
                    let topPct = (top / screenHeight * 100).toFixed(2);
                    let topPx = Math.round(pointToPixel(top));
                    this.verticalTextTop.setText(`${top.toFixed(2)}pt\n${topPct}%\n${topPx}px`);
                }
            })
        };

        this.ruler = {
            screenWidth: screenWidth,
            screenHeight: screenHeight,
            minSize: pixelToPoint(MIN_SIZE_PX),
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

                    updateTexts();
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

                    updateTexts();
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

                    updateTexts();
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

                    updateTexts();
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

                    updateTexts();
                },
                onStartShouldSetPanResponder: (event, gestureState) => true,
            })
        };

        return this.ruler;
    };

    render() {
        const ruler = this.getRuler();
        const screenWidth = ruler.screenWidth;
        const screenHeight = ruler.screenHeight;

        const color = '#008fff';
        const colorBG = '#008fff33';

        const verticalCenterSquare = Animated.add(
            ruler.valueLeft,
            ruler.valueWidth.interpolate({
                inputRange: [0, screenWidth],
                outputRange: [0, screenWidth / 2]
            })
        );

        const verticalCenterSquareText = verticalCenterSquare.interpolate({
            inputRange: [0, screenWidth - 65, screenWidth - 60, screenWidth],
            outputRange: [5, screenWidth - 55, screenWidth - 105, screenWidth - 55]
        });

        const horizontalCenterSquare = Animated.add(
            ruler.valueTop,
            ruler.valueHeigth.interpolate({
                inputRange: [0, screenHeight],
                outputRange: [0, screenHeight / 2]
            })
        );

        const horizontalCenterSquareText = horizontalCenterSquare.interpolate({
            inputRange: [0, screenHeight - 65, screenHeight - 60, screenHeight],
            outputRange: [5, screenHeight - 55, screenHeight - 105, screenHeight - 55]
        });


        const verticalTextStyle = {
            position: 'absolute',
            fontSize: 9,
            lineHeight: 11,
            width: 40,
            height: 40,
            top: -20,
            borderRadius: 4,
            // backgroundColor: colorBG,
            // borderWidth: StyleSheet.hairlineWidth,
            borderColor: color,
            color: color,
            fontFamily: 'System',
            textAlignVertical: 'center',
            textAlign: 'center'
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

                {/*Vertical Text Top*/}
                <CustomText
                    ref={(ref) => {
                        this.verticalTextTop = ref || undefined;
                    }}
                    style={[
                        verticalTextStyle,
                        {
                            opacity: ruler.valueTop.interpolate({
                                inputRange: [15, 40],
                                outputRange: [0, 1],
                                extrapolate: 'clamp'
                            }),
                            transform: [
                                {
                                    translateY: ruler.valueTop.interpolate({
                                        inputRange: [0, 40, screenHeight],
                                        outputRange: [-40, 15, screenHeight / 2]
                                    })
                                },
                                {translateX: verticalCenterSquareText}
                            ],
                        }
                    ]}
                >
                    {'80%\n60p\n1030px'}
                </CustomText>

                {/*Vertical Text Bottom*/}
                <Animated.Text
                    style={[
                        verticalTextStyle,
                        {
                            opacity: ruler.valueBottom.interpolate({
                                inputRange: [screenHeight - 40, screenHeight - 15],
                                outputRange: [1, 0],
                                extrapolate: 'clamp'
                            }),
                            transform: [
                                {
                                    translateY: ruler.valueBottom.interpolate({
                                        inputRange: [0, screenHeight - 40, screenHeight],
                                        outputRange: [screenHeight / 2, screenHeight - 15, screenHeight + 40]
                                    })
                                },
                                {translateX: verticalCenterSquareText}
                            ],
                        }
                    ]}
                >
                    {'80%\n60p\n1030px'}
                </Animated.Text>

                {/*Horizontal Text left*/}
                <Animated.Text
                    style={[
                        horizontalTextStyle,
                        {
                            opacity: ruler.valueLeft.interpolate({
                                inputRange: [15, 40],
                                outputRange: [0, 1],
                                extrapolate: 'clamp'
                            }),
                            transform: [
                                {
                                    translateX: ruler.valueLeft.interpolate({
                                        inputRange: [0, 40, screenHeight],
                                        outputRange: [-40, 15, screenHeight / 2]
                                    })
                                },
                                {translateY: horizontalCenterSquareText}
                            ],
                        }
                    ]}
                >
                    {'80%\n60p\n1030px'}
                </Animated.Text>

                {/*Horizontal Text Right*/}
                <Animated.Text
                    style={[
                        horizontalTextStyle,
                        {
                            opacity: ruler.valueRight.interpolate({
                                inputRange: [screenWidth - 40, screenWidth - 15],
                                outputRange: [1, 0],
                                extrapolate: 'clamp'
                            }),
                            transform: [
                                {
                                    translateX: ruler.valueRight.interpolate({
                                        inputRange: [0, screenWidth - 40, screenWidth],
                                        outputRange: [screenWidth / 2, screenWidth - 15, screenWidth + 40]
                                    })
                                },
                                {translateY: horizontalCenterSquareText}
                            ],
                        }
                    ]}
                >
                    {'80%\n60p\n1030px'}
                </Animated.Text>

                {/*Vertical Line Top*/}
                <Animated.View
                    style={
                        [
                            {
                                position: 'absolute',
                                borderColor: color,
                                height: screenHeight,
                                top: -screenHeight,
                                borderRightWidth: 1,
                                transform: [
                                    {translateY: ruler.valueTop},
                                    {translateX: verticalCenterSquare}
                                ],
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
                                height: screenHeight,
                                top: 0,
                                borderRightWidth: 1,
                                transform: [
                                    {translateY: ruler.valueBottom},
                                    {translateX: verticalCenterSquare}
                                ],
                            }
                        ]
                    }
                />

                {/*Vertical Line Left*/}
                <Animated.View
                    style={
                        [
                            {
                                position: 'absolute',
                                borderColor: color,
                                width: screenWidth,
                                left: -screenWidth,
                                borderTopWidth: 1,
                                transform: [
                                    {translateY: horizontalCenterSquare},
                                    {translateX: ruler.valueLeft}
                                ],
                            }
                        ]
                    }
                />

                {/*Vertical Line Right*/}
                <Animated.View
                    style={
                        [
                            {
                                position: 'absolute',
                                borderColor: color,
                                width: screenWidth,
                                left: 0,
                                borderTopWidth: 1,
                                transform: [
                                    {translateY: horizontalCenterSquare},
                                    {translateX: ruler.valueRight}
                                ],
                            }
                        ]
                    }
                />

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

                {/*Square Top Left*/}
                <Animated.View
                    style={
                        [
                            {
                                position: 'absolute',
                                borderColor: color,
                                width: 16,
                                height: 16,
                                left: -16,
                                top: -16,
                                borderWidth: 1,
                                // borderTopLeftRadius: 16,
                                backgroundColor: colorBG,
                                transform: [
                                    {translateY: ruler.valueTop},
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
                                width: 16,
                                height: 16,
                                left: 0,
                                top: -16,
                                borderWidth: 1,
                                // borderTopRightRadius: 16,
                                backgroundColor: colorBG,
                                transform: [
                                    {translateY: ruler.valueTop},
                                    {translateX: ruler.valueRight}
                                ]
                            }
                        ]
                    }
                />

                {/*Square Bottom Left*/}
                <Animated.View
                    style={
                        [
                            {
                                position: 'absolute',
                                borderColor: color,
                                width: 16,
                                height: 16,
                                top: 0,
                                left: -16,
                                borderWidth: 1,
                                // borderBottomLeftRadius: 16,
                                backgroundColor: colorBG,
                                transform: [
                                    {translateY: ruler.valueBottom},
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
                                width: 16,
                                height: 16,
                                top: 0,
                                left: 0,
                                borderWidth: 1,
                                // borderBottomRightRadius: 16,
                                backgroundColor: colorBG,
                                transform: [
                                    {translateY: ruler.valueBottom},
                                    {translateX: ruler.valueRight}
                                ]
                            }
                        ]
                    }
                />

                {/*Corner Top Left*/}
                <DragCorner ruler={ruler} bottom={false} right={false}/>

                {/*Corner Top Right*/}
                <DragCorner ruler={ruler} bottom={false} right={true}/>

                {/*Corner Bottom Left*/}
                <DragCorner ruler={ruler} bottom={true} right={false}/>

                {/*Corner Bottom Right*/}
                <DragCorner ruler={ruler} bottom={true} right={true}/>
            </View>
        )
    }
}
