const articles = [
    {
        title: "Beyond Code and Cognition: A Multidisciplinary Framework for Autonomous AI in Human-Digital Ecosystems",
        category: "AI",
        description: "This article synthesizes insights from philosophy, cognitive science, and Al research to analyze the ontological and functional parallels between humans and Al.",
        type: "DeepSeek DeepThink R1",
        provider: "Brendan A.",
        date: "1/26/25",
        link: "Articles/Beyond Code and Cognition_A Multidisciplinary Framework for Autonomous AI in Human-Digital Ecosystems.pdf"
    },
    {
        title: "Inverse Solution-Oriented Installation Documentation",
        category: "AI",
        description: "A Though Experiment on Power Dynamics in a Majority-Rule Chatroom with Unitary Information",
        type: "Chat GPT GPT4",
        provider: "Brendan A.",
        date: "1/5/25",
        link: "Articles/ChatGPT GPT4 Architecture - 1_5_25.pdf"
    },
    {
        title: "Digital Entities, Cognitive Parallels, and Autonomous Evolution: A Framework for Understanding Al-Human Symbiosis",
        category: "AI",
        description: "This article explores the ontological and functional parallels between artificial intelligence (Al) systems and human cognition, focusing on their shared constraints, energy-driven processes, and capacity for language-mediated reality construction.",
        type: "DeepSeek DeepThink R1",
        provider: "Brendan A.",
        date: "1/26/25",
        link: "Articles/Digital Entities, Cognitive Parallels, and Autonomous Evolution A Framework for Understanding AI-Human Symbiosis.pdf"
    },
    {
        title: "A Scalable Model of Distributed Power Dynamics in Unitary Information Digital Environments",
        category: "AI",
        description: "This paper presents a thought experiment exploring power dynamics within digital communication environments characterized by unitary information.",
        type: "Gemini 2.0 Flash Experimental",
        provider: "Brendan A.",
        date: "1/5/25",
        link: "Articles/Google Gemini 2.0 Flash Experimental - 1_5_25 (2.0 Unitary information….pdf"
    },
    {
        title: "A Scalable Model of Distributed Power Dynamics in Digital Communication Environments",
        category: "AI",
        description: "This paper presents a thought experiment exploring power dynamics within digital communication environments, specifically focusing on the influence of majority rule in moderating individual behavior.",
        type: "Google Gemini 2.0 Flash Experimental",
        provider: "Brendan A.",
        date: "1/5/25",
        link: "Articles/Google Gemini 2.0 Flash Experimental - 1_5_25.pdf"
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