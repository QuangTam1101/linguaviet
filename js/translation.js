// ===== TRANSLATION SECTION JAVASCRIPT =====

let currentModel = null;
let currentDirection = 'vi-tay'; // Default: Vietnamese to Tày

// DOM Elements
const modelStatus = document.getElementById('modelStatus');
const langVi = document.getElementById('langVi');
const langTay = document.getElementById('langTay');
const swapBtn = document.getElementById('swapBtn');
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const translateBtn = document.getElementById('translateBtn');
const clearBtn = document.getElementById('clearBtn');
const copyInputBtn = document.getElementById('copyInputBtn');
const copyOutputBtn = document.getElementById('copyOutputBtn');
const saveFlashcardBtn = document.getElementById('saveFlashcardBtn');
const charCount = document.getElementById('charCount');
const inputLangLabel = document.getElementById('inputLangLabel');
const outputLangLabel = document.getElementById('outputLangLabel');
const translationInfo = document.getElementById('translationInfo');
const flashcardsGrid = document.getElementById('flashcardsGrid');
const flashcardCount = document.getElementById('flashcardCount');
const clearAllFlashcardsBtn = document.getElementById('clearAllFlashcardsBtn');

// Load model on page load
window.addEventListener('load', async () => {
    await loadModel();
});

// Load TensorFlow model
async function loadModel() {
    try {
        modelStatus.innerHTML = `
            <div class="status-content">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Đang tải mô hình AI...</span>
            </div>
        `;
        
        // Simulate model loading (replace with actual TensorFlow.js model loading)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // TODO: Replace with actual model loading
        // currentModel = await tf.loadLayersModel('path/to/model.json');
        
        modelStatus.className = 'model-status success';
        modelStatus.innerHTML = `
            <div class="status-content">
                <i class="fas fa-check-circle"></i>
                <span>Mô hình AI đã sẵn sàng</span>
            </div>
        `;
        
        translateBtn.disabled = false;
        
    } catch (error) {
        console.error('Error loading model:', error);
        modelStatus.className = 'model-status error';
        modelStatus.innerHTML = `
            <div class="status-content">
                <i class="fas fa-exclamation-circle"></i>
                <span>Không thể tải mô hình. Vui lòng thử lại sau.</span>
            </div>
        `;
        translateBtn.disabled = true;
    }
}

// Language swap
swapBtn.addEventListener('click', () => {
    // Swap direction
    currentDirection = currentDirection === 'vi-tay' ? 'tay-vi' : 'vi-tay';
    
    // Toggle button states
    langVi.classList.toggle('active');
    langTay.classList.toggle('active');
    
    // Update labels
    if (currentDirection === 'vi-tay') {
        inputLangLabel.textContent = 'Tiếng Việt';
        outputLangLabel.textContent = 'Tiếng Tày';
    } else {
        inputLangLabel.textContent = 'Tiếng Tày';
        outputLangLabel.textContent = 'Tiếng Việt';
    }
    
    // Swap text content
    const temp = inputText.value;
    inputText.value = outputText.value;
    outputText.value = temp;
    
    updateCharCount();
});

// Language button clicks
langVi.addEventListener('click', () => {
    if (currentDirection !== 'vi-tay') {
        swapBtn.click();
    }
});

langTay.addEventListener('click', () => {
    if (currentDirection !== 'tay-vi') {
        swapBtn.click();
    }
});

// Character counter
inputText.addEventListener('input', updateCharCount);

function updateCharCount() {
    const count = inputText.value.length;
    charCount.textContent = count;
    
    if (count > 450) {
        charCount.style.color = 'var(--warning)';
    } else {
        charCount.style.color = 'var(--gray-500)';
    }
}

// Clear button
clearBtn.addEventListener('click', () => {
    inputText.value = '';
    outputText.value = '';
    translationInfo.textContent = '';
    updateCharCount();
    inputText.focus();
});

// Copy input
copyInputBtn.addEventListener('click', async () => {
    if (inputText.value.trim() === '') {
        showNotification('Không có văn bản để sao chép', 'error');
        return;
    }
    
    try {
        await copyToClipboard(inputText.value);
        showNotification('Đã sao chép văn bản gốc', 'success');
    } catch (error) {
        showNotification('Không thể sao chép', 'error');
    }
});

// Copy output
copyOutputBtn.addEventListener('click', async () => {
    if (outputText.value.trim() === '') {
        showNotification('Không có bản dịch để sao chép', 'error');
        return;
    }
    
    try {
        await copyToClipboard(outputText.value);
        showNotification('Đã sao chép bản dịch', 'success');
    } catch (error) {
        showNotification('Không thể sao chép', 'error');
    }
});

