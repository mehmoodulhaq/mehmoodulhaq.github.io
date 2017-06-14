(function() {
    'use strict';
    DashboardController.$inject = ['$scope', 'store', 'spotify'];

    function DashboardController($scope, store, spotify) {
        var self = this;
        // /**
        //  * Controller view modals and helper variables
        //  */

        this.store = store.store;
        this.searchText;
        this.cardsMetadata = {};
        this.loading = false;
        this.pageCards = [];

        this.modals = {
            artist: false, // for album ;opneflag matche selectedCard.type
            albumTemplate: 'app/templates/album.modal.tpl.html',
            album: false, // for track ;opneflag matche selectedCard.type
            tracksTemplate: 'app/templates/track.modal.tpl.html',
            selectedCard: {},
            showLoading: false,
            albumsArray: [],
            tracksArray: [],
            audio: {
                lastTrackUrl: '',
                play: false
            },
            openModal: function(card) {
                var _self = this;
                this.albumsArray = card.albums && card.albums.items || [];
                this.tracksArray = card.tracks && card.tracks.items || [];
                this.selectedCard = card;

                toggleModal(card.status);

                if (card.status === 'artist' && !this.albumsArray.length) {
                    this.showLoading = true;
                    this.getAlbums(this.selectedCard)
                }
                if (card.status === 'album' && !this.tracksArray.length) {
                    this.showLoading = true;
                    this.getTracks(this.selectedCard);
                }

            },
            goBack: function(type) {
                if (type === 'album') {
                    this.selectedCard.tracks = null;
                    this.tracksArray = [];
                    this.selectedCard.status = 'artist'
                    this.closeModal(type);
                    this.openModal(this.selectedCard)

                }

            },
            getAlbums: function(card, more) {
                var _self = this;
                var promise;
                if (card.albums && card.albums.next) {
                    promise = spotify.getAlbums(card, card.albums.next)
                } else {
                    promise = spotify.getAlbums(card)
                }

                promise
                    .then(function(data) {
                        _self.showLoading = false;
                        $scope.$$phase || $scope.$digest();
                        if (!card.albums) {
                            card.albums = data.data;
                        } else {
                            card = parseData(card, data.data, 'albums')
                        }
                        _self.albumsArray = card.albums.items;

                        self.store.dispatch({ type: "updateAlbum", payload: card }, true) // true for silent update
                    })
                    .catch(function(e) {
                        _self.showLoading = false;

                    })
            },
            getMoreAlbums: function() {
                if (this.validateGetMore('albums')) return;
                if (this.selectedCard.albums.next) {
                    this.showLoading = true;
                    this.getAlbums(this.selectedCard);
                }

            },
            slectAlbum: function(album) {
                var preStatus = this.selectedCard.status
                this.selectedCard.status = 'album'
                this.selectedCard.album = album;
                this.closeModal(preStatus)
                    // $scope.$$phase || $scope.$digest();
            },

            getTracks: function(card) {
                if (this.validateGetMore('tracks')) return;
                this.showLoading = true;
                var _self = this;
                var promise;
                if (card.tracks && card.tracks.next) {
                    promise = spotify.getTracks(card.album, card.tracks.next)
                } else {
                    promise = spotify.getTracks(card.album)
                }
                this.loading = false;

                promise
                    .then(function(data) {
                        _self.showLoading = false;
                        if (!card.tracks) {
                            card.tracks = data.data;
                        } else {
                            card = parseData(card, data.data, 'tracks')
                        }
                        _self.tracksArray = card.tracks.items;

                        self.store.dispatch({ type: "updateAlbum", payload: card }, true) // true for silent update
                    })
                    .catch(function(e) {
                        _self.showLoading = false;

                    })

            },

            closeModal: function(type) {
                if (this.audio.play) {
                    this.audio.play = false;
                    this.audio.audio.pause();
                }
                toggleModal(type);
                self.store.dispatch({ type: 'updateCards', payload: this.selectedCard })
            },
            togglePlay: function(url) {
                if (url !== this.audio.lastTrackUrl) {
                    if (this.audio.play) {
                        this.audio.play = false;
                        this.audio.audio.pause();
                    }
                    this.audio.audio = new Audio(url);
                    this.audio.lastTrackUrl = url;
                }
                if (this.audio.play) {
                    this.audio.audio.pause()
                    this.audio.play = false;
                } else {
                    this.audio.audio.play()
                    this.audio.play = true;
                }

            },
            validateGetMore: function(val) {
                if (this.selectedCard[val] === null) return;
                if (!(val in this.selectedCard)) return;
                return this.selectedCard[val].offset + this.selectedCard[val].limit >= this.selectedCard[val].total
            }


        }

        // /**
        //  * Subscribe to app various states in this section
        //  */
        // if subscribe cb has same name as state.porp the state will be already filtered

        this.store.subscribe('pageCards', function(pageCards, lastState) {
            self.pageCards = null;
            self.pageCards = pageCards;
        }, comparePageCards)


        this.store.subscribe('loading', function(state) {
            self.loading = state;
        }, function(curr, last) { return curr !== last });

        this.store.subscribe('cardsMetadata', function(state, prev) {
                self.cardsMetadata = state;
                if (self.cardsMetadata.searchText) {
                    self.searchText = self.cardsMetadata.searchText;

                }
            })
            // listen to event equal to cb.name
        this.toggleBtnState = function() {
            var pre = self.cardsMetadata.searchText === undefined ? "" : self.cardsMetadata.searchText
            return !(self.searchText === pre &&
                self.cardsMetadata.next)
        }

        // /**
        //  *  data search and fetch methods
        //  */
        this.searchArtists = function(showMore) {

            // this type exists in tunk so thunk in store will catch it first
            if (showMore) {
                self.store.dispatch({ type: 'getMoreArtists' });
            } else {
                if (!self.searchText) return;
                if (self.searchText === self.cardsMetadata.searchText) return;
                self.store.dispatch({ type: 'getArtists', payload: self.searchText });
            }

        }
        this.getCardByStatus = function(card) {
            if (card.status === "artist") return card;
            if (card.status === "album") return card.album;
        }


        // /**
        //  * View helper methods
        //  */

        this.getIcon = function(card) {
            if (typeof card === 'string') return; // uglify erors hack
            return { "background-image": "url(" + this.getCardStatusIcon(this.getCardByStatus(card)) + ")" };



        }
        this.getCardStatusIcon = function(card) {
            return card.type === 'artist' ? 'assets/images/artist-icon@2x.png' :
                'assets/images/album.png';
            $scope.$$phase || $scope.$digest()
        }


        function toggleModal(type) {

            self.modals[type] = !self.modals[type]
        }

        function comparePageCards(curr, last) {
            return !!(
                typeof curr !== 'undefined' &&
                Array.isArray(curr))
        }

        function parseData(card, obj, type) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    // debugger;
                    if (prop !== 'items') {
                        card[type][prop] = obj[prop]
                    } else {
                        card[type][prop] = card[type][prop].concat(obj[prop])
                    }
                }
            }
            return card
        }

    }

    angular.module('dashboard')
        .controller('dashboardController', DashboardController);

    angular.module('dashboard').filter('trustAsResourceUrl', trustAsResourceUrl);

    trustAsResourceUrl.$inject = ['$sce']

    function trustAsResourceUrl($sce) {
        return function(val) {
            return $sce.trustAsResourceUrl(val);
        };
    }
})();