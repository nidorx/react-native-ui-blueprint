import {Animated, Easing} from "react-native";

/**
 * Efeito de animação genérica usada nos componentes
 *
 * https://easings.net/#easeOutQuint
 * https://developers.google.com/web/fundamentals/design-and-ux/animations/choosing-the-right-easing
 * https://codepen.io/radialglo/post/understanding-the-intuition-of-easing
 */
export const QuinticEaseOut = Easing.bezier(0.23, 1, 0.32, 1);

/**
 * Animação genérica usada nos componentes
 *
 * @param value
 * @param toValue
 * @param callback
 */
export function animateGeneric(
    value: Animated.Value | Animated.ValueXY,
    toValue: number,
    callback?: Animated.EndCallback,
    native?: boolean,
    start?: boolean,
    duration?: number
): Animated.CompositeAnimation {

    const animation = Animated.timing(value, {
        toValue: toValue,
        duration: duration || 250,
        easing: QuinticEaseOut,
        useNativeDriver: !!native
    });

    if (start === undefined || start === true) {
        animation.start(callback);
    }

    return animation;
}

export function animateGenericNative(
    value: Animated.Value | Animated.ValueXY,
    toValue: number,
    callback?: Animated.EndCallback,
    start?: boolean,
    duration?: number
): Animated.CompositeAnimation {
    return animateGeneric(value, toValue, callback, true, start, duration);
}
