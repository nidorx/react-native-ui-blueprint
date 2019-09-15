# Simple Server


```
npm start
```


## Android 
```
adb reverse tcp:3000 tcp:3000
```

## iOS 
You need to find the IP address of your mac and use that instead of localhost. Network preferences will show you your Mac's IP address

## Using on app
```
<Blueprint
    imagesAsync={() => {
        return fetch('http://localhost:3000/images.json')
            .then(resp => resp.json());
    }}
>
    ...
</Blueprint>
```
