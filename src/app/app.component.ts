import { Component, OnInit  } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient, HttpHeaders  } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { Qualification } from './qualification.enum';
import { JobEntry } from './job-entry.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  jobPostForm!: FormGroup;
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  showLoginForm = false;
  showJobPostForm = false;
  showModalPlaceholder = false;
  showHomeGrid = true; // Set this to true by default to display grid on page load
  showRegisterForm = false;
  currentModalTitle = '';
  siftingForm!: FormGroup;
  showSiftingForm = false;
  applyForm!: FormGroup;
  showApplyModal = false;
  selectedPositionName: string = '';
  applicantName: string = 'John Doe';  // Set to the logged-in user or applicant
  currentRole: string | null = null;
  postId: number = 0;
  userId: number = 10; // Placeholder for the logged-in user’s ID
  cvFileBase64: string | null = null; // Holds the base64 string of the CV file
  loading: boolean = false;  // Flag to control spinner visibility
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;

 // userId: string | null = null;
  name: string | null = null;
  surname: string | null = null;


  // Array to hold fetched job entries
  jobEntriesA: any[] = [];  // Placeholder for job entries fetched from API
  jobEntriesB: JobEntry[] = [];

  loadjobEntries() {
    this.jobEntriesB = [
      { postName: 'Security Analyst', jobDescription: 'Monitoring...', closingDate: new Date('2023-12-15') },
      { postName: 'System Administrator', jobDescription: 'IT Infrastructure...', closingDate: new Date('2023-12-20') },
      { postName: 'Software Engineer', jobDescription: 'Software solutions...', closingDate: new Date('2024-01-10') },
      // Add more job entries
    ];
    this.totalItems = this.jobEntriesB.length;
  }



  // Temporary storage for the job the user wants to apply for before logging in
  pendingJobApplication: any = null;

  // Sample candidate data
  candidates:  any[] = [];

  // Define URL
  private loginUrl = 'http://localhost:8811/api/login';
  private logoutUrl = 'http://localhost:8811/api/logout';
  private registerUrl = 'http://localhost:8813/api/users';
  private postApiUrl = 'http://localhost:8812/api/posts';
  private applicationApiUrl = 'http://localhost:8813/api/applications';
  private userDetailsUrl = 'http://localhost:8813/api/users/username'; // Endpoint to fetch user details



// Enums for dropdowns
  businessUnits = ['ICT', 'HUMAN_CAPITAL', 'LAW_ENFORCEMENT', 'FINANCE'];
  qualifications = ['DIPLOMA', 'DEGREE', 'HONORS', 'MASTERS', 'PHD'];
  yearsOfExperience = ['1-3', '3-5', '5-7', '7+'];

  qualificationValues = Object.values(Qualification);


  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.createForms();
  }

  ngOnInit() {
    this.createForms();
    this.checkUserRole();
    this.fetchJobEntries();  // Call to fetch job entries on component load
    this.fetchCandidates();  // Fetch candidates when the component loads
    this.fetchManagers();    // Fetch managers on component load
    this.listenForPostSelection(); // Listen for post selection changes
    this.loadjobEntries();

  }


  // Add a method to listen for changes in the "Select Post" dropdown
  listenForPostSelection() {
    this.siftingForm.get('selectPost')?.valueChanges.subscribe(selectedPostName => {
      // Find the job entry with the matching post name
      const selectedJob = this.jobEntriesA.find(job => job.postName === selectedPostName);

      // Set the jobDescription field with the corresponding job description or clear it if not found
      this.siftingForm.patchValue({
        jobDescription: selectedJob ? selectedJob.jobDescription : ''
      });
    });
  }

  createForms() {
    // Job Post Form
    this.jobPostForm = this.fb.group({
      postName: ['', [Validators.required, Validators.minLength(3)]],
      jobDescription: ['', [Validators.required, Validators.minLength(10)]],
      businessUnit: ['', Validators.required],
      managerId: ['', Validators.required],
      experienceYears: ['', Validators.required],
      qualification: ['', Validators.required],
      driversLicenseRequired: ['', Validators.required],
      openingDate: ['', Validators.required],
      closingDate: ['', Validators.required]
    });

    // Login Form
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.siftingForm = this.fb.group({
      selectPost: ['', Validators.required],
      closingDate: ['', Validators.required],
      responsibleManager: ['', Validators.required],
      jobDescription: ['', Validators.required]
    });

    // Apply form fields
    this.applyForm = this.fb.group({
      qualification: ['', Validators.required],
      driversLicense: ['', Validators.required],
      currentPosition: ['', Validators.required],
      currentCompany: ['', Validators.required],
      yearsInPosition: ['', Validators.required],
      currentSalary: ['', Validators.required],
      totalExperience: ['', Validators.required],
      previousPosition: ['', Validators.required],
      previousCompany: ['', Validators.required],
      periodFrom: ['', Validators.required],
      periodTo: ['', Validators.required]
    });

    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      idNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cellphone: ['', Validators.required],
      fax: [''],
      workPhone: [''],
      streetName: ['', Validators.required],
      streetNumber: ['', Validators.required],
      city: ['', Validators.required],
      province: ['', Validators.required],
      postalCode: ['', Validators.required]
    });
  }

  // Method to open the Sifting of CVs form
  openSiftingForm() {
    this.resetForm();
    this.showSiftingForm = true;
    this.showHomeGrid = false; // Hide other views when Sifting form is shown
  }

  // showRegisterForm = false; // Add a new flag for Register form modal

