// Motivation Board JavaScript for Productivity Hub

document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const achievementContainer = document.querySelector('.achievement-tracker');
    const currentStreakElement = document.querySelector('.text-3xl.font-bold.text-blue-600');
    const goalsCompletedElement = document.querySelector('.text-3xl.font-bold.text-green-600');
    const milestoneProgressElement = document.querySelector('.shadow-none.flex.flex-col.text-center.whitespace-nowrap.text-white.justify-center.bg-amber-500');
    const milestonePercentElement = document.querySelector('.text-right.text-amber-600.dark:text-amber-400.font-medium');
    
    // Initialize data from localStorage or set defaults
    initializeAchievementData();
    
    // Update UI with actual values
    updateAchievementTracker();
    
    // Quote rotation functionality
    setupQuoteRotation();
    
    // Vision board upload functionality
    setupVisionBoardUpload();
    
    // Initialize achievement data
    function initializeAchievementData() {
        const achievements = JSON.parse(localStorage.getItem('achievementData')) || null;
        
        if (!achievements) {
            // Default achievement data
            const defaultAchievements = {
                currentStreak: 0,
                longestStreak: 0,
                goalsCompleted: 0,
                totalGoals: 10,
                milestoneProgress: 0,
                recentAchievements: []
            };
            
            localStorage.setItem('achievementData', JSON.stringify(defaultAchievements));
            return defaultAchievements;
        }
        
        return achievements;
    }
    
    // Update achievement tracker with real data
    function updateAchievementTracker() {
        const achievements = JSON.parse(localStorage.getItem('achievementData'));
        
        if (!achievements) return;
        
        // Update current streak
        if (currentStreakElement) {
            currentStreakElement.textContent = `${achievements.currentStreak} Days`;
        }
        
        // Update goals completed
        if (goalsCompletedElement) {
            goalsCompletedElement.textContent = `${achievements.goalsCompleted}/${achievements.totalGoals}`;
        }
        
        // Update milestone progress
        if (milestoneProgressElement && milestonePercentElement) {
            milestoneProgressElement.style.width = `${achievements.milestoneProgress}%`;
            milestonePercentElement.textContent = `${achievements.milestoneProgress}%`;
        }
        
        // Update recent achievements list
        updateRecentAchievementsList(achievements.recentAchievements);
    }
    
    // Update recent achievements list
    function updateRecentAchievementsList(recentAchievements) {
        const achievementsList = document.querySelector('ul.space-y-2');
        
        if (!achievementsList || !recentAchievements) return;
        
        // Clear current list
        achievementsList.innerHTML = '';
        
        // If no achievements, show a message
        if (recentAchievements.length === 0) {
            const noAchievements = document.createElement('li');
            noAchievements.className = 'text-center text-gray-500 dark:text-gray-400 py-4';
            noAchievements.textContent = 'No recent achievements yet. Complete tasks or focus sessions to earn achievements!';
            achievementsList.appendChild(noAchievements);
            return;
        }
        
        // Add achievements to the list
        recentAchievements.forEach((achievement) => {
            const li = document.createElement('li');
            li.className = 'flex items-center';
            
            // Determine icon based on achievement type
            let iconClass = 'fas fa-star';
            let bgClass = 'bg-purple-100 dark:bg-purple-900';
            let textClass = 'text-purple-500 dark:text-purple-300';
            
            if (achievement.type === 'focus') {
                iconClass = 'fas fa-star';
                bgClass = 'bg-purple-100 dark:bg-purple-900';
                textClass = 'text-purple-500 dark:text-purple-300';
            } else if (achievement.type === 'task') {
                iconClass = 'fas fa-award';
                bgClass = 'bg-blue-100 dark:bg-blue-900';
                textClass = 'text-blue-500 dark:text-blue-300';
            } else if (achievement.type === 'milestone') {
                iconClass = 'fas fa-trophy';
                bgClass = 'bg-amber-100 dark:bg-amber-900';
                textClass = 'text-amber-500 dark:text-amber-300';
            }
            
            li.innerHTML = `
                <div class="w-8 h-8 rounded-full ${bgClass} flex items-center justify-center ${textClass} mr-3">
                    <i class="${iconClass}"></i>
                </div>
                <div>
                    <p class="font-medium">${achievement.title}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">${achievement.date}</p>
                </div>
            `;
            
            achievementsList.appendChild(li);
        });
    }
    
    // Set up quote rotation
    function setupQuoteRotation() {
        const refreshButton = document.getElementById('refresh-quotes');
        const gitaQuotes = [
            { quote: "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action. Never consider yourself the cause of the results of your activities, and never be attached to not doing your duty.", reference: "Bhagavad Gita 2.47" },
            { quote: "Whatever action is performed by a great man, common men follow in his footsteps, and whatever standards he sets by exemplary acts, all the world pursues.", reference: "Bhagavad Gita 3.21" },
            { quote: "For the soul there is never birth nor death. Nor, having once been, does he ever cease to be. He is unborn, eternal, ever-existing, undying and primeval. He is not slain when the body is slain.", reference: "Bhagavad Gita 2.20" },
            { quote: "One who sees inaction in action, and action in inaction, is intelligent among men, and he is in the transcendental position, although engaged in all sorts of activities.", reference: "Bhagavad Gita 4.18" },
            { quote: "Man is made by his belief. As he believes, so he is.", reference: "Bhagavad Gita 17.3" },
            { quote: "The mind is restless and difficult to restrain, but it is subdued by practice and detachment.", reference: "Bhagavad Gita 6.35" },
            { quote: "When meditation is mastered, the mind is unwavering like the flame of a lamp in a windless place.", reference: "Bhagavad Gita 6.19" },
            { quote: "The soul can never be cut to pieces by any weapon, nor burned by fire, nor moistened by water, nor withered by the wind.", reference: "Bhagavad Gita 2.23" },
            { quote: "It is better to perform one's own duties imperfectly than to master the duties of another.", reference: "Bhagavad Gita 18.47" },
            { quote: "Fulfill all your duties; action is better than inaction. Even to maintain your body, you are obliged to act.", reference: "Bhagavad Gita 3.8" },
            { quote: "The wise see that there is action in the midst of inaction and inaction in the midst of action.", reference: "Bhagavad Gita 4.18" },
            { quote: "From passion comes the confusion of mind, then loss of remembrance, the forgetting of duty. From this loss comes the ruin of reason, and the ruin of reason leads to destruction.", reference: "Bhagavad Gita 2.63" }
        ];
        
        if (!refreshButton) return;
        
        refreshButton.addEventListener('click', function() {
            // Add animation class
            refreshButton.classList.add('animate-spin');
            
            setTimeout(() => {
                // Get random quotes (6 of them)
                const randomQuotes = [];
                const availableQuotes = [...gitaQuotes];
                
                for (let i = 0; i < 6; i++) {
                    if (availableQuotes.length === 0) break;
                    const randomIndex = Math.floor(Math.random() * availableQuotes.length);
                    randomQuotes.push(availableQuotes[randomIndex]);
                    availableQuotes.splice(randomIndex, 1);
                }
                
                // Update the quotes in the DOM
                const quoteContainer = document.getElementById('gita-quotes');
                if (!quoteContainer) return;
                
                quoteContainer.innerHTML = '';
                
                randomQuotes.forEach(quoteObj => {
                    const quoteElement = document.createElement('div');
                    quoteElement.className = 'bg-amber-50 dark:bg-gray-700 p-4 rounded-lg shadow-inner border border-amber-100 dark:border-gray-600';
                    quoteElement.innerHTML = `
                        <blockquote class="italic text-gray-700 dark:text-gray-300 mb-2">
                            "${quoteObj.quote}"
                        </blockquote>
                        <p class="text-right text-sm text-gray-500 dark:text-gray-400 mt-2">— ${quoteObj.reference}</p>
                    `;
                    quoteContainer.appendChild(quoteElement);
                });
                
                // Remove animation class
                refreshButton.classList.remove('animate-spin');
            }, 500);
        });
    }
    
    // Set up vision board upload
    function setupVisionBoardUpload() {
        const addImageButton = document.querySelector('.bg-purple-50.dark:bg-gray-700');
        const visionBoardContainer = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.md\\:grid-cols-3');
        
        if (!addImageButton || !visionBoardContainer) return;
        
        // Load existing vision board images
        loadVisionBoardImages();
        
        addImageButton.addEventListener('click', function() {
            // Create file input
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);
            
            // Trigger file selection
            fileInput.click();
            
            // Handle file selection
            fileInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const file = this.files[0];
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        // Create vision board item
                        addVisionBoardItem(e.target.result);
                        
                        // Save to localStorage
                        saveVisionBoardImages();
                    };
                    
                    reader.readAsDataURL(file);
                }
                
                // Remove the file input
                document.body.removeChild(fileInput);
            });
        });
        
        // Function to add vision board item
        function addVisionBoardItem(imageUrl) {
            const isFirst = visionBoardContainer.children.length === 1; // Only the "Add Image" button
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'bg-purple-50 dark:bg-gray-700 p-2 rounded-lg shadow-md hover:shadow-lg transition border border-purple-100 dark:border-gray-600 vision-board-item';
            
            // Create remove button
            const removeButton = document.createElement('button');
            removeButton.className = 'absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center';
            removeButton.innerHTML = '<i class="fas fa-times"></i>';
            
            // Create image container
            const imageContainer = document.createElement('div');
            imageContainer.className = 'aspect-w-4 aspect-h-3 w-full bg-gray-200 dark:bg-gray-600 rounded-md relative overflow-hidden';
            
            // Create image
            const image = document.createElement('img');
            image.src = imageUrl;
            image.className = 'object-cover w-full h-full';
            
            // Add remove button to image container
            imageContainer.appendChild(image);
            imageContainer.appendChild(removeButton);
            
            // Add image container to item div
            itemDiv.appendChild(imageContainer);
            
            // Add caption input
            const captionInput = document.createElement('input');
            captionInput.type = 'text';
            captionInput.className = 'mt-2 w-full text-center text-sm bg-transparent border-b border-purple-200 dark:border-gray-600 focus:outline-none focus:border-purple-400 dark:focus:border-purple-500 placeholder-gray-500 dark:placeholder-gray-400';
            captionInput.placeholder = 'Add a caption...';
            itemDiv.appendChild(captionInput);
            
            // Add event listener to remove button
            removeButton.addEventListener('click', function(e) {
                e.stopPropagation();
                visionBoardContainer.removeChild(itemDiv);
                saveVisionBoardImages();
            });
            
            // Add event listener to caption input to save changes
            captionInput.addEventListener('change', saveVisionBoardImages);
            
            // Insert new item before the "Add Image" button
            visionBoardContainer.insertBefore(itemDiv, addImageButton);
        }
        
        // Function to save vision board images to localStorage
        function saveVisionBoardImages() {
            const visionBoardItems = document.querySelectorAll('.vision-board-item');
            const images = [];
            
            visionBoardItems.forEach(item => {
                const image = item.querySelector('img');
                const caption = item.querySelector('input').value;
                
                if (image) {
                    images.push({
                        src: image.src,
                        caption: caption
                    });
                }
            });
            
            localStorage.setItem('visionBoardImages', JSON.stringify(images));
        }
        
        // Function to load vision board images from localStorage
        function loadVisionBoardImages() {
            const savedImages = JSON.parse(localStorage.getItem('visionBoardImages')) || [];
            
            savedImages.forEach(image => {
                addVisionBoardItem(image.src);
                
                // Set caption if available
                const lastItem = visionBoardContainer.querySelector('.vision-board-item:last-of-type');
                if (lastItem && image.caption) {
                    lastItem.querySelector('input').value = image.caption;
                }
            });
        }
    }
    
    // Function to update achievement data
    window.updateAchievements = function(type, value) {
        const achievements = JSON.parse(localStorage.getItem('achievementData'));
        
        if (!achievements) return;
        
        switch (type) {
            case 'streak':
                achievements.currentStreak = parseInt(value);
                // Update longest streak if current streak is longer
                if (achievements.currentStreak > achievements.longestStreak) {
                    achievements.longestStreak = achievements.currentStreak;
                }
                break;
            case 'goal':
                achievements.goalsCompleted = parseInt(value);
                break;
            case 'milestone':
                achievements.milestoneProgress = parseInt(value);
                break;
            case 'addAchievement':
                if (achievements.recentAchievements.length >= 10) {
                    achievements.recentAchievements.pop();
                }
                
                achievements.recentAchievements.unshift(value);
                break;
        }
        
        localStorage.setItem('achievementData', JSON.stringify(achievements));
        updateAchievementTracker();
    };
    
    // Function to show toast notification
    function showToast(message, type = 'success') {
        // Check if a toast container exists, if not create one
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'fixed bottom-4 right-4 z-50';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `mb-2 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-4 py-2 rounded-lg shadow-lg transform transition-all duration-500 opacity-0 translate-y-8`;
        toast.textContent = message;
        toastContainer.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.remove('opacity-0', 'translate-y-8');
        }, 10);
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-8');
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 500);
        }, 3000);
    }
});