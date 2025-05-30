document.addEventListener('DOMContentLoaded', () => {
    loadSkills();

    // Initialize skills filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterSkills(button.dataset.filter);
        });
    });
});

async function loadSkills() {
    try {
        const response = await fetch('/api/skills');
        const data = await response.json();
        if (data && data.skills) {
            renderSkills(data.skills);
            initializeSkillCards();
        } else {
            console.error('Skills data is not in the expected format');
        }
    } catch (error) {
        console.error('Error loading skills:', error);
        const skillsGrid = document.querySelector('.skills-grid');
        if (skillsGrid) {
            skillsGrid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to load skills. Please try again later.</p>
                </div>
            `;
        }
    }
}

function renderSkills(skills) {
    const skillsGrid = document.querySelector('.skills-grid');
    if (!skillsGrid) return;

    skillsGrid.innerHTML = skills.map(skill => `
        <div class="skill-card" data-category="${skill.category}" data-aos="fade-up">
            <div class="skill-card-inner">
                <div class="skill-card-front">
                    <i class="skill-icon ${skill.icon}"></i>
                    <h3 class="skill-title">${skill.name}</h3>
                    <div class="skill-level-wrap">
                        <div class="skill-level-bar">
                            <div class="skill-level-fill" style="width: ${skill.level}%"></div>
                        </div>
                        <span class="skill-percentage">${skill.level}%</span>
                    </div>
                    <div class="skill-tags">
                        ${skill.tags.map(tag => `<span class="skill-tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="skill-card-back">
                    <h3 class="skill-title">${skill.name} Expertise</h3>
                    <p class="skill-description">${skill.description}</p>
                    <div class="skill-features custom-scrollbar">
                        ${skill.features.map(feature => `
                            <div class="skill-feature" title="${feature}">
                                <i class="fas fa-check"></i>
                                <span>${feature}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Initialize tooltips for long feature text
    document.querySelectorAll('.skill-feature').forEach(feature => {
        const span = feature.querySelector('span');
        if (span.scrollWidth > span.offsetWidth) {
            feature.style.cursor = 'help';
        }
    });
}

function filterSkills(category) {
    const skillCards = document.querySelectorAll('.skill-card');
    const staggerDelay = 50; // ms between each card animation

    skillCards.forEach((card, index) => {
        if (category === 'all' || card.dataset.category === category) {
            setTimeout(() => {
                card.style.display = 'block';
                requestAnimationFrame(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0) scale(1)';
                });
            }, index * staggerDelay);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px) scale(0.95)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

function initializeSkillCards() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fillBar = entry.target.querySelector('.skill-level-fill');
                if (fillBar) {
                    fillBar.style.transform = 'scaleX(1)';
                }
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.skill-card').forEach(card => {
        observer.observe(card);

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });

        // Add smooth transition for skill features
        const features = card.querySelectorAll('.skill-feature');
        features.forEach((feature, index) => {
            feature.style.transitionDelay = `${index * 50}ms`;
        });
    });
}