
import BookSearchApiClient from "../src/BookSearchApiClient";



describe("BookSearchApiClient happy tests", () => {

    global.window.fetch = jest.fn(() => Promise.resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve([{book: {title: "mock title", author: "mock author", isbn: "mock isbn"}, stock: {quantity: 2, price: 2}}]),
        text: () => Promise.resolve("<root><row><book><title>mock title</title><author>mock author</author><isbn>mock isbn</isbn></book><stock><quantity>2</quantity><price>2</price></stock></row></root>")
    })) as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("correctly sets author query parameter", async () => {
        await new BookSearchApiClient().getBooksByAuthor("Dave")
        expect(fetch).toHaveBeenCalledWith("http://api.book-seller-example.com/by-author?q=Dave&format=json");
    })

    test("correctly sets limit query parameter", async () => {
        await new BookSearchApiClient({limit:53}).getBooksByAuthor("Dave")
        expect(fetch).toHaveBeenCalledWith("http://api.book-seller-example.com/by-author?q=Dave&format=json&limit=53");
    })

    test("correctly sets format query parameter", async () => {
        await new BookSearchApiClient({format:"xml"}).getBooksByAuthor("Dave")
        expect(fetch).toHaveBeenCalledWith("http://api.book-seller-example.com/by-author?q=Dave&format=xml");
    })

    test("book search correctly defaults to json and returns data", async () => {
        let search = await new BookSearchApiClient().getBooksByAuthor("Shakespeare")
        expect(fetch).toHaveBeenCalledWith("http://api.book-seller-example.com/by-author?q=Shakespeare&format=json");
        expect(search.result).toEqual([{title: "mock title", author: "mock author", isbn: "mock isbn", quantity: 2, price: 2}])
    })
    test("book search correctly returns xml data", async () => {
        let search = await new BookSearchApiClient({format:"xml"}).getBooksByAuthor("Shakespeare")
        expect(fetch).toHaveBeenCalledWith("http://api.book-seller-example.com/by-author?q=Shakespeare&format=xml");
        expect(search.result).toEqual([{title: "mock title", author: "mock author", isbn: "mock isbn", quantity: 2, price: 2}])
    })
})

describe("BookSearchApiClient sad tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        global.window.fetch = jest.fn(() => Promise.resolve({
            status: 200,
            ok: true,
            json: () => Promise.resolve( "This is not json"),
            text: () => Promise.resolve("This is not xml")
        })) as jest.Mock;
    });

    test("book search correctly returns error when fetch rejects", async () => {
        global.window.fetch = jest.fn(() => Promise.reject("Fetch rejected")) as jest.Mock;
        let search = await new BookSearchApiClient({format:"xml"}).getBooksByAuthor("Shakespeare")
        expect(search.error).toEqual("Fetch rejected")
        expect(search.result).toEqual([])
    })

    test("book search correctly returns error when status not 200", async () => {
        global.window.fetch = jest.fn(() => Promise.resolve({
            status: 404,
            statusText: "This is a 404 error"
        })) as jest.Mock;
        let search = await new BookSearchApiClient({format:"xml"}).getBooksByAuthor("Shakespeare")
        console.log(search.error)
        expect(search.error?.toString()).toEqual("Error: code:404, This is a 404 error")
        expect(search.result).toEqual([])
    })

    test("book search correctly returns error when json is not valid", async () => {
        let search = await new BookSearchApiClient().getBooksByAuthor("Shakespeare")
        expect(search.error?.toString()).toEqual("TypeError: json.map is not a function")
        expect(search.result).toEqual([])
    })

    test("book search correctly returns error when xml is not valid", async () => {
        let search = await new BookSearchApiClient({format:"xml"}).getBooksByAuthor("Shakespeare")
        expect(search.error?.toString()).toContain("Error: XML parse error:")
        expect(search.result).toEqual([])
    })
})