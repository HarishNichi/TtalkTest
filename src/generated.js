import { graphqlOperation, API } from "@aws-amplify/api";

let graphEndPoint = null;
let apiKey = null;
let branch = process.env.NEXT_PUBLIC_AWS_BRANCH;

switch (branch) {
  case "dev":
    graphEndPoint = "ic5tvfvavvaybbjiiptveesviu";
    apiKey = "da2-vapsfkkneje7ncg3dfd2t7o3s4";
    break;
  case "test":
    graphEndPoint = "kc5ubrmtkbfntbppnmmq6rkvlq";
    apiKey = "da2-p4vi3p4r6rcbxjxekqtnzbxa5q";
    break;
  case "stage":
    graphEndPoint = "im27gb7gmzavtf3qz7aqa67vkm";
    apiKey = "da2-2nwavtxy2vag5gxgulcqdgzvie";
    break;
  case "prod":
    graphEndPoint = "ln35kmyv6bb3zpxvid2vkw663u";
    apiKey = "da2-syonh66pobbaxbfqslhwcdx6qm";
    break;
  default:
    graphEndPoint = "ic5tvfvavvaybbjiiptveesviu";
    apiKey = "da2-vapsfkkneje7ncg3dfd2t7o3s4";
    break;
}

export const config = {
  aws_appsync_graphqlEndpoint: `https://${graphEndPoint}.appsync-api.ap-northeast-1.amazonaws.com/graphql`,
  aws_appsync_region: "ap-northeast-1",
  aws_appsync_authenticationType: "API_KEY",
  aws_appsync_apiKey: apiKey,
};

export const subscribeDoc = /* GraphQL */ `
  subscription Subscribe($name: String!) {
    subscribe(name: $name) {
      data
      name
    }
  }
`;

export const publishDoc = /* GraphQL */ `
  mutation Publish($data: AWSJSON!, $name: String!) {
    publish(data: $data, name: $name) {
      data
      name
    }
  }
`;

/**
 * @param  {string} name the name of the channel
 * @param  {Object} data the data to publish to the channel
 */
export async function publish(name, data) {
  return await API.graphql(graphqlOperation(publishDoc, { name, data }));
}

/**
 * @param  {string} name the name of the channel
 * @param  {nextCallback} next callback function that will be called with subscription payload data
 * @param  {function} [error] optional function to handle errors
 * @returns {Observable} an observable subscription object
 */
export function subscribe(name, next, error) {
  return API.graphql(graphqlOperation(subscribeDoc, { name })).subscribe({
    next: ({ provider, value }) => {
      next(value.data.subscribe, provider, value);
    },
    // eslint-disable-next-line no-console
    error: error || (branch == "dev" || branch == "test") ? console.log : "",
  });
}

/**
 * @callback nextCallback
 * @param {Object} data the subscription response including the `name`, and `data`.
 * @param {Object} [provider] the provider object
 * @param {Object} [payload] the entire payload
 */
