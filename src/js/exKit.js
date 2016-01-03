/**
 * Created by Anton on 09.03.2015.
 */
var exKit = {
    legacy: {
        varCache: {
            size_check: /[^0-9.,кбмгтkmgtb]/g,
            size_kb: /кб|kb/,
            size_mb: /мб|mb/,
            size_gb: /гб|gb/,
            size_tb: /тб|tb/,
            today_now: /сейчас|now/,
            today_today: /сегодня|today/,
            today_yest: /вчера|yesterday/,
            ex_num: /[^0-9]/g,
            spaces: /\s+/g,
            timeFormat4: /([0-9]{1,2}d)?[^0-9]*([0-9]{1,2}h)?[^0-9]*([0-9]{1,2}m)?[^0-9]*([0-9]{1,2}s)?/
        },
        sizeFormat: function (s) {
            "use strict";
            var size = s.toLowerCase().replace(this.varCache.size_check, '').replace(',', '.');
            var t = size.replace(this.varCache.size_kb, '');
            var size_len = size.length;
            if (t.length !== size_len) {
                t = parseFloat(t);
                return Math.round(t * 1024);
            }
            t = size.replace(this.varCache.size_mb, '');
            if (t.length !== size_len) {
                t = parseFloat(t);
                return Math.round(t * 1024 * 1024);
            }
            t = size.replace(this.varCache.size_gb, '');
            if (t.length !== size_len) {
                t = parseFloat(t);
                return Math.round(t * 1024 * 1024 * 1024);
            }
            t = size.replace(this.varCache.size_tb, '');
            if (t.length !== size_len) {
                t = parseFloat(t);
                return Math.round(t * 1024 * 1024 * 1024 * 1024);
            }
            return 0;
        },
        monthReplace: function (t) {
            "use strict";
            return t.toLowerCase().replace('янв', '1').replace('фев', '2').replace('мар', '3')
                .replace('апр', '4').replace('мая', '5').replace('май', '5').replace('июн', '6')
                .replace('июл', '7').replace('авг', '8').replace('сен', '9')
                .replace('окт', '10').replace('ноя', '11').replace('дек', '12')
                .replace('jan', '1').replace('feb', '2').replace('mar', '3')
                .replace('apr', '4').replace('may', '5').replace('jun', '6')
                .replace('jul', '7').replace('aug', '8').replace('sep', '9')
                .replace('oct', '10').replace('nov', '11').replace('dec', '12');
        },
        todayReplace: function (t, f) {
            "use strict";
            f = parseInt(f);
            t = t.toLowerCase();
            var tt = new Date();
            if ((this.varCache.today_now).test(t)) {
                t = 'today ' + tt.getHours() + ':' + tt.getMinutes();
            }
            var tty = new Date((Math.round(tt.getTime() / 1000) - 24 * 60 * 60) * 1000);
            var today;
            var yesterday;
            if (f === 0) {
                today = tt.getFullYear() + ' ' + (tt.getMonth() + 1) + ' ' + tt.getDate() + ' ';
                yesterday = tty.getFullYear() + ' ' + (tty.getMonth() + 1) + ' ' + tty.getDate() + ' ';
            } else if (f === 3) {
                today = (tt.getMonth() + 1) + ' ' + tt.getDate() + ' ' + tt.getFullYear() + ' ';
                yesterday = (tty.getMonth() + 1) + ' ' + tty.getDate() + ' ' + tty.getFullYear() + ' ';
            } else {
                today = tt.getDate() + ' ' + (tt.getMonth() + 1) + ' ' + tt.getFullYear() + ' ';
                yesterday = tty.getDate() + ' ' + (tty.getMonth() + 1) + ' ' + tty.getFullYear() + ' ';
            }
            t = t.replace(this.varCache.today_today, today).replace(this.varCache.today_yest, yesterday);
            return t;
        },
        dateFormat: function (f, t) {
            "use strict";
            if (f === undefined) {
                return ['2013-04-31[[[ 07]:03]:27]', '31-04-2013[[[ 07]:03]:27]', 'n day ago', '04-31-2013[[[ 07]:03]:27]', '2d 1h 0m 0s ago'];
            }
            f = parseInt(f);
            if (f === 0) { // || f === '2013-04-31[[[ 07]:03]:27]') {
                var dd = t.replace(this.varCache.ex_num, ' ').replace(this.varCache.spaces, ' ').trim().split(' ');
                for (var i = 0; i < 6; i++) {
                    if (dd[i] === undefined) {
                        dd[i] = 0;
                    } else {
                        dd[i] = parseInt(dd[i]);
                        if (isNaN(dd[i])) {
                            if (i < 3) {
                                return 0;
                            } else {
                                dd[i] = 0;
                            }
                        }
                    }
                }
                if (dd[0] < 10) {
                    dd[0] = '200' + dd[0];
                } else if (dd[0] < 100) {
                    dd[0] = '20' + dd[0];
                }
                return Math.round((new Date(dd[0], dd[1] - 1, dd[2], dd[3], dd[4], dd[5])).getTime() / 1000);
            }
            if (f === 1) { //  || f === '31-04-2013[[[ 07]:03]:27]') {
                var dd = t.replace(this.varCache.ex_num, ' ').replace(this.varCache.spaces, ' ').trim().split(' ');
                for (var i = 0; i < 6; i++) {
                    if (dd[i] === undefined) {
                        dd[i] = 0;
                    } else {
                        dd[i] = parseInt(dd[i]);
                        if (isNaN(dd[i])) {
                            if (i < 3) {
                                return 0;
                            } else {
                                dd[i] = 0;
                            }
                        }
                    }
                }
                if (dd[2] < 10) {
                    dd[2] = '200' + dd[2];
                } else if (dd[2] < 100) {
                    dd[2] = '20' + dd[2];
                }
                return Math.round((new Date(dd[2], dd[1] - 1, dd[0], dd[3], dd[4], dd[5])).getTime() / 1000);
            }
            if (f === 2) { //  || f === 'n day ago') {
                var old = parseFloat(t.replace(this.varCache.ex_num, '')) * 24 * 60 * 60;
                return Math.round(Date.now() / 1000) - old;
            }
            if (f === 3) { //  || f === '04-31-2013[[[ 07]:03]:27]') {
                var dd = t.replace(this.varCache.ex_num, ' ').replace(this.varCache.spaces, ' ').trim().split(' ');
                for (var i = 0; i < 6; i++) {
                    if (dd[i] === undefined) {
                        dd[i] = 0;
                    } else {
                        dd[i] = parseInt(dd[i]);
                        if (isNaN(dd[i])) {
                            if (i < 3) {
                                return 0;
                            } else {
                                dd[i] = 0;
                            }
                        }
                    }
                }
                if (dd[2] < 10) {
                    dd[2] = '200' + dd[2];
                } else if (dd[2] < 100) {
                    dd[2] = '20' + dd[2];
                }
                return Math.round((new Date(dd[2], dd[0] - 1, dd[1], dd[3], dd[4], dd[5])).getTime() / 1000);
            }
            if (f === 4) { //  || f === '2d 1h 0m 0s ago') {
                var match = t.match(this.varCache.timeFormat4);
                if (match) {
                    var d = parseInt(match[1]) || 0;
                    var h = parseInt(match[2]) || 0;
                    var m = parseInt(match[3]) || 0;
                    var s = parseInt(match[4]) || 0;
                    var time = d * 24 * 60 * 60 + h * 60 * 60 + m * 60 + s;
                    if (time === 0) {
                        return 0;
                    }
                    return parseInt(Date.now() / 1000) - time;
                }
                return 0;
            }
        }
    },
    prepareTrackerR: {
        hasEndSlash: /\/$/
    },
    funcList: {
        encodeCp1251: function (string) {
            "use strict";
            var output = '', charCode, ExitValue, char;
            for (var i = 0, len = string.length; i < len; i++) {
                char = string.charAt(i);
                charCode = char.charCodeAt(0);
                var Acode = charCode;
                if (charCode > 1039 && charCode < 1104) {
                    Acode -= 848;
                    ExitValue = '%' + Acode.toString(16);
                }
                else if (charCode === 1025) {
                    Acode = 168;
                    ExitValue = '%' + Acode.toString(16);
                }
                else if (charCode === 1105) {
                    Acode = 184;
                    ExitValue = '%' + Acode.toString(16);
                }
                else if (charCode === 32) {
                    Acode = 32;
                    ExitValue = '%' + Acode.toString(16);
                }
                else if (charCode === 10) {
                    ExitValue = '%0A';
                }
                else {
                    ExitValue = char;
                }
                output = output + ExitValue;
            }
            return output;
        },
        idInCategoryList: function (tracker, cId) {
            "use strict";
            var mapNameId = {
                serials: 0,
                music: 1,
                games: 2,
                films: 3,
                cartoon: 4,
                books: 5,
                soft: 6,
                anime: 7,
                doc: 8,
                sport: 9,
                xxx: 10,
                humor: 11
            };

            for (var key in tracker.categoryList) {
                var list = tracker.categoryList[key];
                if (list.indexOf(cId) !== -1) {
                    return mapNameId[key];
                }
            }

            return -1;
        },
        idInCategoryListInt: function (tracker, url, regexp) {
            "use strict";
            var cId = url.match(regexp);
            cId = cId && cId[1];
            if (cId === null) {
                return -1;
            }
            cId = parseInt(cId);
            return this.idInCategoryList(tracker, cId);
        },
        idInCategoryListStr: function (tracker, url, regexp) {
            "use strict";
            var cId = url.match(regexp);
            cId = cId && cId[1];
            if (cId === null) {
                return -1;
            }
            return this.idInCategoryList(tracker, cId);
        }
    },
    prepareCustomTracker: function (trackerJson) {
        "use strict";
        var id = null;

        if (trackerJson.version === 1) {
            id = 'ct_' + trackerJson.uid;
            if (engine.trackerLib[id]) {
                return;
            }

            var trackerObj = engine.trackerLib[id] = {};
            trackerObj.code = JSON.stringify(trackerJson);
            trackerObj.icon = trackerJson.icon;
            trackerObj.id = id;
            trackerObj.title = trackerJson.name;
            trackerObj.desc = trackerJson.about;
            trackerObj.flags = !trackerJson.flags ? {} : {
                auth: trackerJson.a ? 1 : 0,
                language: trackerJson.l ? 'ru' : undefined,
                cyrillic: trackerJson.rs ? 1 : 0,
                allowProxy: trackerJson.post ? 0 : 1
            };
            var search = trackerObj.search = {};
            var torrentSelector = search.torrentSelector = {};
            var onGetValue = search.onGetValue = {};
            search.searchUrl = trackerJson.search_path;
            if (trackerJson.root_url) {
                search.baseUrl = trackerJson.root_url;
            }
            if (trackerJson.auth) {
                search.loginUrl = trackerJson.auth;
            }
            if (trackerJson.post) {
                search.requestType = 'POST';
                search.requestData = trackerJson.post;
            }
            if (trackerJson.encode) {
                search.onBeforeRequest = function (details) {
                    "use strict";
                    details.query = exKit.funcList.encodeCp1251(details.query);
                };
            }
            search.listItemSelector = trackerJson.items;
            if (trackerJson.charset) {
                search.requestMimeType = 'text/html; charset=' + trackerJson.charset;
            }
            if (trackerJson.cat_alt) {
                trackerJson.cat_attr = 'alt';
                trackerJson.cat_alt = undefined;
            }
            if (trackerJson.auth_f) {
                search.loginFormSelector = trackerJson.auth_f;
            }
            if (trackerJson.sf || trackerJson.sl) {
                search.listItemSplice = [trackerJson.sf || 0, -(trackerJson.sl || 0)];
            }
            torrentSelector.title = trackerJson.tr_name;
            torrentSelector.url = {selector: trackerJson.tr_link, attr: 'href'};
            if (trackerJson.cat_name) {
                torrentSelector.categoryTitle = trackerJson.cat_name;
                if (trackerJson.cat_attr) {
                    torrentSelector.categoryTitle = {
                        selector: torrentSelector.categoryTitle,
                        attr: trackerJson.cat_attr
                    };
                }
                if (trackerJson.cat_link) {
                    torrentSelector.categoryUrl = {selector: trackerJson.cat_link, attr: 'href'};
                }
            }
            if (trackerJson.tr_size) {
                torrentSelector.size = trackerJson.tr_size;
                if (trackerJson.size_attr) {
                    torrentSelector.size = {selector: torrentSelector.size, attr: trackerJson.size_attr};
                }

                var sizeFuncList = [];
                if (trackerJson.size_r && trackerJson.size_rp !== undefined) {
                    var size_r = new RegExp(trackerJson.size_r, 'ig');
                    sizeFuncList.push(function (value) {
                        return value.replace(size_r, trackerJson.size_rp);
                    });
                }
                if (trackerJson.s_c) {
                    sizeFuncList.push(function (value) {
                        return exKit.legacy.sizeFormat(value);
                    });
                }
                if (sizeFuncList.length > 1) {
                    onGetValue.size = function (details, value) {
                        for (var i = 0, func; func = sizeFuncList[i]; i++) {
                            value = func(value);
                        }
                        return value;
                    };
                }
            }
            if (trackerJson.tr_dl) {
                torrentSelector.downloadUrl = {selector: trackerJson.tr_dl, attr: 'href'};
            }
            if (trackerJson.seed) {
                torrentSelector.seed = trackerJson.seed;
                if (trackerJson.seed_r && trackerJson.seed_rp !== undefined) {
                    var seed_r = new RegExp(trackerJson.seed_r, 'ig');
                    onGetValue.seed = function (details, value) {
                        return value.replace(seed_r, trackerJson.seed_rp);
                    };
                }
            }
            if (trackerJson.peer) {
                torrentSelector.peer = trackerJson.peer;
                if (trackerJson.peer_r && trackerJson.peer_rp !== undefined) {
                    var peer_r = new RegExp(trackerJson.peer_r, 'ig');
                    onGetValue.peer = function (details, value) {
                        return value.replace(peer_r, trackerJson.peer_rp);
                    };
                }
            }
            if (trackerJson.date) {
                torrentSelector.date = trackerJson.date;
                if (trackerJson.date_attr) {
                    torrentSelector.date = {selector: torrentSelector.date, attr: trackerJson.date_attr};
                }
                var dateFuncList = [];
                if (trackerJson.t_r && trackerJson.t_r_r !== undefined) {
                    var t_r = new RegExp(trackerJson.t_r, "ig");
                    dateFuncList.push(function (value) {
                        return value.replace(t_r, trackerJson.t_r_r);
                    });
                }
                if (trackerJson.t_t_r) {
                    dateFuncList.push(function (value) {
                        return exKit.legacy.todayReplace(value, trackerJson.t_f);
                    });
                }
                if (trackerJson.t_m_r) {
                    dateFuncList.push(function (value) {
                        return exKit.legacy.monthReplace(value);
                    });
                }
                if (trackerJson.t_f !== undefined && trackerJson.t_f !== "-1") {
                    dateFuncList.push(function (value) {
                        return exKit.legacy.dateFormat(trackerJson.t_f, value);
                    });
                }
                if (dateFuncList.length) {
                    onGetValue.date = function (value) {
                        for (var i = 0, func; func = dateFuncList[i]; i++) {
                            value = func(value);
                        }
                        return value;
                    };
                }
            }
            return trackerObj;
        }
    },
    prepareTracker: function (tracker) {
        "use strict";
        var itemList = ['onGetValue', 'onSelectorIsNotFound', 'onEmptySelectorValue'];
        for (var i = 0, item; item = itemList[i]; i++) {
            if (!tracker.search[item]) {
                tracker.search[item] = {};
            }
        }

        if (!tracker.search.requestType) {
            tracker.search.requestType = 'GET';
        } else {
            tracker.search.requestType = tracker.search.requestType.toUpperCase();
        }
        if (!tracker.search.rootUrl) {
            tracker.search.rootUrl = tracker.search.searchUrl.substr(0, tracker.search.searchUrl.indexOf('/', tracker.search.searchUrl.indexOf('//') + 2) + 1);
        }
        if (!tracker.search.baseUrl) {
            tracker.search.baseUrl = tracker.search.searchUrl.substr(0, tracker.search.searchUrl.lastIndexOf('/'));
        }
        if (!exKit.prepareTrackerR.hasEndSlash.test(tracker.search.rootUrl)) {
            tracker.search.rootUrl = tracker.search.rootUrl + '/';
        }
        if (!exKit.prepareTrackerR.hasEndSlash.test(tracker.search.baseUrl)) {
            tracker.search.baseUrl = tracker.search.baseUrl + '/';
        }
        return tracker;
    },
    parseHtml: function (html) {
        "use strict";
        var fragment = document.createDocumentFragment();
        var div = document.createElement('div');
        div.innerHTML = html;
        var el;
        while (el = div.firstChild) {
            fragment.appendChild(el);
        }
        return fragment;
    },
    contentFilterR: {
        searchJs: /javascript/ig,
        blockHref: /\/\//,
        blockSrc: /src=(['"]?)/ig,
        blockSrcSet: /srcset=(['"]?)/ig,
        blockOnEvent: /on(\w+)=/ig
    },
    contentFilter: function (content) {
        "use strict";
        return content.replace(exKit.contentFilterR.searchJs, 'tms-block-javascript')
            .replace(exKit.contentFilterR.blockHref, '//about:blank#blockurl#')
            .replace(exKit.contentFilterR.blockSrc, 'src=$1data:image/gif,base64#blockurl#')
            .replace(exKit.contentFilterR.blockSrcSet, 'data-block-attr-srcset=$1')
            .replace(exKit.contentFilterR.blockOnEvent, 'data-block-event-$1=');
    },
    contentUnFilter: function (content) {
        "use strict";
        return content.replace(/data:image\/gif,base64#blockurl#/g, '')
            .replace(/about:blank#blockurl#/g, '')
            .replace(/tms-block-javascript/g, 'javascript');
    },
    intList: ['categoryId', 'size', 'seed', 'peer', 'date'],
    isUrlList: ['categoryUrl', 'url', 'downloadUrl'],
    unFilterKeyList: ['categoryTitle', 'categoryUrl', 'title', 'url', 'downloadUrl'],
    urlCheck: function (tracker, value) {
        "use strict";
        if (value.substr(0, 7) === 'magnet:') {
            return value;
        }
        if (value.substr(0, 4) === 'http') {
            return value;
        }
        if (value[0] === '/') {
            return tracker.search.rootUrl + value.substr(1);
        }
        if (value.substr(0, 2) === './') {
            return tracker.search.baseUrl + value.substr(2);
        }
        return tracker.search.baseUrl + value;
    },
    setHostProxyUrl: function (url, proxyIndex) {
        "use strict";
        var proxy = engine.settings.proxyList[proxyIndex - 1];
        if (!proxy || proxy.type !== 1 || url.substr(0, 4) !== 'http') {
            return url;
        }
        return url.replace(/(https?:\/\/[^\/]+)(.*)/, '$1.' + proxy.url + '$2');
    },
    matchTorrentSelector: function(trObj, details) {
        "use strict";
        var _this = this;
        var key = details.key;
        var item = details.item;
        var env = details.env;
        var $node = env.$node;
        var tracker = details.tracker;
        var search = tracker.search;

        if (typeof item === 'string') {
            item = {selector: item};
        }

        var node = trObj.cache[item.selector];
        if (!node) {
            node = trObj.cache[item.selector] = $node.find(item.selector).get(0);
        }

        if (!node && search.onSelectorIsNotFound[key]) {
            node = search.onSelectorIsNotFound[key](details);
            if (env.abort) {
                return;
            }
        }

        if (item.childNodeIndex !== undefined && node) {
            var childNodeIndex = item.childNodeIndex;
            if (childNodeIndex < 0) {
                childNodeIndex = node.childNodes.length + item.childNodeIndex;
            }
            node = node.childNodes[childNodeIndex];
        }

        if (!node) {
            trObj.error[key] = node;
            trObj.error[key + '!'] = 'Selector is not found!';
            trObj.error[key + 'Selector'] = item.selector;
            return;
        }

        var value = null;
        if (item.attr) {
            value = node.getAttribute(item.attr);
        } else if (item.html) {
            value = node.innerHTML;
        } else {
            value = node.textContent;
        }
        if (value) {
            value = $.trim(value);
        }

        if (!value && search.onEmptySelectorValue[key]) {
            value = search.onEmptySelectorValue[key](details);
            if (env.abort) {
                return;
            }
        }

        if (!value && value !== 0) {
            trObj.error[key] = value;
            if (item.attr) {
                trObj.error[key + '!'] = 'Attribute is not found!';
            } else if (item.html) {
                trObj.error[key + '!'] = 'Html content is empty!';
            } else {
                trObj.error[key + '!'] = 'Text content is empty!';
            }
            return;
        }

        var promise = Promise.resolve(value);

        if (search.onGetValue[key]) {
            promise = promise.then(function(value) {
                return search.onGetValue[key](details, value);
            });
        }

        promise = promise.then(function(value) {
            if (env.abort) {
                return;
            }

            if (exKit.intList.indexOf(key) !== -1) {
                var intValue = parseInt(value);
                if (isNaN(intValue)) {
                    intValue = -1;
                    trObj.error[key] = value;
                    trObj.error[key + '!'] = 'isNaN';
                }
                value = intValue;
            } else {
                if (exKit.unFilterKeyList.indexOf(key) !== -1) {
                    value = exKit.contentUnFilter(value);
                }
                if (exKit.isUrlList.indexOf(key) !== -1) {
                    value = exKit.urlCheck(tracker, value);
                    if (tracker.proxyIndex > 0) {
                        value = _this.setHostProxyUrl(value, tracker.proxyIndex);
                    }
                }
            }

            trObj.column[key] = value;
        });

        return promise;
    },
    matchTorrentItem: function($node, details) {
        "use strict";
        var _this = this;
        var env = details.env = {
            abort: false,
            $node: $node
        };

        var tracker = details.tracker;
        var search = tracker.search;

        var promise = Promise.resolve();

        if (search.onGetListItem) {
            promise = promise.then(function() {
                return search.onGetListItem(details);
            });
        }

        promise = promise.then(function() {
            if (env.abort) {
                return;
            }

            var trObj = {
                column: {},
                error: {},
                cache: {}
            };

            var promiseList = [];
            for (var key in search.torrentSelector) {
                var selDetails = Object.create(details);

                selDetails.item = search.torrentSelector[key];
                selDetails.key = key;

                promiseList.push(_this.matchTorrentSelector(trObj, selDetails));
            }

            return Promise.all(promiseList).then(function() {
                if (!trObj.column.title || !trObj.column.url) {
                    console.debug('[' + tracker.id + ']', 'Skip torrent:', trObj);
                    return;
                }

                if (!trObj.column.categoryId && trObj.column.categoryId !== 0) {
                    trObj.column.categoryId = -1;
                }

                if (!trObj.column.date) {
                    trObj.column.date = -1;
                }

                if (!mono.isEmptyObject(trObj.error)) {
                    console.debug('[' + tracker.id + ']', 'Torrent has problems:', trObj);
                }

                return trObj.column;
            });
        });

        return promise;
    },
    parseDom: function(details) {
        "use strict";
        var _this = this;
        var tracker = details.tracker;
        var search = tracker.search;

        var promise = Promise.resolve();

        if (search.onBeforeDomParse) {
            promise = promise.then(function() {
                return search.onBeforeDomParse(details);
            });
        }

        promise = promise.then(function() {
            if (details.result) {
                return details.result;
            }

            var dom = exKit.parseHtml(details.data);
            var $dom = details.$dom = $(dom);

            if (search.onAfterDomParse) {
                search.onAfterDomParse(details);
                if (details.result) {
                    return details.result;
                }
            }

            if (search.loginFormSelector && $dom.find(search.loginFormSelector).length) {
                return {requireAuth: 1};
            }

            var torrentElList = $dom.find(search.listItemSelector);

            if (search.listItemSplice) {
                if (search.listItemSplice[0] !== 0) {
                    torrentElList.splice(0, search.listItemSplice[0]);
                }
                if (search.listItemSplice[1] !== 0) {
                    torrentElList.splice(search.listItemSplice[1]);
                }
            }

            var torrentList = [];

            var promiseList = [];
            for (var i = 0, len = torrentElList.length; i < len; i++) {
                var promise = _this.matchTorrentItem(torrentElList.eq(i), Object.create(details));
                promise = promise.then(function(item) {
                    item && torrentList.push(item);
                });
                promiseList.push(promise);
            }

            return Promise.all(promiseList).then(function() {
                return {torrentList: torrentList};
            });
        });

        return promise;
    },
    search: function (tracker, query, onSearch) {
        "use strict";
        var _this = this;
        var xhr = null;
        var details = {
            tracker: tracker,
            query: query
        };

        onSearch.onBegin && onSearch.onBegin(tracker);

        if (tracker.search.onBeforeRequest !== undefined) {
            tracker.search.onBeforeRequest(details);
        } else {
            details.query = encodeURIComponent(details.query);
        }

        new Promise(function(resolve, reject) {
            Promise.resolve().then(function() {
                xhr = mono.ajax({
                    safe: true,
                    url: tracker.search.searchUrl.replace('%search%', details.query),
                    type: tracker.search.requestType,
                    mimeType: tracker.search.requestMimeType,
                    dataType: tracker.search.requestDataType,
                    data: (tracker.search.requestData || '').replace('%search%', details.query),
                    changeUrl: function (url, method) {
                        var proxy;
                        if (tracker.proxyIndex > 0 && (proxy = engine.settings.proxyList[tracker.proxyIndex - 1])) {
                            if (proxy.type === 0) {
                                if (method === 'GET') {
                                    if (proxy.fixSpaces) {
                                        url = url.replace(/[\t\s]+/g, '%20');
                                    }
                                    url = proxy.url.replace('{url}', encodeURIComponent(url));
                                }
                            }
                            if (proxy.type === 1) {
                                url = _this.setHostProxyUrl(url, tracker.proxyIndex);
                            }
                        }
                        return url;
                    },
                    success: function (data, xhr) {
                        details.data = exKit.contentFilter(data);
                        details.responseUrl = xhr.responseUrl;

                        resolve();
                    },
                    error: function (xhr) {
                        reject(['Request error', xhr.status, xhr.statusText].join(' '));
                    },
                    timeout: function () {
                        reject('Request timeout');
                    },
                    abort: function () {
                        reject('Request aborted!');
                    }
                });
            }).catch(reject)
        }).then(function() {
            if (tracker.search.onAfterRequest !== undefined) {
                tracker.search.onAfterRequest(details);
                if (details.result) {
                    return details.result;
                }
            }

            return exKit.parseDom(details);
        }).then(function(result) {
            onSearch.onSuccess(tracker, query, result);
        }).catch(function(err) {
            console.error('Search', tracker.id, err);
            onSearch.onError(tracker, err);
        }).then(function() {
            onSearch.onDone(tracker);
        });

        return {
            tracker: tracker,
            abort: function () {
                xhr && xhr.abort();
                xhr = null;
            }
        }
    },
    searchProgressList: {},
    searchProgressListClear: function () {
        "use strict";
        var progressList = exKit.searchProgressList;
        for (var trackerId in progressList) {
            if (progressList[trackerId] === undefined) continue;
            progressList[trackerId].abort();
            progressList[trackerId] = undefined;
        }
    },
    searchProgressListBind: function (onSearch) {
        "use strict";
        var progressList = exKit.searchProgressList;
        var onDone = onSearch.onDone;
        onSearch.onDone = function (tracker) {
            progressList[tracker.id] = undefined;
            onDone && onDone.apply(null, arguments);
        };
        onSearch = null;
    },
    searchList: function (trackerList, query, onSearch) {
        "use strict";
        define.on(['jquery', 'promise'], function() {
            exKit.searchProgressListClear();
            exKit.searchProgressListBind(onSearch);
            for (var i = 0, trackerId; trackerId = trackerList[i]; i++) {
                exKit.searchProgressList[trackerId] = exKit.search(engine.trackerLib[trackerId], query, onSearch);
            }
        });
    },
    getTrackerIconUrl: function (icon) {
        "use strict";
        icon = icon || '#ccc';
        if (icon[0] !== '#') {
            return icon;
        }
        var svg = 'data:image/svg+xml;base64,';
        var data = '';
        if (icon === '#skull') {
            data = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" enable-background="new 0 0 48 48" version="1.1" viewBox="0 0 48 48" height="20px" width="20px"><g><g><path d="M33,46c-0.553,0-1-0.447-1-1V34h1c4.963,0,9-4.037,9-9v-5c0-9.925-8.075-18-18-18S6,10.075,6,20v5c0,4.963,4.037,9,9,9h1     v11c0,0.553-0.447,1-1,1s-1-0.447-1-1v-9.045C8.401,35.448,4,30.729,4,25v-5C4,8.972,12.972,0,24,0s20,8.972,20,20v5     c0,5.729-4.401,10.448-10,10.955V45C34,45.553,33.553,46,33,46z"/></g><g><path d="M21,46c-0.553,0-1-0.447-1-1V35c0-0.553,0.447-1,1-1s1,0.447,1,1v10C22,45.553,21.553,46,21,46z"/></g><g><path d="M27,46c-0.553,0-1-0.447-1-1V35c0-0.553,0.447-1,1-1s1,0.447,1,1v10C28,45.553,27.553,46,27,46z"/></g><g><path d="M33,32c-3.859,0-7-3.141-7-7s3.141-7,7-7s7,3.141,7,7S36.859,32,33,32z M33,20c-2.757,0-5,2.243-5,5s2.243,5,5,5     s5-2.243,5-5S35.757,20,33,20z"/></g><g><path d="M15,32c-3.859,0-7-3.141-7-7s3.141-7,7-7s7,3.141,7,7S18.859,32,15,32z M15,20c-2.757,0-5,2.243-5,5s2.243,5,5,5     s5-2.243,5-5S17.757,20,15,20z"/></g><g><path d="M5.236,18c-0.553,0-1-0.447-1-1s0.447-1,1-1C7.955,16,12,14.136,12,9c0-0.553,0.447-1,1-1s1,0.447,1,1     C14,14.908,9.592,18,5.236,18z"/></g><g><path d="M42.764,18C38.408,18,34,14.908,34,9c0-0.553,0.447-1,1-1s1,0.447,1,1c0,5.136,4.045,7,6.764,7c0.553,0,1,0.447,1,1     S43.316,18,42.764,18z"/></g><g><path d="M25.02,32c-0.005,0.001-0.012,0.001-0.02,0h-2c-0.347,0-0.668-0.18-0.851-0.475s-0.199-0.663-0.044-0.973l1-2     c0.34-0.678,1.449-0.678,1.789,0l0.92,1.84c0.129,0.168,0.205,0.379,0.205,0.607C26.02,31.553,25.572,32,25.02,32z"/></g></g></svg>';
        } else {
            data = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" enable-background="new 0 0 48 48" version="1.1" viewBox="0 0 48 48" height="20px" width="20px"><circle cx="24" cy="24" r="20" stroke="black" fill="' + icon + '" /></svg>';
        }
        svg += btoa(data);
        return svg;
    }
};
exKit.funcList.dateFormat = exKit.legacy.dateFormat.bind(exKit.legacy);
exKit.funcList.monthReplace = exKit.legacy.monthReplace.bind(exKit.legacy);
exKit.funcList.sizeFormat = exKit.legacy.sizeFormat.bind(exKit.legacy);
exKit.funcList.todayReplace = exKit.legacy.todayReplace.bind(exKit.legacy);