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


const apiUrlBase = 'https://newsapi.org/v2/everything';
const pageSize = 5; // Number of articles per page
let currentPage = 1;
let totalPages = 1;
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

    fetch(`${apiUrlBase}?q=${query}&pageSize=${pageSize}&page=${page}&apiKey=${apiKey}`)
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