import { Directive, HostListener, HostBinding, Output, EventEmitter, Input } from '@angular/core';

@Directive({
  selector: '[fileDragDrop]'
})

export class FileDragNDropDirective {
  @Output() private filesChangeEmiter : EventEmitter<File[]> = new EventEmitter();


  constructor() { }

  @HostListener('dragover', ['$event']) public onDragOver(evt){
    evt.preventDefault();
    evt.stopPropagation();
  }

  @HostListener('dragleave', ['$event']) public onDragLeave(evt){
    evt.preventDefault();
    evt.stopPropagation();
  }

  @HostListener('drop', ['$event']) public onDrop(evt){
    evt.preventDefault();
    evt.stopPropagation();
    let files = evt.dataTransfer.files;
    let valid_files : Array<File> = files;
    this.filesChangeEmiter.emit(valid_files);
  }
}