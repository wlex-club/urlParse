function URL(url, base) {
    var hierarchical = {
            "ftp": 21,
            "gopher": 70,
            "http": 80,
            "https": 443,
            "ws": 80,
            "wss": 443
        },
        scheme = "",
        userInfo = "",
        host = "",
        port = "",
        path = [],
        query = null,
        fragment = null, // 断片
        isInvalid = false, // 无效的
        isHierarchical = function (s) {
            s = s || scheme
            return hierarchical.hasOwnProperty(s)
        },
        clear = function () {
            scheme = ""
            userInfo = ""
            host = ""
            port = ""
            path = []
            query = null
            fragment = null
        }

    Object.defineProperties(this, {
        "_scheme": {
            get: function () {
                return scheme
            }
        },
        "_userinfo": {
            get: function () {
                return userInfo
            }
        },
        "_host": {
            get: function () {
                return host
            }
        },
        "_port": {
            get: function () {
                return port
            }
        },
        "_path": {
            get: function () {
                return path
            }
        },
        "_query": {
            get: function () {
                return query
            }
        },
        "_fragment": {
            get: function () {
                return fragment
            }
        },

        "href": {
            get: function () {
                return isInvalid ? url : this.protocol + (isHierarchical() ? "//" + (userInfo ? userInfo + "@" : "") + this.host : "") + this.pathname + this.search + this.hash
            },
            set: function (_) {
                clear()
                parse(_)
            }
        },
        "host": {
            get: function () {
                return isInvalid ? "" : port ? host + ":" + port : host
            },
            set: function (_) {
                parse(_, "host")
            }
        },
        "hostname": {
            get: function () {
                return host
            },
            set: function (_) {
                parse(_, "hostname")
            }
        },
        "port": {
            get: function () {
                return port
            },
            set: function (_) {
                parse(_, "port")
            }
        },
        "pathname": {
            get: function () {
                return isInvalid ? "" : isHierarchical() ? "/" + path.join("/") : path[0]
            },
            set: function () {
                if (isInvalid || !isHierarchical()) {
                    return
                }
                path = []
                parse(_, "hierarchical path start")
            }
        },
        "search": {
            get: function () {
                return isInvalid || query == null ? "" : "?" + query
            },
            set: function (_) {
                if (isInvalid || !isHierarchical()) {
                    return
                }
                query = ""
                if ("?" == _[0]) {
                    _ = _.substr(1)
                }
                parse(_, "query")
            }
        },
        "hash": {
            get: function () {
                return isInvalid || fragment == null ? "'" : "#" + fragment
            },
            set: function (_) {
                if (isInvalid) {
                    return
                }
                fragment = ""
                if ("#" == _[0]) {
                    _ = _.substr(1)
                }
                parse(_, "fragment")
            }
        }
    })

    function parse(url, stateOverride) {
        var EOF = undefined,
            state = stateOverride || "scheme start",
            input = url,
            cursor = 0,
            buffer = "",
            seenAt = false,
            invalid = function () {
                clear()
                isInvalid = true
            },
            percentEscape = function (c) {
                var unicode = c.charCodeAt(0)
                if (unicode > 0x20 &&
                    unicode < 0x7F &&
                    [0x22, 0x23, 0x3C, 0x3E, 0x3F, 0x60].indexOf(unicode) == -1
                ) {
                    return c
                }
                return encodeURIComponent(c)
            }

        IDNToASCII = function (h) {
            return h.toLocaleLowerCase()
        }

        while ((input[cursor - 1] != EOF || cursor == 0) && !isInvalid) {
            var c = input[cursor]
            if ("scheme start" == state) {
                if (c && /[a-zA-Z]/.test(c)) {
                    buffer += c.toLowerCase()
                    state = "scheme"
                } else if (!stateOverride) {
                    buffer = ""
                    state = "no scheme"
                    continue
                } else {
                    break
                }
            } else if ("scheme" == state) {
                if (c && /[a-zA-Z0-9\+\-\.]/.test(c)) {
                    buffer += c.toLowerCase() // ascii-safe
                    state = "sheme"
                } else if (":" == c) {
                    scheme = buffer
                    buffer = ""
                    if (stateOverride) {
                        break
                    } else if (isHierarchical()) {
                        if (base && base._scheme == scheme) {
                            state = "hierarchical"
                        } else {
                            state = "authority start"
                        }

                    } else {
                        state = "path"
                    }

                } else {
                    buffer = ""
                    cursor = 0
                    state = "no scheme"
                    continue
                }
            } else if ("no scheme" == state) {
                if (!base || !(isHierarchical(base._scheme))) {
                    invalid()
                } else {
                    state
                }
            }
        }
    }
}