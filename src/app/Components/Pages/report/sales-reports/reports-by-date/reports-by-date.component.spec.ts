import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsByDateComponent } from './reports-by-date.component';

describe('ReportsByDateComponent', () => {
  let component: ReportsByDateComponent;
  let fixture: ComponentFixture<ReportsByDateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportsByDateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportsByDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
