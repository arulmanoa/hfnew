import { Component, Output, EventEmitter, ViewChild, ElementRef, Input } from '@angular/core';
import { AlertService } from 'src/app/_services/service';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './common-file-uploader.component.html'
})
export class CommonFileUploaderComponent {
  @Output() filesUploaded: EventEmitter<{ base64: string, filename: string }[]> = new EventEmitter();
  @Output() err: EventEmitter<string> = new EventEmitter();
  @Input() expectedDocUploads: number;
  @Input() MAX_FILE_SIZE_MB: number = 0;
  @Input() ALLOWED_FILE_TYPES: Array<string> = [];
  errorMessage: string | null = null;
  files: FileList;
  @ViewChild('fileUpload') fileUpload: ElementRef;
  @Input() isMultiple = true;

  constructor(private alertService: AlertService){}

  onFilesSelected(event: any): void {
     this.files = event.target.files;
     if(this.expectedDocUploads && this.files.length != this.expectedDocUploads){
        this.err.emit(`You have selected ${this.expectedDocUploads} records, but only uploaded ${this.files.length} files. Kindly Upload for all the records.`)
     }

    const validFiles: { base64: string, filename: string }[] = [];

    for (let i = 0; i < this.files.length; i++) {
      const file = this.files[i];
      //if fileSize fileType check is needed uncomment and pass the inputs
      if (this.checkFileSize(file)) {
        this.readFileAsBase64(file, validFiles);
      } else {
        this.alertService.showWarning(`Invalid file(s)[${file.name}]. Please check file size, it should be under 2 MB`);
        event.target.value = '';
        return;
      }
    }

    this.errorMessage = null;
    this.filesUploaded.emit(validFiles);
  }

  private checkFileType(file: File): boolean {
    return this.ALLOWED_FILE_TYPES.includes(file.type);
  }

  private checkFileSize(file: File): boolean {
    if(this.MAX_FILE_SIZE_MB == 0){
      return true;
    }
    return file.size <= this.MAX_FILE_SIZE_MB * 1024 * 1024;
  }

  private readFileAsBase64(file: File, validFiles: { base64: string, filename: string }[]): void {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String: string = reader.result as string;
      validFiles.push({ base64: base64String.split(",")[1], filename: file.name });
      if(validFiles.length == this.files.length){
        this.filesUploaded.emit(validFiles);
      }
    };
    reader.readAsDataURL(file);
  }

  openFileDialog(){
     this.fileUpload.nativeElement.click();
  }
}
