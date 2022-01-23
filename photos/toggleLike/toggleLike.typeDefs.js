import { gql } from "apollo-server";

export default gql`
   
    type Mutation{
        likePhoto(id:Int!):MutationResponse!
    }
`