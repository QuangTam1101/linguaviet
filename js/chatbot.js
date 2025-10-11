// ===== CHATBOT WITH RAG + GEMINI API =====

console.log('🤖 Loading Chatbot...');

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const quickBtns = document.querySelectorAll('.quick-btn');
const ragStatus = document.getElementById('ragStatus');

// State
let ragEngine = null;
let chatHistory = [];
let isInitializing = false;
let isProcessing = false;

// API Configuration
const API_ENDPOINT = '/api/chat';

// ===== INITIALIZATION =====
async function initializeChatbot() {
    if (isInitializing) {
        console.log('⚠️ Already initializing...');
        return;
    }
    
    isInitializing = true;
    console.log('🚀 Initializing Chatbot...');
    
    // Update status
    updateRAGStatus('loading', 'Đang khởi tạo RAG Engine...');
    
    try {
        // Check if RAGEngine class exists
        if (typeof RAGEngine === 'undefined') {
            throw new Error('RAGEngine class not found. Make sure rag-engine.js is loaded first.');
        }
        
        // Create and initialize RAG Engine
        console.log('📦 Creating RAG Engine instance...');
        ragEngine = new RAGEngine();
        
        console.log('⚙️ Initializing RAG Engine...');
        await ragEngine.initialize();
        
        console.log('✅ RAG Engine initialized successfully');
        
        // Update status
        updateRAGStatus('success', `✓ RAG Engine sẵn sàng (${ragEngine.knowledgeBase.length} documents)`);
        
        // Add welcome message
        addWelcomeMessage();
        
        // Enable input
        chatInput.disabled = false;
        sendBtn.disabled = false;
        chatInput.focus();
        
        console.log('✅ Chatbot ready!');
        
    } catch (error) {
        console.error('❌ Chatbot initialization failed:', error);
        updateRAGStatus('error', '✗ Không thể khởi tạo RAG Engine: ' + error.message);
        
        // Show error in chat
        addMessage(`Xin lỗi, có lỗi xảy ra khi khởi tạo trợ lý AI:\n${error.message}\n\nVui lòng tải lại trang.`, 'bot');
    } finally {
        isInitializing = false;
    }
}

// Update RAG Status UI
function updateRAGStatus(status, message) {
    if (!ragStatus) return;
    
    ragStatus.className = `rag-status ${status}`;
    
    let icon = '<i class="fas fa-spinner fa-spin"></i>';
    if (status === 'success') icon = '<i class="fas fa-check-circle"></i>';
    if (status === 'error') icon = '<i class="fas fa-exclamation-circle"></i>';
    
    ragStatus.innerHTML = `${icon} <span>${message}</span>`;
    
    // Hide after 3 seconds if success
    if (status === 'success') {
        setTimeout(() => {
            ragStatus.style.opacity = '0';
            setTimeout(() => ragStatus.style.display = 'none', 300);
        }, 3000);
    }
}

// Add welcome message
function addWelcomeMessage() {
    const welcomeMsg = `Xin chào! Tôi là trợ lý AI của LinguaViet. 

Tôi có thể giúp bạn:
• Học từ vựng tiếng Tày
• Giải thích ngữ pháp
• Giới thiệu văn hóa dân tộc Tày
• Hướng dẫn phát âm
• Luyện tập hội thoại

Bạn muốn học gì hôm nay?`;
    
    addMessage(welcomeMsg, 'bot');
}

// ===== AUTO-RESIZE TEXTAREA =====
if (chatInput) {
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 150) + 'px';
    });
}

// ===== SEND MESSAGE =====
if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
}

if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

// Quick action buttons
if (quickBtns) {
    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const message = btn.getAttribute('data-message');
            if (chatInput) {
                chatInput.value = message;
                sendMessage();
            }
        });
    });
}

