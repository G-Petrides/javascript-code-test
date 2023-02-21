
import BookSearchApiClient from "../src/BookSearchApiClient";

global.window.fetch = jest.fn(() => Promise.resolve({
        json: () => Promise.resolve([{book: {title: "mock title", author: "mock author", isbn: "mock isbn"}, stock: {quantity: 2, price: 2}}]),
        text: () => Promise.resolve("<root><row><book><title>mock title</title><author>mock author</author><isbn>mock isbn</isbn></book><stock><quantity>2</quantity><price>2</price></stock></row></root>")
})) as jest.Mock;

describe("BookSearchApiClient tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("correctly sets author query parameter", async () => {
        await new BookSearchApiClient().getBooksByAuthor("Dave").go()
        expect(fetch).toHaveBeenCalledWith("http://api.book-seller-example.com/by-author?q=Dave&format=json&limit=10");
    })

    test("correctly sets limit query parameter", async () => {
        await new BookSearchApiClient().getBooksByAuthor("Dave").limit(53).go()
        expect(fetch).toHaveBeenCalledWith("http://api.book-seller-example.com/by-author?q=Dave&format=json&limit=53");
    })

    test("correctly sets format query parameter", async () => {
        await new BookSearchApiClient().getBooksByAuthor("Dave").format("xml").go()
        expect(fetch).toHaveBeenCalledWith("http://api.book-seller-example.com/by-author?q=Dave&format=xml&limit=10");
    })

    test("book search correctly defaults to json and returns data", async () => {
        let search = await new BookSearchApiClient().getBooksByAuthor("Shakespeare").limit(10).go()
        expect(fetch).toHaveBeenCalledWith("http://api.book-seller-example.com/by-author?q=Shakespeare&format=json&limit=10");
        expect(search.result).toEqual([{title: "mock title", author: "mock author", isbn: "mock isbn", quantity: 2, price: 2}])
    })
    test("book search correctly returns xml data", async () => {
        let search = await new BookSearchApiClient().getBooksByAuthor("Shakespear").format("xml").limit(10).go()
        expect(fetch).toHaveBeenCalledWith("http://api.book-seller-example.com/by-author?q=Shakespear&format=xml&limit=10");
        expect(search.result).toEqual([{title: "mock title", author: "mock author", isbn: "mock isbn", quantity: 2, price: 2}])
    })
})