// ZIP Downloader functionality for Productivity Hub

document.addEventListener('DOMContentLoaded', () => {
    const downloadButton = document.getElementById('download-code-btn');
    
    downloadButton.addEventListener('click', async () => {
        try {
            showToast('Preparing ZIP file...', 'success');
            
            // Create a new JSZip instance
            const zip = new JSZip();
            
            // Files to include in the ZIP (adjust based on your actual file structure)
            const filesToInclude = [
                { path: 'index.html', folder: '' },
                { path: 'ai-assistant.html', folder: '' },
                { path: 'css/styles.css', folder: 'css' },
                { path: 'js/main.js', folder: 'js' },
                { path: 'js/theme.js', folder: 'js' },
                { path: 'js/gemini-api.js', folder: 'js' },
                { path: 'js/ai-assistant.js', folder: 'js' },
                { path: 'js/oauth.js', folder: 'js' },
                { path: 'js/sheets-api.js', folder: 'js' },
                { path: 'js/zip-downloader.js', folder: 'js' },
                { path: 'README.md', folder: '' },
                // Add other files as needed
            ];
            
            // Fetch all files and add them to the ZIP
            await Promise.all(filesToInclude.map(async (file) => {
                try {
                    const response = await fetch(file.path);
                    if (!response.ok) throw new Error(`Failed to fetch ${file.path}`);
                    
                    const content = await response.text();
                    
                    // Add file to the appropriate folder in the ZIP
                    if (file.folder) {
                        zip.file(`productivity-hub/${file.path}`, content);
                    } else {
                        zip.file(`productivity-hub/${file.path}`, content);
                    }
                } catch (error) {
                    console.error(`Error fetching ${file.path}:`, error);
                }
            }));
            
            // Create README.md file with project information (already included in filesToInclude)
            
            // Generate the ZIP file
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            
            // Save the ZIP file using FileSaver.js
            saveAs(zipBlob, 'productivity-hub-code.zip');
            
            showToast('ZIP file downloaded successfully!', 'success');
        } catch (error) {
            console.error('Error creating ZIP file:', error);
            showToast('Error creating ZIP file. See console for details.', 'error');
        }
    });
});