// Method to open the register form modal
  openRegisterModal() {
    this.resetForm();
    this.showRegisterForm = true;
    this.showHomeGrid = false; // Hide other grids when Register form is shown
  }

// Method to close the register form
  closeRegisterForm() {
    this.showRegisterForm = false;
    this.showHomeGrid = true;
  }

  // Method to reset the form and hide all modals
  resetForm() {
    this.showLoginForm = false;
    this.showJobPostForm = false;
    this.showModalPlaceholder = false;
    this.showRegisterForm = false;
    this.showHomeGrid = true; // Ensure Home grid is shown when reset
    this.jobPostForm.reset();
    this.showSiftingForm = false;
    this.siftingForm.reset();
  }

  // Method to open the job post form
  openJobPostForm() {
    this.resetForm();
    this.showJobPostForm = true;
    this.showHomeGrid = false; // Hide grid when another form is shown
  }

  // Method to open the login form modal
  openLoginModal() {
    this.resetForm();
    this.showLoginForm = true;
    this.showHomeGrid = false; // Hide grid when another form is shown
  }

  // Method to open a placeholder modal
  openPlaceholderModal(title: string) {
    this.resetForm();
    this.showModalPlaceholder = true;
    this.showHomeGrid = false; // Hide grid when another form is shown
    this.currentModalTitle = title;
  }

  // Check if the user is logged in and set the role
  checkUserRole() {
    // Ensure sessionStorage is available before accessing it
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const token = sessionStorage.getItem('token');
      const role = sessionStorage.getItem('role');
      console.log('Stored token:', token);
      console.log('Stored role:', role);

      this.currentRole = token && role ? role : null;

      // Show admin-specific forms if role is ADMIN
      if (this.currentRole === 'ADMIN') {
        this.showSiftingForm = true;
        this.showHomeGrid = false;
      } else {
        this.showHomeGrid = true;
        this.showSiftingForm = false;
      }

    } else {
      this.currentRole = null;
    }
  }

  // Function to submit Register form data to API
  onRegister() {
    if (this.registerForm.valid && this.cvFileBase64) {  // Ensure CV file is uploaded
      this.loading = true; // Show the spinner
      const formData = this.registerForm.value;

      // First request payload for the main registration endpoint
      const registerRequestBody = {
        username: formData.username,
        password: formData.password,
        name: formData.name,
        surname: formData.surname,
        idNumber: formData.idNumber,
        cvFile: this.cvFileBase64,  // Add the base64 CV string
        address: [
          {
            streetName: formData.streetName,
            streetNumber: formData.streetNumber,
            province: formData.province,
            city: formData.city,
            postalCode: formData.postalCode
          }
        ],
        contactInfo: [
          {
            email: formData.email,
            cellphone: formData.cellphone,
            fax: formData.fax,
            workPhone: formData.workPhone
          }
        ]
      };

      // Second request payload for the user role endpoint
      const userRoleRequestBody = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: 'APPLICANT'  // Fixed role
      };

      console.log(registerRequestBody)

      // Perform the first registration request
      this.http.post(this.registerUrl, registerRequestBody).subscribe({
        next: (response: any) => {
          console.log('Registration successful:', response);
          alert('Registration successful!');
          this.closeRegisterForm();  // Close modal after successful registration
          this.registerForm.reset();  // Reset form for next use
          this.cvFileBase64 = null;  // Reset file after form submission

          // After first registration request completes, call the second API to set the user role
          this.http.post('http://localhost:8811/api/user', userRoleRequestBody).subscribe({
            next: (roleResponse: any) => {
              console.log('User role persisted successfully:', roleResponse);
              this.loading = false; // Hide the spinner after the second request completes
              this.resetForm();
              this.showHomeGrid = true; // Hide grid when another form is shown
            },
            error: (roleError: any) => {
              console.error('Failed to persist user role:', roleError);
              console.log(userRoleRequestBody)
              alert('User registration was successful, but there was an error assigning the role.');
              this.loading = false; // Hide the spinner after the second request completes
            },
            complete: () => {
              this.loading = false; // Hide the spinner after the second request completes
            }
          });
        },
        error: (error: any) => {
          console.error('Registration failed:', error);
          alert('Registration failed. Please try again.');
          this.loading = false; // Hide the spinner if the registration fails
        }
      });
    } else {
      alert('Please fill in all required fields and upload your CV.');
    }
  }


  // Method to handle login
  // API call for login
  onLogin() {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;
      console.log(loginData)
      this.http.post(this.loginUrl, loginData).subscribe({
        next: (response: any) => {
          console.log('Login successful:', response);
          // Store the token and role in session storage
          sessionStorage.setItem('token', response.token);
          sessionStorage.setItem('role', response.role);
          sessionStorage.setItem('username', response.username);


          this.currentRole = response.role; // Update role after login
          this.fetchUserDetails(response.username); // Fetch additional user details
          this.checkUserRole(); // Re-run check to update UI based on role

          this.showLoginForm = false;
          this.loginForm.reset();

          if(sessionStorage.getItem('role') === 'ADMIN') {
            this.checkUserRole(); // Re-run check to update UI based on role
            this.showSiftingForm = true;
            this.showHomeGrid = false;
          }else {
            this.showHomeGrid = true;
          }

          // If there was a pending job application, navigate directly to the apply modal
          if (this.pendingJobApplication) {
            this.showApplyModalForJob(this.pendingJobApplication);
            this.pendingJobApplication = null; // Clear the stored job data
          }

        },
        error: (error: any) => {
          console.error('Login failed:', error);
          alert('Login failed. Please check your credentials and try again.');
        }
      });
    } else {
      alert('Please fill in all required fields.');
    }
  }

  // Method to fetch user details by username and store in session storage
  fetchUserDetails(username: string) {
    const url = `${this.userDetailsUrl}/${username}`;

    this.http.get(url).subscribe({
      next: (userData: any) => {
        sessionStorage.setItem('userId', userData.userId);
        sessionStorage.setItem('name', userData.name);
        sessionStorage.setItem('surname', userData.surname);

        // Update local variables for immediate use
        this.userId = userData.userId;
        this.name = userData.name;
        this.surname = userData.surname;

        console.log('User details stored in session:', userData);
      },
      error: (error) => {
        console.error('Failed to fetch user details:', error);
        alert('Unable to retrieve user details. Please try again later.');
      }
    });
  }

  // Method to handle logout
  onLogout() {

    // Retrieve the token from sessionStorage
    const token = sessionStorage.getItem('token');
    if (!token) {
      console.log('No token found. User is not logged in.');
      return;
    }

    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    sessionStorage.clear();
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('name');
    sessionStorage.removeItem('surname');

    // Set the headers with the token
    const headers = new HttpHeaders().set('token', token);
    console.log(token);
// Make the POST request to logout endpoint with empty body and token header
    this.http.post(this.logoutUrl, {},{ headers, responseType: 'text' }).subscribe({
      next: (response) => {
        console.log('Logout successful');
        console.log(response); // Response will be plain text now
        // Clear session storage and reset role
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');
        this.currentRole = null; // Update UI to reflect logged-out state
        //this.showLoginForm = true; // Show the login modal again
        this.resetForm();
      },
      error: (error) => {
        console.error('Logout failed:', error);
      }
    });
  }


  // Method to submit the form data to the API
  onSubmit() {
    if (this.jobPostForm.valid) {
      // Convert dates to the required format
      const openingDate = formatDate(this.jobPostForm.value.openingDate, 'yyyy-MM-dd', 'en-US');
      const closingDate = formatDate(this.jobPostForm.value.closingDate, 'yyyy-MM-dd', 'en-US');

      const requestData = {
        postName: this.jobPostForm.value.postName,
        jobDescription: this.jobPostForm.value.jobDescription,
        businessUnit: this.jobPostForm.value.businessUnit,
        managerId: this.jobPostForm.value.managerId,
        experienceYears: this.jobPostForm.value.experienceYears,
        qualification: this.jobPostForm.value.qualification,
        driversLicenseRequired: this.jobPostForm.value.driversLicenseRequired === 'Yes',
        openingDate: openingDate,
        closingDate: closingDate
      };

      // Send POST request
      this.http.post(this.postApiUrl, requestData).subscribe({
        next: (response: any) => {
          console.log('Job post created successfully:', response);
          alert('Job post created successfully!');
          this.resetForm(); // Close form after submission
        },
        error: (error: any) => {
          console.error('Failed to create job post:', error);
          alert('Failed to create job post. Please try again.');
        }
      });
    } else {
      alert('Please fill in all required fields.');
    }
  }

  // Method to open the Apply Modal with dynamic job details
  openApplyModal(job: any) {
    console.log('Opening apply modal for:', job.postName);
    console.log('Opening apply modal for:', job.id);
    if (!this.currentRole) {
      // Store the job data for after login and prompt login
      this.pendingJobApplication = job;
      alert("Please log in to apply for this position.");
      this.openLoginModal();
    } else {
      // If logged in, open the application modal directly
      this.showApplyModalForJob(job);
    }
  }

  // Helper method to open apply modal for a specific job
  showApplyModalForJob(job: any) {
    this.selectedPositionName = job.postName;
    this.postId = job.id;
    this.showApplyModal = true;
  }

  // Method to close the Apply Modal
  closeApplyModal() {
    this.showApplyModal = false;  // Hide the apply modal
  }

  // Method to close the login modal and reset to home view
  closeLoginModal() {
    this.showLoginForm = false;
    this.showHomeGrid = true; // Show the home grid when login modal is closed
  }

  // Updated forgotPassword method to validate email input
  forgotPassword() {
    const emailControl = this.loginForm.get('username');
    if (emailControl && emailControl.value) {
      // Simulate sending a reset password email
      alert('Check your email for password reset instructions.');
      this.closeLoginModal(); // Close modal and return to home grid
    } else {
      alert('Please provide your email to reset the password.');
    }
  }

  // Method to submit the application form data to the API
  onApplySubmit() {
    if (this.applyForm.valid) {
      const formData = this.applyForm.value;

      const requestBody = {
        postId: this.postId,
        userId: this.userId,
        qualification: formData.qualification as Qualification,
        driversLicense: formData.driversLicense === 'Yes',
        currentPosition: formData.currentPosition,
        currentCompany: formData.currentCompany,
        yearsInPosition: +formData.yearsInPosition,
        currentSalary: +formData.currentSalary,
        totalExperience: +formData.totalExperience,
        previousPosition: formData.previousPosition,
        previousCompany: formData.previousCompany,
        periodFrom: formData.periodFrom,
        periodTo: formData.periodTo
      };

      console.log(requestBody);

      this.http.post(this.applicationApiUrl, requestBody).subscribe({
        next: (response: any) => {
          console.log('Application submitted successfully:', response);
          alert('Application submitted successfully!');
          this.closeApplyModal();
          this.applyForm.reset();
        },
        error: (error: any) => {
          console.error('Failed to submit application:', error);
          alert('Failed to submit application. Please try again.');
        }
      });
    } else {
      alert('Please fill in all required fields.');
    }
  }
  // Method to fetch job entries from the API
  fetchJobEntries() {
    this.http.get<any[]>(this.postApiUrl).subscribe({
      next: (data) => {
        this.jobEntriesA = data;  // Set the API response to jobEntries
        console.log('Job entries fetched successfully:', this.jobEntriesA);
      },
      error: (error) => {
        console.error('Failed to fetch job entries:', error);
        alert('Unable to load job entries. Please try again later.');
      }
    });
  }
  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.cvFileBase64 = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  // Method to fetch candidates for the sifting process
  fetchCandidates() {
    const siftingApiUrl = 'http://localhost:8813/api/applications/sifting';
    this.http.get<any[]>(siftingApiUrl).subscribe({
      next: (data) => {
        // Map data to desired candidate structure
        this.candidates = data.map(candidate => ({
          name: candidate.name,
          surname: candidate.surname,
          province: candidate.province,
          driversLicense: candidate.driversLicense,
          qualification: candidate.qualification2,
          experience: candidate.experiencePoints,
          totalPoints: candidate.totalPoints,
          meetRequirement: candidate.meetRequirement,
          reviewCV: candidate.reviewCV // Store base64 string for download
        }));
        console.log('Candidates fetched successfully:', this.candidates);
      },
      error: (error) => {
        console.error('Failed to fetch candidates:', error);
        alert('Unable to load candidates for sifting. Please try again later.');
      }
    });
  }

  // Method to download the CV as a PDF
  downloadCV(base64String: string, filename: string = 'CV.pdf') {
    // Check if the string contains the Base64 prefix and remove it if present
    const sanitizedBase64 = base64String.includes('base64,')
      ? base64String.split('base64,')[1]
      : base64String;

    try {
      // Decode Base64 to binary data
      const byteCharacters = atob(sanitizedBase64);
      const byteNumbers = Array.from(byteCharacters).map(char => char.charCodeAt(0));
      const byteArray = new Uint8Array(byteNumbers);

      // Create a Blob from the binary data
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      // Create a link element to download the PDF
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();

      // Cleanup URL to release memory
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Failed to decode Base64 string:', error);
      alert('Could not download CV. The file may be corrupted or incorrectly encoded.');
    }
  }

// Inside AppComponent
  managers: { id: number, name: string, surname: string, email: string }[] = []; // Store manager data

// Fetch managers from the API
  fetchManagers() {
    this.http.get<{ id: number, name: string, surname: string, email: string }[]>('http://localhost:8812/api/managers')
      .subscribe({
        next: (data) => {
          // Map data to required format: "name | surname | email"
          this.managers = data.map(manager => ({
            id: manager.id,
            name: manager.name,
            surname: manager.surname,
            email: manager.email
          }));
        },
        error: (error) => {
          console.error('Failed to fetch managers:', error);
          alert('Unable to load managers. Please try again later.');
        }
      });
  }

  // Ensure `page` is typed as number
  onPageChange(page: number) {
    this.currentPage = page;
  }
  get paginatedJobs(): JobEntry[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.jobEntriesA.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }
}
