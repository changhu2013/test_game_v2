angular.module('starter.directives', [])
    .controller('moaTableController', ['$scope', '$http', function ($scope, $http) {

        $scope.data = [];

        var loadCallback = function (data) {
            if (data instanceof Array) {
                $scope.skip = $scope.skip + data.length;
                $scope.data = $scope.data.concat(data);
                if ($scope.paging == 'more') {
                    if (data.length < $scope.limit) {
                        $scope.showMoreBtn = false;
                    } else {
                        $scope.showMoreBtn = true;
                    }
                } else {
                    $scope.showMoreBtn = false;
                }
            }
        };

        $scope.loadData = function () {
            $http({
                method: 'POST',
                url: $scope.dataurl,
                params: {
                    skip: $scope.skip,
                    limit: $scope.limit
                }
            }).success(loadCallback);
        };

        $scope.generateHref = function (data) {
            var link = $scope.link;
            if (typeof link == 'string') {
                var args = link.split('/:');
                var href = args[0];
                for (var i = 1, len = args.length; i < len; i++) {
                    var arg = args[i];
                    if (typeof data[arg] == 'string') {
                        href += '/' + data[arg];
                    } else {
                        href += '/' + arg;
                    }
                }
                return href;
            }
        }
    }])
    .directive('moaTable', ['$http', function ($http) {
        return {
            restrict: 'E',
            templateUrl: '/templates/moa-table.tpl.html',
            controller: 'moaTableController',
            scope: true,
            compile: function (element, attributes) {
                var dataurl = attributes.dataurl,
                    title = attributes.title,
                    limit = attributes.limit || 10,
                    clazz = attributes.class,
                    headers = attributes.headers,
                    cols = attributes.cols,
                    paging = attributes.paging || 'more',
                    link = attributes.link;

                headers = typeof headers == 'string' ? headers.split(',') : [];
                cols = typeof cols == 'string' ? cols.replace(' ', '').split(',') : [];

                return {
                    pre: function ($scope, iElement) {
                        $scope.title = title;
                        $scope.dataurl = dataurl;
                        $scope.skip = 0;
                        $scope.limit = limit;
                        $scope.clazz = clazz;
                        $scope.headers = headers;
                        $scope.cols = cols;
                        $scope.paging = paging;
                        $scope.showMoreBtn = false;

                        $scope.link = link;

                        $scope.loadData();
                    }
                }
            }
        };
    }])
    .controller('moaTreeController', ['$scope', '$http', '$compile', function ($scope, $http, $compile) {

        //生成节点ID
        var nodeId = function () {
            return 'node_' + (new Date()).getTime() + ('' + Math.random()).substring(2);
        };

        //展开或合并节点
        var doExpandCollapse = function (node) {
            if (node.collapsed == true) { //当前合并，则展开
                loadChildren(node, function (node, children) {//加载子项
                    if (node.rendered == true) { //判断是否已经渲染，如果已渲染，则显示即可
                        node.collapsed = false;
                    } else {
                        //未曾渲染，将节点信息展示
                        var _id = node._id;
                        var el = $('#' + _id);
                        if (el.length > 0) {
                            var scope = node.scope ? node.scope : $scope.$new();
                            scope.node = node;
                            node.scope = scope;
                            el.after($compile(template)(scope));
                            node.rendered = true;//标记该节点已经展开并已渲染
                            node.collapsed = false; //标记该节点已经展开
                        }
                    }
                });
            } else { //当前展开，则合并
                node.collapsed = true;
            }
        };

        //加载子项，如果已经加载则不再发送异步请求
        var loadChildren = function (node, callback) {
            if (node && node.children) {
                callback(node, node.children);
            } else {
                $http({
                    method: 'POST',
                    url: $scope.dataurl,
                    params: {
                        pid: node.id
                    }
                }).success(function (children) {
                    for (var idx in children) {
                        var child = children[idx];
                        child._id = nodeId();

                        child.collapsed = true;
                        child.expandCollapse = doExpandCollapse;
                    }
                    node.children = children;
                    callback(node, children);
                });
            }
        };

        //节点模板
        var template =
            '<ul class="list" data-ng-show="!node.collapsed" style="margin-bottom:0px;">' +
            '<li data-ng-repeat="child in node.children" class="item" style="padding-left: 10px;padding-right: 0px; padding-bottom : 0px; padding-top:0px; border: 0px;">' +
            '<i data-ng-hide="child.leaf" data-ng-click="child.expandCollapse(child)" class="{{child.collapsed?expandicon:collapseicon}}"></i>' +
            '<i data-ng-show="child.leaf" style="padding-left:6px;"></i>' +
            '<i data-ng-hide="nodeicon==undefined" class="{{nodeicon}}" style="padding-left: 6px;"></i>' +
            '<a id="{{child._id}}" ng-href="{{generateHref(child)}}" class="btn btn-link btn-lg" style="padding-left:6px;">{{child.text}}</a>' +
            '</li>' +
            '</ul>';

        //内置的根节点
        $scope.node = {
            _id: nodeId(),
            id: 'root',
            collapsed: false,
            expandCollapse: doExpandCollapse
        };

        //初始化树
        $scope.init = function (element) {
            var node = $scope.node;
            loadChildren(node, function (node, children) {
                element.html('').append($compile(template)($scope));
            });
        }


        $scope.generateHref = function (data) {
            var link = $scope.link;
            if (typeof link == 'string') {
                var args = link.split('/:');
                var href = args[0];
                for (var i = 1, len = args.length; i < len; i++) {
                    var arg = args[i];
                    if (typeof data[arg] == 'string') {
                        href += '/' + data[arg];
                    } else {
                        href += '/' + arg;
                    }
                }
                return href;
            }
        }
    }])
    .directive('moaTree', ['$compile', function ($compile) {

        return {
            restrict: 'E',
            controller: 'moaTreeController',
            replace: true,
            scope: true,
            compile: function (element, attributes) {

                var dataurl = attributes.dataurl;
                var title = attributes.title;
                var clazz = attributes.class;
                var nodeicon = attributes.nodeicon;
                var expandicon = attributes.expandicon;
                var collapseicon = attributes.collapseicon;
                var link = attributes.link;

                //nodeicon = nodeicon ? nodeicon : 'glyphicon glyphicon-stop';
                expandicon = expandicon ? expandicon : 'glyphicon glyphicon-plus';
                collapseicon = collapseicon ? collapseicon : 'glyphicon glyphicon-minus';

                return {

                    pre: function ($scope, iElement) {
                        $scope.dataurl = dataurl;
                        $scope.title = title;
                        $scope.clazz = clazz;
                        //节点图标
                        $scope.nodeicon = nodeicon;
                        //展开图标
                        $scope.expandicon = expandicon;
                        //合并图标
                        $scope.collapseicon = collapseicon;

                        $scope.link = link;

                        $scope.init(element);
                    }
                }
            }
        };
    }]);
