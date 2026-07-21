import { generateClient, GraphQLResult } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';

let client: any = null;

function getClient(): any {
  if (!client) {
    if (typeof window !== 'undefined') {
      require('@/lib/amplify');
    }
    client = generateClient() as any;
  }
  return client as any;
}

/**
 * GraphQL client for ndotoniStays
 * Shares the same AppSync API as ndotoniWeb
 */
export class GraphQLClient {
  static async execute<T = any>(
    query: string,
    variables?: Record<string, any>,
    forceApiKey = false
  ): Promise<T> {
    const clientInstance = getClient();

    let authMode: 'userPool' | 'apiKey' = 'apiKey';

    if (!forceApiKey) {
      try {
        await getCurrentUser();
        authMode = 'userPool';
      } catch {
        authMode = 'apiKey';
      }
    }

    const result = (await clientInstance.graphql({
      query,
      variables,
      authMode,
    })) as GraphQLResult<any>;

    return result.data as T;
  }

  static async executeAuthenticated<T = any>(
    query: string,
    variables?: Record<string, any>
  ): Promise<T> {
    const clientInstance = getClient();
    await getCurrentUser();

    const result = (await clientInstance.graphql({
      query,
      variables,
      authMode: 'userPool',
    })) as GraphQLResult<any>;

    return result.data as T;
  }

  static async executePublic<T = any>(
    query: string,
    variables?: Record<string, any>
  ): Promise<T> {
    const clientInstance = getClient();

    const result = (await clientInstance.graphql({
      query,
      variables,
      authMode: 'apiKey',
    })) as GraphQLResult<any>;

    return result.data as T;
  }

  /**
   * Get the raw Amplify client for subscriptions and other advanced features
   */
  static getRawClient() {
    return getClient();
  }
}


export default GraphQLClient;
