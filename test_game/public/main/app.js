angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.directives'])
    .run(function ($ionicPlatform, $rootScope, $location) {
        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
        $rootScope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
            //刷新的时候前后的url是一样的，当刷新界面则进入首页
            if (newUrl == oldUrl) {
                $location.url("/tab/home");
            }
        });
    })
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('tab', {
                url: "/tab",
                abstract: true,
                templateUrl: "/templates/tabs"
            })

            .state('tab.home', {
                url: '/home',
                views: {
                    'tab-home': {
                        templateUrl: '/templates/tab/home',
                        controller: 'HomeCtrl'
                    }
                }
            })

            .state('tab.mybattles', {
                url: '/mybattles',
                views: {
                    'tab-mybattles': {
                        templateUrl: '/templates/tab/mybattles',
                        controller: 'MyBattlesCtrl'
                    }
                }
            })
            /*
            .state('tab.chat-detail', {
                url: '/chats/:chatId',
                views: {
                    'tab-chats': {
                        templateUrl: '/main/templates/chat-detail.html',
                        controller: 'ChatDetailCtrl'
                    }
                }
            })
            */
            .state('tab.honor', {
                url: '/honor',
                views: {
                    'tab-honor': {
                        templateUrl: '/templates/tab/honor',
                        controller: 'HonorCtrl'
                    }
                }
            })

            .state('tab.other', {
                url: '/other',
                views: {
                    'tab-other': {
                        templateUrl: '/templates/tab/other',
                        controller: 'OtherCtrl'
                    }
                }
            });

        $urlRouterProvider.otherwise('/tab/home');

    });
