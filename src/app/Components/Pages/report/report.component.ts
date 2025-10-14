import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { User, AuthService } from '../../../Services/Auth/auth.service';
import { SalesService } from '../../../Services/Sales/sale.service';
import { Subscription } from 'rxjs';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { DatePipe } from '@angular/common';

export interface ReportData {
  id: string;
  title: string;
  type: 'sales' | 'inventory' | 'financial' | 'customer';
  description: string;
  dateRange: string;
  generatedBy: string;
  createdAt: Date;
  status: 'draft' | 'published' | 'archived';
}

export interface SalesReport {
  id: number;
  shopId: number;
  date: string;
  isPublished: boolean;
  totalReceiptsAmount: number;
  totalSalesAmount: number;
  overallTotalAmount: number;
}

export interface SalesReportResponse {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  reports: SalesReport[];
}

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrl: './report.component.css',
  providers: [DatePipe]
})
export class ReportComponent implements OnInit {
  currentUser: User | null = null;
  reportsPage: boolean = true;
  showSalesReport = signal<boolean>(false);
  startDate: Date | null = null;
  endDate: Date | null = null;

  displayedColumns: string[] = [
    'date',
    'status',
    'BreaksTotalAmount',
    'totalSalesAmount',
    'totalReceiptsAmount',
    'actions',
  ];
  dataSource = new MatTableDataSource<SalesReport>([]);
  totalCount = 0;
  pageSize = 10;
  pageNumber = 1;

  private subscriptions = new Subscription();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private saleService: SalesService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.authService.currentUser$.subscribe((user) => {
        this.currentUser = user;
      })
    );

    this.loadReports(this.pageNumber, this.pageSize);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadReports(pageNumber: number, pageSize: number): void {
    const shopId = this.currentUser?.shopId || 0;
    if (shopId === 0) {
      this.snackBar.open('Invalid shop ID', 'Close', { duration: 3000 });
      return;
    }

    this.saleService.getReports(shopId, pageNumber, pageSize).subscribe({
      next: (res: SalesReportResponse) => {
        this.dataSource.data = res.reports;
        this.totalCount = res.totalCount;
        this.pageNumber = res.pageNumber;
        this.pageSize = res.pageSize;
      },
      error: () => {
        this.snackBar.open('Failed to load reports', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.loadReports(event.pageIndex + 1, event.pageSize);
  }

  openSalesReport(): void {
    this.showSalesReport.set(true);
  }

  closeSalesReport(): void {
    this.showSalesReport.set(false);
  }

  viewReport(report: SalesReport): void {  // Updated type to SalesReport for better typing
    // Navigate to detail page with date
   const formattedDate = report.date.split('T')[0]; // Ensure YYYY-MM-DD
    this.router.navigate(['/dashboard/sales', formattedDate]);
  }

 downloadReport(report: SalesReport): void {
  if (!report?.date) {
    this.snackBar.open('Invalid report date', 'Close', { duration: 3000 });
    return;
  }

  const shopId = this.currentUser?.shopId ?? 1; 
  const formattedDate = report.date.split('T')[0]; 

  this.saleService.downloadReportPdf(shopId, formattedDate, formattedDate).subscribe({
    next: (pdfBlob: Blob) => {
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');  
      a.href = url;
      a.download = `SalesReport_${formattedDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      this.snackBar.open('Report downloaded successfully', 'Close', {
        duration: 3000,
      });
    },
    error: () => {
      this.snackBar.open('Failed to download report', 'Close', {
        duration: 3000,
      });
    },
  });
}

generateSalesReport(): void {
    if (!this.startDate || !this.endDate) {
      this.snackBar.open('Please select both start and end dates', 'Close', {
        duration: 3000,
      });
      return;
    }

    const shopId = this.currentUser?.shopId ?? 1;
    const fromDate = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
    const toDate = this.datePipe.transform(this.endDate, 'yyyy-MM-dd');

    if (!fromDate || !toDate) {
      this.snackBar.open('Invalid date format', 'Close', { duration: 3000 });
      return;
    }

    this.saleService.downloadReportPdf(shopId, fromDate, toDate).subscribe({
      next: (pdfBlob: Blob) => {
        this.downloadPdf(pdfBlob, `SalesReport_${fromDate}_to_${toDate}.pdf`);
        this.snackBar.open('Report downloaded successfully', 'Close', {
          duration: 3000,
        });
        this.startDate = null;
        this.endDate = null;
      },
      error: (err) => {
        const errorMessage =
          err.status === 400
            ? 'No reports found on selected dates'
            : 'Failed to generate report';
        this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
      },
    });
  }

  private downloadPdf(pdfBlob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  onStartDateChange(event: any): void {
    this.startDate = event.value;
  }

  // onEndDateChange(event: any): void {
  //   this.endDate = event.value;
  // }


  onEndDateChange(event: any): void {
  this.endDate = event.value;
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    this.snackBar.open('End date cannot be before start date', 'Close', { duration: 3000 });
    this.endDate = null;
  }
}

  getStatus(isPublished: boolean): string {
    return isPublished ? 'Published' : 'Draft';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
