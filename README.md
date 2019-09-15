<div align="center">
    <h1>React Native UI Blueprint</h1>
    <img src="./docs/logo-sm.png" width="250" />
    <p align="center">
        To develop pixel perfect apps
    </p>    
    <p>
        <a href="https://badge.fury.io/js/react-native-ui-blueprint">
            <img src="https://badge.fury.io/js/react-native-ui-blueprint.svg" alt="npm version">
        </a>
        <a href="https://travis-ci.org/nidorx/react-native-ui-blueprint">
            <img src="https://travis-ci.org/nidorx/react-native-ui-blueprint.svg?branch=master" alt="Build Status">
        </a>
    </p>
</div>

<br>

No more wrong margins, colors, text sizes and many other silly visual mistakes.

React Native UI Blueprint allow to you implements a pixel-perfect design.


## Quick Start

You can install React Native UI Blueprint via Yarn or NPM.

```bash
# Yarn
yarn add react-native-ui-blueprint

# NPM
npm i react-native-ui-blueprint --save
```

After that, simply encapsulate your application with Blueprint. And finally, tap the bottom left of the device to show Blueprint.

```jsx
import Blueprint from 'react-native-ui-blueprint';


export default class App extends React.PureComponent {
    render() {
        return (
            <Blueprint>
                <StatusBar backgroundColor={'transparent'} translucent={true} barStyle="dark-content"/>
                <View style={[StyleSheet.absoluteFill, {justifyContent: 'center', alignItems: 'center'}]}>
                    <Text>
                        {'My App'}
                    </Text>
                </View>
            </Blueprint>
        );
    }
}
```

## Features

<div align="center">
    <img src="./docs/features.png" />
</div>

### Reload

For those who are too lazy to shake the phone, when running Packager (on port 8081), lets you reload the application.

### Grid

<div align="center">
    <img src="./docs/grid.png" />
</div>

Displays grids on your application, allowing the development of interfaces with regular and homogeneous spacing.

When working in teams, designers often use grid, use this tool to verify design implementation.

```jsx
<Blueprint            
    grid={[
        {
            spacing: 30
        },
        {
            spacing: 60
        }
    ]}
 >
    ...
</Blueprint>
```

By default, Blueprint already defines two grids with 8 and 24 dp spacing.

You can completely remove the grid by passing false as parameter.

```jsx
<Blueprint            
    grid={false}
 >
    ...
</Blueprint>
```

#### Alignment

There are 4 horizontal alignment options:

##### Side
 
The grid is created from the side, respecting the defined spacing. Useful for validating component spacings and side positions.

##### Center

The grid is created from the center of the screen, respecting the defined spacing. Used to check centralized alignment of components.

##### Left and Right

The grid is created from the defined side.

#### Grid Properties

| name | type | default | Description |
|---|---|---|---|
| `spacing` | `number` | -- | The spacing between grid lines. In [dp] |
| `color` | `string` | `GRAY:#828282`, `MAGENTA:#ff4aff` or `BLUE:#18A0FB`| Allows you to set the line color. If not informed, the system will switch between GRAY, BLUE and MAGENTA |
| `opacity` | `number` | `0.2 + $index * 0.1` | Allows you to set opacity. If not entered, the system automatically calculates a value starting with `0.2` and increasing by `0.1` |
| `width` | `number` | `StyleSheet.hairlineWidth` (1 pixel) | Lets you set the line width |

### Guide

<div align="center">
    <img src="./docs/guide.png" />
</div>

Displays vertical or horizontal guide lines with specific placement. Unlike the grid, the tab does not repeat and allows you to work with three units of measurement: Pixel, [dp] and Percent.

```jsx
<Blueprint            
    guides={[
        {
            position: 55,
            orientation: 'vertical',
            unit: 'dp'
        },
        {
            position: 616,
            orientation: 'horizontal',
            unit: 'dp',
            color:'#ff4aff'
        },
        {
            position: 580,
            orientation: 'horizontal',
            unit: 'dp',
            color:'#ff4aff'
        }
    ]}
 >
    ...
</Blueprint>
```

By default Blueprint displays one vertical and one horizontal tab, both on 50% of the screen.

You can completely remove the guides by passing false as parameter.

```jsx
<Blueprint            
    guides={false}
 >
    ...
</Blueprint>
```

#### Guide Properties




| name | type | default | Description |
|---|---|---|---|
| `position` | `number`  | -- | The positioning of the guide. When the unit is pixel, expect an integer. |
| `orientation` | `ENUM['horizontal', 'vertical']` | --| Sets the orientation of the guide |
| `unit` | `ENUM['%', 'dp', 'px']` | `dp` | The unit of measurement used to set the guide position |
| `color` | `string` | `BLUE:#18A0FB`| Allows you to set the line color. |
| `opacity` | `number` | `0.2 + $index * 0.1` | Allows you to set opacity. If not entered, the system automatically calculates a value starting with `0.2` and increasing by `0.1` |
| `width` | `number` | `StyleSheet.hairlineWidth` (1 pixel) | Lets you set the line width |


### Ruler

<div align="center">
    <img src="./docs/ruler.png" />
</div>

Adds a scalable ruler to the screen. The ruler is useful for checking component size and distance from the edges of the screen.

Allows you to change the unit of measurement to Pixel, [dp], or Percent.

The ruler also allows you to change the sensitivity to work more accurately. The values are toggled by `1`, `0.5` and `0.1`.

### Zoom

### Ghost


[dp]: https://en.wikipedia.org/wiki/Device-independent_pixel
