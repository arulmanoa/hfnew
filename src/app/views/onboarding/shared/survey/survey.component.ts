import { Component, OnDestroy, OnInit ,Input} from '@angular/core';
import { apiResult } from '@services/model/apiResult';
import { AlertService, CandidateService, ClientService } from '@services/service';
import { Subscription, Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.css']
})
export class SurveyComponent implements OnInit, OnDestroy {

  private unsubscribe$ = new Subject<void>();
  @Input() entityData : any;
  surveyQuestions: any[] = [];
  termsAndConditions: any;
  constructor(
    private candidateService: CandidateService,
    private loadingScreenService: LoadingScreenService,
    private alertService: AlertService,
    private activeModal: NgbActiveModal,
  ) {

  }

  ngOnInit() {
    this.FetchSurveyQuestions();
    // this.surveyQuestions = [
    //   {
    //     id: 1,
    //     question: 'Shall I use your WhatsApp number to send new updates?',
    //     type: 'Choice',
    //     options: ['Yes', 'No'],
    //     answer: ''
    //   },
    //   {
    //     id: 14,
    //     question: 'Please rate the user interface of our website.',
    //     type: 'Scale',
    //     answer: 5
    //   },
    //   {
    //     id: 13,
    //     question: 'What is your preferred method of customer support?',
    //     type: 'Choice',
    //     options: ['Live Chat', 'Email', 'Phone', 'Other'],
    //     answer: ''
    //   },
    //   {
    //     id: 16,
    //     question: 'Share your suggestions for improving our services.',
    //     type: 'Text',
    //     answer: ''
    //   },
    // ];
  }

  FetchSurveyQuestions() {

    // int entityType, long entityId, int questionGroupType - terms & cond or Feedback
    const requetParameters = `entityType=${this.entityData.EntityType}&entityId=${this.entityData.EntityId}&questionGroupType=${1}`;
    this.candidateService.FetchSurveyQuestions(requetParameters).subscribe((data: apiResult) => {

      console.log('data', data);

      const SurveyQuestions = JSON.parse(data.Result);
      console.log('daSurveyQuestionsta', SurveyQuestions);
      this.termsAndConditions = SurveyQuestions.SurveyQuestions;
      console.log('termsAndConditions', this.termsAndConditions);
      if (this.termsAndConditions && this.termsAndConditions.Defintions && this.termsAndConditions.Defintions.length > 0) {

        this.termsAndConditions.Defintions.forEach(element => {
          element['Answer'] = ""
        });

      }

    })

  }

  agree() {
    if (this.termsAndConditions && this.termsAndConditions.Defintions && this.termsAndConditions.Defintions.length > 0) {
      const emptyMandatoryField = this.termsAndConditions.Defintions.find(
        definition => definition.IsMandatory && !definition.Answer
      );
      if (emptyMandatoryField) {
        alert('Please fill in all mandatory fields.');
      } else {
        this.RecordSurveyResponses();
      }
    }
    console.log('Request saved!');
  }

  RecordSurveyResponses() {

    const surveyResponses: any = [];
    this.termsAndConditions.Defintions.forEach(element => {
      surveyResponses.push({
        ResponseId: 0,
        QuestionId: element.Id,
        EntityType: 11,
        EntityId: this.entityData.EntityId,
        Answer: element.Answer
      })
    });
    console.log('#PYD ::', JSON.stringify(surveyResponses));

    this.candidateService.RecordSurveyResponses(JSON.stringify(surveyResponses))
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(
        (result: apiResult) => {
          console.log('Result: ', result);
          this.loadingScreenService.stopLoading();

          if (result.Status) {
            this.activeModal.close(true);
          } else {
          }
        },
        (error) => {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning("An error occurred while updating an employee status");
          console.error('Error: ', error);
        }
      );
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
