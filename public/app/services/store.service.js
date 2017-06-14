(function() {
    'use strict';
    Store.$inject = ['redux', 'spotify', '$timeout', '$window'];

    function Store(redux, spotify, $timeout, $window) {
        var combinedReducer, rootReducer, store, appInitialState;

        /**
         *  app actions here;
         */
        var actions = {
            toggleLoadoing: function(payload) {
                return {
                    type: 'toggleLoading',
                    payload: payload
                }
            },
            addPageCards: function(payload) {
                return {
                    type: 'addPageCards',
                    payload: payload
                }
            }

        }


        /**
         * Thunk area
         * thunk prop name must match some action.type to work 
         * action.type === 'foo' then 
         * thunk.foo = function(action,payload,store){ //use store.getState() and  store.dispatch(action2,payload)}
         */

        var thunk = {
            getArtists: function(action, store) {
                store.dispatch(actions.toggleLoadoing(true));

                var spPayload = {
                    searchText: action.payload
                }
                spotify.getArtists(spPayload)
                    .then(function(data) {

                        data.data.artists.searchText = action.payload;
                        store.dispatch(actions.addPageCards(data.data.artists.items))
                        store.dispatch({ type: 'artistsMetadata', payload: data.data }); // silent update no subscriber
                        store.dispatch(actions.toggleLoadoing(false));
                    }).catch(function(e) {
                        // debugger;
                        store.dispatch(actions.toggleLoadoing(false));
                    })
            },
            getMoreArtists: function() {
                store.dispatch(actions.toggleLoadoing(true));
                spotify.getArtists({ url: store.getState().cardsMetadata.next })
                    .then(function(data) {
                        data.data.artists.searchText = store.getState().cardsMetadata.searchText;
                        store.dispatch({ type: 'addMorePageCards', payload: data.data.artists.items })
                        store.dispatch({ type: 'artistsMetadata', payload: data.data }); // silent update no subscriber
                        store.dispatch(actions.toggleLoadoing(false));
                    })
                    .catch(function(e) {
                        // debugger;
                        store.dispatch(actions.toggleLoadoing(false));
                    })
            }

        }

        /**
         * 
         * Reducers Area
         * // state and action mutation is preserved in redux so need not do it twice
         */
        pageCardsReducer._name = 'pageCardsReducer' // uglify hack
        function pageCardsReducer(state, action) {

            if (action.type === 'addPageCards') {
                action.payload.forEach(function(card) {
                    card.status = "artist";
                })
                return action.payload;
            }
            if (action.type === 'addMorePageCards') {
                action.payload.forEach(function(card) {
                    card.status = "artist";
                })
                return state.concat(action.payload)
            }
            if (action.type === 'addAlbumsMetadataInCard') {

                state.forEach(function(card) {
                    if (card.id === action.payload.cardId) {
                        card.albumsMetadata = action.payload.albums.items;

                    }
                })
                return state;
            }

            if (action.type === 'updateAlbum') {
                state.map(function(card) {
                    if (card.id === action.payload.cardId) {

                        card = action.payload;
                    }
                })
            }
            return state;
        }

        cardsMetadataReducer._name = 'cardsMetadataReducer';

        function cardsMetadataReducer(state, action) {
            if (action.type === 'artistsMetadata') {
                delete action.payload.artists.items;

                return action.payload.artists;
            }
            return state;
        }

        loadingReducer._name = 'loadingReducer';

        function loadingReducer(state, action) {
            if (action.type === 'toggleLoading') {
                return action.payload
            }
            return state;
        }

        viewportReducer._name = 'viewportReducer';

        function viewportReducer(state, action) {
            if (action.type === 'viewport') {
                return action.payload;
            }
            return state;
        }


        /**
         *   register thunk in store; 
         */

        redux.registerThunk(thunk);


        /**
         * App initial State and Reducer intigration
         */
        appInitialState = {
            pageCards: [],
            loading: false,
            cardsMetadata: {}
        }

        var local = JSON.parse(localStorage.getItem('state'));
        // debugger;
        if (local) {
            appInitialState = local;
        }

        // create combined reducer
        combinedReducer = {
            pageCards: pageCardsReducer,
            loading: loadingReducer,
            viewport: viewportReducer,
            cardsMetadata: cardsMetadataReducer,

        }
        rootReducer = redux.combineReducer(combinedReducer);

        /**
         * Store creation
         */
        store = redux.createStore(rootReducer, appInitialState);



        // breakPoint change
        // $(window).trigger('resize'); for force redraw

        function getViewport() {
            var w = $window.innerWidth
            var payload = {
                    w: w,
                    h: $window.innerHeight,
                    d_bp: '',
                    m_bp: '',
                    band: ''
                }
                //desktop first approach
            if (w < 767) {
                payload.d_bp = 'max-width:767';
            } else if (w < 991) {
                payload.d_bp = 'max-width:991';
            } else if (w < 1199) {
                payload.d_bp = 'max-width:1199';
            }
            // mobile first approach
            if (w >= 576) {
                payload.m_bp = 'min-width:576';
            }
            if (w >= 768) {
                payload.m_bp = 'min-width:768';
            }
            if (w >= 992) {
                payload.m_bp = 'min-width:992';
            }
            if (w >= 1200) {
                payload.m_bp = 'min-width:1200';
            }
            // range band

            if (0 <= w && w < 576) {
                payload.band = 'xs';
            }
            if (576 <= w && w < 768) {
                payload.band = 'sm';
            }
            if (768 <= w && w < 992) {
                payload.band = 'md';
            }
            if (992 <= w) {
                payload.band = 'lg';
            }
            return payload;
        }
        var wait;
        $(window).on('resize', function() {

            if (wait) return;
            wait = $timeout(function() {
                store.dispatch({ type: 'viewport', payload: getViewport() });
                $timeout.cancel(wait);
                wait = null;
            }, 200)

        });

        // service return here
        return {
            store: store,
            actions: actions,
            getViewport: getViewport


        }
    };

    function mutate(state, data) {
        if (Array.isArray(data)) return state = state.concat(data);
        if (typeof data === 'object') return state = object.asign(state, data);
        if (typeof data === 'string' || typeof data === 'boolean' || typeof data === 'number') return state = data;
    }

    angular.module('dashboard').factory('store', Store);
})();