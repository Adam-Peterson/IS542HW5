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


    // PRIVATE VARIABLES
    let books;
    let volumes;


    // PRIVATE METHOD DECLARATIONS
    let init;
    let ajax;
    let bookChapterValid;
    let navigateChapter;
    let cacheBooks;
    let onHashChanged;
    let navigateHome;
    let navigateBook;


    // PRIVATE METHODS
    ajax = function(url, successCallback, failureCallback)
    {
        let request = new XMLHttpRequest();
        request.open("GET", url, true);

        request.onload = function()
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

    navigateChapter = function(bookId, chapter)
    {
        console.log(bookId, chapter);
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

    init = function(onInitializedCallback)
    {
        console.log("Starting init...");
        let booksLoaded = false;
        let volumesLoaded = false;

        ajax("https://scriptures.byu.edu/mapscrip/model/books.php", function(data)
        {
            books = data;
            booksLoaded = true;

            if(volumesLoaded)
            {
                cacheBooks(onInitializedCallback);
            }
        });

        ajax("https://scriptures.byu.edu/mapscrip/model/volumes.php", function(data)
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

    navigateHome = function(volumeId)
    {
        document.getElementById("scriptures").innerHTML = 
        "<div>OT</div>" + 
        "<div>NT</div>" + 
        "<div>BOM</div>" + 
        "<div>DC</div>" + 
        "<div>POGP</div>" +
        volumeId;
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
                navigateHome()
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

    // PUBLIC API
    return {
        init: init,
        onHashChanged: onHashChanged
    };
}());