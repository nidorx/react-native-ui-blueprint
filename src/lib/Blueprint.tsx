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


                {/*Régua*/}
                <Ruler/>

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
