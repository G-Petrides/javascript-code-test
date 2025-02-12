# Book Search API Client

This is a simple class that makes a call to a http API to retrieve a list of books and return them.

The `BookSearchApiClient` class takes an options object with the following properties:

    limit: number - the number of books to return
    format: string - the format of the API response (xml or json)
    root_url: string - the root url of the API if an override is required

After the class is instantiated, you can call the following methods:

    getBooksByAuthor(author: string): Promise<BookSearchResult> - returns a promise that resolves to a BookSearchResult truple
    getBooksByPublisher(publisher: string): Promise<BookSearchResult> - returns a promise that resolves to a BookSearchResult truple

The `BookSearchResult` truple contains the following properties:

    result: Book[] - an array of Book objects, or an empty array
    error: Error | TypeError - an error object if an error occurred, or undefined

Build with `npm run build`

# Javascript Code Test

`BookSearchApiClient` is a simple class that makes a call to a http API to retrieve a list of books and return them.

You need to refactor the `BookSearchApiClient` class, and demonstate in `example-client.js` how it would be used. Refactor to what you consider to be production ready code. You can change it in anyway you would like and can use javascript or typescript.

Things you will be asked about:

1. How could you easily add other book seller APIs in the the future
2. How woud you manage differences in response payloads between differnt APIs without needing to make future changes to whatever code you have in example-client.js
3. How would you implement different query types for example: by publisher, by year published etc
4. How your code would be tested