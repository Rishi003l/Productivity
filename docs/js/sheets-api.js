// Google Sheets API Integration for Productivity Hub

// Configuration
const SHEETS_API_KEY = "process.env.SHEETS-API_JS_API_KEY";
const SPREADSHEET_ID = "1fYcWHxZCOwgHpCpc4uta7piHMDHDsnkU8SePYIr2Wao";
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

let sheetsAPIInitialized = false;

// Initialize the Sheets API client
function initializeSheetsAPI() {
    if (sheetsAPIInitialized) return Promise.resolve();
    
    return new Promise((resolve, reject) => {
        // Load the API client library
        gapi.load('client', () => {
            gapi.client.init({
                apiKey: SHEETS_API_KEY,
                discoveryDocs: DISCOVERY_DOCS
            }).then(() => {
                sheetsAPIInitialized = true;
                console.log('Sheets API initialized');
                resolve();
            }).catch(error => {
                console.error('Error initializing Sheets API:', error);
                reject(error);
            });
        });
    });
}

// Function to create or verify the UserData sheet exists
async function ensureUserDataSheetExists() {
    try {
        // First, check if the sheet exists
        const response = await gapi.client.sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID
        });
        
        const sheets = response.result.sheets || [];
        const userDataSheet = sheets.find(sheet => sheet.properties.title === 'UserData');
        
        if (!userDataSheet) {
            // Sheet doesn't exist, create it
            await gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: SPREADSHEET_ID,
                resource: {
                    requests: [{
                        addSheet: {
                            properties: {
                                title: 'UserData'
                            }
                        }
                    }]
                }
            });
            
            // Add header row
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: 'UserData!A1:C1',
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [['User', 'Metric', 'Value']]
                }
            });
            
            console.log('UserData sheet created');
        }
        
        return true;
    } catch (error) {
        console.error('Error ensuring UserData sheet exists:', error);
        return false;
    }
}

// Function to save activity data to Google Sheets for current user
async function saveActivityToSheets(user, activityType, activityDetails) {
    if (!sheetsAPIInitialized) {
        try {
            await initializeSheetsAPI();
        } catch (error) {
            console.error('Could not initialize Sheets API', error);
            return false;
        }
    }
    
    try {
        // Ensure sheet exists
        await ensureUserDataSheetExists();
        
        // Format the data for the sheet
        const timestamp = new Date().toISOString();
        const values = [
            [user, `Activity_${activityType}`, JSON.stringify({
                timestamp,
                details: activityDetails
            })]
        ];
        
        // Append to the UserData sheet
        const response = await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'UserData!A:C',
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: values
            }
        });
        
        console.log('Activity saved to Google Sheets:', response);
        return true;
    } catch (error) {
        console.error('Error saving to Google Sheets:', error);
        return false;
    }
}

// Function to increment a metric for the user
async function incrementMetric(user, metricName, amount = 1) {
    if (!sheetsAPIInitialized) {
        try {
            await initializeSheetsAPI();
        } catch (error) {
            console.error('Could not initialize Sheets API', error);
            return false;
        }
    }
    
    try {
        // Get current value
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'UserData!A:C'
        });
        
        const rows = response.result.values || [];
        let currentValue = 0;
        let rowIndex = -1;
        
        // Find the row with this user and metric
        for (let i = 0; i < rows.length; i++) {
            if (rows[i][0] === user && rows[i][1] === metricName) {
                currentValue = parseInt(rows[i][2]) || 0;
                rowIndex = i + 1; // +1 because sheets are 1-indexed
                break;
            }
        }
        
        // Increment value
        const newValue = currentValue + amount;
        
        if (rowIndex > 0) {
            // Update existing row
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `UserData!C${rowIndex}`,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [[newValue.toString()]]
                }
            });
        } else {
            // Add new row
            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: 'UserData!A:C',
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS',
                resource: {
                    values: [[user, metricName, newValue.toString()]]
                }
            });
        }
        
        console.log(`Incremented ${metricName} for ${user} to ${newValue}`);
        return newValue;
    } catch (error) {
        console.error('Error incrementing metric:', error);
        return false;
    }
}

// Function to save a pomodoro timer session
async function savePomodoroSession(userName, duration, task) {
    // Increment the pomodoro count
    await incrementMetric(userName, 'Pomodoro Sessions');
    
    // Add focus minutes
    await incrementMetric(userName, 'Focus Minutes', duration);
    
    // Record the specific activity
    return saveActivityToSheets(userName, 'pomodoro', {
        duration,
        task,
        completed: true,
        timestamp: new Date().toISOString()
    });
}

// Function to save completed task
async function saveCompletedTask(userName, taskName) {
    // Increment the task completion count
    await incrementMetric(userName, 'Tasks Completed');
    
    // Record the specific task
    return saveActivityToSheets(userName, 'task', {
        name: taskName,
        completed: true,
        timestamp: new Date().toISOString()
    });
}

// Make functions available globally
window.sheetsAPI = {
    init: initializeSheetsAPI,
    saveActivity: saveActivityToSheets,
    incrementMetric,
    savePomodoroSession,
    saveCompletedTask
};