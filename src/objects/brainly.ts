import type { IBrainlyResponse } from "../types";
import request from "./request";

export default class Brainly {
    public baseURL = "https://brainly.co.id";
    public request = request(this.baseURL, {
        headers: {
            "user-agent": "BrainlyBot/Hanif"
        }
    });

    getBody(query: string, length = 10) {
        const graphql = "query SearchQuery($query: String!, $first: Int!, $after: ID) {\n  questionSearch(query: $query, first: $first, after: $after) {\n    count\n    edges {\n      node {\n        id\n        databaseId\n        author {\n          id\n          databaseId\n          isDeleted\n          nick\n          avatar {\n            thumbnailUrl\n            __typename\n          }\n          rank {\n            name\n            __typename\n          }\n          __typename\n        }\n        content\n        attachments{\nurl\n}\n        answers {\n          nodes {\n            thanksCount\n            ratesCount\n            rating\n            attachments{\nurl\n}\ncontent\n            __typename\n          }\n          hasVerified\n          __typename\n        }\n        __typename\n      }\n      highlight {\n        contentFragments\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n"
        return [{
            operationName: "SearchQuery",
            query: graphql,
            variables: {
                after: null,
                first: length,
                query
            }
        }];
    }

    async fetch(query: string, len = 10) {
        const body = this.getBody(query, len);
        const response = await this.request.post("/graphql/id", body);
        const json = response.data;
        return json[0].data.questionSearch.edges as IBrainlyResponse[];
    }
}