import { gql } from "apollo-server-core";

export default gql`
   
    type Mutation{
        likePhoto(id:Int!):MutationResponse!
    }
`