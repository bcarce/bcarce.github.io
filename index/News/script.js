document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');

    menuToggle.addEventListener('click', () => {
        menu.classList.toggle('active');
        menu.style.display = menu.classList.contains('active') ? 'flex' : 'none';
        menuToggle.textContent = menu.classList.contains('active') ? '×' : '☰';
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    document.querySelectorAll('.blog-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-7px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// NewsAPI Client implementation
class NewsApiClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://newsapi.org/v2';
    }

    async getEverything(params) {
        const url = new URL(`${this.baseUrl}/everything`);
        Object.entries(params).forEach(([key, value]) => {
            if (value) url.searchParams.append(key, value);
        });
        
        try {
            const response = await fetch(url, {
                headers: { 'X-Api-Key': this.apiKey }
            });
            return await response.json();
        } catch (error) {
            throw new Error(`Everything request failed: ${error.message}`);
        }
    }

    async getTopHeadlines(params) {
        const url = new URL(`${this.baseUrl}/top-headlines`);
        Object.entries(params).forEach(([key, value]) => {
            if (value) url.searchParams.append(key, value);
        });

        try {
            const response = await fetch(url, {
                headers: { 'X-Api-Key': this.apiKey }
            });
            return await response.json();
        } catch (error) {
            throw new Error(`TopHeadlines request failed: ${error.message}`);
        }
    }

    async getSources(params) {
        const url = new URL(`${this.baseUrl}/top-headlines/sources`);
        Object.entries(params).forEach(([key, value]) => {
            if (value) url.searchParams.append(key, value);
        });

        try {
            const response = await fetch(url, {
                headers: { 'X-Api-Key': this.apiKey }
            });
            return await response.json();
        } catch (error) {
            throw new Error(`Sources request failed: ${error.message}`);
        }
    }
}

// Usage example
document.addEventListener('DOMContentLoaded', async () => {
    const apiKey = document.querySelector('meta[name="newsapi-key"]').getAttribute('content');
    const newsApiClient = new NewsApiClient(apiKey);

    try {
        // Get everything example
        const everythingResponse = await newsApiClient.getEverything({
            q: 'trump',
            pageSize: 5
        });
        renderArticles(everythingResponse.articles, 'everything-news');

        // Get top headlines example
        const topHeadlinesResponse = await newsApiClient.getTopHeadlines({
            q: 'bitcoin',
            language: 'en',
            pageSize: 5
        });
        renderArticles(topHeadlinesResponse.articles, 'top-headlines');

        // Get sources example
        const sourcesResponse = await newsApiClient.getSources({
            language: 'en',
            country: 'us'
        });
        renderSources(sourcesResponse.sources);
    } catch (error) {
        console.error(error);
        showError(error.message);
    }
});

// Render functions
function renderArticles(articles, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = articles.map(article => `
        <div class="article">
            <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
            ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${article.title}">` : ''}
            <p>${article.description || ''}</p>
            <div class="meta">
                <span>${article.source.name}</span> • 
                <time>${new Date(article.publishedAt).toLocaleDateString()}</time>
            </div>
        </div>
    `).join('');
}

function renderSources(sources) {
    const container = document.getElementById('news-sources');
    container.innerHTML = sources.map(source => `
        <div class="source">
            <h4>${source.name}</h4>
            <p>${source.description || ''}</p>
            <a href="${source.url}" target="_blank">Visit Source</a>
        </div>
    `).join('');
}

function showError(message) {
    const errorContainer = document.getElementById('error-container');
    errorContainer.innerHTML = `<div class="error">${message}</div>`;
}

// Category buttons and pagination
const apiUrlBase = 'https://newsapi.org/v2/everything';
let currentPage = 1;
let cache = {};
let currentQuery = 'latest';

function fetchNews(query = 'latest', page = 1) {
    const cacheKey = `query-${query}-page-${page}`;
    if (cache[cacheKey]) {
        updateContent(cache[cacheKey]);
        return;
    }

    // Show loading state
    showLoadingState();

    const apiKey = document.querySelector('meta[name="newsapi-key"]').getAttribute('content');

    fetch(`${apiUrlBase}?q=${query}&pageSize=5&page=${page}&apiKey=${apiKey}`)
    .then(response => response.json())
    .then(data => {
        if (data.articles) {
            cache[cacheKey] = data.articles;
            updateContent(data.articles);
        }
    })
    .catch(error => {
        console.error('Error fetching news:', error);
        hideLoadingState();
    });
}

function updateContent(articles) {
    updateSlideshow(articles);
    updateLatestNews(articles);
    updatePagination();
    hideLoadingState();
}

function updateSlideshow(articles) {
    const container = document.getElementById('dynamic-news-slideshow');
    container.innerHTML = `
        <div class="gk-news-slideshow">
            <div class="gk-ns-images">
                ${articles.map(article => `
                    <div class="gk-ns-art">
                        ${article.urlToImage ? `
                        <a href="${article.url}" class="gk-ns-image-link">
                            <img src="${article.urlToImage}" alt="${article.title}" class="gk-ns-image"/>
                        </a>` : ''}
                        <h3 class="gk-ns-header">
                            <a href="${article.url}" title="${article.title}">${article.title}</a>
                        </h3>
                        <p class="gk-ns-text">${article.description || ''}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function updateLatestNews(articles) {
    const container = document.getElementById('latest-news-container');
    container.innerHTML = `
        <div class="box">
            <h3 class="box-title">Latest News from NewsAPI</h3>
            ${articles.map(article => `
                <div class="news-article">
                    <h4><a href="${article.url}" target="_blank">${article.title}</a></h4>
                    <p>${article.description || ''}</p>
                    <small>Source: ${article.source.name}</small>
                </div>
            `).join('')}
        </div>
    `;
}

function updatePagination() {
    const container = document.getElementById('pagination-container');
    container.innerHTML = `
        <button onclick="changePage(-1)" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
        <button onclick="changePage(1)">Next</button>
    `;
}

function changePage(direction) {
    currentPage += direction;
    fetchNews(currentQuery, currentPage);
}

function showLoadingState() {
    document.getElementById('dynamic-news-slideshow').innerHTML = '<p>Loading...</p>';
    document.getElementById('latest-news-container').innerHTML = '<p>Loading...</p>';
}

function hideLoadingState() {
    // Loading state will be hidden automatically when content is updated
}

function updateCategory(category) {
    currentQuery = category;
    fetchNews(currentQuery, 1);
}

// Fetch news when page loads
document.addEventListener('DOMContentLoaded', () => fetchNews(currentQuery, currentPage));