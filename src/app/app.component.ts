import { Component, OnInit } from '@angular/core';
import { Employee } from './employee';
import { EmployeeService } from './employee.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{

  public employees: Employee[] = [];
  public editEmployee: Employee | null = null; // Now can be null
  public deleteEmployee: Employee | null = null; // Now can be null
  notFoundMessage: string = '';

  constructor(
    private employeeService: EmployeeService,
    private dialog: MatDialog
  ){}

  ngOnInit() {
    this.getEmployees();
  }

  public getEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next : (data: Employee[]) => {
        this.employees = data;
        console.log(this.employees);
      },
      error :(err)=> {
        alert('get dont work');
      }
    
    
    });
      
     
  }
  public onAddEmployee(addForm: NgForm): void {
    if (addForm.valid) {
      console.log("form add",addForm.value);
      this.employeeService.addEmployee(addForm.value).subscribe({
        next: (response) => {
          console.log('Employee added:', response); // Log the response to see what's returned
          this.getEmployees(); // Refresh the list of employees
          this.closeModal('addEmployeeModal'); // Use a method to close modal for better abstraction
          addForm.reset(); // Reset the form to clear the inputs
        },
        error: (error: HttpErrorResponse) => {
          console.error('Failed to add employee:', error.error); // Logging the error object for more info
          alert(`Failed to add employee: ${error.statusText} (${error.status})`); // More informative error message
          addForm.reset(); // Reset the form even in case of error
        }
      });
    } else {
      alert('Form is not valid, please check your input.'); // Additional check for form validity
    }
  }
  private closeModal(modalId: string): void {
    const dialogRef = this.dialog.getDialogById(modalId);
    if (dialogRef) {
      dialogRef.close();
    } else {
      console.warn(`Dialog with id ${modalId} not found`);
    }
  }
  public onUpdateEmloyee(employee: Employee): void {
    this.employeeService.updateEmployee(employee).subscribe({
      next : (data: Employee) => {
        console.log(data);
        this.getEmployees();
      },
      error:(err :HttpErrorResponse) => {
        alert(err.message);
      }
    }
      
    );
  }

  public onDeleteEmployee(employeeId: number | undefined): void {
    if (employeeId === undefined) {
      console.error("Tried to delete an employee without an ID");
      return; // Retourner ou afficher un message d'erreur
    }
    this.employeeService.deleteEmployee(employeeId).subscribe({
      next: (response: void) => {
        console.log(response);
        this.getEmployees();
      },
      error: (error: HttpErrorResponse) => {
        alert(error.message);
      }
    });
  }
  

  public searchEmployees(key: string): void {
    console.log(key);
    const results: Employee[] = [];
    for (const employee of this.employees) {
      if (employee.name.toLowerCase().indexOf(key.toLowerCase()) !== -1
      || employee.email.toLowerCase().indexOf(key.toLowerCase()) !== -1
      || employee.phone.toLowerCase().indexOf(key.toLowerCase()) !== -1
      || employee.jobTitle.toLowerCase().indexOf(key.toLowerCase()) !== -1) {
        results.push(employee);
      }
    }
    this.employees = results;
    if (results.length === 0 || !key) {
      this.getEmployees();
      if (results.length === 0 && key.trim() !== '') {
        this.notFoundMessage = 'No employees found matching your search ';
       
      } else {
        this.notFoundMessage = ''; // reset message when there are results or empty key
      }
    }
  }

  public onOpenModal(employee: Employee | null, mode: string): void {
    const container = document.getElementById('main-container');
    if (!container) {
      console.error("Container element with ID 'main-container' not found.");
      return;
    }
  
    const button = document.createElement('button');
    button.type = 'button';
    button.hidden = true;  // Utilisation de `hidden` plutôt que `style.display = 'none'`
    button.setAttribute('data-toggle', 'modal');
  
    switch (mode) {
      case 'add':
        button.setAttribute('data-target', '#addEmployeeModal');
        break;
      case 'edit':
        this.editEmployee = employee;
        button.setAttribute('data-target', '#updateEmployeeModal');
        break;
      case 'delete':
        this.deleteEmployee = employee;
        button.setAttribute('data-target', '#deleteEmployeeModal');
        break;
    }
  
    container.appendChild(button);
    button.click();
    container.removeChild(button); // Nettoyer en enlevant le bouton après utilisation
  }
  



}