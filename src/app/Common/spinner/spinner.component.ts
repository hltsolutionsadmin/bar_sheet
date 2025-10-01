import { Component } from '@angular/core';
import { SpinnerService } from '../../Services/Spinner/spinner.service';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.css',
})
export class SpinnerComponent {
  constructor(public spinnerService: SpinnerService) {}
}
