const Scriptures = (function () {
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
    ajax = function(url, successCallback, failureCallback)
    {
        let request = new XMLHttpRequest();
        request.open('GET', url, true);

        request.onload = function() 
        {
            if (request.status >= 200 && request.status < 400) 
            {
                // Success!
                let data = JSON.parse(request.responseText);
                if(typeof successCallback === "function")
                {
                    successCallback(data);
                }
                else
                {
                    if(typeof failureCallback === "funciton")
                    {
                        failureCallback(request);
                    }
                }
            } 
            else
            {
                // We reached our target server, but it returned an error
            }
        };

        request.onerror = failureCallback; 
        {
        // There was a connection error of some sort
        };

        request.send();
    }


    cacheBooks = function(callback)
    {
        volumes.forEach(volume => {
            let volumeBooks = [];
            let bookId = volume.minBookId;

            while(bookId <= volume.maxBookId)
            {
                volumeBooks.push(books[bookId]);
                bookId ++;
            }
            volume.books = volumeBooks;
        });
        if(typeof callback === "function")
        {
            callback();
        }
    };

    init = function(callback)
    {
        let booksLoaded = false;
        let volumesLoaded = false;

        ajax("https://scriptures.byu.edu/mapscrip/model/books.php", data => 
        {
            books = data
            booksLoaded = true;

            if(volumesLoaded)
            {
                cacheBooks(callback);
            }
        });
        ajax("https://scriptures.byu.edu/mapscrip/model/volumes.php", data => 
        {
            volumes = data
            volumesLoaded = true;

            if(booksLoaded)
            {
                cacheBooks(callback);
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