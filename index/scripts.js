const articles = [
    {
        title: "Compliance Document for Multi-Channelled Firmware",
        category: "ARTICLE",
        description: "Gathered by gravity star stuff harvesting star light the ash of stellar alchemy vastness is...",
        type: "PDF HANDOUT",
        provider: "Schiller-Strozen",
        date: "2020-09-30",
        link: "#"
    },
    {
        title: "Inverse Solution-Oriented Installation Documentation",
        category: "EXTERNAL LINK",
        description: "Gathered by gravity star stuff harvesting star light the ash of stellar alchemy vastness is...",
        type: "VIDEO",
        provider: "Champion-Presacco",
        date: "2020-09-30",
        link: "#"
    },
];

function renderArticles() {
    const container = document.getElementById('articleContainer');
    container.innerHTML = articles.map(article => `
        <div class="blog-card article-card" data-category="${article.category}" data-date="${article.date}">
            <div class="card-category article-category">${article.category} • ${article.type}</div>
            <h2 class="card-title article-title">${article.title}</h2>
            <p class="card-excerpt article-description">${article.description}</p>
            <a href="${article.link}" class="read-more">
                ${article.type === 'PDF HANDOUT' ? 'DOWNLOAD (PDF)' : 
                 article.type === 'EXTERNAL LINK' ? 'VISIT LINK' : 'READ ARTICLE'}
            </a>
            <div class="article-meta">
                <span>PROVIDED BY: ${article.provider}</span>
                <span>${article.date}</span>
            </div>
        </div>
    `).join('');
}

document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    document.querySelectorAll('.article-card').forEach(card => {
        const title = card.querySelector('.article-title').textContent.toLowerCase();
        card.style.display = title.includes(searchTerm) ? 'block' : 'none';
    });
});

document.getElementById('sortSelect').addEventListener('change', function(e) {
    const container = document.getElementById('articleContainer');
    const articles = Array.from(container.children);

    articles.sort((a, b) => {
        const dateA = new Date(a.dataset.date);
        const dateB = new Date(b.dataset.date);
        return e.target.value === 'newest' ? dateB - dateA : dateA - dateB;
    });

    articles.forEach(article => container.appendChild(article));
});

document.querySelectorAll('.filter-btn[data-category]').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const category = this.dataset.category;
        document.querySelectorAll('.article-card').forEach(card => {
            card.style.display = category === 'all' ? 'block' : 
                card.dataset.category === category ? 'block' : 'none';
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.textContent = navLinks.classList.contains('active') ? '×' : '☰';
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

renderArticles();