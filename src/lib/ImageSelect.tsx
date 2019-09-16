import React from 'react';
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Image,
    ImageRequireSource,
    ImageURISource,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native'
import {animateGenericNative} from "./Utils";

export type ImageInfo = {
    thumb: {
        uri: string;
        width: number;
        height: number;
    };
    width: number;
    height: number;
    uri: string;
    title?: string;
}

export type ImageInfoAsync = {
    thumb?: {
        uri: string;
        width?: number;
        height?: number;
    };
    width?: number;
    height?: number;
    uri: string;
    title?: string;
};

export type ImageSelectProps = {
    left: number;
    bottom: number;
    width: number;
    height: number;
    /**
     * Server images
     */
    imagesAsync?: () => Promise<Array<ImageInfoAsync>>;
    /**
     * Add image to pixel-perfect
     */
    images?: Array<ImageURISource | ImageRequireSource>;

    onSelect: (info: ImageInfo) => void;
}

type ImageSelectState = {
    loading: boolean;
    images?: Array<ImageInfo>;
}

/**
 * Add guidelines on screen
 */
export default class ImageSelect extends React.PureComponent<ImageSelectProps, ImageSelectState> {

    state: ImageSelectState = {
        loading: true
    };

    private animatedLoading = new Animated.Value(1);

    private animatedValue = new Animated.Value(0);

    async getImageSize(image: ImageURISource | ImageRequireSource): Promise<ImageInfo> {
        if (typeof image === "number") {
            let asset = Image.resolveAssetSource(image);
            return {
                uri: asset.uri,
                width: asset.width,
                height: asset.height,
                thumb: {
                    uri: asset.uri,
                    width: asset.width,
                    height: asset.height
                }
            }
        }

        const uri = image.uri as string;

        return new Promise((resolve, reject) => {
            Image.getSize(uri, (width: number, height: number) => {
                resolve({
                    uri: uri,
                    width: width,
                    height: height,
                    thumb: {
                        uri: uri,
                        width: width,
                        height: height
                    }
                })
            }, reject);
        });
    }

    private getImages = async () => {
        let images: Array<ImageInfo> = [];

        if (Array.isArray(this.props.images) && this.props.images.length > 0) {
            let localImages = await Promise.all(this.props.images.map(this.getImageSize));
            images = images.concat(localImages);
        } else if (this.props.imagesAsync) {
            let asyncImages = await this.props.imagesAsync();
            let imagesAsync = await Promise.all(asyncImages.map(async (image) => {
                if (!image.thumb) {
                    image.thumb = {
                        uri: image.uri
                    };

                    let size = await this.getImageSize({
                        uri: image.uri
                    });

                    image.width = image.thumb.width = size.width;
                    image.height = image.thumb.height = size.height;
                } else if (!image.thumb.width || !image.thumb.height) {

                    let size = await this.getImageSize({
                        uri: image.uri
                    });

                    image.thumb.width = size.width;
                    image.thumb.height = size.height;
                }

                return image;
            })) as Array<ImageInfo>;
            images = images.concat(imagesAsync);
        }

        this.setState({
            images: images
        }, () => {
            animateGenericNative(this.animatedLoading, 0, result => {

            });
        })
    };

    async componentDidMount() {
        animateGenericNative(this.animatedValue, 1);
        this.getImages();
    }

    render() {
        const width = this.props.width * 0.35;
        return (
            <Animated.View
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: this.props.bottom,
                    height: this.props.height,
                    backgroundColor: '#FFF',
                    borderColor: '#2C2C2C33',
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    opacity: this.animatedValue.interpolate({
                        inputRange: [0, 1, 1.5],
                        outputRange: [0, 1, 0],
                        extrapolate: 'clamp'
                    }),
                    transform: [
                        {
                            translateY: this.animatedValue.interpolate({
                                inputRange: [0, 1, 1.5],
                                outputRange: [30, 0, 10],
                                extrapolate: 'clamp'
                            })
                        },
                    ]
                }}
                pointerEvents={'box-none'}
            >

                <Animated.View
                    style={{
                        flex: 1,
                        opacity: this.animatedLoading.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 0]
                        })
                    }}
                >
                    <FlatList
                        data={this.state.images || []}
                        showsHorizontalScrollIndicator={false}
                        ListEmptyComponent={props => {
                            return (
                                <View
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontFamily: 'System',
                                            fontSize: 16,
                                            textAlign: 'left'
                                        }}
                                    >
                                        {"There are no images to display"}
                                    </Text>
                                </View>
                            )
                        }}
                        contentContainerStyle={{
                            flex: (this.state.images && this.state.images.length > 0) ? undefined : 1,
                            paddingLeft: (this.state.images && this.state.images.length > 0) ? width + 5 : 0
                        }}
                        renderItem={({item}) => {
                            return (
                                <TouchableOpacity
                                    onPress={async () => {
                                        if (!item.width || !item.height) {
                                            animateGenericNative(this.animatedLoading, 1);

                                            let size = await this.getImageSize({
                                                uri: item.uri
                                            });

                                            item.width = size.width;
                                            item.height = size.height;
                                        }
                                        animateGenericNative(this.animatedValue, 2, result => {
                                            this.props.onSelect(item);
                                        });
                                    }}
                                >
                                    <View
                                        style={{
                                            flex: 1,
                                            backgroundColor: '#18A0FB11',
                                            width: width,
                                            marginRight: 5,
                                        }}
                                    >
                                        <Image
                                            source={{
                                                uri: item.uri,
                                                height: item.height,
                                                width: item.width
                                            }}
                                            style={{
                                                width: width,
                                                height: '100%',
                                                resizeMode: 'contain'
                                            }}
                                        />

                                        {
                                            item.title
                                                ? (
                                                    <Text
                                                        style={{
                                                            position: 'absolute',
                                                            bottom: 0,
                                                            fontFamily: 'System',
                                                            fontSize: 9,
                                                            textAlign: 'left'
                                                        }}
                                                    >
                                                        {item.title}
                                                    </Text>
                                                )
                                                : null
                                        }

                                    </View>
                                </TouchableOpacity>
                            )
                        }}
                        horizontal={true}
                        keyExtractor={(item, index) => `${index}`}
                        refreshing={this.state.loading}
                    />
                </Animated.View>


                <Animated.View
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        justifyContent: 'center',
                        backgroundColor: '#FFF',
                        opacity: this.animatedLoading
                    }}
                    pointerEvents={'box-none'}
                >
                    <ActivityIndicator
                        color={'#18A0FB'}
                        size={'small'}
                    />
                </Animated.View>

                <Image
                    source={require('./../assets/shadow.png')}
                    style={{
                        position: 'absolute',
                        top: this.props.height - 1 + StyleSheet.hairlineWidth,
                        width: '100%',
                        alignSelf: 'center',
                        resizeMode: 'stretch',
                        opacity: 0.3
                    }}
                />
            </Animated.View>
        )
    }
}