// Translate function
translateBtn.addEventListener('click', async () => {
    const text = inputText.value.trim();
    
    if (text === '') {
        showNotification('Vui lòng nhập văn bản cần dịch', 'error');
        inputText.focus();
        return;
    }
    
    // Show loading state
    translateBtn.disabled = true;
    translateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang dịch...';
    outputText.value = '';
    translationInfo.textContent = '';
    
    try {
        // Simulate translation (replace with actual model inference)
        const translatedText = await performTranslation(text, currentDirection);
        
        // Display result
        outputText.value = translatedText;
        translationInfo.innerHTML = '<i class="fas fa-check"></i> Đã dịch';
        
        showNotification('Dịch thành công!', 'success');
        
    } catch (error) {
        console.error('Translation error:', error);
        showNotification('Có lỗi xảy ra khi dịch', 'error');
        translationInfo.innerHTML = '<i class="fas fa-exclamation-circle"></i> Lỗi';
        translationInfo.style.color = 'var(--error)';
    } finally {
        translateBtn.disabled = false;
        translateBtn.innerHTML = '<i class="fas fa-language"></i> Dịch ngay';
    }
});

// Perform translation (Mock function - replace with actual model)
async function performTranslation(text, direction) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock translation data
    const mockTranslations = {
        'vi-tay': {
            'Xin chào': 'Slương cáo',
            'Cảm ơn': 'Khắp cũn',
            'Tôi yêu Việt Nam': 'Kẩu hạ Việt Nam',
            'Chúc bạn một ngày tốt lạnh': 'Sú nó ngày đệ đị',
            'Tôi đang học tiếng Tày': 'Kẩu láng hác pacá Tày',
        },
        'tay-vi': {
            'Slương cáo': 'Xin chào',
            'Khắp cũn': 'Cảm ơn',
            'Kẩu hạ Việt Nam': 'Tôi yêu Việt Nam',
            'Sú nó ngày đệ đị': 'Chúc bạn một ngày tốt lạnh',
            'Kẩu láng hác pacá Tày': 'Tôi đang học tiếng Tày',
        }
    };
    
    // Check if we have a mock translation
    if (mockTranslations[direction][text]) {
        return mockTranslations[direction][text];
    }
    
    // Otherwise, return a placeholder
    return `[Bản dịch của: "${text}"]`;
    
    // TODO: Replace with actual model inference
    /*
    const inputTensor = preprocessText(text);
    const outputTensor = currentModel.predict(inputTensor);
    const translatedText = postprocessOutput(outputTensor);
    return translatedText;
    */
}

// Allow Enter key to translate (Ctrl/Cmd + Enter)
inputText.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        translateBtn.click();
    }
});

// ===== FLASHCARDS FUNCTIONALITY =====

let flashcards = JSON.parse(localStorage.getItem('flashcards')) || [];

// Save flashcard
saveFlashcardBtn.addEventListener('click', () => {
    const input = inputText.value.trim();
    const output = outputText.value.trim();
    
    if (input === '' || output === '') {
        showNotification('Vui lòng dịch trước khi lưu flashcard', 'error');
        return;
    }
    
    const flashcard = {
        id: Date.now(),
        source: input,
        translation: output,
        direction: currentDirection,
        createdAt: new Date().toISOString()
    };
    
    flashcards.unshift(flashcard);
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
    
    renderFlashcards();
    showNotification('Đã lưu flashcard', 'success');
});

// Render flashcards
function renderFlashcards() {
    if (flashcards.length === 0) {
        flashcardsGrid.innerHTML = `
            <div class="empty-flashcards">
                <i class="fas fa-bookmark"></i>
                <p>Chưa có flashcard nào được lưu</p>
            </div>
        `;
        flashcardCount.textContent = '(0)';
        return;
    }
    
    flashcardCount.textContent = `(${flashcards.length})`;
    
    flashcardsGrid.innerHTML = flashcards.map(card => `
        <div class="flashcard" data-id="${card.id}">
            <div class="flashcard-text">
                <div class="flashcard-label">
                    ${card.direction === 'vi-tay' ? 'Tiếng Việt' : 'Tiếng Tày'}
                </div>
                <div class="flashcard-content">${card.source}</div>
            </div>
            <div class="flashcard-text">
                <div class="flashcard-label">
                    ${card.direction === 'vi-tay' ? 'Tiếng Tày' : 'Tiếng Việt'}
                </div>
                <div class="flashcard-content">${card.translation}</div>
            </div>
            <div class="flashcard-actions">
                <button class="btn-delete-flashcard" onclick="deleteFlashcard(${card.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Delete flashcard
function deleteFlashcard(id) {
    flashcards = flashcards.filter(card => card.id !== id);
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
    renderFlashcards();
    showNotification('Đã xóa flashcard', 'success');
}

// Clear all flashcards
clearAllFlashcardsBtn.addEventListener('click', () => {
    if (flashcards.length === 0) {
        showNotification('Không có flashcard nào để xóa', 'error');
        return;
    }
    
    if (confirm('Bạn có chắc muốn xóa tất cả flashcards?')) {
        flashcards = [];
        localStorage.setItem('flashcards', JSON.stringify(flashcards));
        renderFlashcards();
        showNotification('Đã xóa tất cả flashcards', 'success');
    }
});

// Initial render
renderFlashcards();

// Make deleteFlashcard globally accessible
window.deleteFlashcard = deleteFlashcard;