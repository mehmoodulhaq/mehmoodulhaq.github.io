(function() {
    'use strict';
    Redux.$inject = [];

    function Redux() { // use .pipe(uglify({mangle: { keep_fnames: true} })) for uglify
        var store;
        var postMw, preMw, thunk, reducer, enablePostMiddleWare, enablePreMiddleWare, eventSubscription,
            subscription, lastState, state;
        var toggleLastState = true;

        /**
         * 
         * @param {Function} reducer 
         * @param {Object} state 
         * @param {Array[Ojbect]} middleWare
         * @return {Function} 
         *  
         */
        function CreateStore(_reducer, _state, middleWare) { // middleware.type == 'post' ,middleware.type == 'pre' 
            var self = this;
            // debugger
            state = _state || {};
            postMw = [];
            preMw = []
            thunk = thunk || {};
            reducer = _reducer;
            subscription = [];
            eventSubscription = [];

            (middleWare || []).forEach(function(obj) {
                if (typeof obj['post'] === 'function') postMw.push(obj['post']);
                if (typeof obj['pre'] === 'function') postMw.push(obj['pre']);
            })

        };
        CreateStore.prototype = {

            constructor: CreateStore,
            emit: function(eventname, event) {
                eventSubscription.forEach(function(fn) {
                    if (fn.evtName === eventname) {

                        fn({ type: eventname, data: event })
                    }
                })
            },
            dispatch: function(_action, noSubscribeFlag) {

                var action = JSON.parse(JSON.stringify(_action)) // preserve action mutation in sub reducers

                var self = this;
                lastState = Object.assign({}, state)
                if (action.type in thunk) {
                    // thunk will call dispatch in turn or do nothing;
                    thunk[action.type](action, self);

                } else {
                    // preMiddleware
                    if (enablePreMiddleWare) {
                        (preMw || []).forEach(function(fn) {
                            state = Object.assign({}, state, preMw(action, self.getState));
                        });
                    }

                    // do reducing

                    state = Object.assign({}, state, reducer(state, action, self.getState));

                    // post middle ware
                    if (enablePostMiddleWare) {
                        (preMw || []).forEach(function(fn) {
                            // avoide mutation;

                            state = Object.assign({}, state, preMw(action, self.getState))
                        });
                    }

                    // cache store
                    localStorage.setItem('state', JSON.stringify(state));

                    // all done ; notify subscribers;
                    if (!noSubscribeFlag) { // noSubscribeFlag true means silent update only
                        (subscription || []).forEach(function(fn) {
                            var stateChangeflag = false;
                            var fnNameIState = fn._name && fn._name in state;
                            if (typeof fn.compare === 'function') {
                                // subscriber hastoggleLastState registered a comparator function
                                if (fnNameIState) {
                                    stateChangeflag = fn.compare(state[fn._name], lastState[fn._name])

                                } else {
                                    stateChangeflag = fn.compare(state, lastState)
                                }
                                if (typeof stateChangeflag === 'boolean' && stateChangeflag) {
                                    if (fnNameIState) {
                                        if (toggleLastState) {
                                            fn(state[fn._name], lastState[fn._name]);
                                        } else {
                                            fn(state[fn._name])
                                        }

                                    } else {
                                        if (toggleLastState) {
                                            fn(state, lastState)
                                        } else {
                                            fn(state)
                                        }

                                    }
                                }

                            } else {
                                if (fnNameIState) {
                                    fn(state[fn._name], lastState[fn._name]);

                                } else {
                                    // dont send last state for full state
                                    fn(state)
                                }
                            }

                        })
                    }


                }
                lastState = null;
            },
            getState: function(filter) {
                if (filter && typeof filter === 'function') return filter(state);
                return state;
            },
            on: function(evtName, fn) {
                fn.evtName = evtName
                eventSubscription.push(fn);
                return function off(all) {
                    if (all) {
                        eventSubscription = null;
                        eventSubscription = [];
                    }
                    eventSubscription.map(function(_fn, i, arr) {
                        if (_fn === fn) arr.splice(i, 1);
                    })
                }
            },

            subscribe: function(name, fn, comparaterFn) {
                var self = this;
                fn.compare = comparaterFn;
                fn._name = name;
                subscription.push(fn);
                // provide the current state;
                // fn(state, state[fn._name] || state);
                if (typeof comparaterFn === 'function') {
                    if (comparaterFn(state[fn._name] || state, state[fn._name] || state)) {
                        fn(state[fn._name] || state, state[fn._name] || state);
                    } //else remain silent

                } else {

                    fn(state[fn._name] || state, state[fn._name] || state);
                }

                return function(all) {
                    if (all) {
                        subscription = null;
                        subscription = [];
                    }
                    subscription.map(function(_fn, i, arr) {
                        if (_fn === fn) arr.splice(i, 1);
                    })
                }
            },
            unSubAll: function() {
                this.subscription = null;
                this.subscription = [];
            },
            togglePostMiddleware: function(flag) {
                enablePostMiddleWare = flag;
            },
            togglePreMiddleware: function(flag) {
                enablePreMiddleWare = flag;
            },
            enableLastState: function(val) {
                toggleLastState = typeof val === 'boolean' ? val : false;
            },
            setInStorage: function(val) {
                enableStorage = typeof val === 'boolean' ? val : true;
            }


        }

        var combineReducer = function(config) {
            // now optionally we can alter state in the reducers and var combineReducer be the
            // only pure function.
            return function(state, action) {

                var accuState = Object.assign({}, state);

                Object.keys(config).forEach(function(key) {
                    var reducer;
                    var configFlag = false;
                    var errFlag = false;

                    if (config[key] instanceof Function) {

                        reducer = config[key]
                            // reducer._name = key;
                    } else {
                        configFlag = true;
                        reducer = config[key].reducer
                            // config[key].reducer._name = key;
                    }
                    var alreadyUndefined;
                    if (configFlag) {
                        alreadyUndefined = typeof accuState === 'undefined';
                        accuState = reducer(accuState, action);
                        errFlag = accuState === undefined;
                    } else {
                        alreadyUndefined = typeof accuState[key] === 'undefined';
                        accuState[key] = reducer(accuState[key], action);
                        errFlag = accuState[key] === undefined
                    }

                    if (errFlag && errFlag !== alreadyUndefined) {
                        throw new Error(reducer.name + '-Reducer returned undefined')
                    }
                });

                return accuState;
            }
        }

        var createStore = function(reducer, initialState, middleWare, fresh) {

            if (fresh) {
                return new CreateStore(educer, initialState, middleWare);
            }
            // enable singvaron store
            if (store) return store;
            store = new CreateStore(reducer, initialState, middleWare);
            return store;

        }
        var registerThunk = function(data) {
            thunk = thunk || {};
            if (typeof data === 'object') {
                Object.assign(thunk, data);
            } else {
                if (typeof data === 'function' && data.name) thunk[data.name] = data;
            }
        }

        var undoRedoMetaReducer = function(reducerfn, _length, useLocalStorage) {

            // due to uglify proble
            var length = _length || 10;
            var current;
            var redo = [];
            var undo = [];

            var _state_ = {
                redo: [],
                undo: []
            }
            if (useLocalStorage) {
                _state_ = getLocal();
            }
            var newState;
            var reducerfnName = reducerfn._name || reducerfn.name

            function getLocal() {
                return JSON.parse(localStorage.getItem(reducerfnName) || "{redo:[],undo:[]}");

            }

            function setLocal() {
                localStorage.setItem(reducerfnName, JSON.stringify(_state_))
            }
            return function(state, action) {
                if (action.type === reducerfnName + '-undo') {
                    newState = undo.length ? undo.pop() : state;
                    var clear = setTimeout(function() {
                        if (!Object.is(state, newState)) {
                            if (typeof state !== 'undefined') {
                                _state_.redo.push(state);
                                if (useLocalStorage) {
                                    setLocal();
                                }

                                // if (redo.length > length) {
                                //     redo = redo.slice(length * (-1))
                                // }
                            }

                        }
                        clearTimeout(clear);
                    }, 10)

                } else if (action.type === reducerfnName + '-redo') {
                    newState = redo.length ? redo.pop() : state;
                    var clear = setTimeout(function() {
                        if (!Object.is(state, newState)) {
                            if (typeof state !== 'undefined') {
                                _state_.undo.push(state)
                                if (useLocalStorage) {
                                    setLocal();
                                }
                                // if (undo.length > length) {
                                //     undo = undo.slice(length * (-1))
                                // }
                            }
                        }
                        clearTimeout(clear);
                    }, 10)
                } else {
                    newState = reducerfn(state, action);
                    var clear = setTimeout(function() {
                        if (!Object.is(state, newState)) {
                            if (typeof state !== 'undefined') {
                                _state_.undo.push(state)
                                if (_state_.undo.length > length) {
                                    _state_.undo = _state_.undo.slice(length * (-1))
                                }
                                _state_.redo = [];
                                if (useLocalStorage) {
                                    setLocal();
                                }
                            }
                        }
                        clearTimeout(clear);
                    }, 10)
                }
                return newState;

                function mutate(val) {
                    if (typeof val === 'object') {
                        return Object.assign({}, val)
                    } else if (Array.isArray(state)) {
                        return val = val.concat(val)
                    }
                    return val
                }

            }
        }


        return {
            createStore: createStore,
            combineReducer: combineReducer,
            registerThunk: registerThunk,
            undoRedoMetaReducer: undoRedoMetaReducer
        }
    };
    angular.module('redux.module', []).factory('redux', Redux);
})()