document.addEventListener('DOMContentLoaded', function() {
    // Get references to DOM elements
    const scrapeButton = document.getElementById('scrapeButton');
    const summarizeButton = document.getElementById('summarizeButton');
    const analyzeButton = document.getElementById('analyzeButton');
    const urlInput = document.getElementById('youtubeUrl');
    const resultsDiv = document.getElementById('results');
    const commentsBody = document.getElementById('commentsBody');

    // API key for YouTube Data API
    const API_KEY = 'AIzaSyDvF8PuS9QBmd3Rk6aY9Y1LWcwSvzKLFTI'; // Retrieve API key from environment variable

    // Function to fetch comments from YouTube API
    async function fetchComments(videoId) {
        const apiUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&videoId=${videoId}&key=${API_KEY}&maxResults=100`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Raw API response:', data);
            return data;
        } catch (error) {
            console.error('Error fetching comments:', error);
            throw error;
        }
    }

    // Function to extract video ID from YouTube URL
    function extractVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            return match[2]; // Return the video ID
        } else {
            console.error('Error: Invalid YouTube URL', url);
            return null; // Return null if URL is invalid
        }
    }

    // Function to display comments in the results section
    function displayComments(commentsData) {
        commentsBody.innerHTML = ''; // Clear existing comments

        // Sort comments by like count in descending order
        const sortedComments = commentsData.items.sort((a, b) => 
            b.snippet.topLevelComment.snippet.likeCount - a.snippet.topLevelComment.snippet.likeCount
        );

        // Create a table row for each comment
        sortedComments.forEach(item => {
            const comment = item.snippet.topLevelComment.snippet;
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${comment.authorDisplayName}</td>
                <td>${comment.textDisplay}</td>
                <td>${comment.likeCount}</td>
                <td>${item.snippet.totalReplyCount}</td>
                <td>${new Date(comment.publishedAt).toLocaleString()}</td>
            `;

            commentsBody.appendChild(row); // Append the row to the comments body
        });
    }

    // Function to summarize comments using AI
    async function summarizeComments(comments) {
        console.log('Entering summarizeComments function');
        const canSummarize = await ai.summarizer.capabilities();
        console.log('Summarizer capabilities:', canSummarize);
        if (canSummarize && canSummarize.available !== 'no') {
            let summarizer;
            try {
                console.log('Creating summarizer');
                summarizer = await ai.summarizer.create();
                if (canSummarize.available !== 'readily') {
                    summarizer.addEventListener('downloadprogress', (e) => {
                        console.log(`Download progress: ${e.loaded}/${e.total}`);
                    });
                    console.log('Waiting for summarizer to be ready');
                    await summarizer.ready; // Wait for the summarizer to be ready
                }

                console.log('Preparing comments for summarization');
                let commentsText = comments.map(comment => comment.snippet.topLevelComment.snippet.textDisplay).join('\n');
                console.log('Comments text length:', commentsText.length);
                
                // Check if the input text is too long
                const maxCharacters = 4000; // Approximately 1024 tokens
                if (commentsText.length > maxCharacters) {
                    console.warn('Input text is too long, truncating to 4000 characters');
                    commentsText = commentsText.slice(0, maxCharacters); // Truncate if too long
                }
                
                console.log('Sample of comments:', commentsText.slice(0, 500) + '...');
                console.log('Calling summarizer.summarize');
                const result = await summarizer.summarize(commentsText, {
                    prompt: "Summarize the following YouTube comments into these categories: Complaints, Pain Points, User Requests, and Insights. For each category, provide a bullet-point list of the main points. If a category doesn't have any relevant points, you can omit it."
                });
                console.log('Summarization result:', result);
                return result; // Return the summary result
            } catch (error) {
                console.error('Error in summarizeComments function:', error);
                throw error;
            } finally {
                if (summarizer) {
                    console.log('Destroying summarizer');
                    summarizer.destroy(); // Clean up the summarizer
                }
            }
        } else {
            console.error('Summarizer is not available');
            throw new Error('Summarizer is not available');
        }
    }

    // Function to analyze comments using AI
    async function analyzeCommentsWithAI(commentsText) {
        console.log('Entering analyzeCommentsWithAI function');
        const canUseAssistant = await ai.languageModel.capabilities();
        console.log('Assistant capabilities:', canUseAssistant);
        if (canUseAssistant && canUseAssistant.available !== 'no') {
            let session;
            try {
                console.log('Creating assistant session');
                session = await ai.languageModel.create();
                if (canUseAssistant.available !== 'readily') {
                    session.addEventListener('downloadprogress', (e) => {
                        console.log(`Download progress: ${e.loaded}/${e.total}`);
                    });
                    console.log('Waiting for assistant to be ready');
                    await session.ready; // Wait for the assistant to be ready
                }

                console.log('Preparing comments for analysis');
                const maxCharacters = 4000; // Approximately 1024 tokens
                if (commentsText.length > maxCharacters) {
                    console.warn('Input text is too long, truncating to 4000 characters');
                    commentsText = commentsText.slice(0, maxCharacters); // Truncate if too long
                }
                
                console.log('Sample of comments:', commentsText.slice(0, 500) + '...');
                console.log('Calling assistant.prompt');
                const result = await session.prompt(
                    "Analyze the text and segregate pointwise into Complaints, Pain Points, User Requests, and Other insights. For each category, provide a bullet-point list of the main points. If a category doesn't have any relevant points, you can omit it.\n\n" + commentsText
                );
                console.log('Analysis result:', result);
                return result; // Return the analysis result
            } catch (error) {
                console.error('Error in analyzeCommentsWithAI function:', error);
                throw error;
            } finally {
                if (session) {
                    console.log('Destroying assistant session');
                    session.destroy(); // Clean up the assistant session
                }
            }
        } else {
            console.error('Assistant is not available');
            throw new Error('Assistant is not available');
        }
    }

    // Function to display the analysis results
    function displayAnalysis(analysis) {
        const analysisContainer = document.createElement('div');
        analysisContainer.className = 'analysis-container';
        
        const analysisTitle = document.createElement('h2');
        analysisTitle.className = 'analysis-title';
        analysisTitle.textContent = 'AI Analysis of Comments:';
        analysisContainer.appendChild(analysisTitle);
        
        if (!analysis || analysis.trim() === '') {
            const errorMessage = document.createElement('p');
            errorMessage.className = 'text-danger';
            errorMessage.textContent = 'No analysis generated. The AI might not have produced any output.';
            analysisContainer.appendChild(errorMessage);
        } else {
            try {
                // Format and structure the analysis text
                const sections = analysis.split(/(?=Complaints:|Pain Points:|User Requests:|Other insights:)/g);
                
                sections.forEach(section => {
                    if (section.trim()) {
                        const titleMatch = section.match(/^(.*?):/);
                        if (titleMatch) {
                            // Create section title
                            const sectionTitle = document.createElement('h3');
                            sectionTitle.className = 'category-title';
                            sectionTitle.textContent = titleMatch[1].trim();
                            analysisContainer.appendChild(sectionTitle);

                            // Get content after the title
                            let content = section.replace(titleMatch[0], '').trim();
                            
                            // Split content into bullet points
                            let points = content
                                .split(/[\n•*-]/)
                                .map(point => point.trim())
                                .filter(point => point.length > 0);

                            if (points.length > 0) {
                                const bulletList = document.createElement('ul');
                                bulletList.className = 'analysis-list';
                                
                                points.forEach(point => {
                                    const listItem = document.createElement('li');
                                    listItem.className = 'analysis-item';
                                    listItem.textContent = point;
                                    bulletList.appendChild(listItem);
                                });
                                
                                analysisContainer.appendChild(bulletList);
                            }
                        }
                    }
                });

                // If no sections were created, display the raw text
                if (analysisContainer.children.length <= 1) {
                    const rawText = document.createElement('p');
                    rawText.textContent = analysis;
                    analysisContainer.appendChild(rawText);
                }
            } catch (error) {
                console.error('Error formatting analysis:', error);
                const rawText = document.createElement('p');
                rawText.textContent = analysis;
                analysisContainer.appendChild(rawText);
            }
        }

        // Clear previous results and add the new analysis container
        resultsDiv.innerHTML = '';
        resultsDiv.appendChild(analysisContainer);
    }

    // Event listener for the scrape button
    scrapeButton.addEventListener('click', async function() {
        const url = urlInput.value.trim();
        if (url === '') {
            resultsDiv.innerHTML = '<p class="text-danger">Please enter a YouTube URL.</p>';
            console.error('Error: No URL entered');
            return; // Exit if no URL is entered
        }

        const videoId = extractVideoId(url);
        if (videoId) {
            console.log('Extracted Video ID:', videoId);
            resultsDiv.innerHTML = `<p class="text-success">Video ID extracted: ${videoId}</p>`;

            try {
                const commentsData = await fetchComments(videoId);
                resultsDiv.innerHTML += '<p class="text-success">Comments fetched successfully.</p>';
                displayComments(commentsData); // Display fetched comments
                summarizeButton.style.display = 'inline-block'; // Show the summarize button
                analyzeButton.style.display = 'inline-block'; // Show the analyze button
            } catch (error) {
                resultsDiv.innerHTML += `<p class="text-danger">Error fetching comments: ${error.message}</p>`;
            }
        } else {
            resultsDiv.innerHTML = '<p class="text-danger">Invalid YouTube URL. Please enter a valid URL.</p>';
        }
    });

    // Event listener for the summarize button
    summarizeButton.addEventListener('click', async function() {
        try {
            console.log('Summarize button clicked');
            const comments = Array.from(commentsBody.querySelectorAll('tr'))
                .map(row => ({
                    snippet: {
                        topLevelComment: {
                            snippet: {
                                textDisplay: row.querySelector('td:nth-child(2)').textContent,
                                likeCount: parseInt(row.querySelector('td:nth-child(3)').textContent, 10)
                            }
                        }
                    }
                }))
                .sort((a, b) => b.snippet.topLevelComment.snippet.likeCount - a.snippet.topLevelComment.snippet.likeCount)
                .slice(0, 30); // Get top 30 most liked comments

            console.log('Number of comments to summarize:', comments.length);
            resultsDiv.innerHTML = '<p class="text-info">Summarizing top 30 most-liked comments...</p>';
            const summary = await summarizeComments(comments);
            console.log('Generated summary:', summary); // Log the raw summary

            // Create a new container for the summary
            const summaryContainer = document.createElement('div');
            summaryContainer.className = 'summary-container';

            // Add the title
            const summaryTitle = document.createElement('h2');
            summaryTitle.className = 'summary-title';
            summaryTitle.textContent = 'Summary of top 30 most-liked comments:';
            summaryContainer.appendChild(summaryTitle);

            if (!summary || summary.trim() === '') {
                const errorMessage = document.createElement('p');
                errorMessage.className = 'text-danger';
                errorMessage.textContent = 'No summary generated. The AI might not have produced any output.';
                summaryContainer.appendChild(errorMessage);
            } else {
                // Display the raw summary directly
                const rawSummary = document.createElement('p');
                rawSummary.textContent = summary; // Show the raw summary
                summaryContainer.appendChild(rawSummary);
            }

            // Clear previous results and add the new summary container
            resultsDiv.innerHTML = '';
            resultsDiv.appendChild(summaryContainer);
            console.log('Summary added to resultsDiv');

        } catch (error) {
            console.error('Error in summarization process:', error);
            resultsDiv.innerHTML = `<p class="text-danger">Error summarizing comments: ${error.message}</p>`;
        }
    });

    // Event listener for the analyze button
    analyzeButton.addEventListener('click', async function() {
        try {
            console.log('Analyze button clicked');
            const comments = Array.from(commentsBody.querySelectorAll('tr'))
                .map(row => ({
                    snippet: {
                        topLevelComment: {
                            snippet: {
                                textDisplay: row.querySelector('td:nth-child(2)').textContent,
                                likeCount: parseInt(row.querySelector('td:nth-child(3)').textContent, 10)
                            }
                        }
                    }
                }))
                .sort((a, b) => b.snippet.topLevelComment.snippet.likeCount - a.snippet.topLevelComment.snippet.likeCount)
                .slice(0, 30); // Get top 30 most liked comments

            console.log('Number of comments to analyze:', comments.length);
            console.log('First comment:', comments[0]);

            resultsDiv.innerHTML = '<p class="text-info">Analyzing top 30 most-liked comments...</p>';
            const commentsText = comments.map(comment => comment.snippet.topLevelComment.snippet.textDisplay).join('\n');
            console.log('Before calling analyzeCommentsWithAI');
            const analysis = await analyzeCommentsWithAI(commentsText);
            console.log('After calling analyzeCommentsWithAI');
            console.log('Generated analysis:', analysis);

            displayAnalysis(analysis); // Display the analysis results

            console.log('Analysis added to resultsDiv');

        } catch (error) {
            console.error('Error in analysis process:', error);
            resultsDiv.innerHTML = `<p class="text-danger">Error analyzing comments: ${error.message}</p>`;
            const errorDetails = document.createElement('pre');
            errorDetails.textContent = JSON.stringify(error, null, 2);
            resultsDiv.appendChild(errorDetails);
        }
    });
});
