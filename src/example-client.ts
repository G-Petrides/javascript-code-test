import BookSearchApiClient from "./BookSearchApiClient.js";
async function getExample(){

    const {error, result} = await new BookSearchApiClient()
        .getBooksByAuthor("Shakespeare")
        .format("xml")
        .limit(10)
        .go();

    if(error){  console.log(error); return; }
    console.log(result)
}