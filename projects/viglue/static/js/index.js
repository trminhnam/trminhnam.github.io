window.HELP_IMPROVE_VIDEOJS = false;

// More Works Dropdown Functionality
function toggleMoreWorks() {
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    } else {
        dropdown.classList.add('show');
        button.classList.add('active');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const container = document.querySelector('.more-works-container');
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (container && !container.contains(event.target)) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Close dropdown on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const dropdown = document.getElementById('moreWorksDropdown');
        const button = document.querySelector('.more-works-btn');
        if (!dropdown) return;
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    const copyText = button.querySelector('.copy-text');
    
    if (bibtexElement) {
        navigator.clipboard.writeText(bibtexElement.textContent).then(function() {
            // Success feedback
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = bibtexElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        });
    }
}

// Copy the code block next to a Copy button (same feedback as the BibTeX button)
function copyCode(button) {
    const code = button.parentElement.querySelector('pre');
    const copyText = button.querySelector('.copy-text');
    const showCopied = function() {
        button.classList.add('copied');
        copyText.textContent = 'Cop';
        setTimeout(function() {
            button.classList.remove('copied');
            copyText.textContent = 'Copy';
        }, 2000);
    };

    navigator.clipboard.writeText(code.textContent).then(showCopied).catch(function(err) {
        console.error('Failed to copy: ', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = code.textContent;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showCopied();
    });
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});

// Video carousel autoplay when in view
function setupVideoCarouselAutoplay() {
    const carouselVideos = document.querySelectorAll('.results-carousel video');
    
    if (carouselVideos.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Video is in view, play it
                video.play().catch(e => {
                    // Autoplay failed, probably due to browser policy
                    console.log('Autoplay prevented:', e);
                });
            } else {
                // Video is out of view, pause it
                video.pause();
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the video is visible
    });
    
    carouselVideos.forEach(video => {
        observer.observe(video);
    });
}

$(document).ready(function() {
    // Check for click events on the navbar burger icon

    var options = {
		slidesToScroll: 1,
		slidesToShow: 1,
		loop: true,
		infinite: true,
		autoplay: true,
		autoplaySpeed: 5000,
    }

	// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);
	
    bulmaSlider.attach();
    
    // Setup video autoplay for carousel
    setupVideoCarouselAutoplay();

})

// Dataset preview on touch screens: the viewer scrolls its own table, so a swipe
// that starts on it would never scroll the page. A cover lies over it until tapped,
// and comes back once the viewer has been scrolled out of view.
document.addEventListener('DOMContentLoaded', function() {
    const shield = document.querySelector('.viewer-shield');
    if (!shield) return;

    shield.addEventListener('click', function() {
        shield.hidden = true;
    });

    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (!entry.isIntersecting) shield.hidden = false;
            });
        }).observe(shield.parentElement);
    }
});

// Dataset preview: switch the Hugging Face viewer to another ViGLUE task
document.addEventListener('DOMContentLoaded', function() {
    const picker = document.querySelector('.subset-picker');
    const viewer = document.getElementById('hf-viewer');
    if (!picker || !viewer) return;

    picker.addEventListener('click', function(event) {
        const button = event.target.closest('button[data-subset]');
        if (!button || button.classList.contains('is-active')) return;
        picker.querySelector('.is-active').classList.remove('is-active');
        button.classList.add('is-active');
        viewer.src = 'https://huggingface.co/datasets/tmnam20/ViGLUE/embed/viewer/' + button.dataset.subset + '/train';
    });
});

// Few-shot results: show one figure at a time
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelector('.figure-tabs');
    if (!tabs) return;

    tabs.addEventListener('click', function(event) {
        const button = event.target.closest('button[data-tab]');
        if (!button) return;
        tabs.querySelectorAll('button[data-tab]').forEach(function(tab) {
            const selected = tab === button;
            tab.classList.toggle('is-active', selected);
            tab.setAttribute('aria-selected', selected);
            document.getElementById(tab.dataset.tab).hidden = !selected;
        });
    });
});
