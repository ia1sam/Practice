import { Injectable } from '@angular/core';
import { User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class SortService {
  sortBy(users: User[], column: keyof User, sortDirection: 'asc' | 'desc'): User[] {
    return [...users].sort((a, b) => {
      const valueA = a[column];
      const valueB = b[column];

      if (column === 'id') {
        const numA = valueA != null ? Number(valueA) : 0;
        const numB = valueB != null ? Number(valueB) : 0;
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      } else if (column === 'data') {
        const dateA = isNaN(new Date(valueA).getTime()) ? 0 : new Date(valueA).getTime();
        const dateB = isNaN(new Date(valueB).getTime()) ? 0 : new Date(valueB).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const strA = valueA != null ? String(valueA).toLowerCase() : '';
        const strB = valueB != null ? String(valueB).toLowerCase() : '';
        return sortDirection === 'asc'
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      }
    });
  }
}