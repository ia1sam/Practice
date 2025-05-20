import { Injectable } from '@angular/core';
import { User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  readFile(file: File): Promise<User[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const jsonData = JSON.parse(reader.result as string);
          const normalizedData = Array.isArray(jsonData) ? jsonData : [jsonData];
          const users = normalizedData.map((item: any) => ({
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

  async handleFileSelection(files: File[]): Promise<User[]> {
    const userArrays = await Promise.all(files.map(file => this.readFile(file)));
    return userArrays.flat();
  }
}