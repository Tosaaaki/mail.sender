declare module 'firebase-functions' {
  export namespace https {
    interface Request { [key: string]: any }
    interface Response {
      status(code: number): this;
      json(data: any): void;
      send(data: any): void;
      [key: string]: any;
    }
    function onRequest(handler: (req: Request, res: Response) => any): any;
  }
  export namespace auth {
    function user(): { onCreate(handler: (user: any) => any): any };
  }
}

declare module 'firebase-admin' {
  const admin: any;
  export default admin;
  export const apps: any[];
  export function initializeApp(): void;
  export function firestore(): any;
  export const FieldValue: any;
  export function __setData(data: any): void;
  export function __getData(path: string): any;
}

declare module '@google-cloud/tasks' {
  export class CloudTasksClient {
    queuePath(project: string, location: string, queue: string): string;
    createTask(request: any): Promise<any>;
  }
}

declare module 'google-auth-library' {
  export class OAuth2Client {
    verifyIdToken(options: any): Promise<{ getPayload(): any }>;
  }
}

declare const process: any;
