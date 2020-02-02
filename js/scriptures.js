/*jslint
    browser: true
    long: true */
/*global console, google, map, XMLHttpRequest */
/*property
    Animation, DROP, Marker, animation, books, classKey, clearTimeout, content,
    exec, forEach, fullName, getAttribute, getElementById, google, gridName,
    hash, href, id, init, innerHTML, lat, length, lng, log, map, maps,
    maxBookId, minBookId, numChapters, onHashChanged, onerror, onload, open,
    parse, position, push, querySelectorAll, response, send, setMap, setTimeout,
    slice, split, status, title, tocName
*/

const Scriptures =(function()
{
    "use strict";

    // CONSTANTS
    const BOTTOM_PADDING = "<br /><br />";
    const CLASS_BOOKS = "books";
    const CLASS_BUTTON = "btn";
    const CLASS_CHAPTER = "chapter";
    const CLASS_VOLUME = "volume";
    const DIV_SCRIPTURES_NAVIGATOR = "scripnav";
    const DIV_SCRIPTURES = "scriptures";
    const INDEX_FLAG = 11;
    const INDEX_LATITUDE = 3;
    const INDEX_LONGITUDE = 4;
    const INDEX_PLACENAME = 2;
    const LAT_LON_PARSER = /\((.*),'(.*)',(.*),(.*),(.*),(.*),(.*),(.*),(.*),(.*),'(.*)'\)/;
    const MAX_RETRY_DELAY = 5000;
    const REQUEST_GET = "GET";
    const REQUEST_STATUS_OK = 200;
    const REQUEST_STATUS_ERROR = 400;
    const TAG_VOLUME_HEADER = "h5";
    const URL_BOOKS = "https://scriptures.byu.edu/mapscrip/model/books.php";
    const URL_SCRIPTURES = "https://scriptures.byu.edu/mapscrip/mapgetscrip.php";
    const URL_VOLUMES = "https://scriptures.byu.edu/mapscrip/model/volumes.php";

    // PRIVATE VARIABLES
    let books;
    let volumes;

    // PRIVATE METHOD DECLARATIONS
    let ajax;
    let bookChapterValid;
    let booksGrid;
    let booksGridContent;
    let cacheBooks;
    let htmlAnchor;
    let htmlDiv;
    let htmlElement;
    let htmlLink;
    let init;
    let navigateBook;
    let navigateChapter;
    let navigateHome;
    let onHashChanged;
    let volumesGridContent;


    // PRIVATE METHODS
    ajax = function(url, successCallback, failureCallback)
    {
        let request = new XMLHttpRequest();
        request.open(REQUEST_GET, url, true);

        request.onload = function()
        {
            if(request.status >= REQUEST_STATUS_OK && request.status < REQUEST_STATUS_ERROR)
            {
                // Success!
                let data = JSON.parse(request.response);
                if(typeof successCallback === "function")
                {
                    successCallback(data);
                }
            }
            else
            {
                if(typeof failureCallback === "function")
                {
                    failureCallback(request);
                }
            }
        };

        request.onerror = failureCallback;
        request.send();
    };

    bookChapterValid = function(bookId, chapter)
    {
        let book = books[bookId];

        if(book === undefined || chapter < 0 || chapter > book.numChapters)
        {
            return false;
        }
        if(chapter === 0 && book.numChapters > 0)
        {
            return false;
        }

        return true;
    };

    booksGrid = function(volume)
    {
        return htmlDiv
        (
            {
                classKey: CLASS_BOOKS,
                content: booksGridContent(volume)
            }
        );
    };

    booksGridContent = function(volume)
    {
       let gridContent = "";
       
        volume.books.forEach(function(book)
        {
            gridContent += htmlLink(
                {
                    classKey: CLASS_BUTTON,
                    id: book.id,
                    href: `#${volume.id}:${book.id}`,
                    content: book.gridName
                });
        });
       return gridContent;
    }

    cacheBooks = function(onInitializedCallback)
    {
        volumes.forEach(function(volume)
        {
            let volumeBooks = [];
            let bookId = volume.minBookId;

            while(bookId <= volume.maxBookId)
            {
                volumeBooks.push(books[bookId]);
                bookId += 1;
            }

            volume.books = volumeBooks;
        });
        if(typeof onInitializedCallback === "function")
        {
            onInitializedCallback();
        }
    };

    htmlAnchor = function(volume)
    {
        return `<a name="v${volume.id}" />`;
    };

    htmlDiv = function(parameters)
    {
        let classString = "";
        let contentString = "";
        let idString = "";

        if(parameters.classKey !== undefined) {
            classString = ` class="${parameters.classKey}"`;
        }

        if(parameters.content !== undefined) {
            contentString = parameters.content;
        }

        if(parameters.id !== undefined) {
            idString = ` id="${parameters.id}"`;
        }

        return `<div${idString}${classString}>${contentString}</div>`;
    };

    htmlElement = function(tagName, content)
    {
        return `<${tagName}>${content}</${tagName}>`;
    };

    htmlLink = function(parameters)
    {
        let classString = "";
        let contentString = "";
        let hrefString = "";
        let idString = "";

        if(parameters.classKey !== undefined) {
            classString = ` class="${parameters.classKey}"`;
        }

        if(parameters.content !== undefined) {
            contentString = parameters.content;
        }

        if(parameters.href !== undefined) {
            hrefString = ` href="${parameters.href}"`;
        }

        if(parameters.id !== undefined) {
            idString = ` id="${parameters.id}"`;
        }

        return `<a${idString}${classString}${hrefString}>${contentString}</a>`;
    };

    init = function(onInitializedCallback)
    {
        console.log("Starting init...");
        let booksLoaded = false;
        let volumesLoaded = false;

        ajax(URL_BOOKS, function(data)
        {
            books = data;
            booksLoaded = true;

            if(volumesLoaded)
            {
                cacheBooks(onInitializedCallback);
            }
        });

        ajax(URL_VOLUMES, function(data)
        {
            volumes = data;
            volumesLoaded = true;

            if(booksLoaded)
            {
                cacheBooks(onInitializedCallback);
            }
        });
    };

    navigateBook = function(bookId)
    {
        console.log(bookId);
    };

    navigateChapter = function(bookId, chapter)
    {
        console.log(bookId, chapter);
    };

    navigateHome = function(volumeId)
    {
        document.getElementById(DIV_SCRIPTURES).innerHTML = htmlDiv(
            {
                id: DIV_SCRIPTURES_NAVIGATOR,
                content: volumesGridContent(volumeId)
            }
        )

    };

    onHashChanged = function()
    {
        let ids = [];

        if(location.hash !== "" && location.hash.length > 1)
        {
            ids = location.hash.slice(1).split(":");
        }
        if(ids.length <= 0)
        {
            navigateHome();
        }
        else if(ids.length === 1)
        {
            let volumeId = Number(ids[0]);

            if(volumeId < volumes[0].id || volumeId > volumes.slice(-1).id)
            {
                navigateHome();
            }
            else
            {
                navigateHome(volumeId);
            }
        }
        else if(ids.length >= 2)
        {
            let bookId = Number(ids[1]);
            if(books[bookId] === undefined)
            {
                navigateHome();
            }
            else
            {
                if(ids.length === 2)
                {
                    navigateBook(bookId);
                }
                else
                {
                    let chapter = Number(ids[2]);

                    if(bookChapterValid(bookId, chapter))
                    {
                        navigateChapter(bookId, chapter)
                    }
                    else
                    {
                        navigateHome();
                    }
                }
            }
        }
    };

    volumesGridContent = function(volumeId)
    {
        let gridContent = "";

        volumes.forEach(function(volume)
        {
            if(volumeId === undefined || volumeId === volume.id)
            {
                gridContent += htmlDiv(
                    {
                        classKey: CLASS_VOLUME,
                        content: htmlAnchor(volume) + htmlElement(TAG_VOLUME_HEADER, volume.fullName)
                    });
                gridContent += booksGrid(volume);
            }
        });
        return gridContent + BOTTOM_PADDING;
    };

    // PUBLIC API
    return {
        init: init,
        onHashChanged: onHashChanged
    };
}());