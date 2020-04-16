"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var uuid = require("uuid/v1");
var constants_1 = require("./constants");
var LocalStorage_1 = require("./LocalStorage");
var SessionStorage_1 = require("./SessionStorage");
var Storage = (function () {
    function Storage(ignoredKeys) {
        if (ignoredKeys === void 0) { ignoredKeys = []; }
        this._isInitialized = false;
        this._sessionId = uuid();
        this._ignored = [].concat(ignoredKeys);
        this._ignored.push(constants_1.SESSION_STORAGE_ID);
        this._local = new LocalStorage_1.LocalStorage(window.localStorage);
        this._session = new SessionStorage_1.SessionStorage(window.sessionStorage);
        this._session.addEventListener("set", this.onSetItem.bind(this));
        this._session.addEventListener("delete", this.onDeleteItem.bind(this));
        this._session.addEventListener("clear", this.onClearItems.bind(this));
        this.listenForStorageEvents();
    }
    Object.defineProperty(Storage.prototype, "local", {
        get: function () {
            return this._local;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Storage.prototype, "session", {
        get: function () {
            return this._session;
        },
        enumerable: true,
        configurable: true
    });
    Storage.prototype.listenForStorageEvents = function () {
        var _a;
        var _this = this;
        window.addEventListener(constants_1.WINDOW_STORAGE_EVENT, function (event) {
            var _a, _b, _c, _d, _e;
            if (event == null) {
                event = window.event;
            }
            if (event == null)
                return;
            var data = event.newValue;
            var parsedData;
            try {
                parsedData = data && JSON.parse(data);
            }
            catch (_f) {
            }
            var eventData = parsedData;
            if (eventData != null &&
                eventData[constants_1.SESSION_STORAGE_ID] === _this._sessionId)
                return;
            if (eventData != null)
                delete eventData[constants_1.SESSION_STORAGE_ID];
            if (event.key === constants_1.GET_SESSION_STORAGE_KEY && event.newValue != null) {
                try {
                    if (_this.session.length > 0) {
                        var data_1 = JSON.parse(JSON.stringify(window.sessionStorage));
                        _this._ignored.forEach(function (i) {
                            delete data_1[i];
                        });
                        data_1[constants_1.SESSION_STORAGE_ID] = _this._sessionId;
                        _this.local.set(constants_1.SET_SESSION_STORAGE_KEY, JSON.stringify(data_1));
                        _this.local.remove(constants_1.SET_SESSION_STORAGE_KEY);
                    }
                }
                catch (_g) {
                    _this.local.remove(constants_1.SET_SESSION_STORAGE_KEY);
                }
            }
            else if (event.key === constants_1.SET_SESSION_STORAGE_KEY &&
                event.newValue != null) {
                try {
                    if (_this._isInitialized === true)
                        return;
                    _this._isInitialized = true;
                    if (eventData != null) {
                        var p = void 0;
                        for (p in eventData) {
                            window.sessionStorage.setItem(p, (_a = eventData[p], (_a !== null && _a !== void 0 ? _a : "")));
                        }
                    }
                }
                catch (_h) {
                }
            }
            else if (((_b = eventData) === null || _b === void 0 ? void 0 : _b.key) && ((_c = eventData) === null || _c === void 0 ? void 0 : _c.value) &&
                event.key === constants_1.ADD_TO_SESSION_STORAGE_KEY &&
                event.newValue != null) {
                window.sessionStorage.setItem(eventData.key, eventData.value);
            }
            else if (((_d = eventData) === null || _d === void 0 ? void 0 : _d.key) && ((_e = eventData) === null || _e === void 0 ? void 0 : _e.value) &&
                event.key === constants_1.DELETE_SESSION_STORAGE_KEY &&
                event.newValue != null) {
                window.sessionStorage.removeItem(eventData.key);
            }
            else if (event.key === constants_1.CLEAR_SESSION_STORAGE_KEY &&
                event.newValue != null) {
                window.sessionStorage.clear();
            }
        }, {
            capture: true,
            passive: true
        });
        if (this.session.length <= 0) {
            this.local.set(constants_1.GET_SESSION_STORAGE_KEY, JSON.stringify((_a = {},
                _a[constants_1.SESSION_STORAGE_ID] = this._sessionId,
                _a)));
            this.local.remove(constants_1.GET_SESSION_STORAGE_KEY);
        }
    };
    Storage.prototype.onSetItem = function (key, value) {
        var _a;
        this.local.set(constants_1.ADD_TO_SESSION_STORAGE_KEY, JSON.stringify((_a = {
                key: key,
                value: value
            },
            _a[constants_1.SESSION_STORAGE_ID] = this._sessionId,
            _a)));
        this.local.remove(constants_1.ADD_TO_SESSION_STORAGE_KEY);
    };
    Storage.prototype.onDeleteItem = function (key) {
        var _a;
        this.local.set(constants_1.DELETE_SESSION_STORAGE_KEY, JSON.stringify((_a = {
                key: key
            },
            _a[constants_1.SESSION_STORAGE_ID] = this._sessionId,
            _a)));
        this.local.remove(constants_1.DELETE_SESSION_STORAGE_KEY);
    };
    Storage.prototype.onClearItems = function () {
        var _a;
        this.local.set(constants_1.CLEAR_SESSION_STORAGE_KEY, JSON.stringify((_a = {},
            _a[constants_1.SESSION_STORAGE_ID] = this._sessionId,
            _a)));
        this.local.remove(constants_1.CLEAR_SESSION_STORAGE_KEY);
    };
    return Storage;
}());
exports.Storage = Storage;
