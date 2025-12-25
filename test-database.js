// Test script to verify database functionality
import { getConnection } from './src/lib/database/connection.js';
import { initializeDatabase } from './src/lib/database/schema.js';
import { DataService } from './src/lib/services/dataService.js';

// Polyfill for localStorage
import { LocalStorage } from 'node-localstorage';
global.localStorage = new LocalStorage('./scratch');

async function testDatabase() {
    try {
        console.log('Testing database functionality...');
        
        // Initialize database
        initializeDatabase();
        console.log('✓ Database initialized');
        
        // Get data service
        const dataService = DataService.getInstance();
        console.log('✓ Data service created');
        
        // Test patient operations
        const testPatient = {
            first_name: 'Test',
            last_name: 'Patient',
            birth_date: '1980-01-01',
            address: 'Teststraße 1',
            phone: '123456789',
            insurance: 'Test Krankenkasse',
            diagnosis: 'Test Diagnose',
            notes: 'Test Notizen'
        };
        
        const createdPatient = dataService.createPatient(testPatient, 1);
        console.log('✓ Patient created:', createdPatient.id);
        
        const patients = dataService.getPatients();
        console.log('✓ Patients retrieved:', patients.length);
        
        const patientById = dataService.getPatientById(createdPatient.id);
        console.log('✓ Patient by ID retrieved:', patientById.first_name);
        
        // Test update
        patientById.first_name = 'Updated';
        const updatedPatient = dataService.updatePatient(createdPatient.id, patientById, 1);
        console.log('✓ Patient updated:', updatedPatient.first_name);
        
        // Test delete
        const deleted = dataService.deletePatient(createdPatient.id, 1);
        console.log('✓ Patient deleted:', deleted);
        
        console.log('\n🎉 All database tests passed!');
        
    } catch (error) {
        console.error('❌ Database test failed:', error);
        process.exit(1);
    }
}

testDatabase();