/**
 * FROM: https://raw.githubusercontent.com/react-native-training/react-native-elements/next/src/slider/Slider.js
 */
import React, {Component} from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Easing,
    PanResponder,
    SliderProps as RNSliderProps,
    ViewStyle,
    GestureResponderEvent,
    LayoutChangeEvent,
    PanResponderGestureState
} from 'react-native';

const TRACK_SIZE = 4;
const THUMB_SIZE = 20;

const DEFAULT_ANIMATION_CONFIGS = {
    spring: {
        friction: 7,
        tension: 100,
    },
    timing: {
        duration: 150,
        easing: Easing.inOut(Easing.ease),
        delay: 0,
    },
};

const styles = StyleSheet.create({
    containerHorizontal: {
        height: 40,
        justifyContent: 'center',
    },
    containerVertical: {
        width: 40,
        flexDirection: 'column',
        alignItems: 'center',
    },
    track: {
        borderRadius: TRACK_SIZE / 2,
    },
    trackHorizontal: {
        height: TRACK_SIZE,
    },
    trackVertical: {
        flex: 1,
        width: TRACK_SIZE,
    },
    thumb: {
        position: 'absolute',
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2,
    },
    touchArea: {
        position: 'absolute',
        backgroundColor: 'transparent',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    debugThumbTouchArea: {
        position: 'absolute',
        backgroundColor: 'green',
        opacity: 0.5,
    },
});

export type SliderProps = RNSliderProps & {
    /**
     * Initial value of the slider. The value should be between minimumValue
     * and maximumValue, which default to 0 and 1 respectively.
     * Default value is 0.
     *
     * *This is not a controlled component*, e.g. if you don't update
     * the value, the component won't be reset to its inital value.
     */
    value: number,

    /**
     * If true the user won't be able to move the slider.
     * Default value is false.
     */
    disabled?: boolean,

    /**
     * Initial minimum value of the slider. Default value is 0.
     */
    minimumValue: number,

    /**
     * Initial maximum value of the slider. Default value is 1.
     */
    maximumValue: number,

    /**
     * Step value of the slider. The value should be between 0 and
     * (maximumValue - minimumValue). Default value is 0.
     */
    step: number,

    /**
     * The color used for the track to the left of the button. Overrides the
     * default blue gradient image.
     */
    minimumTrackTintColor?: string,

    /**
     * The color used for the track to the right of the button. Overrides the
     * default blue gradient image.
     */
    maximumTrackTintColor?: string,

    /**
     * The color used for the thumb.
     */
    thumbTintColor?: string,

    /**
     * Callback continuously called while the user is dragging the slider.
     */
    onValueChange?: (value: number) => void,

    /**
     * Callback called when the user starts changing the value (e.g. when
     * the slider is pressed).
     */
    onSlidingStart?: (value: number) => void,

    /**
     * Callback called when the user finishes changing the value (e.g. when
     * the slider is released).
     */
    onSlidingComplete?: (value: number) => void,

    /**
     * The style applied to the slider container.
     */
    style?: ViewStyle,

    /**
     * The style applied to the track.
     */
    trackStyle?: ViewStyle,

    /**
     * The style applied to the thumb.
     */
    thumbStyle?: ViewStyle,

    /**
     * Set this to true to visually see the thumb touch rect in green.
     */
    debugTouchArea?: boolean,

    /**
     * Choose the orientation. 'horizontal' or 'vertical'.
     */
    orientation?: 'horizontal' | 'vertical'

    /**
     * Used to configure the animation parameters.  These are the same parameters in the Animated library.
     */
    animationConfig?: object,
    containerStyle?: ViewStyle,
}


const getBoundedValue = ({value, maximumValue, minimumValue}: SliderProps) => {
    return value > maximumValue
        ? maximumValue
        : value < minimumValue
            ? minimumValue
            : value
};

class Rect {
    public x: number;
    public y: number;
    public width: number;
    public height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    containsPoint(x: number, y: number) {
        return (
            x >= this.x &&
            y >= this.y &&
            x <= this.x + this.width &&
            y <= this.y + this.height
        );
    }
}

export type Size = {
    width: number;
    height: number;
};

export type SliderState = {
    containerSize: Size;
    trackSize: Size;
    thumbSize: Size;
    allMeasured: boolean;
    value: Animated.Value;
}

const thumbTouchSize = {width: 40, height: 40}


export default class Slider extends React.PureComponent<SliderProps, SliderState> {

    static defaultProps = {
        value: 0,
        minimumValue: 0,
        maximumValue: 1,
        step: 0,
        minimumTrackTintColor: '#3f3f3f',
        maximumTrackTintColor: '#b3b3b3',
        thumbTintColor: 'red',
        debugTouchArea: false,
        orientation: 'horizontal',
    };

    private containerSize: Size = {width: 0, height: 0};

    private trackSize: Size = {width: 0, height: 0};

    private thumbSize: Size = {width: 0, height: 0};

    state: SliderState = {
        containerSize: {width: 0, height: 0},
        trackSize: {width: 0, height: 0},
        thumbSize: {width: 0, height: 0},
        allMeasured: false,
        value: new Animated.Value(getBoundedValue(this.props)),
    };

    private panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e) => {
            return this.thumbHitTest(e);
        },
        onMoveShouldSetPanResponder: e => false,
        onPanResponderGrant: (e) => {
            this._previousLeft = this.getThumbLeft(this.getCurrentValue());

            if (this.props.onSlidingStart) {
                this.props.onSlidingStart(this.getCurrentValue());
            }
        },
        onPanResponderMove: (e, gestureState) => {
            if (this.props.disabled) {
                return;
            }

            this.setCurrentValue(this.getValue(gestureState));

            if (this.props.onValueChange) {
                this.props.onValueChange(this.getCurrentValue());
            }
        },
        onPanResponderRelease: (e, gestureState) => {
            if (this.props.disabled) {
                return;
            }

            this.setCurrentValue(this.getValue(gestureState));

            if (this.props.onSlidingComplete) {
                this.props.onSlidingComplete(this.getCurrentValue());
            }
        },
        onPanResponderTerminationRequest: e => false,
        onPanResponderTerminate: (_, gestureState) => {
            if (this.props.disabled) {
                return;
            }

            this.setCurrentValue(this.getValue(gestureState));

            if (this.props.onSlidingComplete) {
                this.props.onSlidingComplete(this.getCurrentValue());
            }
        }
    });

    private _previousLeft: number = 0;

    componentDidUpdate(prevProps: Readonly<SliderProps>, prevState: Readonly<SliderState>, snapshot?: any): void {
        const newValue = getBoundedValue(this.props);

        if (prevProps.value !== newValue) {
            this.setCurrentValue(newValue);
        }
    }

    private setCurrentValue = (value: number) => {
        this.state.value.setValue(value);
    };

    private thumbHitTest = (e: GestureResponderEvent) => {
        const thumbTouchRect = this.getThumbTouchRect();
        return thumbTouchRect.containsPoint(
            e.nativeEvent.locationX,
            e.nativeEvent.locationY
        );
    };

    private getTouchOverflowSize = () => {
        const {thumbSize, allMeasured, containerSize} = this.state;

        const size: Size = {width: 0, height: 0};
        if (allMeasured === true) {
            size.width = Math.max(0, thumbTouchSize.width - thumbSize.width);
            size.height = Math.max(0, thumbTouchSize.height - containerSize.height);
        }

        return size;
    };

    private getTouchOverflowStyle = () => {
        const {width, height} = this.getTouchOverflowSize();

        const touchOverflowStyle: ViewStyle = {};
        if (width !== undefined && height !== undefined) {
            const verticalMargin = -height / 2;
            touchOverflowStyle.marginTop = verticalMargin;
            touchOverflowStyle.marginBottom = verticalMargin;

            const horizontalMargin = -width / 2;
            touchOverflowStyle.marginLeft = horizontalMargin;
            touchOverflowStyle.marginRight = horizontalMargin;
        }

        if (this.props.debugTouchArea === true) {
            touchOverflowStyle.backgroundColor = 'orange';
            touchOverflowStyle.opacity = 0.5;
        }

        return touchOverflowStyle;
    };

    private handleMeasure = (name: string, x: LayoutChangeEvent) => {
        const {width: layoutWidth, height: layoutHeight} = x.nativeEvent.layout;
        const width = this.props.orientation === 'vertical' ? layoutHeight : layoutWidth;
        const height = this.props.orientation === 'vertical' ? layoutWidth : layoutHeight;
        const size = {width, height};

        const currentSize = (
            name == 'containerSize'
                ? this.containerSize
                : name == 'trackSize'
                ? this.trackSize
                : this.thumbSize
        );

        if (currentSize && width === currentSize.width && height === currentSize.height) {
            return;
        }

        switch (name) {
            case 'containerSize':
                this.containerSize = size;
                break;
            case 'trackSize':
                this.trackSize = size;
                break;
            case 'thumbSize':
                this.thumbSize = size;
                break;
        }

        if (this.containerSize && this.trackSize && this.thumbSize) {
            this.setState({
                containerSize: this.containerSize,
                trackSize: this.trackSize,
                thumbSize: this.thumbSize,
                allMeasured: true,
            });
        }
    };

    private measureContainer = (x: LayoutChangeEvent) => {

        this.handleMeasure('containerSize', x);
    };

    private measureTrack = (x: LayoutChangeEvent) => {
        this.handleMeasure('trackSize', x);
    };

    private measureThumb = (x: LayoutChangeEvent) => {
        this.handleMeasure('thumbSize', x);
    };

    private getValue = (gestureState: PanResponderGestureState) => {
        const length = this.state.containerSize.width - this.state.thumbSize.width;
        const thumbLeft =
            this._previousLeft +
            (this.props.orientation === 'vertical'
                ? gestureState.dy
                : gestureState.dx);

        const ratio = thumbLeft / length;

        if (this.props.step) {
            return Math.max(
                this.props.minimumValue,
                Math.min(
                    this.props.maximumValue,
                    this.props.minimumValue +
                    Math.round(
                        (ratio * (this.props.maximumValue - this.props.minimumValue)) /
                        this.props.step
                    ) *
                    this.props.step
                )
            );
        }
        return Math.max(
            this.props.minimumValue,
            Math.min(
                this.props.maximumValue,
                ratio * (this.props.maximumValue - this.props.minimumValue) +
                this.props.minimumValue
            )
        );
    };

    private getCurrentValue = () => {
        return (this.state.value as any).__getValue();
    };

    getRatio(value: number) {
        return (
            (value - this.props.minimumValue) /
            (this.props.maximumValue - this.props.minimumValue)
        );
    }

    getThumbLeft(value: number) {
        const ratio = this.getRatio(value);
        return (
            ratio * (this.state.containerSize.width - this.state.thumbSize.width)
        );
    }

    getThumbTouchRect(): Rect {
        const {thumbSize, containerSize} = this.state;
        const touchOverflowSize = this.getTouchOverflowSize();

        if (this.props.orientation === 'vertical') {
            return new Rect(
                touchOverflowSize.height / 2 +
                (containerSize.height - thumbTouchSize.height) / 2,
                touchOverflowSize.width / 2 +
                this.getThumbLeft(this.getCurrentValue()) +
                (thumbSize.width - thumbTouchSize.width) / 2,
                thumbTouchSize.width,
                thumbTouchSize.height
            );
        }
        return new Rect(
            touchOverflowSize.width / 2 +
            this.getThumbLeft(this.getCurrentValue()) +
            (thumbSize.width - thumbTouchSize.width) / 2,
            touchOverflowSize.height / 2 +
            (containerSize.height - thumbTouchSize.height) / 2,
            thumbTouchSize.width,
            thumbTouchSize.height
        );
    }

    renderDebugThumbTouchRect(thumbLeft: Animated.AnimatedInterpolation) {
        const thumbTouchRect = this.getThumbTouchRect();
        const positionStyle = {
            left: thumbLeft,
            top: thumbTouchRect.y,
            width: thumbTouchRect.width,
            height: thumbTouchRect.height,
        };
        return <Animated.View style={positionStyle} pointerEvents="none"/>;
    }

    getMinimumTrackStyles(thumbStart: Animated.AnimatedInterpolation) {
        const {thumbSize, trackSize} = this.state;
        const minimumTrackStyle: any = {
            position: 'absolute',
        };

        if (this.props.orientation === 'vertical') {
            minimumTrackStyle.height = Animated.add(thumbStart, thumbSize.height / 2);
            minimumTrackStyle.marginLeft = -trackSize.width;
        } else {
            minimumTrackStyle.width = Animated.add(thumbStart, thumbSize.width / 2);
            minimumTrackStyle.marginTop = -trackSize.height;
        }
        return minimumTrackStyle;
    }

    getThumbPositionStyles(thumbStart: Animated.AnimatedInterpolation) {
        if (this.props.orientation === 'vertical') {
            return [
                {
                    translateX: -(this.state.trackSize.height + this.state.thumbSize.height) / 2,
                },
                {translateY: thumbStart},
            ];
        }
        return [
            {translateX: thumbStart},
            {
                translateY: -(this.state.trackSize.height + this.state.thumbSize.height) / 2,
            },
        ];
    }

    render() {
        const {
            minimumValue,
            maximumValue,
            minimumTrackTintColor,
            maximumTrackTintColor,
            thumbTintColor,
            containerStyle,
            style,
            trackStyle,
            thumbStyle,
            debugTouchArea,
            orientation,
            ...other
        } = this.props;

        const {value, containerSize, thumbSize, allMeasured} = this.state;

        const mainStyles: any = containerStyle || styles;
        const thumbStart = value.interpolate({
            inputRange: [minimumValue, maximumValue],
            outputRange: [0, containerSize.width - thumbSize.width],
            // extrapolate: 'clamp',
        });

        const valueVisibleStyle: ViewStyle = {};
        if (!allMeasured) {
            valueVisibleStyle.height = 0;
            valueVisibleStyle.width = 0;
        }

        const minimumTrackStyle = {
            ...this.getMinimumTrackStyles(thumbStart),
            backgroundColor: minimumTrackTintColor,
            ...valueVisibleStyle,
        };

        const thumbStyleTransform = (thumbStyle && thumbStyle.transform) || [];
        const touchOverflowStyle = this.getTouchOverflowStyle();
        return (
            <View
                {...other}
                style={[
                    orientation === 'vertical'
                        ? mainStyles.containerVertical
                        : mainStyles.containerHorizontal,
                    style,
                ]}
                onLayout={this.measureContainer}
            >
                <View
                    style={[
                        mainStyles.track,
                        orientation === 'vertical'
                            ? mainStyles.trackVertical
                            : mainStyles.trackHorizontal,
                        trackStyle,
                        {backgroundColor: maximumTrackTintColor},
                    ]}
                    onLayout={this.measureTrack}
                />

                <Animated.View
                    style={[
                        mainStyles.track,
                        orientation === 'vertical'
                            ? mainStyles.trackVertical
                            : mainStyles.trackHorizontal,
                        trackStyle,
                        minimumTrackStyle,
                    ]}
                />

                <Animated.View
                    testID="sliderThumb"
                    onLayout={this.measureThumb}
                    style={[
                        {
                            backgroundColor: thumbTintColor
                        },
                        mainStyles.thumb,
                        orientation === 'vertical'
                            ? ((width: any) => ({
                                left: 22 + (width ? (width - 4) / 2 : 0),
                            }))(trackStyle && trackStyle.width)
                            : ((height: any) => ({
                                top: 22 + (height ? (height - 4) / 2 : 0),
                            }))(trackStyle && trackStyle.height),
                        thumbStyle,
                        {
                            transform: [
                                ...this.getThumbPositionStyles(thumbStart),
                                ...thumbStyleTransform,
                            ],
                            ...valueVisibleStyle,
                        },
                    ]}
                />

                <View
                    style={[
                        styles.touchArea,
                        touchOverflowStyle
                    ]}
                    {...this.panResponder.panHandlers}
                >
                    {debugTouchArea === true && this.renderDebugThumbTouchRect(thumbStart)}
                </View>
            </View>
        );
    }
}


