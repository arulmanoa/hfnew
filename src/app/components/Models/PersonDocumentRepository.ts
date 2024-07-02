export class PersonDocumentsRepository {
    Id: number; 
    DocumentName?: string; // Filename map
    ContentType?: string;
    DocumentBytes: string;
    FileExtension: string;
    FileSize?: number;
    Status?: number;
    LastUpdatedOn?: Date;
    LastUpdatedBy?: string;
}

