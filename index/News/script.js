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

// NewsAPI Client with proper rate limiting and error handling
class NewsApiClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://newsapi.org/v2';
        this.lastRequestTime = 0;
    }

    async _makeRequest(endpoint, params) {
        // Respect rate limits (1 request/sec)
        const now = Date.now();
        if (now - this.lastRequestTime < 1000) {
            await new Promise(resolve => setTimeout(resolve, 1000 - (now - this.lastRequestTime)));
        }

        const url = new URL(`${this.baseUrl}/${endpoint}`);
        Object.entries(params).forEach(([key, value]) => {
            if (value) url.searchParams.append(key, value);
        });

        try {
            this.lastRequestTime = Date.now();
            const response = await fetch(url, {
                headers: { 'X-Api-Key': this.apiKey }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'API request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async getTopHeadlines(params) {
        return this._makeRequest('top-headlines', {
            country: 'us',
            pageSize: 20,
            ...params
        });
    }
}

// Application State
const newsApp = {
    api: null,
    currentCategory: 'general',
    currentPage: 1,
    pageSize: 10,
    totalResults: 0,
    
    init(apiKey) {
        this.api = new NewsApiClient(apiKey);
        this.setupEventListeners();
        this.loadInitialData();
    },

    async loadInitialData() {
        try {
            await this.loadCategoryNews(this.currentCategory);
            this.setupAutoRefresh(300000); // 5 minutes
        } catch (error) {
            this.showError(error.message);
        }
    },

    async loadCategoryNews(category, page = 1) {
        this.currentCategory = category;
        this.currentPage = page;
        
        try {
            const response = await this.api.getTopHeadlines({
                category,
                pageSize: this.pageSize,
                page
            });
            
            this.totalResults = response.totalResults;
            this.renderNews(response.articles);
            this.updatePagination();
            this.updateActiveCategory(category);
            this.cacheResults(category, page, response.articles);
        } catch (error) {
            this.showError(`Failed to load ${category} news: ${error.message}`);
            this.fallbackToCache(category, page);
        }
    },

    renderNews(articles) {
        // Update slideshow
        const slideshow = document.getElementById('dynamic-news-slideshow');
        slideshow.innerHTML = articles.slice(0, 3).map(article => `
            <div class="slide">
                ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${article.title}">` : ''}
                <div class="slide-content">
                    <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
                    <p>${article.description || ''}</p>
                </div>
            </div>
        `).join('');

        // Update news list
        const container = document.getElementById('latest-news-container');
        container.innerHTML = articles.map((article, index) => `
            <div class="news-item ${index < 3 ? 'featured' : ''}">
                <div class="news-content">
                    <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
                    <div class="meta">
                        <span class="source">${article.source.name}</span>
                        <time>${new Date(article.publishedAt).toLocaleDateString()}</time>
                    </div>
                    <p>${article.description || ''}</p>
                </div>
                ${article.urlToImage ? `
                <div class="news-image">
                    <img src="${article.urlToImage}" alt="${article.title}">
                </div>` : ''}
            </div>
        `).join('');
    },

    updatePagination() {
        const container = document.getElementById('pagination-container');
        const totalPages = Math.ceil(this.totalResults / this.pageSize);
        
        container.innerHTML = `
            <button ${this.currentPage <= 1 ? 'disabled' : ''} 
                    onclick="newsApp.loadCategoryNews('${this.currentCategory}', ${this.currentPage - 1})">
                Previous
            </button>
            <span>Page ${this.currentPage} of ${totalPages}</span>
            <button ${this.currentPage >= totalPages ? 'disabled' : ''} 
                    onclick="newsApp.loadCategoryNews('${this.currentCategory}', ${this.currentPage + 1})">
                Next
            </button>
        `;
    },

    updateActiveCategory(category) {
        document.querySelectorAll('.category-buttons button').forEach(btn => {
            btn.classList.toggle('active', btn.textContent.toLowerCase() === category);
        });
    },

    cacheResults(category, page, articles) {
        const cacheKey = `newsCache-${category}-${page}`;
        localStorage.setItem(cacheKey, JSON.stringify({
            articles,
            timestamp: Date.now()
        }));
    },

    fallbackToCache(category, page) {
        const cacheKey = `newsCache-${category}-${page}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
            const data = JSON.parse(cached);
            if (Date.now() - data.timestamp < 86400000) { // 24h cache validity
                this.renderNews(data.articles);
                this.showError('Showing cached content. News might not be up-to-date.');
                return true;
            }
        }
        
        this.showError('No cached content available. Please try again later.');
        return false;
    },

    showError(message) {
        const errorContainer = document.getElementById('error-container');
        errorContainer.innerHTML = `<div class="error">${message}</div>`;
        setTimeout(() => errorContainer.innerHTML = '', 5000);
    },

    setupAutoRefresh(interval) {
        setInterval(async () => {
            try {
                await this.loadCategoryNews(this.currentCategory, this.currentPage);
            } catch (error) {
                console.log('Auto-refresh failed:', error);
            }
        }, interval);
    },

    setupEventListeners() {
        // Mobile menu toggle
        document.querySelector('.menu-toggle').addEventListener('click', () => {
            document.querySelector('.menu').classList.toggle('active');
        });

        // Category buttons
        document.querySelectorAll('.category-buttons button').forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.textContent.toLowerCase();
                this.loadCategoryNews(category);
            });
        });
    }
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    const apiKey = document.querySelector('meta[name="newsapi-key"]').content;
    newsApp.init(apiKey);
});