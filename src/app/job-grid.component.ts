// job-grid.component.ts

import { Component, OnInit } from '@angular/core';
import { JobEntry } from './job-entry.model';

@Component({
  selector: 'app-job-grid',
  templateUrl: './job-grid.component.html',
  styleUrls: ['./job-grid.component.css']
})
export class JobGridComponent implements OnInit {
  jobEntriesA: JobEntry[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  sortColumn: string = '';
  sortDirection: boolean = true; // true for ascending, false for descending

  ngOnInit() {
    this.loadJobEntries();
  }

  loadJobEntries() {
    // Sample data for demonstration
    this.jobEntriesA = [
      { postName: 'Security Analyst', jobDescription: 'Responsible for monitoring...', closingDate: new Date('2023-12-15') },
      { postName: 'System Administrator', jobDescription: 'Maintains IT infrastructure...', closingDate: new Date('2023-12-20') },
      { postName: 'Software Engineer', jobDescription: 'Develops software solutions...', closingDate: new Date('2024-01-10') },
      // Additional sample job entries
    ];
  }

  sortJobs(column: keyof JobEntry) {
    if (this.sortColumn === column) {
      this.sortDirection = !this.sortDirection; // Toggle direction if the same column is clicked
    } else {
      this.sortColumn = column;
      this.sortDirection = true; // Default to ascending for new column
    }

    this.jobEntriesA.sort((a, b) => {
      const compareA = a[column];
      const compareB = b[column];
      let comparison = 0;

      if (compareA > compareB) {
        comparison = 1;
      } else if (compareA < compareB) {
        comparison = -1;
      }

      return this.sortDirection ? comparison : -comparison;
    });
  }
}
