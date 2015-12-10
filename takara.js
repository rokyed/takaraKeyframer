

function TakaraKeyframer (config) {
    this.objects = [];
    this.animationPlaying = false;
    this.$lastTimeStamp = 0;
    this.initialize(config);
};

TakaraKeyframer.prototype.initialize = function(config) {
    this.$frame = config.startAt;
    this.startAt = config.startAt;
    this.endAt = config.endAt;
    this.frameRate = 1000 / (config.frameRate || 24);

    if (this.startAt > this.endAt)
        this.endAt = this.startAt;

    this.animationDoneCallback = config.callback;
    this.animationDoneScope = config.scope;
};

TakaraKeyframer.prototype.frameTick = function() {
    if (!this.animationPlaying || !this.isNextFrame())
        return;

    this.animateObjects();

    if (this.endAt <= this.$frame) {
        this.animationDoneCallback.bind(this.animationDoneScope);
        this.animationPlaying = false;

        if (this.$timer)
            window.clearInterval(this.$timer);
    }

    this.$frame ++;
};

TakaraKeyframer.prototype.isNextFrame = function () {
    var now = Date.now();

    if (this.lastTimeStamp + this.frameRate > now)
        return false;

    this.lastTimeStamp = now;

    return true;
};

TakaraKeyframer.prototype.animateObjects = function() {
    var currentFrame = this.$frame,
        animatedObjects = this.objects;

    for (var i = 0, ln = animatedObjects.length; i < ln; i++) {
        if (animatedObjects[i].startAt > currentFrame || animatedObjects[i].endAt < currentFrame)
            continue;

        this.calculateValues(animatedObjects[i]);
        animatedObjects[i].tickCallback.apply(animatedObjects[i].tickScope,[animatedObjects[i].element, animatedObjects[i].meta]);
    }
};

TakaraKeyframer.prototype.getProximityKeyFrames = function (animationObject) {
    var keyframes = animationObject.keyframes,
        nearestLower = keyframes[0],
        nearestHigher = keyframes[0],
        lastLowerDistance = this.endAt - this.startAt,
        lastHigherDistance = this.endAt - this.startAt,
        currentFrame = this.$frame;

    for (var i = 0, ln = keyframes.length; i < ln; i++) {
        // looking for nearestLower
        if (currentFrame >= keyframes[i].$frame) {
            distance = currentFrame - keyframes[i].$frame;
            if (distance < lastLowerDistance) {
                nearestLower = keyframes[i];
                lastLowerDistance = distance;
            }
        }

        if (currentFrame < keyframes[i].$frame) {
            distance = keyframes[i].$frame - currentFrame;
            if (distance < lastHigherDistance) {
                nearestHigher = keyframes[i];
                lastHigherDistance = distance;
            }
        }
    }

    return {
        lowerKey: nearestLower,
        higherKey: nearestHigher
    };
};

TakaraKeyframer.prototype.calculateValues = function (animatedObject) {
    var keyFrames = this.getProximityKeyFrames(animatedObject),
        meta = animatedObject.meta,
        lowerKeyValues, higherKeyValues, ratio;

    if (!keyFrames.lowerKey || !keyFrames.higherKey)
        return false;

    lowerKeyValues = keyFrames.lowerKey.values;
    higherKeyValues = keyFrames.higherKey.values;
    ratio = this.calcRatio(keyFrames.lowerKey.$frame, keyFrames.higherKey.$frame, this.$frame);

    console.log( keyFrames.lowerKey.$frame, keyFrames.higherKey.$frame, this.$frame,ratio);
    for (var item in meta) {
        if (!lowerKeyValues[item])
            continue;

        if (!higherKeyValues[item])
            continue;

        meta[item] = this.lerp(lowerKeyValues[item], higherKeyValues[item], ratio);
    }

    return true;
};

TakaraKeyframer.prototype.calcRatio = function (previousKeyFrame, nextKeyFrame, currentFrame) {
        if (currentFrame < previousKeyFrame)
            return 0;

        return (currentFrame - previousKeyFrame) / (nextKeyFrame - previousKeyFrame);
};

TakaraKeyframer.prototype.lerp = function(origin, destination, time) {
        return ((1-time) * origin) + (time * destination);
};

TakaraKeyframer.prototype.playAnimation = function(externalTimer) {
    var me = this;
    me.animationPlaying = true;

    if (externalTimer)
        return;

    me.$timer = window.setInterval(function() {
        me.frameTick.bind(me);
    }, 1);
};

TakaraKeyframer.prototype.addResource = function(resourceName, url, atlas) {
    var resource = {
        data: document.createElement('img'),
        atlas: atlas || null,
        loaded: false
    };

    this.resources[name] = resource;
    return resource;
};

TakaraKeyframer.prototype.addObject = function (config) {
    var newObject;

    newObject = {
        element:config.element,
        tickCallback: config.tickCallback,
        tickScope: config.tickScope,
        currentFrame: config.currentFrame || 0,
        meta: {
            x: config.x || 0,
            y: config.y || 0,
            scaleX: config.scaleX || 1,
            scaleY: config.scaleY || 1,
            rotation: config.rotation || 0,
            opacity: config.opacity || 1,
            currentSpriteFrame: config.currentFrame || 0
        },
        startAt: config.startAt || this.startAt,
        endAt: config.endAt || this.endAt,
        keyframes: [],
        initialSetup: {
            x: config.x || 0,
            y: config.y || 0,
            scaleX: config.scaleX || 0,
            scaleY: config.scaleY || 0,
            rotation: config.rotation || 0,
            opacity: config.opacity || 1,
            currentSpriteFrame: config.currentFrame || 0
        }
    };

    if (newObject.startAt > newObject.endAt)
        newObject.endAt = newObject.startAt;

    this.objects.push(newObject);

    return newObject;
};

TakaraKeyframer.prototype.addKeyframe = function(animatedObject, keyFrameNumber, keyframeInfo) {
    animatedObject.keyframes.push({
        $frame: keyFrameNumber,
        values: keyframeInfo
    });

    return this;
};

TakaraKeyframer.prototype.addKeyframes = function(animatedObject, keyframes) {
    for (var i = 0, ln = keyframes.length; i < ln; i++)
        this.addKeyframe(animatedObject, keyframes[i].frame, keyframes[i].value);
}
