(function() {
    'use strict';
    Spotify.$inject = ['$q', '$http', '$window'];

    function Spotify(q, $http, $window) {

        var baseUrl = "https://api.spotify.com";

        function getArtists(data) {
            if (data.url) return $http.get(data.url)
            var q = baseUrl + '/v1/search';
            var p = {
                params: {
                    type: 'artist',
                    q: encodeURI(data.searchText.trim()),
                    limit: 10
                }
            }

            return $http.get(q, p)
        };

        function getAlbums(card, url) {
            if (url) return $http({
                method: "GET",
                url: url
            })
            var q = baseUrl + '/v1/artists/' + card.id + '/albums';
            var p = {
                params: {
                    limit: 10
                }
            }
            return $http.get(q, p)
        }

        function getTracks(album, url) {
            if (url) return $http({
                method: "GET",
                url: url
            })
            var q = baseUrl + '/v1/albums/' + album.id + '/tracks';
            var p = {
                params: {
                    limit: 10
                }
            }
            return $http.get(q, p)
        }
        return {
            getArtists: getArtists,
            getAlbums: getAlbums,
            getTracks: getTracks

        }
    }
    angular.module('dashboard').factory('spotify', Spotify);
})()