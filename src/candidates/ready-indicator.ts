export abstract class ReadyIndicator {
    abstract name: string;
    status: ResourceReadiness = ResourceReadiness.NotReady;
    details: string | undefined;
  
    abstract checkReadiness(): Promise<void>;
  }
  
  // resource-ready.enum.ts
  export enum ResourceReadiness {
    Ready = 'Ready',
    NotReady = 'Not Ready'
  }