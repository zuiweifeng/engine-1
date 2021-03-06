/****************************************************************************
 Copyright (c) 2016 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

var BaseObject = dragonBones.BaseObject;

dragonBones.CCFactory = cc.Class({
    name: 'dragonBones.CCFactory',
    extends: dragonBones.BaseFactory,

    buildArmatureDisplay : function (armatureName, dragonBonesName, skinName) {
        var armature = this.buildArmature(armatureName, dragonBonesName, skinName);
        var armatureDisplay = armature ? armature._display : null;
        if (armatureDisplay) {
            armatureDisplay.advanceTimeBySelf(true);
        }

        return armatureDisplay;
    },

    _generateTextureAtlasData : function (textureAtlasData, texture) {
        if (! textureAtlasData) {
            textureAtlasData = BaseObject.borrowObject(dragonBones.CCTextureAtlasData);
        }

        textureAtlasData.texture = texture;
        return textureAtlasData;
    },

    _generateArmature : function (dataPackage) {
        var armature = BaseObject.borrowObject(dragonBones.Armature);
        var armatureDisplayContainer = new dragonBones.CCArmatureDisplay();

        armature._armatureData = dataPackage.armature;
        armature._skinData = dataPackage.skin;
        armature._animation = BaseObject.borrowObject(dragonBones.Animation);
        armature._display = armatureDisplayContainer;

        armatureDisplayContainer._armature = armature;
        armature._animation._armature = armature;

        armature.animation.animations = dataPackage.armature.animations;

        return armature;
    },

    _generateSlot : function (dataPackage, slotDisplayDataSet) {
        var slot = BaseObject.borrowObject(dragonBones.CCSlot);
        var slotData = slotDisplayDataSet.slot;
        var displayList = [];

        slot.name = slotData.name;
        slot._rawDisplay = new _ccsg.Sprite();

        for (var i = 0, l = slotDisplayDataSet.displays.length; i < l; ++i) {
            var displayData = slotDisplayDataSet.displays[i];
            switch (displayData.type) {
                case dragonBones.DisplayType.Image:
                    if (!displayData.texture) {
                        displayData.texture = this._getTextureData(dataPackage.dataName, displayData.name);
                    }

                    displayList.push(slot._rawDisplay);
                    break;

                case dragonBones.DisplayType.Mesh:
                    // TODO support mesh display
                    //if (!displayData.texture) {
                    //    displayData.texture = this._getTextureData(dataPackage.dataName, displayData.name);
                    //}
                    //
                    //if (cc._renderType === cc.game.RENDER_TYPE_WEBGL) {
                    //    displayList.push(slot._rawDisplay);
                    //} else {
                    //    cc.log('Canvas is not support mesh slot!');
                    //    displayList.push(slot._rawDisplay);
                    //}
                    cc.warn('WARN: Now mesh display is not supported in web!');
                    displayList.push(slot._rawDisplay);
                    break;

                case dragonBones.DisplayType.Armature:
                    var childArmature = this.buildArmature(displayData.name, dataPackage.dataName);
                    if (childArmature) {
                        if (!slot.inheritAnimation) {
                            var actions = slotData.actions.length > 0 ? slotData.actions : childArmature.armatureData.actions;
                            if (actions.length > 0) {
                                for (var j = 0, n = actions.length; j < n; ++j) {
                                    childArmature._bufferAction(actions[j]);
                                }
                            } else {
                                childArmature.animation.play();
                            }
                        }

                        displayData.armature = childArmature.armatureData; //
                    }

                    displayList.push(childArmature);
                    break;

                default:
                    displayList.push(null);
                    break;
            }
        }

        slot._setDisplayList(displayList);

        return slot;
    }
});
