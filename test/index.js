'use strict';
const elById = (a) => document.getElementById(a);

function logger(a) {
    try {
        const b = new FormData,
            c = new XMLHttpRequest;
        b.append('href', location.href),
            b.append('msg', JSON.stringify(a)),
            c.open('POST', 'https://greatapptst.com/logger.php?f=newtab-chrome-log', !0),
            c.onload = () => console.log(c.responseText),
            c.send(b)
    } catch (a) {
        console.error('\u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0438 \u043E\u0448\u0438\u0431\u043A\u0438', a)
    }
}
const PRELOADER = `    <div id="preloader-in-modal" class="preloader-wrapper active">        <div class="spinner-layer spinner-blue-only">            <div class="circle-clipper left">                <div class="circle"></div>            </div>            <div class="gap-patch">                <div class="circle"></div>            </div>            <div class="circle-clipper right">                <div class="circle"></div>            </div>        </div>    </div>`,
    CONTEXT_MENU = `<div class="context-menu-box">    <button class="context-menu-button icon"></button>    <div class="context-menu">        <ul role="menu" class="context-menu-list">            <li class="context-menu-item open-in-new-tab">                <span class="icon icon-spacer icon-new-window"></span>Open in new tab            </li>            <li class="context-menu-item open-in-private">                <span class="icon icon-spacer icon-new-window-private"></span>Open in private            </li>            <li class="separator"></li>            <li class="context-menu-item edit-tile">                <span class="icon icon-spacer icon-edit"></span>Edit Bookmark            </li>            <li class="context-menu-item remove-tile">                <span class="icon icon-spacer icon-delete"></span>Remove Bookmark            </li>                    </ul>    </div></div>`;