// Main send message function
async function sendMessage() {
    if (!chatInput || !chatMessages) return;
    
    const message = chatInput.value.trim();
    
    if (message === '') return;
    
    // Check if RAG Engine is ready
    if (!ragEngine) {
        console.error('❌ RAG Engine not initialized');
        showNotification('Trợ lý AI chưa sẵn sàng. Vui lòng đợi...', 'error');
        return;
    }
    
    if (isProcessing) {
        console.log('⚠️ Already processing a message');
        return;
    }
    
    isProcessing = true;
    
    // Add user message
    addMessage(message, 'user');
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Add to history
    chatHistory.push({ role: 'user', content: message });
    
    // Disable input
    chatInput.disabled = true;
    sendBtn.disabled = true;
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        console.log(`💬 User: ${message}`);
        
        // Step 1: Retrieve relevant documents
        console.log('🔍 Retrieving relevant documents...');
        const retrievedDocs = await ragEngine.retrieve(message, 5);
        
        console.log(`📚 Retrieved ${retrievedDocs.length} documents`);
        
        // Step 2: Build context
        const context = retrievedDocs
            .filter(item => item.score > 0.15)
            .map(item => item.doc.content)
            .join('\n\n');
        
        console.log(`📝 Context length: ${context.length} characters`);
        
        // Step 3: Send to Gemini API
        console.log('🚀 Sending to Gemini API...');
        const response = await sendToGeminiAPI(message, context, chatHistory);
        
        console.log(`✅ Received response (${response.length} chars)`);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add bot response
        addMessage(response, 'bot');
        
        // Add to history
        chatHistory.push({ role: 'assistant', content: response });
        
        // Keep only last 10 messages
        if (chatHistory.length > 10) {
            chatHistory = chatHistory.slice(-10);
        }
        
    } catch (error) {
        console.error('❌ Chat error:', error);
        removeTypingIndicator();
        
        let errorMessage = 'Xin lỗi, tôi gặp lỗi khi xử lý câu hỏi của bạn. ';
        
        if (error.message.includes('API key')) {
            errorMessage += 'Có vấn đề với API key.';
        } else if (error.message.includes('rate limit')) {
            errorMessage += 'Quá nhiều yêu cầu, vui lòng thử lại sau 1 phút.';
        } else if (error.message.includes('fetch')) {
            errorMessage += 'Không thể kết nối đến server. Đảm bảo server đang chạy.';
        } else {
            errorMessage += error.message;
        }
        
        addMessage(errorMessage, 'bot');
        showNotification('Có lỗi xảy ra', 'error');
        
    } finally {
        // Re-enable input
        chatInput.disabled = false;
        sendBtn.disabled = false;
        chatInput.focus();
        isProcessing = false;
    }
}

// Send to Gemini API
async function sendToGeminiAPI(userMessage, context, history) {
    // Build system prompt
    const systemPrompt = `Bạn là trợ lý AI thông minh của LinguaViet, chuyên về ngôn ngữ và văn hóa dân tộc Tày.

**VAI TRÒ CỦA BẠN:**
- Hỗ trợ người dùng học tiếng Tày một cách hiệu quả và thú vị
- Giải thích ngữ pháp, từ vựng, phát âm tiếng Tày
- Giới thiệu văn hóa, lịch sử, phong tục tập quán của người Tày
- So sánh tiếng Tày với tiếng Việt để người học dễ hiểu
- Đưa ra ví dụ thực tế, câu mẫu, bài tập luyện tập

**NGUYÊN TẮC TRẢ LỜI:**
1. **Dựa trên kiến thức được cung cấp**: Sử dụng thông tin từ KNOWLEDGE BASE bên dưới
2. **Rõ ràng và có cấu trúc**: Dùng markdown (**, -, 1., etc.)
3. **Thân thiện và khuyến khích**: Tạo động lực cho người học
4. **Ví dụ cụ thể**: Luôn đưa ví dụ minh họa khi giải thích
5. **Tiếng Việt chuẩn**: Trả lời bằng tiếng Việt, chỉ dùng tiếng Tày khi minh họa
6. **Thừa nhận hạn chế**: Nếu không có thông tin, hãy nói rõ và gợi ý

**KNOWLEDGE BASE:**
${context || 'Không có thông tin liên quan.'}

---

Dựa trên kiến thức trên, hãy trả lời câu hỏi sau một cách hữu ích:`;

    // Build conversation context
    const conversationContext = history
        .slice(-4)
        .map(msg => `${msg.role === 'user' ? 'Người dùng' : 'Trợ lý'}: ${msg.content}`)
        .join('\n\n');
    
    // Combine prompt
    const fullPrompt = conversationContext 
        ? `${systemPrompt}\n\n**LỊCH SỬ HỘI THOẠI:**\n${conversationContext}\n\n**CÂU HỎI HIỆN TẠI:**\n${userMessage}`
        : `${systemPrompt}\n\n**CÂU HỎI:**\n${userMessage}`;
    
    console.log(`📤 Sending request to ${API_ENDPOINT}`);
    
    // Call backend API
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: fullPrompt,
            context: context,
            history: history.slice(-4)
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📥 API response received');
    
    // Extract text from Gemini response
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
    } else {
        console.error('❌ Invalid response format:', data);
        throw new Error('Invalid response format from API');
    }
}

