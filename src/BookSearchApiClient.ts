export type Book = {
    title: string | undefined
    author: string | undefined
    isbn: string | undefined
    quantity: number | undefined
    price: number | undefined
}

export type BookSearchResult = {
    result: Book[]
    error: Error | TypeError | undefined
}

export type BookSearchOptions = {
    //Optional root url for the book search api, defaults to http://api.book-seller-example.com
    root_url: string
    //Optional format for the book search api, defaults to json
    format: "json" | "xml"
    //Optional limit for the book search api, omitted by default
    limit?: number
}

/**
 * @param options - BookSearchOptions object with root_url, format, and limit
 * @returns client class with methods to search for books by author or publisher
 */
export default class BookSearchApiClient {
    url: URL | undefined;
    options:BookSearchOptions = {
        root_url: "http://api.book-seller-example.com",
        format: "json"
    }
    AUTHOR_SEARCH_PATH = "/by-author";
    PUBLISHER_SEARCH_PATH = "/by-publisher";
    constructor(options?: Partial<BookSearchOptions>) {
        this.options = {...this.options, ...options}
    }

    async getBooksByAuthor(authorName: string) {
        this.url = new URL(this.options.root_url + this.AUTHOR_SEARCH_PATH);
        this.appendQueries(this.url, authorName, this.options)
        return await fetchBookSearch(this.url, this.options.format)
    }

    async getBooksByPublisher(publisherName: string) {
        this.url = new URL(this.options.root_url + this.PUBLISHER_SEARCH_PATH);
        this.appendQueries(this.url, publisherName, this.options)
        return await fetchBookSearch(this.url, this.options.format)
    }

    private appendQueries(url:URL, queryValue: string, options: BookSearchOptions) {
        url.searchParams.append("q", queryValue);
        if(options.limit) url.searchParams.append("limit", options.limit.toString());
    }
}

async function fetchBookSearch(url: URL, format: "json" | "xml") {
    let data:BookSearchResult = {result:[], error:undefined};
    try {
        let response = await window.fetch(url.toString())

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