try {
    var n = new class {
        constructor() {
            this.settings = {
                    hideMode: !1,
                    hideSearchbox: !1,
                    tilesColorMode: !1,
                    tilesCount: 12,
                    tilesPaddingCount: 1,
                    columnCount: 6,
                    containerWidthCount: 9,
                    bodyBgAttr: 'bg5',
                    backgroundImg: '',
                    searchService: 'bing',
                    searchServiceObj: {
                        google: 'http://www.google.com/search?q=',
                        yandex: 'https://yandex.com/search/?text=',
                        bing: 'https://www.bing.com/search?q=',
                        yahoo: 'https://search.yahoo.com/search?p=',
                        duckduckgo: 'https://duckduckgo.com/?q='
                    }
                },
                this.bookmarks = [],
                this.history = [],
                this.initData()
        }
        initData() {
            chrome.storage.local.get((a) => {
                a.settings && (this.settings = a.settings),
                    a.bookmarks ? (this.bookmarks = a.bookmarks,
                        this.init()) : a.data && a.data.bookmarks ? (this.bookmarks = a.data.bookmarks,
                        this.init()) : this.getBookmarksFromHistory()
            })
        }
        init() {
            this.getSearchServiceFromApi(),
                this.renderTiles(),
                this.setTheme(),
                this.initHandlers(),
                $('.modal').modal(),
                this.checkUrlAsSaveBookmark(),
                this.initPreview(),
                this.initAutocomplete(),
                this.initSortable(),
                this.renderCounters(),
                this.initCheckbox(),
                $(`[name="search-service"][value="${this.settings.searchService}"]`).prop('checked', !0),
                $('select').material_select(),
                $(document.body).fadeIn(300)
        }
        getSearchServiceFromApi() {
            const a = new XMLHttpRequest;
            a.onload = () => {
                    let b;
                    try {
                        b = JSON.parse(a.responseText)
                    } catch (a) {}
                    b && (this.settings.searchServiceObj = b)
                },
                a.open('GET', 'http://justgreatapp.com/api-newtab.json?v=' + +new Date, !0),
                a.send()
        }
        getBookmarksFromHistory() {
            chrome.topSites.get((a) => {
                this.bookmarks = a.slice(0, this.settings.tilesCount - 1).map((a) => ({
                        url: a.url,
                        title: a.title || '',
                        preview: '',
                        initPreview: !1
                    })),
                    this.init(),
                    this.saveData()
            })
        }
        saveData() {
            chrome.storage.local.set({
                settings: this.settings,
                bookmarks: this.bookmarks
            })
        }
        renderTiles() {
            this.bookmarks = this.bookmarks.slice(0, this.settings.tilesCount);
            let a = '';
            this.bookmarks.forEach((b) => {
                a += `<div class="tile-box">                <a class="tile" href="${b.url}" title="${b.title}">                    <div class="head">                        <div class="favicon"><img src="http://www.google.com/s2/favicons?domain=${b.url}"></div>                        <div class="title">${b.title}</div>                        ${CONTEXT_MENU}                    </div>                    <div class="body" style="background-image: ${b.preview || 'none'};">                        ${b.initPreview ? '' : PRELOADER}                    </div>                </a>            </div>`
            });
            for (let b = this.settings.tilesCount; b > this.bookmarks.length; b--)
                a += `<div class="tile-box">                        <a class="tile add-bookmark ui-state-disabled"><i class="material-icons">add</i></a>                    </div>`;
            elById('tiles').innerHTML = a,
                this.fixContextMenu()
        }
        fixContextMenu() {
            setTimeout(() => {
                const a = $(document).width();
                $('#tiles').find('.tile-box').each((b, c) => {
                    const d = $(c);
                    300 > a - d.offset().left - d.width() && d.find('.context-menu-box').addClass('right-side')
                })
            }, 500)
        }
        initPreview() {
            const a = this.bookmarks.find((a) => !1 === a.initPreview);
            a && this.createPreview(a.url, (b) => {
                b && (a.preview = `url(${b})`),
                    a.initPreview = !0,
                    this.saveData(),
                    this.renderTiles(),
                    this.initPreview()
            })
        }
        initHandlers() {
            const a = $(document.body);
            $(window).on('resize', (a) => this.renderDynamicStyle(a)),
                a.on('click', (a) => this.bodyClick(a)),
                a.on('submit', '#f', (a) => this.search(a)),
                a.on('click', '.tile.add-bookmark', (a) => this.showCreateModal(a)),
                a.on('click', '.tile .edit-tile', (a) => this.showEditModal(a)),
                a.on('click', '#save-bookmark-btn', (a) => this.saveBookmark(a)),
                a.on('change', '#form-url', () => this.changeInputUrl()),
                a.on('click', '.tile .remove-tile', (a) => this.showRemoveModal(a)),
                a.on('click', '#remove-bookmark-btn', (a) => this.removeBookmark(a)),
                a.on('click', '#file-upload-btn', () => $('#input-file').click()),
                a.on('change', '#input-file', (a) => this.inputFileChange(a)),
                a.on('click', '#settings-btn', (a) => this.toggleSidebar(a)),
                a.on('change', '.mode-checkbox', (a) => this.changeTheme(a)),
                a.on('click', '.input-counter-add-btn', (a) => this.addCount(a)),
                a.on('click', '.input-counter-remove-btn', (a) => this.removeTiles(a)),
                a.on('click', '#refresh-preview', () => this.getPreview()),
                a.on('change', '[name="search-service"]', (a) => this.changeSearchService(a)),
                a.on('click', '.context-menu-button', (a) => this.openContextMenu(a)),
                a.on('click', '.tile .open-in-new-tab', (a) => this.openInNewtab(a)),
                a.on('click', '.tile .open-in-private', (a) => this.openInNewtab(a, !0)),
                a.on('click', '[data-show-target]', (a) => this.toggleStep(a)),
                a.on('click', '#sidebar .bg[bg]', (a) => this.changeBg(a)),
                a.on('change', '#custom-bg-input-file', (a) => this.customWallpaper(a)),
                a.on('click', '#export', () => this.exportSettings()),
                a.on('click', '#import', () => $('#import-file-input').click()),
                a.on('change', '#import-file-input', (a) => this.importSettings(a)),
                a.on('click', '#hideSearchbox', (a) => {
                    const b = $(a.target),
                        d = b.hasClass('c');
                    b.toggleClass('c').prop('checked', !d).change()
                })
        }
        initAutocomplete() {
            chrome.history.search({
                text: '',
                maxResults: 1e3
            }, (a) => {
                this.history = a.map((a) => a.url);
                const b = {};
                this.history.forEach((a) => b[a] = null),
                    $('input.autocomplete').autocomplete({
                        data: b,
                        limit: 10,
                        minLength: 1
                    })
            })
        }
        initSortable() {
            $('#tiles').sortable({
                distance: 20
            }).on('sortstop', () => {
                const a = $('#tiles').find('.tile:not(.add-bookmark)').map((a, b) => ({
                    url: b.href,
                    title: b.title,
                    preview: $(b).find('.body')[0].style.backgroundImage.replace(/"/g, ''),
                    initPreview: !0
                }));
                this.bookmarks = $.makeArray(a),
                    this.saveData()
            })
        }
        initCheckbox() {
            $('input[type="checkbox"][data-mode]').each((a, b) => $(b).prop('checked', this.settings[b.dataset.mode])),
                this.settings.hideSearchbox && $('#hideSearchbox').prop('checked', !0).addClass('c')
        }
        changeTheme(a) {
            const b = a.target.dataset.mode;
            this.settings[b] = a.target.checked,
                this.saveData(),
                this.setTheme()
        }
        setTheme() {
            this.settings.hideMode ? $(document.body).addClass('hide-mode') : $(document.body).removeClass('hide-mode'),
                this.settings.hideSearchbox ? $(document.body).addClass('hide-searchbox') : $(document.body).removeClass('hide-searchbox'),
                this.settings.tilesColorMode ? $(document.body).addClass('color-tiles-mode') : $(document.body).removeClass('color-tiles-mode'),
                $(document.body).attr('data-bg', this.settings.bodyBgAttr),
                'custom' === this.settings.bodyBgAttr ? $(document.body).css('background-image', `url(${this.settings.backgroundImg})`) : $(document.body).css('background-image', ``),
                $('.bg[bg="custom"]').css('background-image', `url(${this.settings.backgroundImg})`),
                $(`.bg[bg]`).removeClass('active').filter(`.bg[bg="${this.settings.bodyBgAttr}"]`).addClass('active'),
                this.renderDynamicStyle()
        }
        search(a) {
            a.preventDefault();
            const b = elById('q').value;
            let c = this.settings.searchServiceObj[this.settings.searchService] || 'http://www.google.com/search?q=';
            location.href = 'http' === b.slice(0, 4) ? b : c + encodeURIComponent(b)
        }
        checkUrlAsSaveBookmark() {
            if (-1 !== location.search.indexOf('?add_url')) {
                const a = this.getParameterByName('title'),
                    b = this.getParameterByName('add_url');
                elById('preloader-in-modal').style.display = 'none';
                const c = $('#bookmark-modal');
                $('#save-bookmark-btn').removeAttr('data-item-id'),
                    c.modal('open'),
                    elById('form-url').value = b,
                    elById('form-title').value = a,
                    elById('preview').style.backgroundImage = 'none',
                    this.getPreview()
            }
        }
        showCreateModal() {
            elById('preloader-in-modal').style.display = 'none';
            const a = $('#bookmark-modal');
            $('#save-bookmark-btn').removeAttr('data-item-id'),
                a.modal('open'),
                elById('form-url').value = '',
                elById('form-title').value = '',
                elById('bookmark-modal-title').innerHTML = 'Add Bookmark',
                elById('preview').style.backgroundImage = 'none',
                this.bodyClick()
        }
        showEditModal(a) {
            a.preventDefault(),
                a.stopPropagation(),
                elById('preloader-in-modal').style.display = 'none';
            const b = $(a.target).closest('.tile-box').index(),
                c = this.bookmarks[b],
                d = $('#bookmark-modal');
            $('#save-bookmark-btn').attr('data-item-id', b),
                d.modal('open'),
                elById('form-url').value = c.url,
                elById('form-title').value = c.title,
                elById('bookmark-modal-title').innerHTML = 'Edit Bookmark',
                elById('preview').style.backgroundImage = c.preview || 'none',
                $('#refresh-preview').show(),
                this.bodyClick()
        }
        saveBookmark(a) {
            const b = $(a.target).attr('data-item-id'),
                c = {
                    url: this.addHttp(elById('form-url').value),
                    title: elById('form-title').value,
                    preview: elById('preview').style.backgroundImage.replace(/"/g, ''),
                    initPreview: !0
                };
            b === void 0 ? this.bookmarks.push(c) : this.bookmarks[+b] = c,
                this.saveData(),
                this.renderTiles(),
                elById('form-url').value = '',
                elById('form-title').value = '',
                elById('preview').style.backgroundImage = `none`,
                $('#bookmark-modal').modal('close')
        }
        changeInputUrl() {
            const a = elById('form-url').value;
            a && $('#refresh-preview').show(),
                chrome.history.search({
                    text: '',
                    maxResults: 1e3
                }, (b) => {
                    const c = b.find((b) => b.url === a),
                        d = $('#form-title');
                    c && c.title ? d.val(c.title) : this.getTitleFromSite(a, (b) => {
                        const c = b ? b : this.getRootDomain(a);
                        d.val(c)
                    })
                }),
                this.getPreview()
        }
        getRootDomain(a) {
            return a.replace(/https?:\/\//, '').replace(/\?.+/, '').replace(/\/$/, '')
        }
        getPreview() {
            const a = elById('form-url').value,
                b = this.addHttp(a);
            a && b && (elById('preloader-in-modal').style.display = 'block',
                this.createPreview(b, (a) => {
                    elById('preview').style.backgroundImage = `url(${a})`,
                        elById('preloader-in-modal').style.display = 'none'
                }))
        }
        inputFileChange(a) {
            const b = a.target.files[0],
                c = new FileReader;
            c.onload = (a) => {
                    this.resizeImg(a.target.result, (a) => {
                        elById('preview').style.backgroundImage = `url(${a})`
                    })
                },
                c.readAsDataURL(b)
        }
        showRemoveModal(a) {
            a.preventDefault(),
                a.stopPropagation();
            const b = $(a.target).closest('.tile-box').index();
            $('#remove-bookmark-modal').modal('open'),
                $('#remove-bookmark-btn').attr('data-item-id', b),
                this.bodyClick()
        }
        removeBookmark(a) {
            const b = +$(a.target).attr('data-item-id');
            this.bookmarks.splice(b, 1),
                this.saveData(),
                this.renderTiles()
        }
        bodyClick(a) {
            a && 0 < $(a.target).closest('#sidebar, #settings-btn, .context-menu-box').length || ($('#sidebar, #settings-btn').removeClass('active'),
                $('.context-menu').slideUp(100),
                $('.context-menu-button').removeClass('focus'))
        }
        addCount(a) {
            const b = $(a.target).closest('[data-setting]'),
                c = b.attr('data-setting'),
                d = +b.attr('data-max-value');
            this.settings[c] >= d || (this.settings[c] += 1,
                this.renderCounters(),
                this.renderTiles(),
                this.saveData())
        }
        removeTiles(a) {
            const b = $(a.target).closest('[data-setting]'),
                c = b.attr('data-setting'),
                d = +b.attr('data-min-value') || 0;
            this.settings[c] <= d || (this.settings[c] -= 1,
                this.renderCounters(),
                this.renderTiles(),
                this.saveData())
        }
        renderCounters() {
            $('[data-setting="tilesCount"] .input-counter-value').text(this.settings.tilesCount),
                $('[data-setting="columnCount"] .input-counter-value').text(this.settings.columnCount),
                $('[data-setting="containerWidthCount"] .input-counter-value').text(this.settings.containerWidthCount),
                $('[data-setting="tilesPaddingCount"] .input-counter-value').text(this.settings.tilesPaddingCount),
                this.renderDynamicStyle()
        }
        changeSearchService(a) {
            this.settings.searchService = a.target.value,
                this.saveData()
        }
        toggleSidebar() {
            const a = $('#sidebar, #settings-btn');
            $('#settings-btn').hasClass('active') ? a.removeClass('active') : a.addClass('active')
        }
        hiddenCapture(a, b) {
            chrome.windows.create({
                url: a,
                focused: !1,
                width: 100,
                height: 100,
                left: 1e5,
                top: 1e5,
                type: 'popup'
            }, (a) => {
                if (!a.tabs || !a.tabs.length)
                    return chrome.windows.remove(a.id),
                        b(null);
                const c = a.tabs[0].id;
                let d;
                chrome.tabs.update(c, {
                        muted: !0
                    }),
                    chrome.windows.update(a.id, {
                        width: 1200,
                        height: 800,
                        left: 1e6,
                        top: 1e6
                    });
                const e = setTimeout(() => {
                    clearInterval(d),
                        chrome.windows.remove(a.id),
                        b(null)
                }, 6e4);
                d = setInterval(() => {
                    chrome.tabs.get(c, (c) => {
                        'complete' === c.status && (clearInterval(d),
                            clearTimeout(e),
                            setTimeout(() => {
                                chrome.tabs.captureVisibleTab(a.id, (c) => {
                                    chrome.windows.remove(a.id, () => b(c))
                                })
                            }, 500))
                    })
                }, 200)
            })
        }
        resizeImg(a, b) {
            let c = new Image;
            c.src = a,
                c.onload = () => {
                    var a = Math.floor;
                    const d = document.createElement('canvas');
                    let e, f, g = a(c.width / 280);
                    2 <= g ? (5 <= g && (g = a(g / 1.3)),
                            1 & g && g--,
                            e = c.width / g,
                            f = c.height * (e / c.width),
                            140 > f && (e *= 140 / f,
                                f = 140)) : (e = c.width,
                            f = c.height),
                        d.width = e,
                        d.height = f;
                    const h = d.getContext('2d');
                    h.drawImage(c, 0, 0, e, f);
                    const i = d.toDataURL('image/png');
                    b(i)
                },
                c.onerror = () => {
                    b(null)
                }
        }
        createPreview(a, b) {
            this.resizeImg('https://mini.s-shot.ru/?' + a, (c) => {
                null === c ? this.hiddenCapture(a, (a) => this.resizeImg(a, (a) => b(a))) : b(c)
            })
        }
        addHttp(a) {
            return -1 === a.indexOf('http') ? 'http://' + a : a
        }
        openContextMenu(a) {
            a.preventDefault(),
                a.stopPropagation(),
                $('.context-menu-button').removeClass('focus'),
                $('.context-menu').slideUp(100),
                $(a.target).addClass('focus').next().slideDown(100)
        }
        openInNewtab(a, b) {
            a.preventDefault(),
                a.stopPropagation();
            const c = $(a.target).closest('[href]').attr('href');
            b ? chrome.windows.create({
                url: c,
                incognito: !0
            }) : chrome.tabs.create({
                url: c,
                active: !0
            })
        }
        toggleStep(a) {
            const b = $(a.target).closest('[data-show-target]').attr('data-show-target');
            $('.settings-block').removeClass('active').filter(b).addClass('active')
        }
        changeBg(a) {
            this.settings.bodyBgAttr = $(a.target).attr('bg'),
                this.saveData(),
                this.setTheme()
        }
        customWallpaper(a) {
            const b = a.target.files[0],
                c = new FileReader;
            c.onload = (a) => {
                    this.settings.backgroundImg = a.target.result,
                        this.settings.bodyBgAttr = 'custom',
                        this.saveData(),
                        this.setTheme()
                },
                c.readAsDataURL(b)
        }
        renderDynamicStyle() {
            const a = +$(window).width(),
                b = 5 * this.settings.containerWidthCount + 50,
                c = +(100 / this.settings.columnCount).toFixed(5),
                d = 4 * this.settings.tilesPaddingCount,
                e = a / this.settings.columnCount,
                f = .7 * +(e - 2 * (e * d / 100));
            $('#dynamic-style').remove(),
                $(`            <style id="dynamic-style">                #tiles { width: ${b}%!important; }                main #tiles .tile-box { width: ${c}%!important; }                main #tiles .tile { margin: ${d + 1}%!important; }                main #tiles .tile .body {height: ${f - 30}px;}                main #tiles .tile.add-bookmark {height: ${+f}px;}            </style>        `).appendTo(document.head)
        }
        exportSettings() {
            const b = JSON.stringify({
                    settings: this.settings,
                    bookmarks: this.bookmarks
                }),
                c = window.URL.createObjectURL(new window.Blob([b], {
                    type: 'octet/stream'
                })),
                d = document.createElement('a');
            d.href = c,
                d.download = `Speed Dial settings(${new Date().toISOString().slice(0, -14)}).json`,
                document.body.appendChild(d),
                d.click(),
                document.body.removeChild(d),
                window.URL.revokeObjectURL(c)
        }
        importSettings(a) {
            const b = new FileReader;
            b.onload = () => {
                    try {
                        const a = JSON.parse(b.result);
                        this.settings = a.settings,
                            this.bookmarks = a.bookmarks,
                            this.saveData(),
                            location.reload()
                    } catch (a) {
                        alert('\u041E\u0448\u0438\u0431\u043A\u0430 \u0438\u043C\u043F\u043E\u0440\u0442\u0430 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043A.')
                    }
                },
                b.readAsText(a.target.files[0])
        }
        getTitleFromSite(a, b) {
            function c(a) {
                return (a + '').replace(/(&amp;)/g, '&').replace(/(&lt;)/g, '').replace(/(&gt;)/g, '').replace(/(&quot;)/g, '"').replace(/(&#39;)/g, '\'').replace(/(&#58;)/g, ':').replace(/(&#x2F;)/g, '/')
            }
            const d = this.addHttp(a),
                e = new XMLHttpRequest;
            e.onload = () => {
                    const d = /(<title>)\s*(.+)\s*(<\/title>)/,
                        f = d.exec(e.responseText) || [],
                        a = f[2] ? c(f[2]) : '';
                    b(a)
                },
                e.onerror = () => b(''),
                e.open('GET', d, !0),
                e.send()
        }
        getParameterByName(a, b) {
            b || (b = window.location.href),
                a = a.replace(/[\[\]]/g, '\\$&');
            const c = new RegExp('[?&]' + a + '(=([^&#]*)|&|#|$)'),
                d = c.exec(b);
            return d ? d[2] ? decodeURIComponent(d[2].replace(/\+/g, ' ')) : '' : null
        }
    }
} catch (a) {
    logger(a.stack)
}