// Simple data persistence layer using localStorage with backup capabilities
export class DataStore {
  private static instance: DataStore;
  private backupKey = 'ai_teacher_backup';
  
  static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore();
    }
    return DataStore.instance;
  }

  // Save data with automatic backup
  save(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      this.createBackup();
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  // Load data with fallback
  load(key: string, defaultValue: any = null): any {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Failed to load data:', error);
      return defaultValue;
    }
  }

  // Create automatic backup of all app data
  private createBackup(): void {
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        data: {
          users: this.load('users', []),
          study_materials: this.load('study_materials', []),
          tests: this.load('tests', []),
          test_submissions: this.load('test_submissions', []),
          ai_analyses: this.load('ai_analyses', []),
        }
      };
      localStorage.setItem(this.backupKey, JSON.stringify(backup));
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  }

  // Export all data as downloadable JSON
  exportData(): string {
    const backup = this.load(this.backupKey, {});
    return JSON.stringify(backup, null, 2);
  }

  // Import data from backup
  importData(backupData: string): boolean {
    try {
      const backup = JSON.parse(backupData);
      if (backup.data) {
        Object.keys(backup.data).forEach(key => {
          this.save(key, backup.data[key]);
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // Clear all data
  clearAll(): void {
    const keysToKeep = ['user', 'authToken']; // Keep authentication
    Object.keys(localStorage).forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
  }

  // Get storage usage
  getStorageInfo(): { used: number; available: number; percentage: number } {
    let used = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length;
      }
    }
    
    const available = 5 * 1024 * 1024; // 5MB typical limit
    const percentage = (used / available) * 100;
    
    return { used, available, percentage };
  }
}

// Specialized data managers
export class StudyMaterialManager {
  private dataStore = DataStore.getInstance();
  private key = 'study_materials';

  save(material: any): void {
    const materials = this.getAll();
    const existingIndex = materials.findIndex((m: any) => m.id === material.id);
    
    if (existingIndex >= 0) {
      materials[existingIndex] = material;
    } else {
      materials.push(material);
    }
    
    this.dataStore.save(this.key, materials);
  }

  getAll(): any[] {
    return this.dataStore.load(this.key, []);
  }

  getByTeacher(teacherId: string): any[] {
    return this.getAll().filter(material => material.teacherId === teacherId);
  }

  getById(id: string): any | null {
    return this.getAll().find(material => material.id === id) || null;
  }

  delete(id: string): boolean {
    const materials = this.getAll();
    const filtered = materials.filter(material => material.id !== id);
    if (filtered.length !== materials.length) {
      this.dataStore.save(this.key, filtered);
      return true;
    }
    return false;
  }
}

export class TestManager {
  private dataStore = DataStore.getInstance();
  private key = 'tests';

  save(test: any): void {
    const tests = this.getAll();
    const existingIndex = tests.findIndex((t: any) => t.id === test.id);
    
    if (existingIndex >= 0) {
      tests[existingIndex] = test;
    } else {
      tests.push(test);
    }
    
    this.dataStore.save(this.key, tests);
  }

  getAll(): any[] {
    return this.dataStore.load(this.key, []);
  }

  getByTeacher(teacherId: string): any[] {
    return this.getAll().filter(test => test.teacherId === teacherId);
  }

  getActiveTests(): any[] {
    return this.getAll().filter(test => test.status === 'active');
  }

  getById(id: string): any | null {
    return this.getAll().find(test => test.id === id) || null;
  }
}

export class SubmissionManager {
  private dataStore = DataStore.getInstance();
  private key = 'test_submissions';

  save(submission: any): void {
    const submissions = this.getAll();
    const existingIndex = submissions.findIndex((s: any) => s.id === submission.id);
    
    if (existingIndex >= 0) {
      submissions[existingIndex] = submission;
    } else {
      submissions.push(submission);
    }
    
    this.dataStore.save(this.key, submissions);
  }

  getAll(): any[] {
    return this.dataStore.load(this.key, []);
  }

  getByTest(testId: string): any[] {
    return this.getAll().filter(submission => submission.testId === testId);
  }

  getByStudent(studentId: string): any[] {
    return this.getAll().filter(submission => submission.studentId === studentId);
  }
}

export class AnalysisManager {
  private dataStore = DataStore.getInstance();
  private key = 'ai_analyses';

  save(analysis: any): void {
    const analyses = this.getAll();
    const existingIndex = analyses.findIndex((a: any) => a.id === analysis.id);
    
    if (existingIndex >= 0) {
      analyses[existingIndex] = analysis;
    } else {
      analyses.push(analysis);
    }
    
    this.dataStore.save(this.key, analyses);
  }

  getAll(): any[] {
    return this.dataStore.load(this.key, []);
  }

  getByTest(testId: string): any[] {
    return this.getAll().filter(analysis => analysis.testId === testId);
  }

  getLatest(): any | null {
    const analyses = this.getAll();
    return analyses.length > 0 ? analyses[analyses.length - 1] : null;
  }
}