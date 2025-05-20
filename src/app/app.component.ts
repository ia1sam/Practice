import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from './user.model';
import { SortService } from './sort.service';
import { UserService } from './user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  users: User[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  itemsPerPageOptions: number[] = [5];
  editingUser: User | null = null;
  editedUser: User | null = null;
  isLoading: boolean = false;
  sortColumn: keyof User | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private userService: UserService, private sortService: SortService) {}
  

  get displayedUsers(): User[] {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.users.length);
    return this.users.slice(startIndex, endIndex);
  }

   get totalPages(): number {
    return Math.ceil(this.users.length / this.itemsPerPage) || 1;
  }

  get startItemIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endItemIndex(): number {
    return Math.min(this.startItemIndex + this.itemsPerPage, this.users.length);
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    this.users = [...this.users];
    console.log('Items per page changed:', this.itemsPerPage, 'Current page reset to:', this.currentPage);
  }

  openFileDialog() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.click();
  }

  readFile(file: File): Promise<User[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const jsonData = JSON.parse(reader.result as string);
        const normalizedData = Array.isArray(jsonData) ? jsonData : [jsonData];
        const users: User[] = normalizedData.map((item: any) => ({
          ...item,
          id: Number(item.id) || 0,
        }));
        resolve(users); 
      } catch (error) {
        console.error('Ошибка при парсинге JSON:', error);
        reject(error);
      }
    };
    reader.onerror = () => {
      console.error('Ошибка при чтении файла');
      reject(new Error('File reading error'));
    };
    reader.readAsText(file);
  });
}

  onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.users = [];
    this.currentPage = 1;
    this.editingUser = null;
    this.editedUser = null;
    this.isLoading = true;

    const files = Array.from(input.files);
    Promise.all(files.map(file => this.readFile(file)))
      .then((results) => {
        
        const newUsers = results.flat(); 
        this.users = newUsers;           
        this.isLoading = false;
      })
      .catch(() => {
        this.isLoading = false;
      });

    input.value = '';
  }
}

  nextPage() {
  if (this.currentPage < this.totalPages) {
    this.cancelEdit();
    this.currentPage++;
  }
}

  prevPage() {
  if (this.currentPage > 1) {
    this.cancelEdit();
    this.currentPage--;
  }
}

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  editUser(user: User) {
    this.editingUser = user;
    this.editedUser = { ...user };
  }

  saveUser() {
    if (this.editingUser && this.editedUser) {
      const index = this.users.findIndex(u => u.id === this.editingUser!.id);
      if (index !== -1) {
        this.users[index] = { ...this.editedUser };
        this.users = [...this.users];
      }
      this.cancelEdit();
    }
  }

  cancelEdit() {
    this.editingUser = null;
    this.editedUser = null;
  }

  sortBy(column: keyof User) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.users = this.sortService.sortBy(this.users, this.sortColumn, this.sortDirection);
  }
}