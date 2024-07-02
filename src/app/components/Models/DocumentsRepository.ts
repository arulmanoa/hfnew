export class DocumentsRepository {
    Id: number; // DocumentId map
    OriginalFileName?: string;
    DocumentName?: string; // Filename map
    ContentType?: string;
    // no need for create
    FilePath?: string;
    FileExtension?: string;
    // no need for create
    FileSize?: number;
    Status?: number;
    // enum for JD=1 and RD=2 functionality for RD to rename OriginalFileName property
    DocumentCategoryId?: number;
    // no need for create
    LastUpdatedOn?: Date;
    LastUpdatedBy?: string;
}
