const DEFAULT_LIMIT = 10;
const DEFAULT_FORMAT = "json";

type Book = {
    title?: string,
    author?: string,
    isbn?: string,
    quantity?: number,
    price?: number
    test?:number
}

type BookSearchResult = {
    result?: Book[],
    error?: Error
}

class BookSearchApiClient {
    url: URL | undefined;

    getBooksByAuthor(authorName: string) {
        this.url = new URL("http://api.book-seller-example.com/by-author");
        this.url.searchParams.append("q", authorName);
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
    let data:BookSearchResult = {result:undefined, error:undefined};
    try {
        let response = await fetch(url.toString())
        switch (format) {
            case "json":
                data.result = await mapJsonToBooks(await response.json()); break;
            case "xml":
                data.result = await mapXmlToBooks(await response.text()); break;
        }
    } catch (e) {
        console.error('Fetch error',e)
        data.error = new Error(e as string)
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
    let books:Book[] = []
    let xml = new window.DOMParser().parseFromString(text, "text/xml").documentElement.childNodes
    xml.forEach(function (item: any) {
        books.push( {
            title: item.getElementsByTagName("title")[0]?.childNodes[0]?.nodeValue,
            author: item.getElementsByTagName("author")[0]?.childNodes[0]?.nodeValue,
            isbn: item.getElementsByTagName("isbn")[0]?.childNodes[0]?.nodeValue,
            quantity: Number(item.getElementsByTagName("quantity")[0]?.childNodes[0]?.nodeValue),
            price: Number(item.getElementsByTagName("price")[0]?.childNodes[0]?.nodeValue)
        })
    })
    return books
}

export default BookSearchApiClient;