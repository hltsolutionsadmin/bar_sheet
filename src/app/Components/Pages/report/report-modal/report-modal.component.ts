import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReportData } from '../report.component';

@Component({
  selector: 'app-report-modal',
  templateUrl: './report-modal.component.html',
  styleUrl: './report-modal.component.css',
})
export class ReportModalComponent {
  reportForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ReportModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReportData | null
  ) {
    this.reportForm = this.fb.group({
      title: [data?.title || '', Validators.required],
      type: [data?.type || '', Validators.required],
      description: [data?.description || '', Validators.required],
      dateRange: [data?.dateRange || '', Validators.required],
      status: [data?.status || 'draft', Validators.required],
    });
  }

  onSave(): void {
    if (this.reportForm.valid) {
      const formValue = this.reportForm.value;
      const result = this.data ? { ...this.data, ...formValue } : formValue;
      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
