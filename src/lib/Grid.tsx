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

const GRAY = '#828282';
const MAGENTA = '#ff4aff';
const BLUE = '#18A0FB';

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
    unit?: '%' | 'dp' | 'px';
    color?: string;
    opacity?: number;
    width?: number;
}>;

/**
 * Allows you to add regularly spaced marker lines on the screen
 */
export type GridLines = Array<{
    spacing: number;
    color?: string;
    opacity?: number;
    width?: number;
}>

export type GridProps = {

    /**
     * Add guides on screen. Percentual, points or pixel. Ex. v50%, h50%, v10px, v10p
     */
    guides?: Guides;

    /**
     * Allows you to add regularly spaced marker lines on the screen
     */
    grid?: GridLines;

    /**
     * Sets grid alignment
     */
    align: 'side' | 'center' | 'left' | 'right';
}

/**
 * Add guidelines on screen
 */
export default class Grid extends React.PureComponent<GridProps> {

    render() {

        const {width, height} = Dimensions.get('screen');

        const tiny = 8;
        const small = 16;
        const base = 24;
        const large = 48;
        const extra = 64;

        let guides: Guides = [];

        if (this.props.guides) {
            guides = guides.concat(this.props.guides);
        } else {
            // Default guides
            guides = [
                {
                    position: 50,
                    orientation: 'horizontal',
                    unit: '%'

                },
                {
                    position: 50,
                    orientation: 'vertical',
                    unit: '%'
                }
            ];
        }

        const addGuides = (
            maxPx: number,
            spacingPx: number,
            orientation: 'horizontal' | 'vertical',
            color: string,
            opacity: number,
            width?: number
        ) => {
            if (orientation === 'vertical') {
                let midle = maxPx / 2;
                if (this.props.align === 'left') {
                    for (let a = spacingPx; a <= maxPx; a += spacingPx) {
                        guides.push({
                            position: pixelToPoint(a),
                            orientation: orientation,
                            unit: 'dp',
                            color: color,
                            opacity: opacity,
                            width: width
                        });
                    }
                } else if (this.props.align === 'right') {
                    for (let a = maxPx - spacingPx; a > 0; a -= spacingPx) {
                        guides.push({
                            position: pixelToPoint(a),
                            orientation: orientation,
                            unit: 'dp',
                            color: color,
                            opacity: opacity,
                            width: width
                        });
                    }
                } else if (this.props.align === 'center') {
                    for (let a = midle - spacingPx; a >= 0; a -= spacingPx) {
                        guides.push({
                            position: pixelToPoint(a),
                            orientation: orientation,
                            unit: 'dp',
                            color: color,
                            opacity: opacity,
                            width: width
                        });
                    }
                    for (let a = midle - spacingPx; a <= maxPx; a += spacingPx) {
                        guides.push({
                            position: pixelToPoint(a),
                            orientation: orientation,
                            unit: 'dp',
                            color: color,
                            opacity: opacity,
                            width: width
                        });
                    }
                } else if (this.props.align === 'side') {
                    for (let a = spacingPx; a < midle; a += spacingPx) {
                        guides.push({
                            position: pixelToPoint(a),
                            orientation: orientation,
                            unit: 'dp',
                            color: color,
                            opacity: opacity,
                            width: width
                        });
                    }
                    for (let a = maxPx - spacingPx; a > midle; a -= spacingPx) {
                        guides.push({
                            position: pixelToPoint(a),
                            orientation: orientation,
                            unit: 'dp',
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
                        unit: 'dp',
                        color: color,
                        opacity: opacity,
                        width: width
                    });
                }
            }
        };

        if (this.props.grid && this.props.grid.length > 0) {
            this.props.grid.forEach((value, index) => {
                let color = value.color || [GRAY, MAGENTA, BLUE][index % 3];
                let opacity = value.opacity || (index * 0.1 + 0.2);
                addGuides(pointToPixel(width), pointToPixel(value.spacing), 'vertical', color, opacity, value.width);
                addGuides(pointToPixel(height), pointToPixel(value.spacing), 'horizontal', color, opacity, value.width);
            });
        } else {
            addGuides(pointToPixel(width), pointToPixel(tiny), 'vertical', GRAY, 0.2);
            addGuides(pointToPixel(height), pointToPixel(tiny), 'horizontal', GRAY, 0.2);
            addGuides(pointToPixel(width), pointToPixel(base), 'vertical', MAGENTA, 0.3);
            addGuides(pointToPixel(height), pointToPixel(base), 'horizontal', MAGENTA, 0.3);
        }

        return (
            <View style={StyleSheet.absoluteFill} pointerEvents={'box-none'}>
                {
                    guides.map((guide, index) => {
                        const pos = guide.position;
                        const position = guide.unit === 'dp'
                            ? pos
                            : guide.unit === '%'
                                ? `${pos}%`
                                : pixelToPoint(pos);

                        return (
                            <View
                                key={`guide_${index}`}
                                style={
                                    [
                                        {
                                            position: 'absolute',
                                            opacity: guide.opacity || 1,
                                            borderColor: guide.color || BLUE
                                        },
                                        guide.orientation === 'horizontal'
                                            ? {
                                                left: 0,
                                                right: 0,
                                                top: position,
                                                borderTopWidth: guide.width || StyleSheet.hairlineWidth,
                                                transform: [
                                                    {translateY: -((guide.width || 1) / 2)}
                                                ]
                                            }
                                            : {
                                                top: 0,
                                                bottom: 0,
                                                left: position,
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
            </View>
        )
    }
}
