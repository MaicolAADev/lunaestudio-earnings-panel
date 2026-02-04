declare module "pg" {
  export type QueryResult<R = any> = {
    rows: R[];
  };

  export class Pool {
    constructor(config: { connectionString: string });
    query<R = any>(text: string, values?: any[]): Promise<QueryResult<R>>;
  }
}
