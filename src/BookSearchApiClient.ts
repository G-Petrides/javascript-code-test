const DEFAULT_LIMIT = 10;
const DEFAULT_FORMAT = "json";
const DEFAULT_URL = "http://api.book-seller-example.com";
const AUTHOR_SEARCH_PATH = "/by-author";
const PUBLISHER_SEARCH_PATH = "/by-publisher";

type Book = {
    title?: string,
    author?: string,
    isbn?: string,
    quantity?: number,
    price?: number
    test?:number
}

type BookSearchResult = {
    result: Book[],
    error?: Error | TypeError
}

class BookSearchApiClient {
    url: URL | undefined;

    getBooksByAuthor(authorName: string) {
        this.url = new URL(DEFAULT_URL + AUTHOR_SEARCH_PATH);
        this.url.searchParams.append("q", authorName);

        //extends getBooksByAuthor with functions to set query params and execute the search
        return new QueryParams(this.url)
    }

    getBooksByPublisher(publisherName: string) {
        this.url = new URL(DEFAULT_URL + PUBLISHER_SEARCH_PATH);
        this.url.searchParams.append("q", publisherName);
        return new QueryParams(this.url)
    }
}

class QueryParams {
    private readonly url: URL;
    private reqFormat: "json" | "xml" = DEFAULT_FORMAT;

    constructor(url: URL) {
        this.url = url;
        //default format
        this.url.searchParams.append("format", DEFAULT_FORMAT);
        //default limit
        this.url.searchParams.append("limit", DEFAULT_LIMIT.toString());
    }

    format(format: "json" | "xml") {
        this.url.searchParams.set("format", format);
        this.reqFormat = format;
        return this
    }

    limit(limit: number) {
        this.url.searchParams.set("limit", limit.toString());
        return this
    }

    async go() {
        return await fetchBookSearch(this.url, this.reqFormat)
    }
}

async function fetchBookSearch(url: URL, format: "json" | "xml") {
    let data:BookSearchResult = {result:[], error:undefined};
    try {
        let response = await fetch(url.toString())

        if (!response.ok || response.status !== 200) {
            throw new Error(`code:${response.status}, ${response.statusText}`)
        }

        switch (format) {
            case "json":
                data.result = await mapJsonToBooks( await response.json() ); break;
            case "xml":
                data.result = await mapXmlToBooks( await response.text() ); break;
        }

    } catch (e){
        data.error = e as TypeError
        errorHandler(e as TypeError)
    }
    return data
}

async function mapJsonToBooks(json: any):Promise<Book[]> {
    return json.map(function (item: any) {
        return {
            title: item?.book?.title,
            author: item?.book?.author,
            isbn: item?.book?.isbn,
            quantity: item?.stock?.quantity,
            price: item?.stock?.price,
        }
    })
}

async function mapXmlToBooks(text: string):Promise<Book[]> {
    const books:Book[] = []
    const xml = new window.DOMParser().parseFromString(text, "text/xml")
    const errorNode = xml.querySelector("parsererror")

    if(errorNode) {
        throw new Error("XML parse error: " + errorNode.textContent)
    }

    xml.documentElement.childNodes.forEach(function (item: any) {
        books.push( {
            title: item.getElementsByTagName("title")[0].childNodes[0]?.textContent,
            author: item.getElementsByTagName("author")[0]?.childNodes[0]?.textContent,
            isbn: item.getElementsByTagName("isbn")[0]?.childNodes[0]?.textContent,
            quantity: Number(item.getElementsByTagName("quantity")[0]?.childNodes[0]?.textContent),
            price: Number(item.getElementsByTagName("price")[0]?.childNodes[0]?.textContent)
        })
    })
    return books
}

function errorHandler(error: Error) {
    console.error(error)
}

export default BookSearchApiClient;