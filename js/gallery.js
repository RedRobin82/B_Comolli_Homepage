(function () {
    'use strict';

    let galleryData = null;

    function imagePath(folder, file) {
        return 'Images/' + folder + '/' + encodeURIComponent(file);
    }

    async function loadGalleryData() {
        if (galleryData) {
            return galleryData;
        }
        const response = await fetch('data/gallery.json');
        if (!response.ok) {
            throw new Error('Galerie-Daten konnten nicht geladen werden.');
        }
        galleryData = await response.json();
        return galleryData;
    }

    function renderGalleryGrid(container, category) {
        container.innerHTML = '';
        category.images.forEach(function (image, index) {
            const img = document.createElement('img');
            img.src = imagePath(category.folder, image.file);
            img.alt = image.alt || image.file;
            img.className = 'carousel-trigger';
            img.dataset.index = String(index);
            container.appendChild(img);
        });
    }

    function renderCarouselItems(container, category) {
        container.innerHTML = '';
        category.images.forEach(function (image) {
            const item = document.createElement('div');
            item.className = 'carousel-item';
            const img = document.createElement('img');
            img.src = imagePath(category.folder, image.file);
            img.alt = image.alt || image.file;
            img.className = 'd-block w-100';
            item.appendChild(img);
            container.appendChild(item);
        });
    }

    function initOverlay() {
        const overlay = document.getElementById('overlayCarousel');
        const carouselInner = document.getElementById('carouselInner');
        if (!overlay || !carouselInner) {
            return;
        }

        const carouselItems = function () {
            return carouselInner.querySelectorAll('.carousel-item');
        };

        overlay.addEventListener('click', function (event) {
            if (event.target === overlay) {
                closeOverlay();
            }
        });

        document.getElementById('galleryGrid').addEventListener('click', function (event) {
            const trigger = event.target.closest('.carousel-trigger');
            if (!trigger) {
                return;
            }
            const index = Number(trigger.dataset.index);
            carouselItems().forEach(function (item) {
                item.classList.remove('active');
            });
            const items = carouselItems();
            if (items[index]) {
                items[index].classList.add('active');
            }
            overlay.classList.add('active');
        });

        window.closeOverlay = function () {
            overlay.classList.remove('active');
        };

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && overlay.classList.contains('active')) {
                closeOverlay();
            }
        });
    }

    async function initGalleryPage() {
        const categoryId = document.body.dataset.galleryCategory;
        if (!categoryId) {
            return;
        }

        const data = await loadGalleryData();
        const category = data.categories[categoryId];
        if (!category) {
            throw new Error('Unbekannte Kategorie: ' + categoryId);
        }

        const titleEl = document.getElementById('galleryTitle');
        if (titleEl) {
            titleEl.textContent = category.title;
        }
        document.title = category.title + ' - Brigitte Comolli';

        renderGalleryGrid(document.getElementById('galleryGrid'), category);
        renderCarouselItems(document.getElementById('carouselInner'), category);
        initOverlay();
    }

    async function initHomepage() {
        const container = document.getElementById('homepageCategories');
        if (!container) {
            return;
        }

        const data = await loadGalleryData();
        const order = ['pilatus', 'poems', 'abstrakt', 'natur', 'movements'];
        container.innerHTML = '';

        order.forEach(function (categoryId) {
            const category = data.categories[categoryId];
            if (!category) {
                return;
            }

            const col = document.createElement('div');
            col.className = 'col-md-4 mb-4 image-container';

            const link = document.createElement('a');
            link.href = category.page;

            const img = document.createElement('img');
            img.src = imagePath(category.folder, category.cover);
            img.alt = category.title;

            const title = document.createElement('div');
            title.className = 'image-title';
            title.textContent = category.title;

            link.appendChild(img);
            link.appendChild(title);
            col.appendChild(link);
            container.appendChild(col);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initGalleryPage().catch(function (error) {
            console.error(error);
        });
        initHomepage().catch(function (error) {
            console.error(error);
        });
    });
})();
