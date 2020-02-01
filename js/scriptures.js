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

const Scriptures = (function ()
{
    "use strict";

    // CONSTANTS


    // PRIVATE VARIABLES
    let books;
    let volumes;


    // PRIVATE METHOD DECLARATIONS
    let init;
    let ajax;
    let cacheBooks;
    let onHashChanged;


    // PRIVATE METHODS
    ajax = function (url, successCallback, failureCallback)
    {
        let request = new XMLHttpRequest();
        request.open("GET", url, true);

        request.onload = function ()
        {
            if(request.status >= 200 && request.status < 400)
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


    cacheBooks = function(onInitializedCallback)
    {
        volumes.forEach(function (volume)
        {
            let volumeBooks = [];
            let bookId = volume.minBookId;

            while (bookId <= volume.maxBookId)
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

    init = function (onInitializedCallback)
    {
        let booksLoaded = false;
        let volumesLoaded = false;

        ajax("https://scriptures.byu.edu/mapscrip/model/books.php", function (data)
        {
            books = data;
            booksLoaded = true;

            if(volumesLoaded)
            {
                cacheBooks(onInitializedCallback);
            }
        });

        ajax("https://scriptures.byu.edu/mapscrip/model/volumes.php", function (data)
        {
            volumes = data;
            volumesLoaded = true;

            if(booksLoaded)
            {
                cacheBooks(onInitializedCallback);
            }
        });
    };

    onHashChanged = function ()
    {
        console.log("Hash" + location.hash);
    }

    // PUBLIC API
    return {
        init: init,
        onHashChanged: onHashChanged
    };
}());