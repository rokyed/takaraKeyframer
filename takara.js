(function (){

function TakaraKeyframer (config) {
    this.objects = [];
    this.animationPlaying = false;
    this.$lastTimeStamp = 0;
    this.animationDoneCallback = null;
    this.animationDoneScope = null;
    this.initialize(config);
};

TakaraKeyframer.prototype.initialize = function(config) {
    this.$frame = config.startAt;
    this.startAt = config.startAt;
    this.endAt = config.endAt;
    this.animationDoneCallback = config.callback;
    this.animationDoneScope = config.scope;
    this.frameRate = 1000 / (config.frameRate || 24);

    if (this.startAt > this.endAt)
        this.endAt = this.startAt;
};

TakaraKeyframer.prototype.frameTick = function() {
    if (!this.animationPlaying || !this.isNextFrame())
        return;

    this.animateObjects();

    if (this.endAt <= this.$frame) {
        this.animationDoneCallback.apply(this.animationDoneScope,[]);
        this.stopAnimation();

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
        this.calculateValues(animatedObjects[i]);

        if (animatedObjects[i].startAt < currentFrame && animatedObjects[i].endAt > currentFrame) {
            animatedObjects[i].meta.visible = true;
        } else {
            animatedObjects[i].meta.visible = false;
        }

        animatedObjects[i].tickCallback.apply(animatedObjects[i].tickScope,[animatedObjects[i].element, animatedObjects[i].meta, animatedObjects[i]]);
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

    for (var item in meta) {
        if (!this.isSet(lowerKeyValues[item]) || !this.isSet(higherKeyValues[item]) || this.isBool(meta[item]))
            continue;

        meta[item] = this.lerp(lowerKeyValues[item], higherKeyValues[item], ratio);
    }

    return true;
};

TakaraKeyframer.prototype.isSet = function (value) {
    return typeof(value) !== 'undefined' && value !== null;
};

TakaraKeyframer.prototype.isBool = function (value) {
    return typeof(value) === 'boolean';
}

TakaraKeyframer.prototype.calcRatio = function (previousKeyFrame, nextKeyFrame, currentFrame) {
    if (currentFrame < previousKeyFrame)
        return 0;

    var ratio = (currentFrame - previousKeyFrame) / (nextKeyFrame - previousKeyFrame);

    if (ratio < 0)
        return 0;

    return ratio;
};

TakaraKeyframer.prototype.lerp = function(origin, destination, time) {
    return ((1-time) * origin) + (time * destination);
};

TakaraKeyframer.prototype.playAnimation = function(externalTimer) {
    var me = this;
    me.animationPlaying = true;
    me.$frame = me.startAt;

    if (externalTimer)
        return;

    me.$timer = window.setInterval(function() {
        me.frameTick.bind(me);
    }, 1);
};

TakaraKeyframer.prototype.pauseAnimation = function() {
    this.animationPlaying = false;
};

TakaraKeyframer.prototype.stopAnimation = function () {
    this.animationPlaying = false;

    if (this.$timer)
        window.clearInterval(this.$timer);

    this.$frame = this.startAt;
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
            scale: config.scale || 1,
            rotation: config.rotation || 0,
            opacity: config.opacity || 1,
            currentSpriteFrame: config.currentFrame || 0,
            visible: true
        },
        extraMeta: config.extraMeta || null,
        startAt: config.startAt || this.startAt,
        endAt: config.endAt || this.endAt,
        keyframes: [],
        initialSetup: {
            x: config.x || 0,
            y: config.y || 0,
            scaleX: config.scaleX || 0,
            scaleY: config.scaleY || 0,
            scale: config.scale || 0,
            rotation: config.rotation || 0,
            opacity: config.opacity || 1,
            currentSpriteFrame: config.currentFrame || 0,
            visible: true
        }
    };

    if (newObject.startAt > newObject.endAt)
        newObject.endAt = newObject.startAt;

    if (newObject.startAt < this.$frame && newObject.endAt > this.$frame) {
        newObject.meta.visible = true;
    } else {
        newObject.meta.visible = false;
    }

    newObject.tickCallback.apply(newObject.tickScope,[newObject.element, newObject.meta, newObject]);
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
    if (keyframes)
        for (var i = 0, ln = keyframes.length; i < ln; i++)
            this.addKeyframe(animatedObject, keyframes[i].frame, keyframes[i].value);
}

window['TakaraKeyframer'] = TakaraKeyframer;
})();