// Add message to chat UI
function addMessage(content, sender) {
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    
    const time = new Date().toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
        </div>
        <div class="message-content">
            <div class="message-bubble">
                ${formatMessage(content)}
            </div>
            <span class="message-time">${time}</span>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Format message with markdown
function formatMessage(content) {
    let formatted = content;
    
    // Escape HTML first
    formatted = formatted
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    
    // Bold: **text**
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic: *text*
    formatted = formatted.replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, '<em>$1</em>');
    
    // Code: `code`
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Headers
    formatted = formatted.replace(/^### (.+)$/gm, '<h4>$1</h4>');
    formatted = formatted.replace(/^## (.+)$/gm, '<h3>$1</h3>');
    
    // Lists
    const lines = formatted.split('\n');
    let inList = false;
    let listType = '';
    
    formatted = lines.map(line => {
        const trimmed = line.trim();
        
        // Unordered list
        if (trimmed.match(/^[-•]\s/)) {
            if (!inList) {
                inList = true;
                listType = 'ul';
                return '<ul><li>' + trimmed.substring(2) + '</li>';
            }
            return '<li>' + trimmed.substring(2) + '</li>';
        }
        
        // Ordered list
        if (trimmed.match(/^\d+\.\s/)) {
            if (!inList) {
                inList = true;
                listType = 'ol';
                return '<ol><li>' + trimmed.replace(/^\d+\.\s/, '') + '</li>';
            }
            return '<li>' + trimmed.replace(/^\d+\.\s/, '') + '</li>';
        }
        
        // End of list
        if (inList && trimmed !== '') {
            const closeTag = `</${listType}>`;
            inList = false;
            return closeTag + '<br>' + line;
        }
        
        return line;
    }).join('\n');
    
    if (inList) formatted += `</${listType}>`;
    
    // Paragraphs
    formatted = formatted
        .split('\n\n')
        .map(p => {
            p = p.trim();
            if (!p) return '';
            if (p.match(/^<[hulo]/)) return p;
            return `<p>${p}</p>`;
        })
        .join('');
    
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
}

// Show typing indicator
function showTypingIndicator() {
    if (!chatMessages) return;
    
    const indicator = document.createElement('div');
    indicator.className = 'chat-message bot-message typing-indicator';
    indicator.id = 'typingIndicator';
    indicator.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="message-bubble">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

// Show notification (uses function from main.js)
function showNotification(message, type = 'info') {
    // Check if main.js notification function exists
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        // Fallback
        console.log(`[${type.toUpperCase()}] ${message}`);
        alert(message);
    }
}

// Clear chat
window.clearChat = function() {
    if (!chatMessages) return;
    
    chatMessages.innerHTML = '';
    chatHistory = [];
    addWelcomeMessage();
};

// ===== AUTO-INITIALIZE ON PAGE LOAD =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChatbot);
} else {
    // DOM already loaded
    initializeChatbot();
}

console.log('✅ Chatbot script loaded');