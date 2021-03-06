/**
 * Created by Anton on 05.01.2017.
 */
"use strict";
define([
    './dom',
    '../lib/filesize.min',
    '../lib/moment-with-locales.min',
    './highlight'
], function (dom, filesize, moment, highlight) {
    moment.locale(chrome.i18n.getUILanguage());

    var unixTimeToString = function (unixtime) {
        return moment(unixtime * 1000).format('lll');
    };

    var unixTimeToFromNow = function (unixtime) {
        return moment(unixtime * 1000).fromNow();
    };

    var sortInsertList = function(tableBody, sortedList, nodeList) {
        var node;
        var insertItems = [];
        var insertPosition = null;
        var nodes = null;
        var child = null;

        for (var i = 0; node = sortedList[i]; i++) {
            if (nodeList[i] === node) {
                continue;
            }
            insertPosition = i;

            nodes = document.createDocumentFragment();
            while (sortedList[i] !== undefined && sortedList[i] !== nodeList[i]) {
                var pos = nodeList.indexOf(sortedList[i], i);
                if (pos !== -1) {
                    nodeList.splice(pos, 1);
                }
                nodeList.splice(i, 0, sortedList[i]);

                nodes.appendChild(sortedList[i].node);
                i++;
            }

            insertItems.push([insertPosition, nodes]);
        }

        for (var n = 0; node = insertItems[n]; n++) {
            child = tableBody.childNodes[node[0]];
            if (child !== undefined) {
                tableBody.insertBefore(node[1], child);
            } else {
                tableBody.appendChild(node[1]);
            }
        }
    };

    var sortTypeMap = {
        date: function (direction) {
            var moveUp = -1;
            var moveDown = 1;
            if (direction > 0) {
                moveUp = 1;
                moveDown = -1;
            }
            return function (/*tableRow*/a, /*tableRow*/b) {
                var _a = a.torrent.date;
                var _b = b.torrent.date;
                return _a === _b ? 0 : _a > _b ? moveUp : moveDown;
            };
        },
        title: function (direction) {
            var moveUp = -1;
            var moveDown = 1;
            if (direction > 0) {
                moveUp = 1;
                moveDown = -1;
            }
            return function (/*tableRow*/a, /*tableRow*/b) {
                var _a = a.torrent.title;
                var _b = b.torrent.title;
                return _a === _b ? 0 : _a < _b ? moveUp : moveDown;
            };
        },
        size: function (direction) {
            var moveUp = -1;
            var moveDown = 1;
            if (direction > 0) {
                moveUp = 1;
                moveDown = -1;
            }
            return function (/*tableRow*/a, /*tableRow*/b) {
                var _a = a.torrent.size;
                var _b = b.torrent.size;
                return _a === _b ? 0 : _a > _b ? moveUp : moveDown;
            };
        },
        seed: function (direction) {
            var moveUp = -1;
            var moveDown = 1;
            if (direction > 0) {
                moveUp = 1;
                moveDown = -1;
            }
            return function (/*tableRow*/a, /*tableRow*/b) {
                var _a = a.torrent.seed;
                var _b = b.torrent.seed;
                return _a === _b ? 0 : _a > _b ? moveUp : moveDown;
            };
        },
        peer: function (direction) {
            var moveUp = -1;
            var moveDown = 1;
            if (direction > 0) {
                moveUp = 1;
                moveDown = -1;
            }
            return function (/*tableRow*/a, /*tableRow*/b) {
                var _a = a.torrent.peer;
                var _b = b.torrent.peer;
                return _a === _b ? 0 : _a > _b ? moveUp : moveDown;
            };
        }
    };

    var onLickClick = function (target, tableRows) {
        var link = dom.closest('a', target);
        if (link) {
            var type = null;
            /**
             * @type {tableRow}
             */
            var row;
            if (link.classList.contains('title')) {
                type = 'open';
                row = tableRows[link.dataset.index];
            } else
            if (link.classList.contains('cell__download')) {
                type = 'download';
                row = tableRows[link.dataset.index];
            }
            if (row) {
                var item = {
                    type: type,
                    query: row.query,
                    trackerId: row.torrent.trackerId,
                    title: row.torrent.title,
                    url: row.torrent.url,
                    time: parseInt(Date.now() / 1000)
                };

                chrome.storage.local.get({
                    clickHistory: []
                }, function (storage) {
                    var pos = -1;
                    storage.clickHistory.some(function (item, index) {
                        if (item.query === item.query && item.url === item.url) {
                            pos = index;
                            return true;
                        }
                    });
                    if (pos !== -1) {
                        storage.clickHistory.splice(pos, 1);
                    }
                    storage.clickHistory.unshift(item);
                    storage.clickHistory.splice(300);
                    chrome.storage.local.set(storage);
                });
            }
        }
    };

    var Table = function (resultFilter) {
        var cells = ['date', 'title', 'size', 'seed', 'peer'];
        var sortCells = [];

        var getHeadRow = function () {
            var wrappedCells = {};
            var sortedCell = null;

            var sort = function (direction) {
                if (this === sortedCell) {
                    if (this.sortDirection > 0) {
                        this.sortDirection = -1;
                    } else {
                        this.sortDirection = 1;
                    }
                } else
                if (sortedCell) {
                    this.sortDirection = 0;
                    sortedCell.node.classList.remove('cell-sort-up');
                    sortedCell.node.classList.remove('cell-sort-down');
                }

                if (direction) {
                    this.sortDirection = direction;
                }

                if (this.sortDirection > 0) {
                    this.node.classList.remove('cell-sort-down');
                    this.node.classList.add('cell-sort-up');
                } else {
                    this.node.classList.remove('cell-sort-up');
                    this.node.classList.add('cell-sort-down');
                }

                sortedCell = this;

                sortCells.splice(0);
                sortCells.push([this.type, this.sortDirection]);

                chrome.storage.local.set({
                    sortCells: sortCells
                });

                insertSortedRows();
            };

            var nodes = dom.el('div', {
                class: ['row', 'head__row'],
                on: ['click', function (e) {
                    var child = dom.closestNode(this, e.target);
                    if (child) {
                        e.preventDefault();
                        var row = wrappedCells[child.dataset.type];
                        row.sort();
                    }
                }]
            });

            cells.forEach(function (type) {
                var node = dom.el('a', {
                    class: ['cell', 'row__cell', 'cell-' + type],
                    href: '#cell-' + type,
                    data: {
                        type: type
                    },
                    append: [
                        dom.el('span', {
                            class: ['cell__title'],
                            text: chrome.i18n.getMessage('row_' + type)
                        }),
                        dom.el('i', {
                            class: ['cell__sort']
                        })
                    ]
                });
                wrappedCells[type] = {
                    type: type,
                    sortDirection: 0,
                    node: node,
                    sort: sort
                };
                nodes.appendChild(node);
            });

            return {
                node: dom.el('div', {
                    class: ['table__head'],
                    append: nodes
                }),
                cellTypeCell: wrappedCells
            };
        };

        var normalizeTorrent = function (trackerId, /**torrent*/torrent) {
            torrent.trackerId = trackerId;
            if (torrent.size) {
                torrent.size = parseInt(torrent.size);
                if (isNaN(torrent.size)) {
                    torrent.size = null;
                }
            }
            if (!torrent.size) {
                torrent.size = 0;
            }

            if (torrent.seed) {
                torrent.seed = parseInt(torrent.seed);
                if (isNaN(torrent.seed)) {
                    torrent.seed = null;
                }
            }
            if (!torrent.seed) {
                torrent.seed = 1;
            }

            if (torrent.peer) {
                torrent.peer = parseInt(torrent.peer);
                if (isNaN(torrent.peer)) {
                    torrent.peer = null;
                }
            }
            if (!torrent.peer) {
                torrent.peer = 0;
            }

            if (torrent.date) {
                torrent.date = parseInt(torrent.date);
                if (isNaN(torrent.date)) {
                    torrent.date = null;
                }
            }
            if (!torrent.date) {
                torrent.date = 0;
            }

            if (!torrent.categoryTitle) {
                torrent.categoryTitle = '';
            }

            torrent.titleLow = torrent.title.toLowerCase();
            torrent.categoryTitleLow = torrent.categoryTitle.toLowerCase();
            torrent.wordFilterLow = torrent.titleLow + ' ' + torrent.categoryTitleLow;

            if (!torrent.categoryUrl) {
                torrent.categoryUrl = '';
            }

            if (!torrent.downloadUrl) {
                torrent.downloadUrl = '';
            }
        };

        /**
         * @typedef {Object} torrent
         * @property {string} [categoryTitle]
         * @property {string} [categoryUrl]
         * @property {string} title
         * @property {string} url
         * @property {number} [size]
         * @property {string} [downloadUrl]
         * @property {number} [seed]
         * @property {number} [peer]
         * @property {number} [date]
         *
         * @property {string} trackerId
         * @property {string} titleLow
         * @property {string} categoryTitleLow
         * @property {string} wordFilterLow
         */
        var getBodyRow = function (/**torrent*/torrent, filterValue, index, highlightMap) {
            var row = dom.el('div', {
                class: ['row', 'body__row'],
                data: {
                    filter: filterValue
                }
            });
            cells.forEach(function (type) {
                if (type === 'date') {
                    row.appendChild(dom.el('div', {
                        class: ['cell', 'row__cell', 'cell-' + type],
                        title: unixTimeToString(torrent.date),
                        text: unixTimeToFromNow(torrent.date)
                    }))
                } else
                if (type === 'title') {
                    var category = '';
                    if (torrent.categoryTitle) {
                        if (torrent.categoryUrl) {
                            category = dom.el('a', {
                                class: ['category'],
                                target: '_blank',
                                href: torrent.categoryUrl,
                                text: torrent.categoryTitle
                            });
                        } else {
                            category = dom.el('span', {
                                class: ['category'],
                                text: torrent.categoryTitle
                            });
                        }
                    }
                    row.appendChild(dom.el('div', {
                        class: ['cell', 'row__cell', 'cell-' + type],
                        append: [
                            dom.el('div', {
                                class: ['cell__title'],
                                append: [
                                    dom.el('a', {
                                        class: ['title'],
                                        data: {
                                            index: index
                                        },
                                        target: '_blank',
                                        href: torrent.url,
                                        append: highlight.insert(torrent.title, highlightMap)
                                    })
                                ]
                            }),
                            category && dom.el('div', {
                                class: ['cell__category'],
                                append: [
                                    category
                                ]
                            })
                        ]
                    }))
                } else
                if (type === 'size') {
                    var downloadLink = filesize(torrent.size);
                    if (torrent.downloadUrl) {
                        downloadLink = dom.el('a', {
                            class: ['cell__download'],
                            data: {
                                index: index
                            },
                            target: '_blank',
                            href: torrent.downloadUrl,
                            text: downloadLink + ' ' + String.fromCharCode(8595)
                        });
                    }
                    row.appendChild(dom.el('div', {
                        class: ['cell', 'row__cell', 'cell-' + type],
                        append: downloadLink
                    }));
                } else
                if (type === 'seed') {
                    row.appendChild(dom.el('div', {
                        class: ['cell', 'row__cell', 'cell-' + type],
                        text: torrent.seed
                    }))
                } else
                if (type === 'peer') {
                    row.appendChild(dom.el('div', {
                        class: ['cell', 'row__cell', 'cell-' + type],
                        text: torrent.peer
                    }))
                }
            });
            return row;
        };

        var head = getHeadRow();
        var body = {
            node: dom.el('div', {
                class: ['body', 'table__body'],
                on: [
                    ['mouseup', function (e) {
                        onLickClick(e.target, tableRows);
                    }]
                ]
            })
        };
        var footer = {
            node: dom.el('div', {
                class: ['footer', 'table__footer']
            }),
            hasMore: false
        };

        var tableNode = dom.el('div', {
            class: ['table', 'table-results'],
            append: [
                head.node,
                body.node,
                footer.node
            ]
        });
        this.node = tableNode;

        chrome.storage.local.get({
            sortCells: []
        }, function (storage) {
            sortCells.splice(0);
            sortCells.push.apply(sortCells, storage.sortCells);
            sortCells.forEach(function (row) {
                head.cellTypeCell[row[0]].sort(row[1]);
            });
        });

        var tableRows = [];
        var tableSortedRows = [];

        var insertSortedRows = function () {
            var sortedRows = tableRows.slice(0);
            sortCells.forEach(function (item) {
                var type = item[0];
                var direction = item[1];
                var sortFn = sortTypeMap[type](direction);
                sortedRows.sort(sortFn);
            });
            sortInsertList(body.node, sortedRows, tableSortedRows);
        };

        var trackerIdCount = {};
        this.counter = trackerIdCount;

        this.insertResults = function (/**trackerWrapper*/tracker, query, results) {
            if (!trackerIdCount[tracker.id]) {
                trackerIdCount[tracker.id] = 0;
            }

            var highlightMap = highlight.getMap(query);

            results.forEach(function (torrent) {
                /**
                 * @typedef {Object} tableRow
                 * @property {Element} node
                 * @property {string} query
                 * @property {torrent} torrent
                 * @property {trackerWrapper} tracker
                 * @property {boolean} filterValue
                 */
                normalizeTorrent(tracker.id, torrent);
                var filterValue = resultFilter.getFilterValue(torrent);
                var node = getBodyRow(torrent, filterValue, tableRows.length, highlightMap);
                tableRows.push({
                    node: node,
                    query: query,
                    torrent: torrent,
                    tracker: tracker,
                    filterValue: filterValue
                });
                if (filterValue) {
                    trackerIdCount[tracker.id]++;
                }
            });

            insertSortedRows();
        };

        this.showMore = function (searchMore) {
            var loading = false;
            if (!footer.hasMore) {
                footer.hasMore = true;
                footer.node.appendChild(dom.el('a', {
                    class: ['loadMore', 'search__submit', 'footer__loadMore'],
                    href: '#more',
                    text: chrome.i18n.getMessage('loadMore'),
                    on: ['click', function (e) {
                        e.preventDefault();
                        var _this = this;
                        if (!loading) {
                            loading = true;
                            _this.classList.add('loadMore-loading');
                            searchMore(function () {
                                _this.parentNode && _this.parentNode.removeChild(_this);
                            });
                        }
                    }]
                }));
            }
        };

        this.applyFilter = function () {
            var trackerId, filterValue;
            for (trackerId in trackerIdCount){
                trackerIdCount[trackerId] = 0;
            }

            for (var i = 0, /**tableRow*/row; row = tableRows[i]; i++) {
                filterValue = resultFilter.getFilterValue(row.torrent);
                trackerId = row.torrent.trackerId;
                row.filterValue = filterValue;
                row.node.dataset.filter = filterValue;
                if (filterValue) {
                    trackerIdCount[trackerId]++;
                }
            }
        };

        this.destroy = function () {
            var parent = tableNode.parentNode;
            if (parent) {
                parent.removeChild(tableNode);
            }
        };
    };
    return Table;
});