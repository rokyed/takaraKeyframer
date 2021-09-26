# takaraKeyframer



### What it does??
If you ever touched any tool that does animation you will recognize instantly that this is that bar on the bottom with the frames on it. 
The one that you use to set key frames on an animation and the tool will build your in between frames. Why write a function for each element to do a linear interpolation?
You can do this easly now.

This library is awesome and easy to use.

Note: The animation between 2 keyframes is based on linear-interpolation.

### initialize it:
```javascript
var myKeyframer = new TakaraKeyframer({
    startAt: 0,
    endAt: 100,
    callback: function() {
        alert('done');
    },
    scope: window,
    frameRate: 26
});
```

### add objects to it:
```javascript
var myObject = myKeyframer.addObject({
    element: myElement,
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    scale: 1,
    rotation:  0,
    opacity: 1,
    startAt: 20,
    endAt: 40,
    tickCallback: function(element, metaData, takaraKeyframerObject) {
        // do something with your code
        // takaraKeyframerObject contains all the settings of this object at that specific frame moment
        // here's where you take care of rendering your element or doing whacky stuff
        // hint:
        console.log(takaraKeyframerObject.extraMeta.myLittleBoolean);
        // will show: 'false'
        
        // @NOTE: the takaraKeyframerObject.visible is determined by the startAt and endAt of this object
        // so for a render you would have this: 
        if (!takaharaKeyFramerObject.visible)
            // skip drawing for me
            return;
    },
    tickScope: window,
    extraMeta: {
        // this is where you have meta data that you can manage it yourself
        myLittleBoolean: false
    }
});
```

### add one key frame:
```javascript
myKeyframer.addKeyframe(myObject, 10, {
    opacity: 0,
    scale: 10,
    x: 100,
    y: 1000
});
```

###add many key frames:
```javascript
myKeyframer.addKeyframes(myObject ,[{
    frame: 20,
    value: {
        x: 0.5,
        y: 0.5,
        rotation:0,
        opacity: 1,
        scale: 1
    }
},{
    frame: 144,
    value: {
        x: 0.5,
        y: 0.5,
        rotation: 0,
        opacity: 1,
        scale: 1
    }
}]);
```
### use your own timer:
```javascript
window.setInterval(function(){
    // do your needs and when you want tick the takaraKeyframer
    myKeyframer.frameTick();
},1);
```

### play, stop ,pause:
```javascript
///play:
myKeyframer.playAnimation();

// if you have set your own timer to tick the takaraKeyframer
myKeyframer.playAnimation(true);

//stop: 
myKeyframer.stopAnimation();

//pause
myKeyframer.pauseAnimation();
```

That's all folks, all there is to it is presented on the table :D
Have fun and use it to whatever you want to do with: 
Manage and syncronize sound, popups, animations on your page with your elements, animate a canvas (that was the first use i had for it)
