const axios = require('axios');

const API_BASE_URL = 'http://localhost:8080/api';

async function runTest() {
    try {
        // 1. Create Material
        console.log('Creating material...');
        const materialResponse = await axios.post(`${API_BASE_URL}/materials`, {
            name: 'Test Material',
            description: 'A material for testing',
            unit: 'kg',
            quantity: 100
        });
        const materialId = materialResponse.data.id;
        console.log('Material created:', materialResponse.data);

        // 2. Create Component
        console.log('Creating component...');
        const componentResponse = await axios.post(`${API_BASE_URL}/components`, {
            name: 'Test Component',
            description: 'A component for testing',
            material_id: materialId,
            quantity_needed: 10,
            sku: 'TC-001'
        });
        const componentId = componentResponse.data.id;
        console.log('Component created:', componentResponse.data);

        // 3. Create Model
        console.log('Creating model...');
        const modelResponse = await axios.post(`${API_BASE_URL}/models`, {
            name: 'Test Model',
            description: 'A model for testing',
            components: [{ component_id: componentId, quantity: 1 }]
        });
        const modelId = modelResponse.data.id;
        console.log('Model created:', modelResponse.data);

        // 4. Create Inventory Item
        console.log('Creating inventory item...');
        const inventoryResponse = await axios.post(`${API_BASE_URL}/inventory`, {
            model_id: modelId,
            quantity: 1,
            production_date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
        });
        const inventoryItemId = inventoryResponse.data.id;
        console.log('Inventory item created:', inventoryResponse.data);

        // 5. Update Inventory Item Production Date
        console.log('Updating inventory item production date...');
        const newProductionDate = '2025-01-01';
        const updateResponse = await axios.put(`${API_BASE_URL}/inventory/${inventoryItemId}`, {
            production_date: newProductionDate
        });
        console.log('Inventory item updated:', updateResponse.data);

    } catch (error) {
        console.error('Error during test script execution:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

runTest();