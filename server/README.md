# Simple Server

```
npm start
```

## Web 

```
http://localhost:3000
```

## Android 
```
adb reverse tcp:3000 tcp:3000
```

## iOS 
You need to find the IP address of your mac and use that instead of localhost. Network preferences will show you your Mac's IP address

## Using on app

```jsx
<Blueprint            
    imagesAsync={() => {
        const server = 'http://localhost:3000'; // IP address for iOS
        return fetch(`${server}/images.json`)
            .then(resp => resp.json())
            .then(images => {
                images.forEach((image: any) => {
                    image.uri = `${server}/${image.uri}`;
                    image.thumb.uri = `${server}/${image.thumb.uri}`;
                });
                return images;
            });
    }}
 >
    ...
</Blueprint>
```
