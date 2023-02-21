import BookSearchApiClient, {BookSearchOptions} from "./BookSearchApiClient.js";
async function getExample(){

    const options:Partial<BookSearchOptions> = {limit:20, format:"xml"}
    const queryClient = new BookSearchApiClient(options)
    const {error, result} = await queryClient.getBooksByAuthor("Shakespeare")

    if(error){  console.log(error); return; }
    console.log(result)
}